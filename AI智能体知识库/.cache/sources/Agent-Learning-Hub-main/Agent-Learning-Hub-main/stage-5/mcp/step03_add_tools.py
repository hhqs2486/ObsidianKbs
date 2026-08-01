"""
Step 3 — 为 MCP 服务器添加工具（Tools）

工具 = 模型可调用的函数。FastMCP 根据类型注解和 docstring 自动生成 JSON Schema。

运行：python step03_add_tools.py
"""

from __future__ import annotations

from common import load_movies
from fastmcp import FastMCP

mcp = FastMCP("Stage5 Movie Tools")


@mcp.tool
def search_movies(keyword: str, limit: int = 3) -> list[dict]:
    """按片名或简介关键词搜索电影。"""
    keyword_lower = keyword.lower()
    results = [
        movie
        for movie in load_movies()
        if keyword_lower in movie["title"].lower()
        or keyword_lower in movie["summary"]
    ]
    return results[:limit]


@mcp.tool
def get_movie_by_id(movie_id: int) -> dict:
    """根据电影 ID 返回详情。"""
    for movie in load_movies():
        if movie["id"] == movie_id:
            return movie
    return {"error": f"未找到 id={movie_id} 的电影"}


@mcp.tool
def recommend_by_genre(genre: str, top_k: int = 2) -> list[dict]:
    """按类型推荐评分最高的电影。"""
    genre_lower = genre.lower()
    matched = [
        movie
        for movie in load_movies()
        if any(genre_lower in g.lower() for g in movie["genres"])
    ]
    matched.sort(key=lambda m: m["rating"], reverse=True)
    return matched[:top_k]


if __name__ == "__main__":
    mcp.run()
