---
name: {{SKILL_NAME}}
description: {{DESCRIPTION}}
---

# Lark / Feishu Integration Skill

Use this skill when the user needs to interact with Feishu (Lark) APIs: docs, sheets, calendar, IM, or Base tables via lark-cli or Open API.

## When To Use

- The user mentions 飞书, Lark, lark-cli, 多维表格, 云文档, or Feishu bot workflows.
- Tasks involve reading/writing Feishu resources, auth setup, or permission errors.
- The user wants to automate Feishu workflows from an agent.

## When Not To Use

- The user needs generic HTTP API help unrelated to Feishu.
- Required scopes or tenant admin approval are missing and cannot be obtained.

## Steps

1. Check lark-cli auth: `lark-cli auth status` (or guide user through `lark-cli auth login`).
2. Identify resource type: doc, sheet, base, calendar, im, task.
3. Read the matching lark-* skill for command patterns before calling APIs.
4. Use `--as user` or `--as bot` consistently; handle Permission denied with scope checklist.
5. Return structured results with resource IDs and links.

## Output

- Commands run (redact tokens).
- Resource identifiers (doc_token, spreadsheet_token, etc.).
- Next steps if permission or scope is missing.

## Verification

- No secrets in output.
- Links use full https:// URLs.
- Errors include actionable fix (scope name, admin approval path).
