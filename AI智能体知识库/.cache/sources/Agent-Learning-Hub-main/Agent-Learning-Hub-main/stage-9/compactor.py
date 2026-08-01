"""上下文压缩（Context Compaction）实现：滑动窗口 + 摘要式。

核心思想（对照 cc流程图 的 Context Compact / Reactive Compact 节点）：
- 主动压缩：每轮把超预算的旧消息压掉（sliding window）
- 被动压缩：碰到 413 / 预算爆了时紧急压缩（summarize）
- 锚点（anchor）：系统约束、用户明确要求、工具 schema 永不丢弃
"""
from __future__ import annotations

import os

from common import estimate_tokens, llm_enabled


def make_summarizer():
    """返回一个 summary(text) -> str 函数；无 key 时用确定性模板。"""
    if llm_enabled():
        from openai import OpenAI

        client = OpenAI()

        def summarize(text: str) -> str:
            resp = client.chat.completions.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {
                        "role": "system",
                        "content": "把以下对话压缩成简明要点，保留决策、用户要求、关键事实与待办。",
                    },
                    {"role": "user", "content": text},
                ],
                max_tokens=300,
            )
            return resp.choices[0].message.content.strip()

        return summarize

    def summarize(text: str) -> str:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        head = lines[:2]
        tail = lines[-2:]
        preview = " | ".join(head + tail)
        return f"[无 LLM key，确定性摘要] {preview}  （共 {len(lines)} 条消息已压缩）"

    return summarize


def sliding_window_compact(messages, max_tokens, keep_anchors=True):
    """保留锚点 + 最近的消息，直到逼近 token 预算。"""
    anchors = [m for m in messages if m.get("anchor")] if keep_anchors else []
    rest = [m for m in messages if not m.get("anchor")]
    used = sum(estimate_tokens(m["content"]) for m in anchors)
    selected = []
    for m in reversed(rest):
        t = estimate_tokens(m["content"])
        if selected and used + t > max_tokens:
            break
        selected.insert(0, m)
        used += t
    return anchors + selected


def summarize_compact(messages, summarizer, keep_anchors=True):
    """把非锚点消息压成一条摘要消息（带 anchor=True，后续也不会被丢弃）。"""
    anchors = [m for m in messages if m.get("anchor")] if keep_anchors else []
    to_compress = [m for m in messages if not m.get("anchor")]
    if not to_compress:
        return list(messages)
    text = "\n".join(f'{m["role"]}: {m["content"]}' for m in to_compress)
    summary = summarizer(text)
    summary_msg = {"role": "system", "content": f"[会话摘要]\n{summary}", "anchor": True}
    return anchors + [summary_msg]
