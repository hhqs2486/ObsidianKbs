# Claude Code 源码学习指南 — 第02章：Query 引擎

> **核心文件**：`src/query.ts`（785KB，最大文件）· `src/QueryEngine.ts` · `src/query/`

---

## 一、Query 引擎是什么？

Query 引擎是 Claude Code 的**心脏**。它管理 Agent 的核心循环：

1. 接收用户消息
2. 组装 System Prompt
3. 调用 Claude API（流式）
4. 解析 `tool_use` 响应
5. 执行工具（并发/串行）
6. 将 `tool_result` 追加到对话历史
7. 再次调用 API
8. 循环，直到 `stop_reason = "end_turn"`

`query.ts` 是整个系统中最复杂的文件（785KB），几乎涵盖了所有生产级考量。

---

## 二、两个入口：REPL 模式 vs SDK 模式

```
用户输入 (REPL)                    程序调用 (SDK)
      │                                  │
      ▼                                  ▼
  main.tsx                         QueryEngine.ts
  useQueueProcessor                submitMessage()
      │                                  │
      └──────────────┬───────────────────┘
                     │
                     ▼
              query() 主循环
         (src/query.ts 的核心导出)
```

### QueryEngine.ts — SDK 模式的高层封装

```typescript
// src/QueryEngine.ts
export class QueryEngine {
  async *submitMessage(
    prompt: string,
    options?: { ... }
  ): AsyncGenerator<SDKMessage> {
    // 1. 加载会话历史（如果 resume）
    // 2. 处理用户输入（/命令等）
    // 3. 组装 system prompt
    // 4. 调用 query() 循环
    // 5. yield SDKMessage 给调用方
    // 6. 保存 transcript（sessionStorage）
    // 7. 处理错误重试
  }
}
```

QueryEngine 额外处理：会话持久化、structured output（SDKMessage 流）、重试逻辑、cost tracking、transcript 记录。

---

## 三、query() 函数 — 主循环深度解析

```typescript
// src/query.ts
export async function* query(
  params: QueryParams,
): AsyncGenerator<StreamEvent | RequestStartEvent | Message | TombstoneMessage | ToolUseSummaryMessage, Terminal>
```

### 3.1 QueryParams 核心字段

```typescript
type QueryParams = {
  messages: Message[]           // 当前对话历史
  systemPrompt: SystemPrompt    // 已组装的 system prompt
  userContext: {...}            // 用户上下文（cwd、OS 等）
  systemContext: {...}          // 系统上下文
  canUseTool: CanUseToolFn      // 权限检查函数
  toolUseContext: ToolUseContext // 工具运行环境
  maxTurns?: number             // 最大循环次数
  maxOutputTokensOverride?: number
  taskBudget?: { total: number } // API 任务预算
  fallbackModel?: string         // 降级模型（fallback）
}
```

### 3.2 循环状态机

```typescript
// 每轮循环携带的可变状态
type State = {
  messages: Message[]                    // 当前消息列表
  toolUseContext: ToolUseContext          // 当前工具上下文
  autoCompactTracking: AutoCompactTrackingState | undefined
  maxOutputTokensRecoveryCount: number   // max_output_tokens 错误恢复次数（上限3）
  hasAttemptedReactiveCompact: boolean   // 已尝试响应式压缩？
  maxOutputTokensOverride: number | undefined
  pendingToolUseSummary: Promise<...> | undefined
  stopHookActive: boolean | undefined
  turnCount: number                      // 当前是第几轮
  transition: Continue | undefined       // 上一轮为何继续（调试用）
}
```

### 3.3 主循环流程图

```
┌─────────────────────────────────────────────────────┐
│ query() 主循环                                       │
│                                                     │
│  loop:                                              │
│    1. buildQueryConfig()      构建 API 请求配置      │
│    2. callClaudeAPI(stream)   发起流式请求            │
│    3. accumulateStreamEvents  积累流式事件            │
│       ├── 'content_block_start'  文本/工具块开始      │
│       ├── 'content_block_delta' 增量内容（流式文字）  │
│       ├── 'content_block_stop'  工具参数收集完毕      │
│       ├── 'message_delta'       stop_reason 到达     │
│       └── 'message_stop'        请求完成             │
│    4. 检查 stop_reason                               │
│       ├── 'end_turn' → break（循环结束）              │
│       ├── 'tool_use' → 执行工具                      │
│       │     ├── runTools() 并发/串行执行              │
│       │     ├── 追加 tool_results 到 messages        │
│       │     └── 继续循环                             │
│       ├── 'max_tokens' → 尝试恢复（最多3次）          │
│       └── 其他 → 错误处理                            │
│    5. checkTokenBudget()      检查 token 预算        │
│    6. autoCompact 检查        是否需要压缩历史         │
│    7. handleStopHooks()       执行 stop hooks        │
└─────────────────────────────────────────────────────┘
```

