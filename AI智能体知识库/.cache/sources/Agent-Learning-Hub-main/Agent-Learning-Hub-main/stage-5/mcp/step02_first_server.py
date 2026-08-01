"""
Step 2 — 创建第一个 MCP 服务器

MCP 客户端（Cursor / Claude Desktop）通过 stdio 启动本脚本并与之通信。

运行（调试时可手动启动，正常由客户端拉起）：
    python step02_first_server.py

或用 FastMCP CLI：
    fastmcp run step02_first_server.py
"""

from fastmcp import FastMCP

mcp = FastMCP(
    "Stage5 Hello Server",
    instructions="一个最小教学用 MCP 服务器，只提供 hello 工具。",
)


@mcp.tool
def hello(name: str = "World") -> str:
    """向指定名字返回问候语。"""
    return f"Hello, {name}!"


if __name__ == "__main__":
    # 默认 transport="stdio"，适合本地 IDE 集成
    mcp.run()
