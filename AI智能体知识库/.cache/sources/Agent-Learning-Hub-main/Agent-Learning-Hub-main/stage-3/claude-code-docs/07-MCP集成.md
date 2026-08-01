# Claude Code 源码学习指南 — 第07章：MCP 集成

> **核心文件**：`src/services/mcp/` · `src/tools/MCPTool/` · `src/tools/ListMcpResourcesTool/` · `src/tools/ToolSearchTool/`

---

## 一、MCP 是什么？

**Model Context Protocol (MCP)** 是 Anthropic 制定的开放标准，让 AI 模型可以连接外部工具和数据源。Claude Code 通过 MCP 实现：

- **无限工具扩展**：连接任意外部服务（数据库、API、浏览器等）
- **动态工具加载**：运行时加载新工具，不需要重启
- **资源访问**：读取外部数据源（文件系统、代码库、文档等）

**MCP 架构**：

```
Claude Code (MCP Client)
      │
      │  MCP Protocol (stdio / SSE / HTTP)
      │
      ▼
MCP Server（外部进程）
  ├── Tools（工具列表）
  ├── Resources（数据资源）
  └── Prompts（提示模板）
```

---

## 二、MCP 传输协议

```typescript
// src/services/mcp/client.ts

// 三种传输协议
// 1. stdio（最常用）：通过 stdin/stdout 与子进程通信
const stdioTransport = new StdioClientTransport({
  command: config.command,
  args: config.args,
  env: config.env,
})

// 2. SSE（Server-Sent Events）：通过 HTTP 长连接
const sseTransport = new SSEClientTransport(new URL(config.url))

// 3. StreamableHTTP（新标准）：可双向流式
const httpTransport = new StreamableHTTPClientTransport(new URL(config.url))
```

---

## 三、connectToServer() — 服务器连接流程

```typescript
// src/services/mcp/client.ts

export async function connectToServer(
  config: ScopedMcpServerConfig,
  options: ConnectOptions,
): Promise<MCPServerConnection> {
  // 1. 创建 MCP Client
  const client = new Client({
    name: 'claude-code',
    version: PRODUCT_VERSION,
  })

  // 2. 选择传输协议
  const transport = createTransport(config)

  // 3. 建立连接（带超时）
  await withTimeout(client.connect(transport), CONNECTION_TIMEOUT_MS)

  // 4. 获取工具列表
  const toolsResult = await client.listTools()

  // 5. 将 MCP 工具包装为 Claude Code Tool
  const tools = await fetchToolsForClient(client, config, toolsResult)

  // 6. 获取资源列表（可选）
  const resources = await fetchResourcesForClient(client, config)

  return { client, config, tools, resources, status: 'connected' }
}
```

### MCPServerConnection 类型

```typescript
// src/services/mcp/types.ts

export type MCPServerConnection = {
  client: Client                    // MCP SDK 客户端
  config: ScopedMcpServerConfig     // 服务器配置
  tools: Tool[]                     // 从 MCP 服务器加载的工具
  resources: ServerResource[]       // 从 MCP 服务器加载的资源
  status: 'connecting' | 'connected' | 'failed'
  error?: Error                     // 连接失败时的错误
}
```

---

## 四、fetchToolsForClient() — 工具包装

每个 MCP 工具被包装为 Claude Code 的内部 Tool：

```typescript
// src/services/mcp/client.ts

export async function fetchToolsForClient(
  client: Client,
  config: ScopedMcpServerConfig,
  toolsResult: ListToolsResult,
): Promise<Tool[]> {
  return toolsResult.tools.map(mcpTool => {
    // 工具名格式：mcp__服务名__工具名
    // 例如：mcp__filesystem__read_file
    const toolName = CLAUDE_AGENT_SDK_MCP_NO_PREFIX
      ? mcpTool.name  // 无前缀模式（SDK 特殊模式）
      : `mcp__${config.name}__${mcpTool.name}`

    return MCPTool({
      name: toolName,
      description: mcpTool.description,
      inputSchema: mcpTool.inputSchema,  // 直接使用 MCP 提供的 JSON schema
      serverName: config.name,
      toolName: mcpTool.name,
      client,
      config,
      // 确定是否延迟加载（大量工具时）
      shouldDefer: shouldDeferMCPTool(mcpTool, config),
      alwaysLoad: mcpTool._meta?.['anthropic/alwaysLoad'] === true,
    })
  })
}
```

