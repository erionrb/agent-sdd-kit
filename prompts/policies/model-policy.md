# Model Policy

## Decision table

| Work type | Model | Reason |
|-----------|-------|--------|
| Discovery, source summarization, checklists, first-draft docs | Free / low-cost (e.g. Gemini Flash, DeepSeek, Haiku) | No reasoning depth required; high volume |
| OpenSpec planning, design decisions, task generation | Sonnet | Needs coherent multi-step reasoning; output quality matters |
| Task implementation | Sonnet | Code quality and spec fidelity matter |
| Task review (clean context) | Sonnet | Analytical, bounded scope, output is short |
| Debugging after first Sonnet attempt fails | Sonnet with compressed context | Limit tokens; structured input |
| Critical architecture review, deep security audit | Opus | Rare; justify before invoking |
| Broad agent loops, polling, batch doc generation | Never Opus | Token cost is unbounded |

## Embed block

```xml
<model_policy>
  Use a free or low-cost model for: discovery, doc extraction, summarization, checklist creation.
  Use Sonnet for: OpenSpec planning, design, task generation, implementation, review, debugging.
  Use Opus only for: critical architecture or security decisions after Sonnet has failed or is insufficient.
  Never use Opus for broad loops or batch generation.
</model_policy>
```

## Switching signal

If Sonnet produces an incorrect or low-quality result after two focused attempts with compressed context, escalate to Opus for that specific sub-problem only. Return to Sonnet for everything else in the session.
