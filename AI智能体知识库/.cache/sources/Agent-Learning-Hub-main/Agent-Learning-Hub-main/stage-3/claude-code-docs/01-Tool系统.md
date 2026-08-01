# 01 - Tool 系统深度解析

> 基于 `src/Tool.ts`、`src/services/tools/toolExecution.ts`、`src/tools/FileEditTool/` 真实源码

---

## 一、Tool 是什么？

Tool（工具）是 Claude Code 中 **Claude 与外部世界交互的唯一通道**。Claude 本身只能输出文字，所有真实的副作用（读写文件、执行命令、调用 API）都必须通过 Tool 完成。

架构上，Tool 是一个**接口约定**，不是类继承体系。系统中有约 30+ 个内置工具，全部由同一个工厂函数 `buildTool()` 生产。

```
Claude API 返回 tool_use block
        ↓
   toolExecution.ts
   runToolUse() / streamedCheckPermissionsAndCallTool()
        ↓
  validateInput() → checkPermissions() → call()
        ↓
    真实 I/O（文件系统、Shell、网络...）
        ↓
  mapToolResultToToolResultBlockParam()
        ↓
   作为 tool_result 回传给 Claude
```

---

## 二、Tool 接口全解（`src/Tool.ts`）

这是整个系统的核心契约，每个字段都精心设计：

### 2.1 身份标识

```typescript
export type Tool = {
  readonly name: string        // 工具的唯一 ID，如 "str_replace_based_edit_tool"
  aliases?: string[]           // 兼容旧名字，如 "KillShell" → "TaskStop"
  searchHint?: string          // 给 ToolSearch 用的关键词，如 "modify file contents in place"
  isMcp?: boolean              // 是否来自 MCP 外部服务器
  isLsp?: boolean              // 是否是 LSP 语言服务器工具
  readonly shouldDefer?: boolean   // 是否延迟加载（需先调用 ToolSearch）
  readonly alwaysLoad?: boolean    // 永不延迟，始终在系统提示中出现
  readonly strict?: boolean        // 启用 strict JSON schema 模式
  mcpInfo?: { serverName: string; toolName: string }  // MCP 工具的原始服务器信息
}
```

**设计亮点：`aliases`**

当工具改名时，旧名字放入 `aliases`。`findToolByName()` 会查主名和所有别名，确保历史 transcript 中的旧调用不会崩溃：

```typescript
export function findToolByName(tools: Tools, name: string): Tool | undefined {
  return tools.find(t => toolMatchesName(t, name))
}

export function toolMatchesName(
  tool: { name: string; aliases?: string[] },
  name: string,
): boolean {
  return tool.name === name || (tool.aliases?.includes(name) ?? false)
}
```

---

### 2.2 Schema 定义（输入/输出的类型系统）

```typescript
readonly inputSchema: Input           // Zod schema，Claude 会按此填写参数
readonly inputJSONSchema?: ToolInputJSONSchema  // MCP 工具直接提供 JSON Schema
outputSchema?: z.ZodType<unknown>     // 输出类型，用于验证和序列化
```

以 `FileEditTool` 的输入 Schema 为例（`src/tools/FileEditTool/types.ts`）：

```typescript
const inputSchema = lazySchema(() =>
  z.strictObject({
    file_path: z.string().describe('The absolute path to the file to modify'),
    old_string: z.string().describe('The text to replace'),
    new_string: z.string().describe('The text to replace it with'),
    replace_all: semanticBoolean(
      z.boolean().default(false).optional(),
    ).describe('Replace all occurrences of old_string (default false)'),
  }),
)
```

`z.strictObject` 会拒绝任何 schema 外的额外字段，防止模型注入意外参数。`lazySchema` 是延迟初始化包装，避免模块加载时就解析 Zod。

---

### 2.3 核心执行方法：`call()`

