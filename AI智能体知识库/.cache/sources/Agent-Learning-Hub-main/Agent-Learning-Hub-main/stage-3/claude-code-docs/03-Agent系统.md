# Claude Code 源码学习指南 — 第03章：Agent 系统

> **核心文件**：`src/tools/AgentTool/` · `src/coordinator/` · `src/tasks/LocalAgentTask/` · `src/tasks/RemoteAgentTask/`

---

## 一、Agent 系统概览

Claude Code 支持**递归多 Agent 架构**。主 Agent 可以通过 AgentTool 启动子 Agent，子 Agent 可以继续启动孙 Agent，形成任意深度的 Agent 树。

```
Main Agent (REPL / QueryEngine)
        │
        │ AgentTool.call()
        │
   ┌────┴──────────────────────────────────┐
   │                                       │
Local Subagent              Remote Agent (via API)
(runAgent.ts)               (RemoteAgentTask)
   │
   ├── In-Process Teammate
   │   (InProcessTeammateTask)
   │
   ├── Fork Subagent (Git Worktree)
   │   (forkSubagent.ts)
   │
   └── Coordinator Workers (蜂群)
       (coordinatorMode.ts)
```

---

## 二、AgentTool — 子 Agent 的入口

### 2.1 目录结构

```
src/tools/AgentTool/
├── AgentTool.tsx          # 主工具实现（1,338+ 行）
├── UI.tsx                 # 所有 UI 渲染
├── agentColorManager.ts   # Agent 颜色分配（UI 区分）
├── agentDisplay.ts        # Agent 显示名称
├── agentMemory.ts         # Agent 记忆管理
├── agentMemorySnapshot.ts # 记忆快照
├── agentToolUtils.ts      # 进度追踪、生命周期工具函数
├── built-in/              # 内置 Agent 定义
│   └── generalPurposeAgent.js  # generalPurpose Agent
├── builtInAgents.ts       # 内置 Agent 注册
├── constants.ts           # AGENT_TOOL_NAME 等常量
├── forkSubagent.ts        # Fork Subagent（Git Worktree 隔离）
├── loadAgentsDir.ts       # 从 .claude/agents/ 加载用户自定义 Agent
├── prompt.ts              # System prompt
├── resumeAgent.ts         # 恢复已暂停的 Agent
└── runAgent.ts            # 核心：子 Agent 执行逻辑（894+ 行）
```

### 2.2 AgentTool 的 inputSchema

```typescript
// AgentTool 接受的参数
z.object({
  task: z.string(),          // 给子 Agent 的任务描述
  model: z.string().optional(),  // 可指定不同模型
  permissionMode: permissionModeSchema.optional(),  // 权限模式
  // ... 更多参数
})
```

### 2.3 四种 Agent 执行路径

```typescript
// AgentTool.tsx 中的分发逻辑
async call(args, context, canUseTool, parentMessage, onProgress) {
  // 1. 检查是否可以远程运行
  const remoteEligibility = await checkRemoteAgentEligibility(args, context)
  if (remoteEligibility.eligible) {
    return await runRemoteAgent(args, context, onProgress)  // 路径4
  }

  // 2. 检查是否是 Fork Subagent
  if (isForkSubagentEnabled() && args.type === FORK_AGENT) {
    return await runForkSubagent(args, context, onProgress)  // 路径3
  }

  // 3. 检查是否是 Teammate
  if (isTeammate(args)) {
    return await spawnTeammate(args, context, onProgress)   // 路径2（In-Process）
  }

  // 4. 默认：本地子 Agent
  return await runLocalSubagent(args, context, onProgress)  // 路径1
}
```

---

## 三、runAgent.ts — 子 Agent 核心引擎

### 3.1 createSubagentContext() — 状态隔离的精髓

