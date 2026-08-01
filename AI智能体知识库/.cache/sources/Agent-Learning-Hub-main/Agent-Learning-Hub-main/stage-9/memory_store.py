"""长期记忆（Long-term Memory）最小实现：JSON 持久化 + 关键词召回。

与 RAG 的区别：RAG 查「文档/资料」，记忆层记「用户事实/偏好」。
本文件不依赖向量库：默认关键词召回（英文按词、中文按字）；有 OPENAI_API_KEY 时可扩展为语义召回。
"""
from __future__ import annotations

import json
import os
import re
import time

MEMORY_PATH = os.getenv("STAGE9_MEMORY_PATH", ".stage9_memory.json")


def _tokens(text: str):
    """英文按词、中文按字切分，忽略标点与空白。"""
    return re.findall(r"[a-z0-9]+|[一-鿿]", text.lower())


def _load():
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save(mem):
    with open(MEMORY_PATH, "w", encoding="utf-8") as f:
        json.dump(mem, f, ensure_ascii=False, indent=2)


def add_memory(fact, user_id="default"):
    mem = _load()
    mem.append({"user_id": user_id, "fact": fact, "ts": time.time()})
    _save(mem)
    return len(mem)


def search_memory(query, user_id="default", top_k=3):
    mem = [m for m in _load() if m["user_id"] == user_id]
    qt = _tokens(query)
    scored = []
    for m in mem:
        ft = set(_tokens(m["fact"]))
        score = sum(1 for t in qt if t in ft)
        if score > 0:
            scored.append((score, m))
    scored.sort(key=lambda x: -x[0])
    return list(dict.fromkeys(m["fact"] for _, m in scored[:top_k]))
