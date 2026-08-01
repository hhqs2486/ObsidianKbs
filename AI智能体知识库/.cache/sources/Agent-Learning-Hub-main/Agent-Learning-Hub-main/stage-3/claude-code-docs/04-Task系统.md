# Claude Code 源码学习指南 — 第04章：Task 系统

> **核心文件**：`src/Task.ts` · `src/tasks/` · `src/utils/task/`

---

## 一、Task 系统是什么？

Task 系统管理所有**长期运行的异步操作**。当一个操作无法在同步的工具调用中完成时（如长时运行的 Shell 命令、后台 Agent），就需要 Task 系统来管理其生命周期。

**Task vs 工具调用的区别**：
- 工具调用：同步完成，结果直接返回（`tool.call()` → `ToolResult`）
- Task：异步运行，输出写磁盘，UI 轮询显示进度

---

## 二、Task 类型系统

### 2.1 TaskType — 7 种任务类型

```typescript
// src/Task.ts
export type TaskType =
  | 'local_bash'          // Shell 命令后台运行
  | 'local_agent'         // 本地子 Agent
  | 'remote_agent'        // 远程 Agent（Anthropic 服务器）
  | 'in_process_teammate' // 进程内 Teammate
  | 'local_workflow'      // 本地工作流（feature gate）
  | 'monitor_mcp'         // MCP 服务器监控
  | 'dream'               // 自主任务（KAIROS，feature gate）
```

### 2.2 TaskId 格式

```typescript
// Task ID = 前缀字母 + 8位随机字符（36进制）
const TASK_ID_PREFIXES: Record<TaskType, string> = {
  local_bash:          'b',   // e.g. b3f7a2k1
  local_agent:         'a',   // e.g. a8m2n5p9
  remote_agent:        'r',   // e.g. r1x4y7z2
  in_process_teammate: 't',   // e.g. t6q3r8s5
  local_workflow:      'w',   // e.g. w9k2l4m7
  monitor_mcp:         'm',   // e.g. m5n8p3q1
  dream:               'd',   // e.g. d2x7y1z4
}

// 36^8 ≈ 2.8 万亿组合，足以抵抗暴力 symlink 攻击
const TASK_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

export function generateTaskId(type: TaskType): string {
  const prefix = TASK_ID_PREFIXES[type]
  const bytes = randomBytes(8)
  let id = prefix
  for (let i = 0; i < 8; i++) {
    id += TASK_ID_ALPHABET[bytes[i]! % TASK_ID_ALPHABET.length]
  }
  return id  // e.g. "b3f7a2k1"
}
```

### 2.3 TaskStatus — 状态机

```typescript
export type TaskStatus =
  | 'pending'    // 已创建，等待启动
  | 'running'    // 正在执行
  | 'completed'  // 成功完成（终态）
  | 'failed'     // 执行失败（终态）
  | 'killed'     // 被强制终止（终态）

// 判断终态（completed/failed/killed）
// 用于：防止向死亡 Task 注入消息、清理过期 Task
export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return status === 'completed'
      || status === 'failed'
      || status === 'killed'
}
```

**状态转换图**：

```
        ┌──────────────────────┐
  创建  │                      │
   ↓    │                      │
pending ──→ running ──→ completed (终态)
                  │
                  ├──→ failed    (终态)
                  │
                  └──→ killed    (终态)
```

---

## 三、TaskStateBase — 所有 Task 的公共字段

```typescript
// src/Task.ts
export type TaskStateBase = {
  id: string                // 任务 ID（带类型前缀）
  type: TaskType            // 任务类型
  status: TaskStatus        // 当前状态
  description: string       // 任务描述（UI 显示）
  toolUseId?: string        // 关联的工具调用 ID
  startTime: number         // 启动时间戳（Date.now()）
  endTime?: number          // 结束时间戳
  totalPausedMs?: number    // 暂停的总时长（毫秒）
  outputFile: string        // 磁盘输出文件路径
  outputOffset: number      // 已读取的字节偏移量
  notified: boolean         // 是否已发送完成通知
}
```

**outputFile 和 outputOffset 的设计**：

```typescript
// 每个 Task 有一个专属输出文件
// 例如：~/.claude/tasks/b3f7a2k1.txt
outputFile: getTaskOutputPath(id)

// outputOffset：记录 UI 已读取到哪个位置
// UI 轮询时只读新增部分（增量读取）
outputOffset: 0  // 初始为 0

// 好处：进程崩溃后可以从磁盘恢复 Task 状态
```

---

## 四、Task 目录结构