```typescript
// src/utils/forkedAgent.ts
export function createSubagentContext(
  parentContext: ToolUseContext,
  params: CacheSafeParams,
): ToolUseContext {
  return {
    ...parentContext,

    // 关键：子 Agent 的 setAppState 是 no-op
    // 防止子 Agent 的状态操作污染主线程的 AppState
    setAppState: (_f) => {/* no-op */},

    // 但 setAppStateForTasks 打通到根 Store
    // 让子 Agent 可以注册/清理 Task（跨 Agent 共享）
    setAppStateForTasks: parentContext.setAppStateForTasks
      ?? parentContext.setAppState,

    // 独立的 AbortController（但受父 Agent 控制）
    abortController: createChildAbortController(parentContext.abortController),

    // 克隆文件状态缓存（避免 LRU 相互驱逐）
    readFileState: cloneFileStateCache(parentContext.readFileState),

    // 独立的消息历史
    messages: [],

    // 子 Agent 身份
    agentId: params.agentId,
    agentType: params.agentType,

    // 子 Agent 的内容替换状态
    // 默认克隆父 Agent 的（缓存共享），可覆盖
    contentReplacementState: params.contentReplacementState
      ?? cloneContentReplacementState(parentContext.contentReplacementState),
  }
}
```

**关键设计决策**：

| 字段 | 是否隔离 | 原因 |
|------|---------|------|
| `setAppState` | ✅ 隔离（no-op）| 防止状态污染主线程 |
| `setAppStateForTasks` | ❌ 共享（穿透到根） | Task 需要跨 Agent 可见 |
| `messages` | ✅ 隔离（空数组） | 独立对话历史 |
| `readFileState` | ✅ 克隆（独立 LRU） | 避免缓存相互驱逐 |
| `abortController` | ✅ 子 controller | 父取消 → 子自动取消 |
| `contentReplacementState` | ✅ 克隆 | 保持缓存 key 一致性 |

### 3.2 runAgent() 执行流程

```typescript
// src/tools/AgentTool/runAgent.ts
export async function runAgent(
  params: RunAgentParams,
): Promise<AgentResult> {
  const agentId = createAgentId()

  // 1. 注册 Agent（AppState 中记录）
  registerAsyncAgent(agentId, context)

  // 2. 设置 Agent 颜色（UI 区分）
  setAgentColor(agentId, agentColorManager.next())

  // 3. 准备 MCP 服务器（如果 Agent 需要特定 MCP）
  const mcpClients = await connectAgentMCPServers(params.mcpServers)

  // 4. 组装工具集
  const tools = assembleToolPool({
    agentId,
    allowedTools: params.allowedTools,
    mcpClients,
  })

  // 5. 执行 pre-subagent-start hooks
  await executeSubagentStartHooks(agentId, context)

  // 6. 创建子 Agent 上下文
  const subContext = createSubagentContext(context, { agentId })

  // 7. 初始化 system prompt
  const systemPrompt = await buildEffectiveSystemPrompt({
    agentType: params.agentType,
    customSystemPrompt: params.systemPrompt,
    tools,
  })

  // 8. 启动 query() 循环
  try {
    for await (const event of query({
      messages: [createUserMessage(params.task)],
      systemPrompt,
      toolUseContext: subContext,
      canUseTool: params.canUseTool,
      maxTurns: params.maxTurns,
    })) {
      // 实时进度推送
      updateProgressFromMessage(agentId, event, context)
      onProgress?.({ data: getProgressUpdate(agentId) })
      yield event
    }
    completeAsyncAgent(agentId)
  } catch (e) {
    failAsyncAgent(agentId, e)
    throw e
  } finally {
    // 清理：kill Shell tasks、注销 MCP 连接
    killShellTasksForAgent(agentId, context.setAppState)
    unregisterAgentForeground(agentId, context.setAppState)
    cleanupAgentTracking(agentId)
  }
}
```

---

## 四、Fork Subagent — Git Worktree 隔离

Fork Subagent 在独立的 git worktree 中运行，实现真正的**文件系统隔离**：

