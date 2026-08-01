"""
Step 3 — 定义工具并在本地执行（不经过模型）

先理解：工具 = schema（告诉模型有什么） + handler（你真正执行的代码）

运行：python step03_tools_def.py
"""

import json

from tools import TOOL_SCHEMAS, run_tool


def main() -> None:
    print("=== 工具 schema（会发给模型）===")
    print(json.dumps(TOOL_SCHEMAS, ensure_ascii=False, indent=2))

    print("\n=== 本地直接调用工具 ===")
    # ✍️ 手写练习 4：自己构造 name + arguments_json，多试几种输入
    print(run_tool("calculator", '{"expression": "(12 + 8) * 3"}'))
    print(run_tool("read_file", '{"filename": "notes.txt"}'))
    print(run_tool("unknown", "{}"))


if __name__ == "__main__":
    main()
