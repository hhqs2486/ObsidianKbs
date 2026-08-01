# MCP Transport 对比：stdio、SSE 与 Streamable HTTP

MCP（Model Context Protocol）规定的是**客户端与服务器之间交换什么消息**（tools / resources / prompts），但没有规定**消息怎么传**。传输层（Transport）负责把 JSON-RPC 消息从 A 送到 B。FastMCP 目前支持三种主流方式。

---

## 一句话对照

| Transport | 典型场景 | 连接方式 | 双向通信 | 推荐度 |
| --- | --- | --- | --- | --- |
| **stdio** | Cursor、Claude Desktop、本地 CLI | 客户端启动子进程，走 stdin/stdout | ✅ | 本地首选 |
| **Streamable HTTP** | 远程服务、多客户端、生产部署 | HTTP POST + 可选流式响应 | ✅ 完整双向 | 网络首选 |
| **SSE** | 旧版远程 MCP 客户端 | HTTP + Server-Sent Events | ⚠️ 主要是服务端→客户端推送 | 仅兼容遗留 |

> FastMCP 2.x 中，`transport="http"` 即 Streamable HTTP；部分文档也写作 `streamable-http`，含义相同。

---

## 1. stdio（标准输入/输出）

### 工作方式

```text
MCP 客户端（Cursor）
    │  fork / spawn
    ▼
python movie_server.py
    │  stdin  ← 客户端写入 JSON-RPC 请求
    │  stdout → 客户端读取 JSON-RPC 响应
    ▼
（进程随客户端退出而结束）
```

客户端**拥有服务器进程的生命周期**：启动、传环境变量、杀进程都在客户端侧完成。

### 优点

- 零网络配置，本机即插即用
- 天然进程隔离，适合访问本地文件系统
- Claude Desktop、Cursor 默认配置方式

### 缺点

- 一台机器一个进程，难以水平扩展
- 子进程**默认不继承** shell 环境变量，需在 MCP 配置里显式传 `env`
- 无法被局域网内其他机器直接调用

### FastMCP 示例

```python
from fastmcp import FastMCP

mcp = FastMCP("Demo")

@mcp.tool
def ping() -> str:
    return "pong"

if __name__ == "__main__":
    mcp.run()  # 默认 transport="stdio"
```

### Cursor 配置片段

```json
{
  "mcpServers": {
    "movie-recommender": {
      "command": "python",
      "args": ["/绝对路径/stage-5/mcp/movie_server.py"],
      "cwd": "/绝对路径/stage-5"
    }
  }
}
```

---

## 2. Streamable HTTP（流式 HTTP，现行标准）

### 工作方式

```text
MCP 客户端                    MCP 服务器（常驻进程）
    │  HTTP POST /mcp  ──────────────►  FastMCP + Uvicorn
    │  （JSON-RPC 请求体）              处理 tools/list、tools/call …
    │◄──────────────  HTTP 响应 / 流式 chunk
    ▼
可多个客户端同时连接同一 URL
```

2025 年起，MCP 规范将 **Streamable HTTP** 定为远程传输的推荐方案。它在**单个 HTTP 端点**上支持完整的双向语义，包括流式返回，比早期 SSE 方案更完整。

### 优点

- 适合 Docker、K8s、Serverless 网关后面挂服务
- 可加 Authorization Header、API Gateway、限流
- 一个实例服务多个客户端
- 新客户端应优先实现此协议

### 缺点

- 需要处理端口、TLS、鉴权、进程守护
- 本地调试比 stdio 多一步（要先 `curl` 或 Client 连 URL）

### FastMCP 示例

```python
mcp.run(
    transport="http",       # Streamable HTTP
    host="127.0.0.1",
    port=8000,
    path="/mcp",
)
```

启动后客户端连接：`http://127.0.0.1:8000/mcp`

### 与 stdio 的关系

两者传的是**同一套 MCP 消息**，只是载体不同。可以用 FastMCP `Client` + `StreamableHttpTransport` 连远程服务，或用 `StdioTransport` 连本地脚本——业务层的 `@mcp.tool` 代码通常不用改。

---

## 3. SSE（Server-Sent Events，遗留兼容）

### 工作方式

早期远程 MCP 实现里，客户端先连 `/sse` 建立**单向事件流**（服务端推），再通过单独的 HTTP POST 通道发请求。通信被拆成「一条长连接 + 若干短请求」，实现和运维都比 Streamable HTTP 笨重。

```text
客户端 ──GET /sse──► 服务端（保持长连接，推送事件）
客户端 ──POST──────► 服务端（发送 RPC 请求）
```

### 优点

- 已有旧客户端、旧网关只认 SSE 时仍能对接
- 某些只熟悉「EventSource」的前端团队上手快

### 缺点

- MCP 官方已将其标为**遗留**；新客户端应实现 Streamable HTTP
- 双向能力弱于 Streamable HTTP，连接管理更复杂
- 同一服务若要同时兼容新旧客户端，往往要**同时暴露** `/sse` 和 `/mcp` 两个端点

### FastMCP 示例

```python
mcp.run(transport="sse", host="127.0.0.1", port=8000)
# 客户端通常连接 http://127.0.0.1:8000/sse
```

---

## 三者之间的联系

可以把它们理解成**同一协议栈的不同物理层**：

```text
┌─────────────────────────────────────┐
│  MCP 语义层：tools / resources / prompts │
├─────────────────────────────────────┤
│  JSON-RPC 消息编解码                    │
├──────────┬──────────────┬───────────┤
│  stdio   │ Streamable   │    SSE    │
│  管道    │    HTTP      │  事件流   │
└──────────┴──────────────┴───────────┘
```

- **联系**：同一 `@mcp.tool` 函数，改 `mcp.run(transport=...)` 即可切换传输，无需重写业务逻辑。
- **区别**：部署形态、扩展性、客户端兼容矩阵不同。
- **迁移路径**：stdio 本地验证 → Streamable HTTP 上云；仅当必须兼容旧客户端时再开 SSE 端点。

---

## 选型建议

| 你的情况 | 选什么 |
| --- | --- |
| 在 Cursor / Claude Desktop 里用 | **stdio** |
| 团队共用一台远程 MCP 服务 | **Streamable HTTP** |
| 公司网关只支持 SSE 的老集成 | **SSE**（短期）+ 计划迁到 HTTP |
| 单元测试、CI | **内存 Client**（`Client(mcp)`，见 `step06_testing.py`） |
| 同时兼容新旧远程客户端 | HTTP `/mcp` + SSE `/sse` 双端点 |

---

## 常见误区

**Q: SSE 和 Streamable HTTP 都是 HTTP，可以混用吗？**  
不行。URL 路径、握手、会话管理方式不同，客户端必须按对应 transport 实现连接。

**Q: stdio 安全吗？**  
进程由可信客户端启动时，攻击面主要是工具本身能访问什么（文件、网络）。HTTP 暴露到公网则必须加鉴权。

**Q: `transport="http"` 和 `"streamable-http"` 有区别吗？**  
在 FastMCP 2.6+ 中视为同一实现的不同别名，优先写 `http`。

---

## 延伸阅读

- [Model Context Protocol — Transports](https://modelcontextprotocol.io/docs/concepts/transports)
- [FastMCP — Running Your Server](https://gofastmcp.com/deployment/running-server)
- [Cloudflare — Streamable HTTP MCP](https://blog.cloudflare.com/streamable-http-mcp-servers-python/)
