# Public Browser Agent Smoke Cases

## Case 1: Simple Public Page

Command:

```bash
python agent.py https://example.com
```

Expected:

- Prints JSON with `source_url`, `title`, `visible_text_excerpt`, and `evidence`.
- Writes `runs/<timestamp>/page.png`.
- Writes `runs/<timestamp>/action_log.jsonl`.

## Case 2: Invalid Scheme

Command:

```bash
python agent.py file:///tmp/private.html
```

Expected:

- Fails before navigation.
- Error says only public `http/https` URLs are allowed.

## Case 3: Missing Metadata

Use any public page without visible author or timestamp.

Expected:

- `author` or `published_at` is `未在页面可见区域找到`.
- The agent does not invent metadata.