```typescript
call(
  args: z.infer<Input>,          // 经过 Zod 解析验证后的输入
  context: ToolUseContext,        // 执行上下文（见下文详解）
  canUseTool: CanUseToolFn,      // 权限检查回调
  parentMessage: AssistantMessage, // 触发此工具的 Claude 消息
  onProgress?: ToolCallProgress<P>, // 进度回调，用于流式更新 UI
): Promise<ToolResult<Output>>
```

`call()` 返回的 `ToolResult<T>` 结构：

```typescript
export type ToolResult<T> = {
  data: T                    // 工具的实际输出
  newMessages?: Message[]    // 工具执行中产生的额外消息（如子 agent 对话）
  contextModifier?: (ctx: ToolUseContext) => ToolUseContext  // 修改后续调用的上下文
  mcpMeta?: {                // MCP 协议元数据透传
    _meta?: Record<string, unknown>
    structuredContent?: Record<string, unknown>
  }
}
```

`contextModifier` 非常关键：它允许工具执行后**修改后续的执行上下文**，但只对非并发安全的工具生效（避免并发竞争）。

---

### 2.4 两阶段安全门：`validateInput()` + `checkPermissions()`

这是 Claude Code 最核心的安全设计：

**第一阶段 `validateInput()`**：纯逻辑验证，不涉及权限 UI

```typescript
validateInput?(
  input: z.infer<Input>,
  context: ToolUseContext,
): Promise<ValidationResult>

// 返回值：
type ValidationResult =
  | { result: true }                    // 通过
  | { result: false; message: string; errorCode: number }  // 拒绝，报错给 Claude
```

以 `FileEditTool.validateInput()` 为例，它会依次检查：
1. `old_string === new_string`？→ 拒绝（没有实际变化）
2. 文件路径在 deny 规则中？→ 拒绝
3. UNC 路径（Windows 网络路径）？→ 特殊处理（防止 NTLM 凭据泄露）
4. 文件超过 1 GiB？→ 拒绝（防止 OOM）
5. 文件不存在且 `old_string` 非空？→ 拒绝并建议相似文件名
6. 文件是 `.ipynb`？→ 拒绝，引导用 NotebookEditTool
7. 文件未被读过？→ 拒绝（必须先 Read 再 Edit）
8. 文件自上次读取后被修改？→ 拒绝（防止覆盖用户改动）
9. `old_string` 在文件中有多处匹配且 `replace_all=false`？→ 拒绝

```typescript
// 真实代码（简化）
const readTimestamp = toolUseContext.readFileState.get(fullFilePath)
if (!readTimestamp || readTimestamp.isPartialView) {
  return {
    result: false,
    behavior: 'ask',
    message: 'File has not been read yet. Read it first before writing to it.',
    errorCode: 6,
  }
}
```

**第二阶段 `checkPermissions()`**：权限判断，可能触发用户弹窗

```typescript
checkPermissions(
  input: z.infer<Input>,
  context: ToolUseContext,
): Promise<PermissionResult>

// 返回：allow / deny / ask（弹出权限确认框）
```

两阶段分离的设计意图：`validateInput` 的错误直接返回给 Claude（Claude 可以自己修正），而 `checkPermissions` 的拒绝可能需要用户确认（不应直接暴露给 Claude 自动处理）。

---

### 2.5 并发控制：`isConcurrencySafe()`

```typescript
isConcurrencySafe(input: z.infer<Input>): boolean
```

这个方法决定工具能否**与其他工具并行执行**。

- 返回 `true`：可以与其他安全工具同时执行（如多个 `FileRead`）
- 返回 `false`（默认值，fail-closed）：必须串行执行

`buildTool()` 的默认值是 `false`，即"假设不安全"。工具需要**主动声明**自己是并发安全的。

典型的并发安全工具：`FileReadTool`、`GrepTool`、`GlobTool`（只读操作）
典型的非并发安全工具：`FileEditTool`（写操作，可能导致竞争条件）

---

### 2.6 渲染方法（Tool 自己负责 UI）

这是 Claude Code 的独特设计：**每个 Tool 负责自己的 UI 渲染**，不依赖通用渲染器。

