"""Shared helpers for Stage 5 skill loading and validation."""

from __future__ import annotations

import re
from pathlib import Path


REQUIRED_SECTIONS = (
    "## When To Use",
    "## When Not To Use",
    "## Steps",
    "## Output",
    "## Verification",
)
REQUIRED_FRONTMATTER = ("name", "description")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()
    return meta, parts[2].strip()


def load_skill(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)
    return {"path": str(path), "meta": meta, "body": body, "text": text}


def validate_skill_md(path: Path) -> list[str]:
    skill = load_skill(path)
    problems: list[str] = []

    for key in REQUIRED_FRONTMATTER:
        if not skill["meta"].get(key):
            problems.append(f"missing frontmatter field: {key}")

    body = str(skill["body"])
    for section in REQUIRED_SECTIONS:
        if section not in body:
            problems.append(f"missing section: {section}")

    description = str(skill["meta"].get("description", ""))
    if len(description) < 20:
        problems.append("description is too short to help skill discovery")

    if re.search(r"\b(all tasks|everything|always use)\b", body, re.I):
        problems.append("skill trigger looks too broad")

    return problems
