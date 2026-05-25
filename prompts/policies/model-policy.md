# Model Policy

## Decision table

| Work type | Model | Reason |
|-----------|-------|--------|
| Daily reports, summaries, session captures, mechanical documentation, simple file formatting, first-pass discovery | Free / low-cost (e.g. Gemini Flash, DeepSeek, Haiku) | No reasoning depth required; high volume; output tokens are the main cost driver |
| Discovery (deep), source summarization, checklists, first-draft integration docs | Free / low-cost (e.g. Gemini Flash, DeepSeek, Haiku) | No reasoning depth required; high volume |
| OpenSpec planning, design decisions, task generation | Sonnet | Needs coherent multi-step reasoning; output quality matters |
| Task implementation | Sonnet | Code quality and spec fidelity matter |
| Task review (clean context) | Sonnet | Analytical, bounded scope, output is short |
| QA validation | Sonnet | Careful reading of acceptance criteria; bounded scope |
| Normal debugging | Sonnet | Structured, bounded; use compressed context |
| Debugging after two focused Sonnet attempts fail | Sonnet with compressed context | Limit tokens; structured input |
| Critical architecture review, deep security audit, explicit high-stakes reasoning | Opus | Escalation only — rare; justify before invoking |
| Broad agent loops, polling, batch doc generation | Never Opus | Token cost is unbounded |

**Opus must not be the default for:** discovery, implementation, QA, summaries, daily reports, or any routine SDD phase.

## Embed block

```xml
<model_policy>
  Use a free or low-cost model (Haiku, Gemini Flash, DeepSeek) for:
    daily reports, summaries, session captures, mechanical documentation,
    simple file formatting, first-pass discovery, checklist creation.
  Use Sonnet (default) for:
    OpenSpec planning, design, task generation, implementation, review, QA, normal debugging.
  Use Opus only for:
    critical architecture or security decisions after Sonnet has failed or is insufficient.
    Must be justified explicitly. Never use Opus as a default for any phase.
  Never use Opus for: broad loops, batch generation, or routine SDD phases.
</model_policy>
```

## Switching signal

If Sonnet produces an incorrect or low-quality result after two focused attempts with compressed context, escalate to Opus for that specific sub-problem only. Return to Sonnet for everything else in the session.