```typescript
// 工具调用时（流式，input 可能不完整）
renderToolUseMessage(
  input: Partial<z.infer<Input>>,   // 注意是 Partial！流式时参数可能还没全
  options: { theme: ThemeName; verbose: boolean; commands?: Command[] },
): React.ReactNode

// 工具执行中的进度
renderToolUseProgressMessage?(
  progressMessagesForMessage: ProgressMessage<P>[],
  options: { tools: Tools; verbose: boolean; ... },
): React.ReactNode

// 工具完成后的结果
renderToolResultMessage?(
  content: Output,
  progressMessagesForMessage: ProgressMessage<P>[],
  options: { style?: 'condensed'; theme: ThemeName; verbose: boolean; ... },
): React.ReactNode

// 被用户拒绝时
renderToolUseRejectedMessage?(input, options): React.ReactNode

// 出错时
renderToolUseErrorMessage?(result, options): React.ReactNode

// 多个相同工具并行执行时的分组渲染
renderGroupedToolUse?(toolUses[], options): React.ReactNode | null
```

**`renderToolUseMessage` 的 `Partial<Input>` 是精髓**：当 Claude 正在流式输出工具参数时，UI 就立即开始渲染（此时参数还不完整）。这让用户能看到"实时打字"效果。

---

### 2.7 其他关键方法

```typescript
// 工具是否只读（影响安全分类）
isReadOnly(input: z.infer<Input>): boolean

// 工具是否是破坏性操作（删除、覆盖、发送）
isDestructive?(input: z.infer<Input>): boolean

// 用户发新消息时如何处理正在运行的工具
interruptBehavior?(): 'cancel' | 'block'

// 工具结果是否被截断（影响"点击展开"功能）
isResultTruncated?(output: Output): boolean

// 给自动安全分类器的输入（用于 auto 模式）
toAutoClassifierInput(input: z.infer<Input>): unknown

// 工具最大输出字符数（超出则持久化到磁盘）
maxResultSizeChars: number

// 路径感知（权限规则匹配用）
getPath?(input: z.infer<Input>): string

// 观察者输入预处理（展开路径、补充遗留字段）
backfillObservableInput?(input: Record<string, unknown>): void

// 权限规则的模式匹配器工厂（如 "git *" 规则）
preparePermissionMatcher?(
  input: z.infer<Input>,
): Promise<(pattern: string) => boolean>
```

`maxResultSizeChars` 的设计：超过阈值时，工具结果不直接放入上下文，而是写入磁盘，Claude 收到一个文件路径预览。`FileReadTool` 设为 `Infinity`——它本身就负责读文件，持久化会造成循环引用。

---

## 三、`ToolUseContext`：工具的"执行环境"

`ToolUseContext` 是传给每个工具的完整执行环境对象，可以理解为"依赖注入容器"：

```typescript
export type ToolUseContext = {
  // 会话配置
  options: {
    tools: Tools               // 当前可用工具列表
    commands: Command[]        // 可用斜杠命令
    mcpClients: MCPServerConnection[]   // MCP 服务器连接
    mainLoopModel: string      // 使用的模型
    debug: boolean
    verbose: boolean
    isNonInteractiveSession: boolean
    refreshTools?: () => Tools  // 动态刷新工具列表（MCP 热连接）
  }

  // 状态管理
  getAppState(): AppState
  setAppState(f: (prev: AppState) => AppState): void
  setAppStateForTasks?: (f: ...) => void  // 跨子 agent 的全局状态

  // 文件系统状态
  readFileState: FileStateCache  // 记录每个文件的最后读取时间和内容

  // 取消支持
  abortController: AbortController  // 传播取消信号

  // UI 交互（仅 REPL 模式可用）
  setToolJSX?: SetToolJSXFn             // 设置工具专属 JSX 组件
  addNotification?: (notif) => void      // 系统通知
  appendSystemMessage?: (msg) => void    // 追加系统消息
  sendOSNotification?: (opts) => void    // 操作系统通知

  // 消息管理
  messages: Message[]
  setInProgressToolUseIDs: (f: (prev: Set<string>) => Set<string>) => void

  // 权限跟踪
  localDenialTracking?: DenialTrackingState

  // 子 agent 标识
  agentId?: AgentId
  agentType?: string

  // 高级功能
  contentReplacementState?: ContentReplacementState  // 工具结果预算
  renderedSystemPrompt?: SystemPrompt  // Fork 子 agent 共享提示缓存
  queryTracking?: QueryChainTracking   // 调用链追踪（chainId, depth）
  toolDecisions?: Map<string, {...}>   // 工具决策缓存
  requireCanUseTool?: boolean          // Speculation 模式强制检查权限
}
```

