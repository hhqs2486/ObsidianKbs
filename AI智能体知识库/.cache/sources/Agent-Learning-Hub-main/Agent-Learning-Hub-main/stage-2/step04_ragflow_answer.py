"""
Step 4 — 带引用的 RAG 回答

流程：retrieve chunks → 拼进 prompt → LLM 生成带 [1][2] 引用的答案

运行：python step04_ragflow_answer.py "mem0 和 RAG 有什么区别"
"""

from __future__ import annotations

import sys

from common import get_client, get_model
from ragflow_helper import format_chunks_for_prompt, retrieve


def answer_with_citations(question: str) -> str:
    chunks = retrieve(question, top_k=3)
    context = format_chunks_for_prompt(chunks)

    client = get_client()
    model = get_model()
    messages = [
        {
            "role": "system",
            "content": (
                "你是资料研究助手。只能根据「检索片段」回答。"
                "每条事实后标注引用编号如 [1]。"
                "若片段不足以回答，明确说「资料中未找到」。"
            ),
        },
        {
            "role": "user",
            "content": f"问题：{question}\n\n检索片段：\n{context}",
        },
    ]
    response = client.chat.completions.create(model=model, messages=messages)
    return (response.choices[0].message.content or "").strip()


def main() -> None:
    question = " ".join(sys.argv[1:]).strip() or "Agent 记忆分哪几层？各用什么组件？"
    print("Q:", question)
    print("\n=== 带引用回答 ===")
    print(answer_with_citations(question))


if __name__ == "__main__":
    main()
