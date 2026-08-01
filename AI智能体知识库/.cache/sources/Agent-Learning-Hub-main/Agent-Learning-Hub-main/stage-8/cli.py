#!/usr/bin/env python3
"""
Stage 8 CLI entry — deployable agent with safety gate.

Usage:
  python cli.py "读取 stage-1/notes.txt 并总结"
  python cli.py --approve "删除生产数据库备份"
  AGENT_DRY_RUN=true python cli.py "smoke test task"
"""

from __future__ import annotations

import sys

from agent import run_agent
from common import load_settings, setup_logging
from safety import Decision, gate_user_input, parse_approve_flag


def main() -> int:
    approve, args = parse_approve_flag(sys.argv[1:])
    question = " ".join(args).strip()

    settings = load_settings()
    log = setup_logging(settings.log_level)

    if not question:
        print("用法: python cli.py [--approve] \"你的任务\"")
        return 1

    hold_msg, decision = gate_user_input(question)
    if hold_msg and decision == Decision.BLOCK.value:
        print(hold_msg)
        return 2
    if hold_msg and decision == Decision.APPROVAL_REQUIRED.value and not approve:
        print(hold_msg)
        return 3

    log.info("task=%s approved=%s dry_run=%s", question[:80], approve, settings.dry_run)
    print("Q:", question)
    answer = run_agent(question, settings=settings)
    print("A:", answer)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