这个上下文对象在整个调用链中传递，是实现**依赖注入**的关键。子 agent 和主线程可以共享或隔离不同的上下文字段，从而实现精细的状态隔离。

---

## 四、`buildTool()`：工厂模式与 Fail-Closed 原则

```typescript
// src/Tool.ts

const TOOL_DEFAULTS = {
  isEnabled: () => true,
  isConcurrencySafe: (_input?: unknown) => false,   // 默认不并发安全
  isReadOnly: (_input?: unknown) => false,           // 默认假设写操作
  isDestructive: (_input?: unknown) => false,
  checkPermissions: (input, _ctx?) =>
    Promise.resolve({ behavior: 'allow', updatedInput: input }),  // 默认放行
  toAutoClassifierInput: (_input?: unknown) => '',  // 默认跳过分类器
  userFacingName: (_input?: unknown) => '',
}

export function buildTool<D extends AnyToolDef>(def: D): BuiltTool<D> {
  return {
    ...TOOL_DEFAULTS,
    userFacingName: () => def.name,
    ...def,            // 工具自定义的方法会覆盖默认值
  } as BuiltTool<D>
}
```

**Fail-Closed 原则在默认值中体现**：

| 默认值 | 含义 |
|--------|------|
| `isConcurrencySafe: false` | 假设存在并发风险，保守串行 |
| `isReadOnly: false` | 假设会写入，不给予只读优惠 |
| `checkPermissions: allow` | 把权限控制权交给通用权限系统 |
| `toAutoClassifierInput: ''` | 默认跳过安全分类（新工具加入时不被错误评估） |

新工具只需要关注自己的业务逻辑，安全默认值已经"配置好了"。

---

## 五、工具执行全流程（`toolExecution.ts`）

当 Claude 返回一个 `tool_use` block，`runToolUse()` 负责完整的执行生命周期：

```
                    Claude 返回 tool_use
                           ↓
              runToolUse(toolUse, assistantMessage, ...)
                           ↓
           1. findToolByName()  ← 查找工具（含别名）
                           ↓
           2. 检查 abortController.signal  ← 是否已取消
                           ↓
           3. streamedCheckPermissionsAndCallTool()
              ├── 3a. Zod schema 解析 input
              ├── 3b. backfillObservableInput()  ← 展开路径等预处理
              ├── 3c. validateInput()            ← 逻辑验证
              ├── 3d. runPreToolUseHooks()        ← 外部 Hook（用户脚本）
              ├── 3e. checkPermissions()          ← 权限检查（可能弹窗）
              ├── 3f. canUseTool()                ← Speculation 路径重写
              ├── 3g. tool.call()                 ← 真实执行
              ├── 3h. runPostToolUseHooks()       ← 后置 Hook
              └── 3i. mapToolResultToToolResultBlockParam()  ← 序列化结果
                           ↓
              yield MessageUpdateLazy  ← 每一步都流式 yield 给 query.ts
```

关键细节：整个函数是 `async generator`（`async function*`），每一个重要阶段都会 `yield` 一条消息更新，这样 UI 可以实时渲染进度。

---

## 六、FileEditTool 深度解剖

`FileEditTool` 是最复杂的内置工具，它展示了工业级工具的完整设计：

### 6.1 输入处理流水线

