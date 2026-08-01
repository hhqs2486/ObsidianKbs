"""RAGFlow 封装 + 本地 fallback（未配置 RAGFlow 时用关键词检索 sample_docs）。"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

from common import ragflow_enabled

STAGE_DIR = Path(__file__).resolve().parent
SAMPLE_DOCS_DIR = STAGE_DIR / "sample_docs"


@dataclass
class RetrievedChunk:
    content: str
    source: str
    score: float = 0.0


def _local_retrieve(question: str, top_k: int = 3) -> list[RetrievedChunk]:
    """未连接 RAGFlow 时的教学 fallback：按关键词匹配本地 Markdown。"""
    tokens = {t.lower() for t in re.findall(r"\w+", question) if len(t) > 1}
    if not tokens:
        return []

    scored: list[tuple[float, Path, str]] = []
    for path in SAMPLE_DOCS_DIR.glob("*.md"):
        text = path.read_text(encoding="utf-8")
        words = {t.lower() for t in re.findall(r"\w+", text)}
        overlap = len(tokens & words)
        if overlap:
            scored.append((overlap / len(tokens), path, text))

    scored.sort(key=lambda x: x[0], reverse=True)
    chunks: list[RetrievedChunk] = []
    for score, path, text in scored[:top_k]:
        chunks.append(
            RetrievedChunk(
                content=text[:800],
                source=path.name,
                score=round(score, 3),
            )
        )
    return chunks


def get_ragflow_client():
    from ragflow_sdk import RAGFlow

    api_key = os.getenv("RAGFLOW_API_KEY")
    base_url = os.getenv("RAGFLOW_BASE_URL")
    if not api_key or not base_url:
        raise RuntimeError("RAGFlow 未配置，请设置 RAGFLOW_API_KEY 与 RAGFLOW_BASE_URL")
    return RAGFlow(api_key=api_key, base_url=base_url)


def get_or_create_dataset(name: str | None = None):
    client = get_ragflow_client()
    ds_name = name or os.getenv("RAGFLOW_DATASET_NAME", "stage2_kb")
    existing = client.list_datasets(name=ds_name)
    if existing:
        return existing[0]
    return client.create_dataset(name=ds_name)


def upload_sample_documents(dataset) -> list:
    """上传 sample_docs 目录下的 Markdown 到 RAGFlow dataset。"""
    docs = []
    for path in sorted(SAMPLE_DOCS_DIR.glob("*.md")):
        docs.append(
            {
                "display_name": path.name,
                "blob": path.read_bytes(),
            }
        )
    if not docs:
        return []
    uploaded = dataset.upload_documents(docs)
    ids = [doc.id for doc in uploaded]
    dataset.async_parse_documents(ids)
    return uploaded


def retrieve(question: str, top_k: int = 3) -> list[RetrievedChunk]:
    if not ragflow_enabled():
        print("[fallback] 未配置 RAGFlow，使用本地 sample_docs 关键词检索")
        return _local_retrieve(question, top_k=top_k)

    client = get_ragflow_client()
    dataset = get_or_create_dataset()
    raw_chunks = client.retrieve(
        question=question,
        dataset_ids=[dataset.id],
        page_size=top_k,
    )
    chunks: list[RetrievedChunk] = []
    for c in raw_chunks:
        chunks.append(
            RetrievedChunk(
                content=getattr(c, "content", str(c)),
                source=getattr(c, "document_name", "unknown"),
                score=float(getattr(c, "similarity", 0.0) or 0.0),
            )
        )
    return chunks


def format_chunks_for_prompt(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return "（未检索到相关文档片段）"
    parts = []
    for i, ch in enumerate(chunks, 1):
        parts.append(
            f"[{i}] 来源: {ch.source} | 相关度: {ch.score}\n{ch.content.strip()}"
        )
    return "\n\n".join(parts)
