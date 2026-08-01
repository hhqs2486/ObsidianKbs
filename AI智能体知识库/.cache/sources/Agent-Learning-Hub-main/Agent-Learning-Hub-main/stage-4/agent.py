"""
Stage 4 最终产出 — 可调试的多 agent 写作系统

运行：
  python agent.py
  python agent.py "写一段解释 supervisor 模式的短文"
"""

from __future__ import annotations

import json
import sys

from coordinator import print_trace, run_supervised, state_to_dict


def main() -> None:
    task = " ".join(sys.argv[1:]).strip()
    if not task:
        task = "写一段解释 research -> write -> review -> revise 多 agent 流程的短文"

    state = run_supervised(task, max_steps=8)

    print("=== Final Answer ===")
    print(state.final or "未产出 final，请查看 trace。")
    print_trace(state)

    print("\n=== Debug State ===")
    print(json.dumps(state_to_dict(state), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
