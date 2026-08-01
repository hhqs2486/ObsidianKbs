#!/usr/bin/env python3
"""Scaffold a new Cursor Agent Skill from built-in templates."""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "stage-5" / "my-skill" / "templates"

BUILTIN = {
    "eval": TEMPLATES / "eval-skill",
    "lark": TEMPLATES / "lark-skill",
    "minimal": TEMPLATES / "minimal-skill",
}


def slugify(name: str) -> str:
    value = name.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "my-skill"


def scaffold_from_dir(template_dir: Path, out_dir: Path, skill_name: str, description: str) -> None:
    if out_dir.exists():
        raise SystemExit(f"Output already exists: {out_dir}")

    out_dir.mkdir(parents=True)
    for src in template_dir.rglob("*"):
        rel = src.relative_to(template_dir)
        dest = out_dir / rel
        if src.is_dir():
            dest.mkdir(parents=True, exist_ok=True)
            continue
        text = src.read_text(encoding="utf-8")
        text = text.replace("{{SKILL_NAME}}", skill_name).replace("{{DESCRIPTION}}", description)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding="utf-8")


def scaffold_minimal(out_dir: Path, skill_name: str, description: str) -> None:
    skill_md = out_dir / "SKILL.md"
    if out_dir.exists():
        raise SystemExit(f"Output already exists: {out_dir}")
    out_dir.mkdir(parents=True)

    content = f"""---
name: {skill_name}
description: {description}
---

# {skill_name.replace("-", " ").title()}

Brief purpose of this skill.

## When To Use

- Describe the trigger scenarios here.

## When Not To Use

- Describe anti-patterns here.

## Steps

1. First step.
2. Second step.

## Output

- Expected output shape.

## Verification

- How to verify the skill worked.
"""
    skill_md.write_text(content, encoding="utf-8")
    (out_dir / "tests").mkdir(exist_ok=True)
    (out_dir / "tests" / "smoke.md").write_text(
        "# Smoke test\n\n- [ ] Skill loads without validation errors\n",
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", required=True, help="Skill name (kebab-case)")
    parser.add_argument("--description", required=True, help="One-line skill description")
    parser.add_argument(
        "--template",
        choices=sorted(BUILTIN.keys()),
        default="minimal",
        help="Template to copy",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output directory (default: stage-5/my-skill/<name>)",
    )
    args = parser.parse_args()

    skill_name = slugify(args.name)
    out_dir = args.out or (ROOT / "stage-5" / "my-skill" / skill_name)
    template = BUILTIN[args.template]

    if template.is_dir():
        scaffold_from_dir(template, out_dir, skill_name, args.description)
    else:
        scaffold_minimal(out_dir, skill_name, args.description)

    print(f"Created skill at: {out_dir}")
    print(f"Validate: cd stage-5 && python step03_validate_report.py")
    print(f"Install to Cursor: cp -r {out_dir} ~/.cursor/skills/{skill_name}/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
