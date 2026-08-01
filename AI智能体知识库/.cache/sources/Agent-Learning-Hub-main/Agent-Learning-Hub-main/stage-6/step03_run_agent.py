"""
Step 3 — 调用最终 browser agent

运行：python step03_run_agent.py https://example.com
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python step03_run_agent.py <url>")
        raise SystemExit(2)

    agent = Path("browser-agent/agent.py")
    cmd = [sys.executable, str(agent), sys.argv[1]]
    raise SystemExit(subprocess.call(cmd))


if __name__ == "__main__":
    main()