```typescript
// src/tools/AgentTool/forkSubagent.ts

async function runForkSubagent(args, context) {
  // 1. 创建 git worktree
  const worktreePath = await createAgentWorktree(agentId, baseBranch)
  // git worktree add /tmp/claude-agent-xxx -b agent-xxx

  // 2. 在 worktree 路径下运行 Agent
  await runWithCwdOverride(worktreePath, async () => {
    await runAgent({ ...params, cwd: worktreePath })
  })

  // 3. 检查是否有变更
  const hasChanges = await hasWorktreeChanges(worktreePath)
  if (hasChanges) {
    // 返回 diff 给父 Agent 决策
    return { hasChanges: true, diff: await getWorktreeDiff(worktreePath) }
  }

  // 4. 清理 worktree
  await removeAgentWorktree(worktreePath)
}
```

**使用场景**：
- 需要大量文件修改，但不确定是否要保留
- 多个 Agent 并行实验不同方案
- 安全地探索代码变更

**与普通子 Agent 的区别**：

| 特性 | 普通子 Agent | Fork Subagent |
|------|------------|--------------|
| 文件系统 | 共享（可能冲突） | 独立（git worktree） |
| 变更合并 | 直接生效 | 父 Agent 决策是否合并 |
| 隔离程度 | 进程级 | 文件系统级 |
| 适用场景 | 一般任务 | 实验性修改 |

---

## 五、Coordinator Mode — 蜂群协作

```typescript
// src/coordinator/coordinatorMode.ts

// 蜂群模式下：
// - Coordinator Agent：负责分解任务、分配工作
// - Worker Agents：并行执行子任务
// - 结果汇总：Coordinator 整合所有结果

export function isCoordinatorMode(): boolean {
  return getFeatureValue_CACHED_MAY_BE_STALE('COORDINATOR_MODE')
}
```

**初始化流程**（hooks/useSwarmInitialization.ts）：

```
用户开启 Coordinator Mode
         │
         ▼
useSwarmInitialization()
  ├── 创建 Coordinator Agent（主线程）
  ├── 初始化 Worker Agent 池
  ├── 设置任务分发队列
  └── 注册权限轮询（useSwarmPermissionPoller）
         │
         ▼
Coordinator 收到任务
  ├── 分解为子任务
  ├── 并行分配给 Worker Agents
  └── 等待所有 Worker 完成，汇总结果
```

**与 Fork Subagent 的区别**：
- Coordinator Mode 是持久的工作模式
- Worker Agents 可以共享上下文
- 结果自动汇总，不需要 diff 合并

---

## 六、In-Process Teammate

Teammate 是 UI 可见的**长期 Agent 协作者**，区别于普通一次性子 Agent：

```typescript
// 判断是否是 Teammate
export function isTeammate(args): boolean {
  return args.type === 'in_process_teammate'
}

// 判断是否在 Teammate 上下文中运行
export function isInProcessTeammate(): boolean {
  return getTeammateContext() !== null
}
```

**核心特性**：

1. **UI 可见**：用户可以在 UI 切换查看 Teammate 的对话历史
2. **Mailbox 通信**：通过 `MailboxProvider` 发送消息给 Teammate

```typescript
// src/context/mailbox.ts
// 主 Agent 向 Teammate 发消息
sendMessageToTeammate(teammateId, {
  type: 'user_message',
  content: 'Please help with the authentication module',
})

// Teammate 回复
await receiveFromMailbox(teammateId)
```

3. **会话关联**：

```typescript
// src/utils/teammate.ts
// Teammate 知道自己的父会话 ID
export function getParentSessionId(): string | null {
  return getTeammateContext()?.parentSessionId ?? null
}
```

4. **视图切换**：

```typescript
// AppState 中的 Teammate 视图状态
type AppState = {
  expandedView: 'none' | 'tasks' | 'teammates'
  selectedIPAgentIndex: number  // 选中哪个 Teammate
}
```

---

## 七、内置 Agent 类型

### 7.1 预置 Agent

