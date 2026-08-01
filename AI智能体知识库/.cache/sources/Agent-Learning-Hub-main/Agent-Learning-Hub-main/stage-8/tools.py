"""Stage 8 tool schemas and local executors."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Evaluate a simple arithmetic expression, e.g. (12 + 8) * 3",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Digits and + - * / ( ) only",
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
            "description": "Read a UTF-8 text file under the Agent-Learning-Hub repo",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Repo-relative path, e.g. stage-1/notes.txt",
                    }
                },
                "required": ["path"],
            },
        },
    },
]

REPO_ROOT = Path(__file__).resolve().parents[1]


def calculator(expression: str) -> str:
    allowed = set("0123456789+-*/(). ")
    if not all(ch in allowed for ch in expression):
        return "错误：表达式含非法字符"
    try:
        value = eval(expression, {"__builtins__": {}}, {})  # noqa: S307
        return str(value)
    except Exception as exc:  # noqa: BLE001
        return f"计算失败: {exc}"


def read_file(path: str) -> str:
    candidate = (REPO_ROOT / path).resolve()
    try:
        candidate.relative_to(REPO_ROOT.resolve())
    except ValueError:
        return "错误：不允许读取仓库外的文件"
    if not candidate.is_file():
        return f"错误：文件不存在 {path}"
    return candidate.read_text(encoding="utf-8")


def run_tool(name: str, arguments_json: str) -> str:
    try:
        args = json.loads(arguments_json or "{}")
    except json.JSONDecodeError:
        return "错误：arguments 不是合法 JSON"

    if name == "calculator":
        return calculator(str(args.get("expression", "")))
    if name == "read_file":
        return read_file(str(args.get("path", "")))
    return f"错误：未知工具 {name}"
