# Claude Code 源码学习指南 — 第10章：CLI 入口与命令系统

> **核心文件**：`src/entrypoints/` · `src/commands/` · `src/commands.ts` · `src/bootstrap/`

---

## 一、入口层架构

Claude Code 有三种运行模式，对应不同的入口：

```
用户执行 claude 命令
       │
       ▼
cli.tsx（CLI 解析，基于 Commander.js）
       │
       ├── 交互式（默认）→ main.tsx (REPL)
       │                    Ink 渲染，持续对话
       │
       ├── 单次查询 → Print 模式
       │   claude -p "重构这个函数"
       │   结果输出到 stdout，退出
       │
       └── SDK 模式 → QueryEngine
           const engine = new QueryEngine(options)
           for await (const msg of engine.submitMessage(prompt)) { ... }
```

---

## 二、Bootstrap — 启动初始化

```typescript
// src/bootstrap/state.ts

// 会话 ID（每次启动生成新的 UUID）
let sessionId: string | null = null
export function getSessionId(): string {
  if (!sessionId) sessionId = randomUUID()
  return sessionId
}

// 项目根目录（通过 .git、package.json 等探测）
export function getProjectRoot(): string | null {
  return findProjectRoot(getCwd())
}

// 会话持久化开关
export function isSessionPersistenceDisabled(): boolean {
  return isEnvTruthy('CLAUDE_CODE_DISABLE_SESSION_PERSISTENCE')
}

// Token 预算（API 级别）
export function getCurrentTurnTokenBudget(): number | undefined {
  return getFeatureValue_CACHED_MAY_BE_STALE('TURN_TOKEN_BUDGET')
}

// 模型别名系统（Capybara → claude-3-5-sonnet, Tengu → claude-3-7-sonnet）
export function getKairosActive(): boolean {
  return isEnvTruthy('CLAUDE_CODE_KAIROS') || feature('KAIROS')
}
```

---

## 三、Entrypoints — 多模式入口

```
src/entrypoints/
├── agentSdkTypes.ts    # SDK 模式的类型定义
│                         SDKMessage, SDKStatus, SDKPermissionDenial 等
└── ...
```

### 3.1 agentSdkTypes.ts — SDK 消息类型

```typescript
// src/entrypoints/agentSdkTypes.ts

// SDK 模式输出的结构化消息流
export type SDKMessage =
  | {
      type: 'system'
      subtype: 'init'
      session_id: string
      tools: string[]       // 可用工具名列表
      mcp_servers: {...}[]  // MCP 服务器信息
    }
  | {
      type: 'user'
      message: MessageParam  // Anthropic SDK MessageParam
    }
  | {
      type: 'assistant'
      message: AssistantMessage
    }
  | {
      type: 'result'
      subtype: 'success'
      session_id: string
      cost_usd: number        // 本次会话费用
      duration_ms: number
      num_turns: number
      usage: Usage
    }
  | {
      type: 'result'
      subtype: 'error_max_turns'
    }
  | {
      type: 'result'
      subtype: 'error_during_execution'
      error: string
    }

// SDK 状态
export type SDKStatus = 'idle' | 'loading' | 'streaming' | 'error'

// SDK 权限拒绝
export type SDKPermissionDenial = {
  tool_use_id: string
  tool_name: string
  input: unknown
}
```

---

## 四、commands.ts — 命令定义基础

```typescript
// src/commands.ts

export type Command = {
  name: string                   // 命令名（不含 /）
  aliases?: string[]             // 别名
  description: string            // 帮助文字
  isEnabled?: () => boolean      // 是否启用
  isHidden?: boolean             // 是否隐藏（不在帮助列表中）

  // 命令类型
  type: 'local-jsx' | 'local' | 'slash' | 'skill'

  // 执行（local 命令）
  execute?: (args: string, context: ToolUseContext) => Promise<void>

  // 渲染（local-jsx 命令，直接推送 UI）
  render?: (args: string) => React.ReactNode

  // 是否在 slash 命令列表中
  isSlashCommand?: boolean
}
```