---

## 五、MCPTool — 动态工具包装器

```typescript
// src/tools/MCPTool/MCPTool.ts

export function MCPTool(params: MCPToolParams): Tool {
  return buildTool({
    name: params.name,
    // MCP 工具使用 JSON Schema，而非 Zod
    inputJSONSchema: params.inputSchema,

    // 保存原始 MCP 服务器/工具名（用于路由）
    mcpInfo: {
      serverName: params.serverName,
      toolName: params.toolName,
    },
    isMcp: true,

    // 延迟加载标志
    shouldDefer: params.shouldDefer,
    alwaysLoad: params.alwaysLoad,

    async call(args, context, canUseTool, parentMessage, onProgress) {
      // 通过 MCP Client 调用远程工具
      const result = await params.client.callTool({
        name: params.toolName,
        arguments: args,
      }, CallToolResultSchema)

      // 处理 MCP 错误码 -32042（需要用户输入/认证）
      if (result.isError && result.error?.code === ErrorCode.InvalidRequest) {
        await handleElicitation(result, context)
      }

      return {
        data: result.content,
        mcpMeta: {
          _meta: result._meta,
          structuredContent: result.structuredContent,
        }
      }
    },

    // 权限检查：MCP 工具有独立的权限配置
    async checkPermissions(input, context) {
      return checkMCPToolPermissions(params, input, context)
    },

    maxResultSizeChars: MAX_MCP_RESULT_SIZE,
  })
}
```

---

## 六、MCP Resources — 外部数据源

除工具外，MCP 服务器还可以提供**资源**（只读数据）：

### 6.1 ListMcpResourcesTool

```typescript
// src/tools/ListMcpResourcesTool/ListMcpResourcesTool.ts

// Claude 用这个工具发现可用资源
export const ListMcpResourcesTool = buildTool({
  name: 'list_mcp_resources',
  isReadOnly: () => true,
  isConcurrencySafe: () => true,

  async call(args, context) {
    const allResources: Record<string, ServerResource[]> = {}

    for (const client of context.options.mcpClients) {
      const resources = await client.client.listResources()
      allResources[client.config.name] = resources.resources
    }

    return { data: allResources }
  },
})
```

### 6.2 ReadMcpResourceTool

```typescript
// src/tools/ReadMcpResourceTool/ReadMcpResourceTool.ts

// Claude 用这个工具读取特定资源
export const ReadMcpResourceTool = buildTool({
  name: 'read_mcp_resource',
  isReadOnly: () => true,
  isConcurrencySafe: () => true,

  inputSchema: z.object({
    server_name: z.string(),  // MCP 服务器名
    uri: z.string(),          // 资源 URI（如 file:///path/to/file）
  }),

  async call(args, context) {
    const client = context.options.mcpClients
      .find(c => c.config.name === args.server_name)

    const result = await client.client.readResource({ uri: args.uri })
    return { data: result.contents }
  },
})
```

---

## 七、ToolSearchTool — 延迟加载机制

当 MCP 工具数量很多时，全部列入 system prompt 会占用大量 context。ToolSearch 实现按需加载：

### 7.1 工具延迟加载原理

```typescript
// Tool 接口中的延迟加载标志
readonly shouldDefer?: boolean   // true → 不在初始 prompt 中出现
readonly alwaysLoad?: boolean    // true → 始终出现（覆盖 shouldDefer）
searchHint?: string             // 关键词（ToolSearch 匹配用）
```

**初始 prompt 中的工具**：只包含 `shouldDefer !== true` 或 `alwaysLoad === true` 的工具。

### 7.2 ToolSearchTool 实现

