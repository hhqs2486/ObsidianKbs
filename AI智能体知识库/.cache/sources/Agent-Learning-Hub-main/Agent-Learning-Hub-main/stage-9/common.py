"""Stage 9 公共工具：配置开关、token 估算。

不依赖外部 key 也能跑：没有 OPENAI_API_KEY 时，摘要函数退化为确定性模板。
"""
from __future__ import annotations

import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # noqa: BLE001 - dotenv 可选，无网/无依赖时也能跑
    pass

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def llm_enabled() -> bool:
    return bool(OPENAI_API_KEY)


def estimate_tokens(text: str) -> int:
    """粗略 token 估算：英文约 1.3 token/词，CJK 按字符计。"""
    words = len(text.split())
    cjk = sum(1 for ch in text if "一" <= ch <= "鿿")
    return int(words * 1.3 + cjk)