```
src/tasks/
├── DreamTask/              # 自主任务（KAIROS feature gate）
├── InProcessTeammateTask/  # 进程内 Teammate 任务
├── LocalAgentTask/         # 本地子 Agent 任务
│   └── LocalAgentTask.ts   # 完整的 Agent Task 生命周期管理
├── LocalMainSessionTask.ts # 主会话任务（单例）
├── LocalShellTask/         # Shell 命令后台任务
│   ├── LocalShellTask.ts   # 后台 Shell 执行引擎
│   └── killShellTasks.ts   # 任务终止逻辑
├── RemoteAgentTask/        # 远程 Agent 任务
│   └── RemoteAgentTask.ts  # 远程任务注册和轮询
├── pillLabel.ts            # UI 标签（任务类型图标）
├── stopTask.ts             # 统一停止接口
└── types.ts                # TaskState 联合类型
```

---

## 五、LocalShellTask — Shell 命令后台化

### 5.1 为什么需要后台 Shell Task？

BashTool 默认同步执行 Shell 命令，但有些命令需要长时运行：
- 启动开发服务器（`npm run dev`）
- 运行测试套件（`pytest -v`）
- 执行长时间的构建

### 5.2 前台 ↔ 后台 切换

```typescript
// src/tasks/LocalShellTask/LocalShellTask.ts

// BashTool 超时阈值（15秒）
const ASSISTANT_BLOCKING_BUDGET_MS = 15_000

// 启动后台 Shell Task
export async function spawnShellTask(
  input: LocalShellSpawnInput,
  context: ToolUseContext,
): Promise<TaskHandle> {
  const taskId = generateTaskId('local_bash')
  const outputFile = getTaskOutputPath(taskId)

  // 创建子进程，输出重定向到文件
  const process = spawn(input.command, {
    cwd: getCwd(),
    stdio: ['ignore', outputFile, outputFile],
  })

  // 在 AppState 中注册 Task
  context.setAppStateForTasks(prev => ({
    ...prev,
    tasks: new Map([...prev.tasks, [taskId, createTaskState(taskId, input)]])
  }))

  return { taskId, cleanup: () => process.kill() }
}

// 注册为前台（用户可以"接管"查看输出）
export function registerForeground(
  taskId: string,
  context: ToolUseContext,
): void {
  context.setAppState(prev => ({
    ...prev,
    tasks: new Map([
      ...prev.tasks,
      [taskId, { ...prev.tasks.get(taskId)!, isForeground: true }]
    ])
  }))
}

// 将前台 Task 转为后台
export function backgroundExistingForegroundTask(
  taskId: string,
  context: ToolUseContext,
): void {
  context.setAppState(prev => ({
    ...prev,
    tasks: updateTaskField(prev.tasks, taskId, { isForeground: false })
  }))
}
```

### 5.3 输出轮询

```typescript
// UI 通过轮询 outputOffset 显示实时输出
// src/hooks/useTasksV2.ts

function pollTaskOutput(taskId: string, currentOffset: number) {
  const outputFile = getTaskOutputPath(taskId)
  const content = readFileSync(outputFile)
  const newContent = content.slice(currentOffset)  // 只读新增部分

  if (newContent.length > 0) {
    displayNewOutput(newContent)
    updateOffset(taskId, currentOffset + newContent.length)
  }
}
```

---

## 六、LocalAgentTask — Agent 任务生命周期

```typescript
// src/tasks/LocalAgentTask/LocalAgentTask.ts

// 注册异步 Agent（Task 进入 running 状态）
export function registerAsyncAgent(agentId: AgentId, context): void {
  context.setAppStateForTasks(prev => addAgentTask(prev, agentId))
}

// 更新 Agent 进度
export function updateAgentProgress(agentId, progress, context): void {
  context.setAppStateForTasks(prev => updateTaskProgress(prev, agentId, progress))
}

// 完成 Agent Task（终态：completed）
export function completeAgentTask(agentId, result, context): void {
  context.setAppStateForTasks(prev => ({
    ...prev,
    tasks: setTaskStatus(prev.tasks, agentId, 'completed')
  }))
  enqueueAgentNotification(agentId, 'completed', context)
}

// Agent Task 失败（终态：failed）
export function failAgentTask(agentId, error, context): void {
  context.setAppStateForTasks(prev => ({
    ...prev,
    tasks: setTaskStatus(prev.tasks, agentId, 'failed', error.message)
  }))
  enqueueAgentNotification(agentId, 'failed', context)
}

// 强制终止 Agent（终态：killed）
export async function killAsyncAgent(taskId, setAppState): Promise<void> {
  // 1. 找到 Agent 的 AbortController
  const controller = getAgentAbortController(taskId)
  // 2. 触发中止
  controller?.abort()
  // 3. 更新状态
  setAppState(prev => setTaskStatus(prev, taskId, 'killed'))
  // 4. 清理 Shell Task（Agent 可能启动了子 Shell）
  await killShellTasksForAgent(taskId, setAppState)
}
```

