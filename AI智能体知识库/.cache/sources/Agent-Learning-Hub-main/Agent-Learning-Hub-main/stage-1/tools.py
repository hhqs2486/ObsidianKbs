"""工具定义与执行 — Step 3 起会用到。"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

# 交给模型的工具 schema（OpenAI tools 格式）
TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "计算数学表达式，例如 (12 + 8) * 3",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "仅含数字与 + - * / ( ) 的表达式",
                    }
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "读取 stage-1 目录下的文本文件内容",
            "parameters": {
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "文件名，例如 notes.txt",
                    }
                },
                "required": ["filename"],
            },
        },
    },
]

STAGE_DIR = Path(__file__).resolve().parent


def calculator(expression: str) -> str:
    allowed = set("0123456789+-*/(). ")
    if not all(ch in allowed for ch in expression):
        return "错误：表达式含非法字符"
    try:
        # 教学用：仅允许简单算术字符
        value = eval(expression, {"__builtins__": {}}, {})  # noqa: S307
        return str(value)
    except Exception as exc:  # noqa: BLE001
        return f"计算失败: {exc}"


def read_file(filename: str) -> str:
    path = (STAGE_DIR / filename).resolve()
    if STAGE_DIR not in path.parents and path != STAGE_DIR:
        return "错误：不允许读取 stage-1 目录外的文件"
    if not path.exists():
        return f"错误：文件不存在 {filename}"
    return path.read_text(encoding="utf-8")


def run_tool(name: str, arguments_json: str) -> str:
    """根据模型返回的 tool call 执行本地工具。"""
    try:
        args = json.loads(arguments_json or "{}")
    except json.JSONDecodeError:
        return "错误：arguments 不是合法 JSON"

    if name == "calculator":
        return calculator(str(args.get("expression", "")))
    if name == "read_file":
        return read_file(str(args.get("filename", "")))
    return f"错误：未知工具 {name}"
