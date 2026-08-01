"""
Step 1 — URL 安全校验

运行：
  python step01_validate_url.py https://example.com
  python step01_validate_url.py file:///tmp/private.html
"""

from __future__ import annotations

import sys

from browser_policy import validate_public_url


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python step01_validate_url.py <url>")
        raise SystemExit(2)

    url = sys.argv[1]
    try:
        validate_public_url(url)
    except ValueError as exc:
        print(f"Rejected: {exc}")
        raise SystemExit(1)

    print(f"Allowed public URL: {url}")


if __name__ == "__main__":
    main()