---

## 五、60+ 命令完整分类

### 5.1 初始化 & 配置

| 命令 | 功能 |
|------|------|
| `/init` | 初始化项目（创建 CLAUDE.md） |
| `/config` | 配置管理（模型、权限等） |
| `/model` | 切换使用的模型 |
| `/permissions` | 管理权限规则 |
| `/output-style` | 设置输出样式 |
| `/theme` | 切换 UI 主题 |
| `/keybindings` | 键盘绑定配置 |
| `/vim` | 切换 Vim 模式 |

### 5.2 会话管理

| 命令 | 功能 |
|------|------|
| `/resume` | 恢复上一个会话 |
| `/rewind` | 回退到某个消息 |
| `/compact` | 手动触发历史压缩 |
| `/clear` | 清除对话历史 |
| `/export` | 导出会话记录 |
| `/session` | 会话信息 |

### 5.3 Memory & 知识

| 命令 | 功能 |
|------|------|
| `/memory` | 查看/编辑记忆文件 |
| `/context` | 查看当前上下文 |
| `/files` | 管理附加文件 |

### 5.4 Git & 代码

| 命令 | 功能 |
|------|------|
| `/commit` | 生成 git commit message |
| `/commit-push-pr` | 提交并创建 PR |
| `/diff` | 查看文件变更 |
| `/review` | 代码审查 |
| `/branch` | 分支管理 |
| `/pr_comments` | PR 评论管理 |

### 5.5 Agent & Task

| 命令 | 功能 |
|------|------|
| `/agents` | 查看/管理 Agents |
| `/tasks` | 后台任务管理 |
| `/resume` | 恢复 Agent 会话 |
| `/teleport` | 切换远程环境 |

### 5.6 MCP & 插件

| 命令 | 功能 |
|------|------|
| `/mcp` | MCP 服务器管理 |
| `/plugin` | 插件管理 |
| `/skills` | Agent Skills 管理 |
| `/reload-plugins` | 重新加载插件 |

### 5.7 调试 & 诊断

| 命令 | 功能 |
|------|------|
| `/cost` | 查看 token/费用使用 |
| `/usage` | 详细用量统计 |
| `/status` | 系统状态 |
| `/doctor` | 环境诊断 |
| `/debug-tool-call` | 调试工具调用 |
| `/perf-issue` | 性能问题报告 |
| `/heapdump` | 内存堆转储 |

### 5.8 其他功能

| 命令 | 功能 |
|------|------|
| `/plan` | 进入/退出 Plan 模式 |
| `/voice` | 语音模式 |
| `/share` | 分享会话 |
| `/feedback` | 发送反馈 |
| `/release-notes` | 查看更新日志 |
| `/install` | 安装 Claude Code |
| `/login` | 登录/认证 |
| `/logout` | 登出 |
| `/version` | 版本信息 |
| `/help` | 帮助信息 |
| `/exit` | 退出 |

### 5.9 隐藏命令（不在帮助中显示）

```typescript
// src/commands/btw/      → /btw（内部状态信息，Anthropic 员工专用）
// src/commands/stickers/ → /stickers（彩蛋命令）
```

---

## 六、命令处理流程

```typescript
// src/utils/processUserInput/processUserInput.ts

export async function processUserInput(
  input: string,
  context: ProcessUserInputContext,
): Promise<ProcessedInput> {
  // 1. 检测是否是斜杠命令
  if (isSlashCommand(input)) {
    const { commandName, args } = parseSlashCommand(input)
    const command = findCommand(commandName, context.commands)

    if (!command) {
      return {
        type: 'error',
        message: `Unknown command: /${commandName}. Type /help for available commands.`,
      }
    }

    // 执行命令
    return await executeCommand(command, args, context)
  }

  // 2. 检测是否是命令别名
  if (isCommandAlias(input)) {
    return await handleCommandAlias(input, context)
  }

  // 3. 正常的用户消息
  return {
    type: 'message',
    content: input,
    attachments: await extractAttachments(input),
  }
}
```

