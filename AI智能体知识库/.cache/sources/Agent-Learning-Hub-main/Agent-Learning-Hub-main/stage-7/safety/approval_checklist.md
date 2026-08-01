# Human Approval Checklist

Use this checklist before executing a high-risk action.

- [ ] The action is necessary for the user's stated goal.
- [ ] The exact target is visible and unambiguous.
- [ ] The impact is explained in plain language.
- [ ] The rollback or recovery path is known, or the action is marked irreversible.
- [ ] No secrets, tokens, cookies, or private data are exposed in the approval prompt.
- [ ] The user explicitly approved this exact action.
- [ ] The approval is recorded in the trace.

Template:

```text
Approval required

Action: ...
Target: ...
Impact: ...
Reversible: yes/no/unknown
Exact operation: ...
Reason: ...

Reply with explicit approval before I continue.
```
