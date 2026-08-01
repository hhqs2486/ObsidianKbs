"""
Step 2 — 最小页面观察

运行：python step02_observe_page.py https://example.com
"""

from __future__ import annotations

import sys

from playwright.sync_api import sync_playwright

from browser_common import maybe_text, normalize_space, validate_public_url


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python step02_observe_page.py <url>")
        raise SystemExit(2)

    url = sys.argv[1]
    validate_public_url(url)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=20_000)

        print("=== Observation ===")
        print(f"url: {page.url}")
        print(f"title: {normalize_space(page.title())}")
        print(f"h1: {maybe_text(page, ['h1'])}")
        browser.close()


if __name__ == "__main__":
    main()