---

## 七、Skill 命令

```typescript
// src/commands/skills/

// Skill 是可复用的 Agent 工作流
// 存储在 ~/.claude/skills/ 或 .claude/skills/
// 通过 /skills list 查看，通过 skill name 调用

export type SkillCommand = Command & {
  type: 'skill'
  skillPath: string       // SKILL.md 文件路径
  skillContent: string    // SKILL.md 内容（包含执行指令）
}

// 当 Claude 调用 SkillTool 时，SKILL.md 被注入到 Agent 上下文
// Agent 按照 SKILL.md 中的指令执行
```

---

## 八、addDir 命令 — 工作目录管理

```typescript
// src/commands/add-dir/

// 允许 Agent 访问多个工作目录
// 例如：同时处理 frontend/ 和 backend/
export const addDirCommand: Command = {
  name: 'add-dir',
  description: 'Add a directory to the allowed working directories',

  async execute(args, context) {
    const dirPath = path.resolve(args.trim())

    context.setAppState(prev => ({
      ...prev,
      toolPermissionContext: {
        ...prev.toolPermissionContext,
        additionalWorkingDirectories: new Map([
          ...prev.toolPermissionContext.additionalWorkingDirectories,
          [dirPath, { path: dirPath, addedAt: Date.now() }]
        ])
      }
    }))

    console.log(`Added ${dirPath} to working directories`)
  },
}
```

---

## 九、Init 命令 — 项目初始化

```typescript
// src/commands/init.ts

// /init 命令：为项目创建 CLAUDE.md
export async function initProject(context: ToolUseContext): Promise<void> {
  const projectRoot = getProjectRoot()

  // 1. 分析项目结构（运行 ls、cat README.md 等）
  const projectInfo = await analyzeProject(projectRoot, context)

  // 2. 用 AI 生成 CLAUDE.md 内容
  const claudeMdContent = await generateClaudeMd(projectInfo)

  // 3. 写入文件
  await writeFile(path.join(projectRoot, 'CLAUDE.md'), claudeMdContent)

  console.log('Created CLAUDE.md with project context')
}
```

---

## 十、statusline.tsx — 状态栏

```typescript
// src/commands/statusline.tsx

// 底部状态栏显示：
// - 当前模型名
// - Token 用量和费用
// - 当前模式（Plan、Bypass 等）
// - 后台任务数量
// - MCP 连接状态

export function StatusLine() {
  const { mainLoopModel, tasks, toolPermissionContext } = useAppState()
  const { totalCostUsd, tokenCount } = useCostTracker()

  return (
    <Box>
      <Text color="cyan">{renderModelName(mainLoopModel)}</Text>
      <Text> | </Text>
      <Text>${totalCostUsd.toFixed(4)}</Text>
      <Text> | </Text>
      {toolPermissionContext.mode !== 'default' && (
        <Text color="yellow">[{toolPermissionContext.mode}] </Text>
      )}
      {tasks.size > 0 && (
        <Text color="blue">{tasks.size} tasks </Text>
      )}
    </Box>
  )
}
```

---

## 十一、Bridge 模式 — Claude Desktop 集成

```typescript
// src/bridge/
// Claude Desktop App 通过 Bridge 协议与 Claude Code 通信

export async function startBridgeMode(): Promise<void> {
  // 1. 连接到 Claude Desktop
  const bridge = await connectToBridge(getBridgeConfig())

  // 2. 接收来自 Desktop 的消息
  bridge.on('message', async (msg) => {
    const result = await processMessage(msg)
    bridge.send(result)
  })

  // 3. 管理会话生命周期
  bridge.on('disconnect', () => cleanup())
}
```

---

*上一章：[09-UI 层](./09-UI层.md) | 下一章：[11-设计精髓](./11-设计精髓.md)*