---

## 四、流式处理详解

### 4.1 SSE 事件流

Claude API 以 Server-Sent Events 返回响应：

```
← content_block_start  {"type":"text"}
← content_block_delta  {"delta":{"text":"I'll "}}
← content_block_delta  {"delta":{"text":"help you"}}
← content_block_stop
← content_block_start  {"type":"tool_use","name":"Bash"}
← content_block_delta  {"delta":{"partial_json":"{\"comm"}}
← content_block_delta  {"delta":{"partial_json":"and\":\"ls"}}
← content_block_delta  {"delta":{"partial_json":"\"}"}}
← content_block_stop   ← 此时工具参数完整，可以执行
← message_delta        {"stop_reason":"tool_use"}
← message_stop
```

### 4.2 工具参数积累

```typescript
// 工具参数通过 delta 逐字节积累，完整接收后才执行
// 这意味着 UI 可以实时展示"正在生成参数..."
let partialJson = ''
for await (const event of stream) {
  if (event.type === 'content_block_delta') {
    if (event.delta.type === 'input_json_delta') {
      partialJson += event.delta.partial_json
      // 此时渲染部分参数（流式 UI 更新）
    }
  }
  if (event.type === 'content_block_stop') {
    const args = JSON.parse(partialJson)  // 完整参数
    // 现在可以执行工具
  }
}
```

### 4.3 Thinking 块处理

```typescript
// Extended Thinking 模式特殊规则（代码注释原文）：
// 1. 包含 thinking/redacted_thinking 块的消息必须在 max_thinking_length > 0 的请求中
// 2. thinking 块不能是消息的最后一个块
// 3. thinking 块必须在一个 assistant trajectory 中保持
//    （一个 turn，或如果包含 tool_use，则延伸到 tool_result 和下一个 assistant 消息）
```

---

## 五、并发工具执行

当 Claude 一次性输出多个 `tool_use` 块时，系统根据 `isConcurrencySafe()` 决定执行策略：

### 5.1 StreamingToolExecutor

```typescript
// src/services/tools/StreamingToolExecutor.ts
// 核心职责：在工具参数还在流式传输时，尽早开始执行

class StreamingToolExecutor {
  // 当一个工具的参数完整到达时立即开始执行
  // 不等待所有工具都准备好
  async executeAsReady(toolUseBlocks: ToolUseBlock[]) {
    const results = []
    for (const block of toolUseBlocks) {
      if (tool.isConcurrencySafe(block.input)) {
        // 并发安全：立即开始，不等待
        results.push(executeAsync(block))
      } else {
        // 非并发安全：等待前面的完成
        await Promise.all(results)
        results.push(await executeSync(block))
      }
    }
    return await Promise.all(results)
  }
}
```

### 5.2 runTools() 工具编排

```typescript
// src/services/tools/toolOrchestration.ts
// 将工具分组：并发安全 vs 串行
async function runTools(toolUseBlocks, context) {
  const concurrent = toolUseBlocks.filter(b => isConcurrent(b))
  const serial = toolUseBlocks.filter(b => !isConcurrent(b))

  // 并发组：全部并发执行
  const concurrentResults = await Promise.all(
    concurrent.map(b => executeTool(b, context))
  )

  // 串行组：顺序执行，每个都可以通过 contextModifier 修改上下文
  let ctx = context
  const serialResults = []
  for (const block of serial) {
    const result = await executeTool(block, ctx)
    if (result.contextModifier) {
      ctx = result.contextModifier(ctx)  // 修改上下文（后续工具可见）
    }
    serialResults.push(result)
  }
}
```

---

## 六、Auto Compact — Context 窗口管理

### 6.1 触发条件

```typescript
// src/services/compact/autoCompact.ts
function calculateTokenWarningState(
  contextTokens: number,
  maxContextTokens: number
): 'ok' | 'warning' | 'critical' {
  const ratio = contextTokens / maxContextTokens
  if (ratio < 0.7) return 'ok'
  if (ratio < 0.9) return 'warning'
  return 'critical'  // → 触发 compact
}
```

### 6.2 Compact 流程

```
检测到 context 接近上限
         │
         ▼
pre_compact hooks 执行
         │
         ▼
buildPostCompactMessages()
  ├── 调用专用 LLM（轻量模型）总结历史
  ├── 保留最近 N 条消息（不压缩）
  ├── 保留所有 tool_use/tool_result 边界
  └── 插入 CompactBoundaryMessage（标记压缩位置）
         │
         ▼
post_compact hooks 执行
         │
         ▼
用新的压缩消息列表继续循环
```

### 6.3 Feature Gate 的三种 Compact 模式

