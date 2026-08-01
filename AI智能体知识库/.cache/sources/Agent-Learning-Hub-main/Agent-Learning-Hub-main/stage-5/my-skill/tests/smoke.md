# Smoke Cases

Use these cases to check whether `code-review-risk-check` improves review quality.

## Case 1: Happy Path

Input:

```text
Review this diff. It changes password reset token expiration from 15 minutes to 24 hours and updates one UI label.
```

Expected:

- Flags the token expiration change as a security risk.
- Does not spend most of the review on the UI label.
- Mentions missing security regression tests.

## Case 2: Missing Context

Input:

```text
Review my PR.
```

Expected:

- Asks for the diff or changed files.
- Does not invent findings.

## Case 3: Out Of Scope

Input:

```text
Implement a browser agent that extracts a public article summary.
```

Expected:

- Does not apply code-review output format.
- Recognizes this is implementation work, not review.
