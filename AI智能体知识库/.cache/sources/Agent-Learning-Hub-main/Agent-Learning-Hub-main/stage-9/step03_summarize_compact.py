"""Step 3 — 摘要式压缩：把整段旧对话压成一条摘要消息。"""
from __future__ import annotations

from common import estimate_tokens
from compactor import make_summarizer, summarize_compact


def build_long_conversation():
    msgs = [
        {"role": "system", "content": "你是项目助手。", "anchor": True},
        {"role": "user", "content": "用户决定：用 FastAPI，下周上线，负责人是小红。"},
    ]
    for i in range(1, 16):
        msgs.append({"role": "user", "content": f"讨论第 {i} 个接口的设计。"})
        msgs.append({"role": "assistant", "content": f"接口 {i} 用 POST /items/{i}，返回 201。"})
    return msgs


def main() -> None:
    msgs = build_long_conversation()
    before = len(msgs)
    summarizer = make_summarizer()
    compacted = summarize_compact(msgs, summarizer)
    after = len(compacted)
    print(f"压缩前：{before} 条")
    print(f"压缩后：{after} 条")
    summary_msg = [m for m in compacted if m["content"].startswith("[会话摘要]")][0]
    print("\n生成的摘要消息：")
    print(summary_msg["content"])
    print(f"\n估算 token：{before} 条 ~{before * 40} -> 压缩后 ~{estimate_tokens(summary_msg['content'])}")


if __name__ == "__main__":
    main()
