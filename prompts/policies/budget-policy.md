# Budget Policy

## Core rules

1. **OpenRouter monthly cap is the only hard financial guarantee.** Set it. Do not rely on per-session discipline alone.
2. **Output tokens are the main cost driver** on Sonnet and Opus. Suppress unnecessary output with the output policy.
3. **Use free/low-cost models for discovery.** Every token spent on Sonnet for summarization or listing is waste.
4. **Compress context into Markdown before using Sonnet.** Write a `summary.md` at the end of each phase; feed that to the next phase instead of raw conversation history.
5. **One task per Sonnet session.** Do not chain tasks. Implement one, review it, then `/clear`.
6. **One review per session.** The reviewer reads spec + diff only. No other context.
7. **Track cost per accepted task.** If a task costs more than expected, diagnose why before starting the next one (usually: too much output, too broad a file scan, or unnecessary re-reads).

## Embed block

```xml
<budget_policy>
  - Use free/low-cost model for discovery and summarization.
  - Compress all context to Markdown before starting a Sonnet session.
  - Implement one task per session. Review in a separate clean session.
  - Suppress full-file prints; show diffs only.
  - Do not continue if the next step would require reading more than 5 files not on the allowlist.
</budget_policy>
```

## /clear is context hygiene, not cost control

`/clear` resets the model's context window. It does not undo billed tokens from the current session. Use it to start a clean context for the next phase, not to "save money" mid-session.

## Cost estimation heuristics (rough)

| Operation | Sonnet cost signal |
|-----------|--------------------|
| Read 1 small file (~200 lines) | Low |
| Read 5 files + write 1 implementation | Medium |
| Print full file instead of diff | High (avoidable) |
| Broad repo scan (find, ls -R, grep /) | Very high (avoidable) |
| Long reasoning chain before writing | Medium (acceptable) |