```typescript
// src/tools/AgentTool/builtInAgents.ts
// 从 built-in/ 目录加载预置 Agent

export const BUILT_IN_AGENTS: AgentDefinition[] = [
  GENERAL_PURPOSE_AGENT,  // 通用 Agent
  // 其他内置 Agent（部分通过 feature gate 控制）
]
```

### 7.2 用户自定义 Agent（loadAgentsDir.ts）

```typescript
// src/tools/AgentTool/loadAgentsDir.ts

export type AgentDefinition = {
  name: string
  description: string
  systemPrompt?: string
  allowedTools?: string[]       // 工具白名单
  requiredMcpServers?: string[] // 前置 MCP 服务器要求
  model?: string                // 指定模型
  maxTurns?: number
}

// 从 .claude/agents/ 加载 YAML/JSON 定义
export async function loadAgentsDir(dir: string): Promise<AgentDefinitionsResult> {
  const files = await glob(`${dir}/*.{yaml,yml,json}`)
  return files.map(f => parseAgentDefinition(f))
}

// 过滤：只列出满足 MCP 前置条件的 Agent
export function filterAgentsByMcpRequirements(
  agents: AgentDefinition[],
  availableMcpServers: string[],
): AgentDefinition[] {
  return agents.filter(agent =>
    !agent.requiredMcpServers ||
    agent.requiredMcpServers.every(s => availableMcpServers.includes(s))
  )
}
```

### 7.3 内置 Agent 类型（ONE_SHOT_BUILTIN_AGENT_TYPES）

```typescript
// 只能运行一次的内置 Agent 类型
export const ONE_SHOT_BUILTIN_AGENT_TYPES = [
  'generalPurpose',
  'explore',
  'shell',
  'browser-use',
  'docs-researcher',
  'best-of-n-runner',
]
```

---

## 八、Remote Agent

Remote Agent 在 Anthropic 的服务器上运行（企业特性）：

```typescript
// src/tasks/RemoteAgentTask/RemoteAgentTask.ts

// 1. 检查是否可以远程运行
export async function checkRemoteAgentEligibility(args, context) {
  return {
    eligible: isRemoteAgentEnabled() && !hasLocalOnlyDependencies(args),
    reason: '...',
  }
}

// 2. 注册远程任务
export async function registerRemoteAgentTask(args, context) {
  const sessionUrl = getRemoteTaskSessionUrl(taskId)
  // 向远程服务器提交任务
  // 轮询状态
  // 流式传输结果
}
```

---

## 九、Agent 进度追踪

AgentTool 在执行过程中持续推送进度给父 Agent 的 UI：

```typescript
// src/tools/AgentTool/agentToolUtils.ts

// 进度推送
export function emitTaskProgress(agentId, event, onProgress) {
  const progress = {
    type: 'agent_progress',
    agentId,
    messageCount: getMessageCount(agentId),
    toolUseCount: getToolUseCount(agentId),
    currentActivity: createActivityDescriptionResolver(agentId),
    tokenCount: getTokenCountFromTracker(agentId),
  }
  onProgress?.({ data: progress })
}

// 活动描述（UI 显示"正在做什么"）
export function createActivityDescriptionResolver(agentId) {
  const lastToolName = getLastToolUseName(agentId)
  return lastToolName
    ? `Using ${lastToolName}`
    : 'Thinking...'
}
```

---

## 十、Agent 颜色系统

为了在 UI 中区分多个并行 Agent，每个 Agent 分配一个颜色：

```typescript
// src/tools/AgentTool/agentColorManager.ts

export type AgentColorName =
  | 'blue' | 'green' | 'yellow' | 'magenta' | 'cyan'
  | 'brightBlue' | 'brightGreen' | 'brightYellow'
  | 'brightMagenta' | 'brightCyan'

// 循环分配颜色
const colorQueue = [...AGENT_COLORS]
export function assignNextColor(): AgentColorName {
  const color = colorQueue.shift()!
  colorQueue.push(color)  // 放回队尾，循环使用
  return color
}
```

---

*上一章：[02-Query 引擎](./02-Query引擎.md) | 下一章：[04-Task 系统](./04-Task系统.md)*
