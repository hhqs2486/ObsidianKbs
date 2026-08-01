# Browser Agent Policies

## Allowed

- Visit public `http` or `https` URLs.
- Read text that is visible on the page.
- Capture screenshots for debugging and evidence.
- Click ordinary navigation, expand, filter, or pagination controls when the task requires it.
- Stop and report blockers when a page asks for login, payment, captcha, or sensitive permissions.

## Not Allowed

- Log in to personal, work, or paid accounts.
- Bypass captcha, paywalls, robots rules, or platform rate limits.
- Send messages, publish posts, buy items, delete data, or submit forms.
- Extract private data, tokens, cookies, or hidden page state.
- Continue retrying after repeated failures without new evidence.

## High-Risk Actions

The demo agent in this folder does not perform high-risk actions. A production browser agent must require explicit human approval before:

- submitting any form;
- sending or publishing content;
- deleting, buying, cancelling, or changing permissions;
- exporting private or account-scoped data.
