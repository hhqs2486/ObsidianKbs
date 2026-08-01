"""
Step 1 — 环境准备：安装 FastMCP 并验证

运行：python step01_setup.py
"""

from __future__ import annotations

import importlib.metadata
import sys


def main() -> None:
    version = sys.version_info
    print("=== Python 环境 ===")
    print(f"Python {version.major}.{version.minor}.{version.micro}")

    try:
        fastmcp_version = importlib.metadata.version("fastmcp")
    except importlib.metadata.PackageNotFoundError:
        print("\n❌ 未安装 fastmcp。请先执行：")
        print("   pip install -r requirements.txt")
        raise SystemExit(1) from None

    print(f"fastmcp {fastmcp_version}")

    from fastmcp import FastMCP  # noqa: F401

    print("\n✅ FastMCP 已就绪。")
    print("\n下一步：python step02_first_server.py")


if __name__ == "__main__":
    main()