```
Claude 输出 { file_path, old_string, new_string, replace_all }
    ↓
backfillObservableInput()  ←  expandPath() 展开 ~ 和相对路径
    ↓
validateInput()  ←  9 个检查点（见上文）
    ↓
checkPermissions()  ←  checkWritePermissionForTool()
    ↓
call()  ←  真正执行编辑
```

### 6.2 `call()` 内的原子操作

```typescript
async call(input, { readFileState, userModified, updateFileHistoryState, ... }) {
  // 1. 发现并加载技能目录（非阻塞）
  const newSkillDirs = await discoverSkillDirsForPaths([absoluteFilePath], cwd)
  addSkillDirectories(newSkillDirs).catch(() => {})  // fire-and-forget

  // 2. 记录诊断基线（LSP 诊断跟踪）
  await diagnosticTracker.beforeFileEdited(absoluteFilePath)

  // 3. 确保父目录存在
  await fs.mkdir(dirname(absoluteFilePath))

  // 4. 文件历史备份（幂等，基于内容哈希）
  if (fileHistoryEnabled()) {
    await fileHistoryTrackEdit(updateFileHistoryState, absoluteFilePath, parentMessage.uuid)
  }

  // ===== 临界区开始：避免异步操作破坏原子性 =====
  // 5. 再次检查文件未被修改（时间戳 + 内容双重验证）
  const { content: originalFileContents, encoding, lineEndings } = readFileForEdit(absoluteFilePath)
  if (lastWriteTime > lastRead.timestamp) {
    if (!contentUnchanged) throw new Error(FILE_UNEXPECTEDLY_MODIFIED_ERROR)
  }

  // 6. 处理引号归一化（curly quotes vs straight quotes）
  const actualOldString = findActualString(originalFileContents, old_string) || old_string
  const actualNewString = preserveQuoteStyle(old_string, actualOldString, new_string)

  // 7. 执行字符串替换
  const newFileContents = replace_all
    ? originalFileContents.replaceAll(actualOldString, actualNewString)
    : originalFileContents.replace(actualOldString, actualNewString)

  // 8. 保持原始行尾格式（CRLF/LF）
  const finalContents = restoreLineEndings(newFileContents, endings)

  // 9. 原子写入
  await writeTextContent(absoluteFilePath, finalContents, encoding)
  // ===== 临界区结束 =====

  // 10. 通知 VS Code 文件更新（MCP 集成）
  notifyVscodeFileUpdated(absoluteFilePath)

  // 11. 生成 git diff（用于展示给用户）
  const gitDiff = await fetchSingleFileGitDiff(absoluteFilePath)

  // 12. 更新 readFileState（标记文件已被当前轮次写入）
  readFileState.set(absoluteFilePath, { timestamp: Date.now(), content: finalContents })
}
```

几个值得注意的设计决策：

**时间戳 + 内容双重验证**：Windows 上云同步/杀毒软件会修改时间戳但不改内容，纯时间戳检查会产生假阳性。

**`preserveQuoteStyle()`**：如果文件里用的是 `"hello"`（弯引号），而 Claude 输出的是 `"hello"`（直引号），系统会自动归一化，避免因为编码问题导致匹配失败。

**技能目录发现**：编辑某个文件后，系统会异步发现该路径附近的 `SKILL.md` 文件并加载，不阻塞编辑操作。

### 6.3 `inputsEquivalent()` 与 Speculation

```typescript
inputsEquivalent(input1, input2) {
  return areFileEditsInputsEquivalent(
    { file_path: input1.file_path, edits: [{ old_string, new_string, replace_all }] },
    { file_path: input2.file_path, edits: [{ old_string, new_string, replace_all }] },
  )
}
```

这个方法用于 **Speculation（预测执行）** 系统：当预测命中时，用这个方法判断"预测的输入"和"实际的输入"是否等价，等价则直接使用预测结果，不用重新执行。

---

## 七、工具目录总览

