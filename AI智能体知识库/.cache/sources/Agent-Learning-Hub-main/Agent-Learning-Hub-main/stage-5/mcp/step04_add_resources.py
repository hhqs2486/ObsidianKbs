"""
Step 4 — 为 MCP 服务器添加资源（Resources）

资源 = 客户端可读取的只读数据，通常用 URI 标识（如 movie://1）。

运行：python step04_add_resources.py
"""

from __future__ import annotations

import json

from common import load_movies
from fastmcp import FastMCP

mcp = FastMCP("Stage5 Movie Resources")


@mcp.resource("movie://catalog")
def movie_catalog() -> str:
    """返回全部电影的 JSON 目录。"""
    return json.dumps(load_movies(), ensure_ascii=False, indent=2)


@mcp.resource("movie://{movie_id}")
def movie_detail(movie_id: str) -> str:
    """按 ID 返回单部电影详情。"""
    movie_id_int = int(movie_id)
    for movie in load_movies():
        if movie["id"] == movie_id_int:
            return json.dumps(movie, ensure_ascii=False, indent=2)
    return json.dumps({"error": f"未找到 id={movie_id} 的电影"}, ensure_ascii=False)


@mcp.resource("config://server-info")
def server_info() -> str:
    """返回服务器元信息。"""
    return json.dumps(
        {
            "name": "Stage5 Movie Resources",
            "data_source": "sample_data/movies.json",
            "resource_templates": ["movie://{movie_id}"],
        },
        ensure_ascii=False,
        indent=2,
    )


if __name__ == "__main__":
    mcp.run()