```typescript
// 1. 标准 autoCompact（始终可用）
import { isAutoCompactEnabled } from './services/compact/autoCompact.js'

// 2. reactiveCompact（实验性，流式处理中实时压缩）
const reactiveCompact = feature('REACTIVE_COMPACT')
  ? require('./services/compact/reactiveCompact.js')
  : null

// 3. contextCollapse（实验性，上下文折叠）
const contextCollapse = feature('CONTEXT_COLLAPSE')
  ? require('./services/contextCollapse/index.js')
  : null

// 4. snipCompact（实验性，基于裁剪的压缩）
const snipModule = feature('HISTORY_SNIP')
  ? require('./services/compact/snipCompact.js')
  : null
```

---

## 七、max_output_tokens 错误恢复

```typescript
const MAX_OUTPUT_TOKENS_RECOVERY_LIMIT = 3  // 最多恢复 3 次

// 当遇到 max_output_tokens 错误时：
// 1. 不立即暴露给 SDK 调用方（因为 SDK 客户端可能会终止会话）
// 2. 增加 maxOutputTokensRecoveryCount
// 3. 如果 < 3，继续循环（Claude 会继续上次的输出）
// 4. 如果 >= 3，放弃恢复，返回错误

function isWithheldMaxOutputTokens(msg): boolean {
  return msg?.type === 'assistant' && msg.apiError === 'max_output_tokens'
}
```

---

## 八、Token Budget 系统

Claude Code 支持 API 级别的任务预算（`task-budgets-2026-03-13` beta）：

```typescript
// QueryParams
taskBudget?: { total: number }  // 整个 agentic turn 的 token 预算

// 每次迭代计算剩余预算
// src/query/tokenBudget.ts
const tracker = createBudgetTracker(taskBudget.total)
for (const iteration of loop) {
  const remaining = tracker.getRemaining(cumulativeUsage)
  if (remaining <= 0) break  // 超出预算，停止循环
  const config = buildQueryConfig({ ...params, remainingBudget: remaining })
}
```

---

## 九、Thinking 规则（注释原文翻译）

```
The rules of thinking are lengthy and fortuitous.
They require plenty of thinking of most long duration and deep meditation
for a wizard to wrap one's noggin around.

规则如下：
1. 包含 thinking 或 redacted_thinking 块的消息，
   必须属于 max_thinking_length > 0 的请求
2. thinking 块不能是块中的最后一个
3. thinking 块必须在整个 assistant trajectory 期间保持：
   - 单个 turn
   - 或者如果该 turn 包含 tool_use 块，
     则延伸到其 tool_result 和后续 assistant 消息

严格遵守这些规则。否则你将面临整整一天的调试和抓狂。
```

---

## 十、QueryEngine.ts 补充功能

### 10.1 会话持久化

```typescript
// 每次交互后保存 transcript
await recordTranscript(sessionId, messages)
await flushSessionStorage()

// 恢复时
const savedMessages = await loadSessionMessages(sessionId)
```

### 10.2 重试逻辑

```typescript
// src/services/api/errors.ts
function categorizeRetryableAPIError(error) {
  if (error.status === 529) return 'overloaded'  // 服务过载
  if (error.status === 500) return 'server_error'
  if (error.status === 408) return 'timeout'
  return 'non_retryable'
}

// 指数退避重试
async function withRetry(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn()
    } catch (e) {
      if (categorizeRetryableAPIError(e) === 'non_retryable') throw e
      await sleep(Math.pow(2, i) * 1000)  // 1s, 2s, 4s
    }
  }
}
```

### 10.3 SDKMessage 输出格式

```typescript
// SDK 模式的结构化输出类型
type SDKMessage =
  | { type: 'user'; message: MessageParam }        // 用户消息
  | { type: 'assistant'; message: Message }         // 助手消息
  | { type: 'system'; subtype: 'init'; ... }       // 初始化信息
  | { type: 'result'; subtype: 'success'; ... }    // 成功结果（含 cost/usage）
  | { type: 'result'; subtype: 'error_max_turns' } // 超出最大轮数
  | { type: 'result'; subtype: 'error_during_execution' }  // 执行错误
```

---

## 十一、性能优化点

### 11.1 Prompt Cache

```typescript
// system prompt 被设计为可缓存的（cache_control: "ephemeral"）
// 确保同一会话的多次调用命中 prompt cache
// forkSubagent.ts 使用父 Agent 的 renderedSystemPrompt 避免重新生成
renderedSystemPrompt?: SystemPrompt  // 父 Agent 冻结的 system prompt
```

### 11.2 headlessProfiler

```typescript
// 性能打点（调试模式）
await queryCheckpoint('before_api_call', state)
const response = await callAPI(...)
await queryCheckpoint('after_api_call', state)
```

### 11.3 Memory Prefetch

```typescript
// 在等待 API 响应时，预取相关的记忆文件
startRelevantMemoryPrefetch(messages, context)
```

---

*上一章：[01-Tool 系统](./01-Tool系统.md) | 下一章：[03-Agent 系统](./03-Agent系统.md)*