```typescript
// src/tools/ToolSearchTool/ToolSearchTool.ts

export const ToolSearchTool = buildTool({
  name: 'tool_search',
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  alwaysLoad: true,  // 始终加载（否则 Claude 找不到它）

  inputSchema: z.object({
    query: z.string().describe('Keywords describing what you want to do'),
  }),

  async call(args, context) {
    const { query } = args
    const allTools = context.options.tools

    // 搜索延迟加载的工具
    const deferredTools = allTools.filter(t => t.shouldDefer)
    const matches = searchToolsByKeyword(deferredTools, query)

    // 返回匹配工具的 schema
    return {
      data: matches.map(tool => ({
        name: tool.name,
        description: await tool.description({}, {}),
        inputSchema: tool.inputJSONSchema ?? zodToJsonSchema(tool.inputSchema),
      }))
    }
  },
})

// 关键词匹配逻辑
function searchToolsByKeyword(tools: Tool[], query: string): Tool[] {
  const queryLower = query.toLowerCase()
  return tools.filter(tool => {
    // 匹配工具名
    if (tool.name.toLowerCase().includes(queryLower)) return true
    // 匹配 searchHint
    if (tool.searchHint?.toLowerCase().includes(queryLower)) return true
    return false
  })
}
```

---

## 八、MCP Elicitation — 认证交互协议

当 MCP 服务器需要用户提供信息（如 OAuth token、用户名密码）时，触发 Elicitation：

```typescript
// src/services/mcp/elicitationHandler.ts

// MCP 错误码 -32042 触发 elicitation
// 服务器返回：{ code: -32042, data: { url: "https://oauth.provider/..." } }

// REPL 模式：通过 UI 队列处理
export async function handleElicitationInREPL(
  serverName: string,
  params: ElicitRequestURLParams,
  signal: AbortSignal,
): Promise<ElicitResult> {
  // 将 elicitation 请求放入队列
  return new Promise((resolve, reject) => {
    enqueueElicitationRequest(serverName, params, resolve, reject)
    // UI 轮询队列，弹出确认对话框
  })
}

// SDK 模式：直接处理（不依赖 UI）
export async function handleElicitationInSDK(
  serverName: string,
  params: ElicitRequestURLParams,
  signal: AbortSignal,
): Promise<ElicitResult> {
  // structuredIO.handleElicitation → 通过 stdio 传递给 SDK 调用方
}
```

---

## 九、MCP 配置

### 9.1 服务器配置格式

```json
// ~/.claude/mcp_servers.json 或 .claude/mcp_servers.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    "my-api": {
      "url": "http://localhost:8000/mcp",
      "type": "http"
    }
  }
}
```

### 9.2 ScopedMcpServerConfig

```typescript
// src/services/mcp/types.ts

export type ScopedMcpServerConfig = {
  name: string               // 服务器名（用于工具名前缀）
  type: 'stdio' | 'sse' | 'http'
  command?: string           // stdio 模式：命令
  args?: string[]            // stdio 模式：参数
  env?: Record<string, string>
  url?: string               // sse/http 模式：URL

  // 权限范围
  scope: 'user' | 'project'  // 用户级 vs 项目级
  allowedTools?: string[]    // 只允许使用这些工具
  deniedTools?: string[]     // 禁止使用这些工具
}
```

---

## 十、MCP 工具权限隔离

```typescript
// src/services/mcp/channelPermissions.ts

// MCP 工具有独立的权限上下文
// 例如：filesystem 服务器只能访问指定目录
export function checkMCPToolPermissions(
  serverName: string,
  toolName: string,
  config: ScopedMcpServerConfig,
): PermissionResult {
  // 检查工具是否在允许列表
  if (config.allowedTools && !config.allowedTools.includes(toolName)) {
    return { behavior: 'deny', message: `Tool ${toolName} not allowed for ${serverName}` }
  }

  // 检查工具是否在拒绝列表
  if (config.deniedTools?.includes(toolName)) {
    return { behavior: 'deny', message: `Tool ${toolName} is denied for ${serverName}` }
  }

  return { behavior: 'allow' }
}
```

---

## 十一、MCP Server 配置刷新

```typescript
// src/hooks/useMergedClients.ts

// 支持运行时热加载新的 MCP 服务器
// 当 .claude/mcp_servers.json 变化时，自动重新连接

// ToolUseContext 提供 refreshTools 回调
options.refreshTools?: () => Tools  // MCP 服务器连接后，刷新工具列表
```

---

*上一章：[06-权限系统](./06-权限系统.md) | 下一章：[08-服务层](./08-服务层.md)*
