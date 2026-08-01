"""Step 2 — 滑动窗口压缩：保留锚点 + 最近消息。"""
from __future__ import annotations

from common import estimate_tokens
from compactor import sliding_window_compact

MAX_TOKENS = 300


def build_messages():
    msgs = [
        {
            "role": "system",
            "content": "你是严谨的 coding agent，必须遵守：不删除用户文件、付款前必须确认。",
            "anchor": True,
        },
        {
            "role": "user",
            "content": "用户明确要求：项目用 Python 3.11，禁用 pandas。",
            "anchor": True,
        },
    ]
    for i in range(1, 21):
        msgs.append({"role": "user", "content": f"第 {i} 步要做什么？"})
        msgs.append({"role": "assistant", "content": f"第 {i} 步：执行检查 {i}，结果正常。"})
    return msgs


def main() -> None:
    msgs = build_messages()
    before = sum(estimate_tokens(m["content"]) for m in msgs)
    print(f"压缩前：{len(msgs)} 条消息，~{before} token")

    compacted = sliding_window_compact(msgs, MAX_TOKENS)
    after = sum(estimate_tokens(m["content"]) for m in compacted)
    print(f"压缩后：{len(compacted)} 条消息，~{after} token（预算 {MAX_TOKENS}）")

    anchors = [m for m in compacted if m.get("anchor")]
    print(f"锚点保留：{len(anchors)} 条（系统约束 + 用户要求未被丢弃）")
    print("\n保留下来的消息：")
    for m in compacted:
        tag = " [锚点]" if m.get("anchor") else ""
        print(f"  - {m['role']}: {m['content'][:40]}{tag}")


if __name__ == "__main__":
    main()