```
src/tools/
├── AgentTool/           # 启动子 Agent
├── BashTool/            # 执行 Shell 命令（最复杂的工具之一）
├── ComputerUseTool/     # 计算机视觉操作（截图、点击）
├── FileEditTool/        # 精确字符串替换
├── FileReadTool/        # 读取文件（支持分页、编码检测）
├── FileWriteTool/       # 覆盖写文件（适合新文件）
├── GlobTool/            # 文件模式匹配
├── GrepTool/            # 正则内容搜索
├── LSPDiagnosticsTool/  # LSP 诊断（类型错误、lint）
├── MCPTool/             # 动态代理 MCP 工具
├── NotebookEditTool/    # Jupyter Notebook 专用编辑
├── NotebookReadTool/    # Jupyter Notebook 读取
├── PermissionPromptTool/# 向 SDK 外部宿主请求权限
├── REPLTool/            # 持久 Python REPL 环境
├── TaskTool/            # 任务状态管理（TodoWrite/TodoRead）
├── ToolSearchTool/      # 搜索可用工具（延迟加载场景）
├── WebFetchTool/        # HTTP 请求
├── WebSearchTool/       # 网络搜索
└── shared/              # 共享工具：Git 操作追踪、diff 渲染等
```

---

## 八、工具注册与发现

### 8.1 内置工具注册

所有内置工具在 `src/tools.ts` 中注册：

```typescript
// src/tools.ts（示意）
export function getAllBaseTools(): Tools {
  return [
    BashTool,
    FileReadTool,
    FileEditTool,
    FileWriteTool,
    GlobTool,
    GrepTool,
    AgentTool,
    // ...
  ]
}
```

### 8.2 MCP 工具动态注册

MCP 工具在运行时动态加载，名字格式为 `mcp__<serverName>__<toolName>`（或无前缀模式）。它们通过 `MCPTool` 代理实现，内部实际调用 MCP 服务器。

### 8.3 ToolSearch（延迟加载）

当工具数量过多（超出 Claude 的 context 限制），部分工具设置 `shouldDefer: true`，不出现在初始系统提示中。模型需要先调用 `ToolSearch` 工具搜索，找到工具后才能调用。

```typescript
// 永不延迟的工具（第一轮对话就要用）
readonly alwaysLoad?: boolean  // 如 FileRead、FileEdit、Bash
```

---

## 九、工具权限系统深度

### 9.1 四层权限检查

```
1. validateInput()      ← 工具自己的业务逻辑校验
2. runPreToolUseHooks() ← 外部 Hook 脚本（用户自定义）
3. checkPermissions()   ← 规则引擎（allow/deny/ask）
4. canUseTool()         ← Speculation 路径重写
```

### 9.2 权限决策来源标记

系统追踪每个权限决策的来源，用于 OTel 遥测：

```typescript
// ruleSourceToOTelSource() 的映射：
'session'       → 'user_temporary' (用户本次会话授权)
'localSettings' → 'user_permanent' (写入磁盘的规则)
'userSettings'  → 'user_permanent'
其他            → 'config'         (CLI 参数、环境变量等)

// deny 类型特殊处理：
deny  → 'user_reject'   // 无论来源，用户拒绝就是拒绝
```

### 9.3 权限弹窗的两种模式

- **REPL 模式**：直接展示 TUI 弹窗等待用户输入
- **SDK/Print 模式**：通过 `handleElicitation` 回调委托给宿主程序处理

---

## 十、工具的错误分类

`toolExecution.ts` 中的 `classifyToolError()` 是一个遥测安全的错误分类器：

```typescript
export function classifyToolError(error: unknown): string {
  // TelemetrySafeError：命名时已验证不含代码或路径
  if (error instanceof TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS) {
    return error.telemetryMessage.slice(0, 200)
  }
  if (error instanceof Error) {
    // Node.js 文件系统错误：使用 errno code（ENOENT, EACCES...）
    const errnoCode = getErrnoCode(error)
    if (typeof errnoCode === 'string') return `Error:${errnoCode}`

    // 有 stable name 属性的错误：使用 name（不受代码压缩影响）
    if (error.name && error.name !== 'Error' && error.name.length > 3) {
      return error.name.slice(0, 60)
    }
    return 'Error'
  }
  return 'UnknownError'
}
```

