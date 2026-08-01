"""URL and text helpers without Playwright dependency."""

from __future__ import annotations

import re
from urllib.parse import urlparse


LOGIN_HINTS = (
    "sign in",
    "log in",
    "login",
    "登录",
    "请先登录",
    "password",
)


def validate_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Only public http/https URLs are allowed.")
    if not parsed.netloc:
        raise ValueError("URL must include a host.")


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()
