"""
Step 2 — 加载并校验 SKILL.md

运行：python step02_load_skill.py
"""

from __future__ import annotations

import json
from pathlib import Path

from skill_common import load_skill, validate_skill_md


def main() -> None:
    skill_path = Path("my-skill/SKILL.md")
    skill = load_skill(skill_path)
    problems = validate_skill_md(skill_path)

    print("=== Skill Frontmatter ===")
    print(json.dumps(skill["meta"], ensure_ascii=False, indent=2))

    print("\n=== Required Sections Found ===")
    for section in ("## When To Use", "## Steps", "## Verification"):
        print(f"- {section}: {'yes' if section in skill['body'] else 'no'}")

    if problems:
        print("\nValidation failed:")
        for problem in problems:
            print(f"- {problem}")
        raise SystemExit(1)

    print("\nSkill validation passed.")


if __name__ == "__main__":
    main()
