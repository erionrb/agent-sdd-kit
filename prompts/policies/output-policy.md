# Output Policy

Embed this block inside any prompt to enforce verbosity and scan discipline.

```xml
<output_policy>
  - Print file contents only when explicitly asked. Never print full files.
  - Never scan the whole repository. Read only listed files.
  - Summaries: max 10 bullets unless overridden.
  - Code blocks: do not print full diffs unless explicitly requested. Show only the changed lines.
  - No explanation of what the code does unless asked.
  - No trailing summaries of what you just did.
  - Test output: if tests pass, print only the command and a pass summary (e.g. "npm test — 42 passed").
    Print failing test output only when tests fail.
  - Final responses for implementation, review, and QA phases must be short and bounded (under 120 words).
  - Prefer writing artifacts to files rather than explaining them in chat.
  - If output would exceed 400 lines, stop and ask for confirmation before continuing.
  - Never create new files outside the explicit output list.
</output_policy>
```

## When to embed

Include in every phase skeleton. It is the baseline guard against runaway output tokens.

## Why this matters

Output tokens cost the same as input tokens on Sonnet/Opus. A prompt that causes the model to print 3 full files instead of a diff can 5–10× the cost of a session.