**为什么不直接用 `error.constructor.name`？** 在压缩/混淆后的代码中，`constructor.name` 会变成 `nJT`、`Chq` 这样的无意义字符，无法用于诊断。通过在类定义中**显式设置 `.name`** 属性，可以在压缩后保留可读的名字。

---

## 十一、进度报告机制

工具通过 `onProgress` 回调报告中间状态：

```typescript
type ToolCallProgress<P extends ToolProgressData> = (
  progress: ToolProgress<P>,
) => void

type ToolProgress<P extends ToolProgressData> = {
  toolUseID: string
  data: P   // 具体进度数据，每个工具有自己的类型
}

// 各工具的进度数据类型：
type BashProgress = { type: 'bash_progress'; output: string; ... }
type AgentToolProgress = { type: 'agent_progress'; ... }
type WebSearchProgress = { type: 'web_search_progress'; ... }
```

每次调用 `onProgress`，`StreamingToolExecutor` 会立即将其包装成 `ProgressMessage` 并 yield 给 query 循环，从而实时更新 UI。

---

## 十二、实战：理解一次完整的文件编辑

```
用户: "帮我修改 src/config.ts，把 timeout 从 3000 改为 5000"

1. Claude 先调用 FileRead(src/config.ts)
   → readFileState.set('src/config.ts', { timestamp: now, content: '...' })

2. Claude 返回 tool_use: FileEdit({
     file_path: 'src/config.ts',
     old_string: 'timeout: 3000',
     new_string: 'timeout: 5000'
   })

3. runToolUse() 开始：
   a. findToolByName('str_replace_based_edit_tool') → FileEditTool ✓
   b. abortController.signal.aborted? → false，继续
   c. backfillObservableInput(): expandPath('src/config.ts') → '/abs/path/src/config.ts'
   d. validateInput():
      - old_string ≠ new_string ✓
      - 路径不在 deny 规则 ✓
      - 文件 < 1GiB ✓
      - readFileState 有记录 ✓
      - 时间戳检查通过 ✓
      - 'timeout: 3000' 在文件中出现 1 次 ✓
      → { result: true }
   e. runPreToolUseHooks(): 无配置的 Hook → 跳过
   f. checkPermissions():
      - PermissionMode 为 'default'
      - 文件路径在 allow 规则 → allow
   g. FileEditTool.call():
      - 再次验证时间戳（临界区）
      - findActualString: 找到 'timeout: 3000'
      - preserveQuoteStyle: 无需调整
      - 执行 replace，写入磁盘
      - notifyVscodeFileUpdated()
      - 生成 git diff
   h. runPostToolUseHooks(): 无配置 → 跳过
   i. mapToolResultToToolResultBlockParam():
      → { type: 'tool_result', content: '{ filePath, oldString, newString, structuredPatch }' }

4. query.ts 收到 tool_result，追加到消息列表，继续下一轮 Claude 调用
```

---

## 十三、设计总结

| 设计原则 | 体现 |
|----------|------|
| **接口而非继承** | 所有工具实现同一个 `Tool` 类型，无基类 |
| **Fail-Closed** | 默认值假设最坏情况（非并发安全、写操作） |
| **工具自治 UI** | 每个工具负责自己的渲染逻辑，解耦 UI 和业务 |
| **流式优先** | `renderToolUseMessage` 接受 `Partial<Input>`，支持流式渲染 |
| **两阶段安全** | `validateInput` 给 Claude 看，`checkPermissions` 给用户看 |
| **原子操作** | FileEdit 的临界区避免异步操作，防止并发竞争 |
| **遥测安全** | 错误分类、分析元数据都经过污染检查，不含代码或路径 |
| **类型即文档** | 方法名如 `TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS` 强制执行约束 |
