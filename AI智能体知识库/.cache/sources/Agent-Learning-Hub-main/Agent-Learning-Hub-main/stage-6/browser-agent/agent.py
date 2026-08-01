#!/usr/bin/env python3
"""A minimal public-web browser agent with screenshots and action logs."""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright

from browser_common import (
    ActionLogger,
    MAX_TEXT_CHARS,
    detect_login_blocker,
    make_run_dir,
    maybe_text,
    normalize_space,
    save_dom_excerpt,
    validate_public_url,
)


class BrowserBlockerError(RuntimeError):
    pass


def extract_public_article(url: str, out_dir: Path, max_chars: int) -> dict[str, object]:
    validate_public_url(url)
    run_dir = make_run_dir(out_dir)
    logger = ActionLogger(run_dir / "action_log.jsonl")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        try:
            logger.write("navigate", "started", url, "Opening public URL")
            page.goto(url, wait_until="domcontentloaded", timeout=20_000)
            try:
                page.wait_for_load_state("networkidle", timeout=5_000)
                logger.write("navigate", "ok", page.url, "Page loaded")
            except PlaywrightTimeoutError:
                logger.write("navigate", "partial", page.url, "Timed out waiting for networkidle")
        except PlaywrightTimeoutError as exc:
            logger.write("navigate", "failed", url, str(exc))
            browser.close()
            raise

        blocker = detect_login_blocker(page)
        if blocker:
            logger.write("blocker", "stop", page.url, blocker)
            browser.close()
            raise BrowserBlockerError(blocker)

        screenshot_path = run_dir / "page.png"
        page.screenshot(path=str(screenshot_path), full_page=True)
        logger.write("screenshot", "ok", page.url, "Captured page screenshot", screenshot=str(screenshot_path))

        dom_path = run_dir / "dom_excerpt.html"
        save_dom_excerpt(page, dom_path)
        logger.write("observe", "ok", page.url, "Saved DOM excerpt", dom=str(dom_path))

        title = normalize_space(page.title()) or maybe_text(page, ["h1"])
        author = maybe_text(
            page,
            ['meta[name="author"]', '[rel="author"]', '[class*="author" i]'],
        )
        published_at = maybe_text(
            page,
            [
                "time",
                'meta[property="article:published_time"]',
                '[class*="date" i]',
                '[class*="time" i]',
            ],
        )

        try:
            visible_text = normalize_space(page.locator("body").inner_text(timeout=5_000))
        except PlaywrightTimeoutError:
            visible_text = ""
        visible_text = visible_text[:max_chars]

        result = {
            "source_url": page.url,
            "title": title,
            "author": author,
            "published_at": published_at,
            "visible_text_excerpt": visible_text,
            "evidence": {
                "screenshot": str(screenshot_path),
                "dom_excerpt": str(dom_path),
                "action_log": str(run_dir / "action_log.jsonl"),
            },
        }
        summary_path = run_dir / "summary.json"
        summary_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        logger.write("extract", "ok", page.url, "Extracted public page metadata", summary=str(summary_path))
        browser.close()

    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", help="Public http/https URL to inspect")
    parser.add_argument("--out-dir", type=Path, default=Path("runs"), help="Directory for screenshots and logs")
    parser.add_argument("--max-chars", type=int, default=MAX_TEXT_CHARS, help="Max visible text characters to save")
    args = parser.parse_args()

    start = time.perf_counter()
    try:
        result = extract_public_article(args.url, args.out_dir, args.max_chars)
    except ValueError as exc:
        print(json.dumps({"error": str(exc), "blocker": True}, ensure_ascii=False, indent=2))
        return 2
    except BrowserBlockerError as exc:
        print(json.dumps({"error": str(exc), "blocker": True}, ensure_ascii=False, indent=2))
        return 3

    elapsed_ms = round((time.perf_counter() - start) * 1000)
    print(json.dumps({**result, "latency_ms": elapsed_ms}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
