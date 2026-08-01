---
name: code-review-risk-check
description: Use when reviewing a code diff or pull request for correctness, regressions, safety issues, and missing tests.
---

# Code Review Risk Check

Use this skill to turn a raw code diff into a concise engineering review. The goal is not to summarize every changed file; the goal is to find the issues that could break users, production, security, data integrity, or future maintenance.

## When To Use

- The user asks for a code review, PR review, diff review, or regression risk review.
- The input contains changed files, a patch, commit diff, or PR context.
- The expected output is a review comment or a list of findings.

## When Not To Use

- The user asks for implementation rather than review.
- There is no code, diff, or behavioral description to inspect.
- The request is only about formatting, naming, or style preferences.

## Inputs

- Code diff or file list.
- User intent, issue, PR description, or acceptance criteria if available.
- Test output, linter output, or CI failures if available.

## Steps

1. Identify the user-facing behavior or contract touched by the change.
2. Scan the diff for correctness risks first: control flow, data shape, state transitions, error handling, permissions, concurrency, and persistence.
3. Check whether tests cover the riskiest changed behavior.
4. Ignore low-signal style issues unless they hide a real bug.
5. Report findings first, ordered by severity.
6. If no issues are found, say so clearly and mention remaining test gaps or residual risk.

## Output

Use `templates/review_report.md` as the output shape:

- Findings first.
- Each finding must include severity, file or symbol, impact, and a concrete fix direction.
- Summary is optional and must stay short.

## Verification

Before returning the review:

- At least one finding has concrete evidence, or the report explicitly says no findings.
- No fabricated file paths or line numbers.
- No broad rewrite suggestions unless the current diff requires them.
- Test gaps are tied to changed behavior, not generic advice.
