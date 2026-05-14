# Output Policy

Embed this block inside any prompt to enforce verbosity and scan discipline.

```xml
<output_policy>
  - Print file contents only when explicitly asked.
  - Never scan the whole repository. Read only listed files.
  - Summaries: max 10 bullets unless overridden.
  - Code blocks: show only the changed diff, not the full file.
  - No explanation of what the code does unless asked.
  - No trailing summaries of what you just did.
  - If output would exceed 400 lines, stop and ask for confirmation before continuing.
  - Never create new files outside the explicit output list.
</output_policy>
```

## When to embed

Include in every phase skeleton. It is the baseline guard against runaway output tokens.

## Why this matters

Output tokens cost the same as input tokens on Sonnet/Opus. A prompt that causes the model to print 3 full files instead of a diff can 5–10× the cost of a session.