---

## 七、TaskOutput — 磁盘 I/O 工具类

```typescript
// src/utils/task/TaskOutput.ts

export class TaskOutput {
  private file: FileHandle
  private path: string

  constructor(taskId: string) {
    this.path = getTaskOutputPath(taskId)
  }

  // 追加输出到文件
  async append(data: string): Promise<void> {
    await this.file.appendFile(data, 'utf-8')
  }

  // 从指定偏移量读取（增量）
  async readFrom(offset: number): Promise<{ data: string; newOffset: number }> {
    const stat = await this.file.stat()
    if (offset >= stat.size) return { data: '', newOffset: offset }

    const buffer = Buffer.alloc(stat.size - offset)
    await this.file.read(buffer, 0, buffer.length, offset)
    return {
      data: buffer.toString('utf-8'),
      newOffset: stat.size,
    }
  }
}

// 输出文件路径规则
export function getTaskOutputPath(taskId: string): string {
  // ~/.claude/tasks/<taskId>.txt
  return path.join(getClaudeDataDir(), 'tasks', `${taskId}.txt`)
}
```

---

## 八、stopTask.ts — 统一停止接口

```typescript
// src/tasks/stopTask.ts

// 按类型分发到对应的 Task 实现
export async function stopTask(
  taskId: string,
  setAppState: SetAppState,
): Promise<void> {
  const taskType = getTaskTypeFromId(taskId)  // 从前缀推断类型

  const task = getTaskByType(taskType)
  await task.kill(taskId, setAppState)
}

// 每种 Task 类型的 kill 实现
// 所有 kill 只需要 setAppState（getAppState/abortController 已被移除）
const TASK_IMPLS: Record<TaskType, Task> = {
  local_bash:          LocalShellTaskImpl,
  local_agent:         LocalAgentTaskImpl,
  remote_agent:        RemoteAgentTaskImpl,
  in_process_teammate: InProcessTeammateTaskImpl,
  // ...
}
```

---

## 九、Task 通知系统

Task 完成后，系统通过多种方式通知用户：

```typescript
// src/tasks/LocalAgentTask/LocalAgentTask.ts

export function enqueueAgentNotification(
  agentId: AgentId,
  status: 'completed' | 'failed',
  context: ToolUseContext,
): void {
  if (status === 'completed') {
    // 1. OS 通知（iTerm2/Kitty/Ghostty/bell）
    context.sendOSNotification?.({
      message: `Agent ${agentId} completed`,
      notificationType: 'agent_complete',
    })

    // 2. UI 内通知（通知面板）
    context.addNotification?.({
      type: 'agent_complete',
      agentId,
      timestamp: Date.now(),
    })

    // 3. Away Summary（用户离开时的摘要通知）
    // src/services/awaySummary.ts
  }
}
```

---

## 十、Task 在 AppState 中的位置

```typescript
// src/state/AppStateStore.ts
type AppState = {
  tasks: Map<string, TaskState>  // taskId → TaskState
  // ...
}

// TaskState 联合类型（每种 TaskType 有自己的状态字段）
type TaskState =
  | LocalShellTaskState
  | LocalAgentTaskState
  | RemoteAgentTaskState
  | InProcessTeammateTaskState
  // ...

// 每种状态都扩展 TaskStateBase
type LocalShellTaskState = TaskStateBase & {
  type: 'local_bash'
  command: string
  isForeground: boolean
  kind: 'bash' | 'monitor'
  pid?: number
}
```

---

## 十一、useTasksV2 — 任务 UI Hook

```typescript
// src/hooks/useTasksV2.ts

export function useTasksV2(): {
  tasks: TaskState[]
  completedTasks: TaskState[]
  runningTasks: TaskState[]
} {
  const appState = useAppState()

  // 按状态分组
  const allTasks = Array.from(appState.tasks.values())
  return {
    tasks: allTasks,
    runningTasks: allTasks.filter(t => t.status === 'running'),
    completedTasks: allTasks.filter(t => isTerminalTaskStatus(t.status)),
  }
}
```

---

*上一章：[03-Agent 系统](./03-Agent系统.md) | 下一章：[05-状态管理](./05-状态管理.md)*
