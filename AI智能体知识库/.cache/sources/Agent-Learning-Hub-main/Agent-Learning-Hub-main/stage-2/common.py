"""Stage 2 各步骤共用的配置与客户端。"""

from __future__ import annotations

import os

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv() -> None:
        return None

load_dotenv()


def get_client():
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "请设置 OPENAI_API_KEY。可复制 .env.example 为 .env 后填写。"
        )
    base_url = os.getenv("OPENAI_BASE_URL")
    if base_url:
        return OpenAI(api_key=api_key, base_url=base_url)
    return OpenAI(api_key=api_key)


def get_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def ragflow_enabled() -> bool:
    return bool(os.getenv("RAGFLOW_API_KEY") and os.getenv("RAGFLOW_BASE_URL"))


def letta_enabled() -> bool:
    return bool(os.getenv("LETTA_API_KEY") or os.getenv("LETTA_BASE_URL"))
