"""Shared helpers for Stage 6 browser agent examples."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import Page
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

from browser_policy import LOGIN_HINTS, normalize_space, validate_public_url


MAX_TEXT_CHARS = 5000

__all__ = [
    "ActionEvent",
    "ActionLogger",
    "MAX_TEXT_CHARS",
    "detect_login_blocker",
    "make_run_dir",
    "maybe_text",
    "normalize_space",
    "save_dom_excerpt",
    "validate_public_url",
]


@dataclass
class ActionEvent:
    step: int
    event: str
    status: str
    url: str
    detail: str
    evidence: dict[str, str]
    ts: str


class ActionLogger:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.step = 0
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, event: str, status: str, url: str, detail: str, **evidence: str) -> None:
        self.step += 1
        item = ActionEvent(
            step=self.step,
            event=event,
            status=status,
            url=url,
            detail=detail,
            evidence=evidence,
            ts=datetime.now(timezone.utc).isoformat(),
        )
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(item), ensure_ascii=False) + "\n")


def maybe_text(page: Page, selectors: list[str], timeout_ms: int = 800) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if locator.count() == 0:
                continue
            if selector.startswith("meta"):
                value = locator.get_attribute("content", timeout=timeout_ms)
                if value:
                    return normalize_space(value)
            text = normalize_space(locator.inner_text(timeout=timeout_ms))
            if text:
                return text
        except PlaywrightTimeoutError:
            continue
        except Exception:
            continue
    return "未在页面可见区域找到"


def detect_login_blocker(page: Page) -> str | None:
    url = page.url.lower()
    if any(token in url for token in ("/login", "/signin", "/sign-in", "auth")):
        return f"Login-like URL detected: {page.url}"

    try:
        body_text = normalize_space(page.locator("body").inner_text(timeout=2_000)).lower()
    except PlaywrightTimeoutError:
        return None

    hits = [hint for hint in LOGIN_HINTS if hint in body_text]
    password_inputs = page.locator('input[type="password"]').count()
    if password_inputs > 0 and hits:
        return f"Login form detected ({', '.join(hits[:2])})"
    return None


def save_dom_excerpt(page: Page, path: Path, max_chars: int = 4000) -> None:
    try:
        html = page.content()
    except PlaywrightTimeoutError:
        html = ""
    path.write_text(html[:max_chars], encoding="utf-8")


def make_run_dir(out_dir: Path) -> Path:
    run_dir = out_dir / datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir.mkdir(parents=True, exist_ok=True)
    return run_dir
