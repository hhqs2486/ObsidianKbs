# Review Report

## Findings

### Severity: high

- Location: `auth/reset_token.py`
- Impact: Extending password reset token lifetime from 15 minutes to 24 hours increases account takeover risk if a token leaks.
- Evidence: The diff changes `TOKEN_TTL = 900` to `TOKEN_TTL = 86400` without adding rate limits or one-time-use enforcement.
- Fix direction: Keep a shorter TTL, add one-time token invalidation, and add security regression tests.

## Test Gaps

- No test covers expired-token rejection after the new TTL.
- No test verifies that a reused reset token is rejected.

## Notes

- UI label change is low risk and does not need to dominate the review.
