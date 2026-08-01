"""
Step 3 — RAGFlow retrieve：chunk → embed → 检索

运行：python step03_ragflow_retrieve.py "agent 记忆分几层"
"""

from __future__ import annotations

import sys

from ragflow_helper import format_chunks_for_prompt, retrieve


def main() -> None:
    question = " ".join(sys.argv[1:]).strip() or "RAG 的基本流程是什么？"
    print("=== Retrieve ===")
    print("Q:", question)

    chunks = retrieve(question, top_k=3)
    if not chunks:
        print("\n未检索到片段。若使用 RAGFlow，请确认 Step 2 已完成解析。")
        return

    print(f"\n命中 {len(chunks)} 条:\n")
    print(format_chunks_for_prompt(chunks))

    # ✍️ 手写练习 3：打印每条 chunk 的 source，思考如何写进 citation


if __name__ == "__main__":
    main()
