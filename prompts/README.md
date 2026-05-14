# Prompt Skeleton Library

Reusable, copy/paste-ready prompt templates for the SDD/OpenSpec workflow in this repository.

## Structure

```
prompts/
  phases/       One skeleton per SDD phase (01–08)
  policies/     Reusable policy blocks to embed in any prompt
  examples/     Concrete filled-in examples for the most common phases
```

## SDD Phase → Skeleton Map

| Phase | File | Model | Token Risk |
|-------|------|-------|------------|
| 01 Discovery | `phases/01-discovery.md` | Free/low-cost | Low |
| 02 Local Documentation | `phases/02-local-documentation.md` | Free/low-cost | Low |
| 03 OpenSpec Planning | `phases/03-openspec-planning.md` | Sonnet | Medium |
| 04 Task Implementation | `phases/04-task-implementation.md` | Sonnet | Medium |
| 05 Task Review | `phases/05-task-review.md` | Sonnet | Low |
| 06 QA | `phases/06-qa.md` | Sonnet | Medium |
| 07 Debug (compressed) | `phases/07-debug-compressed.md` | Sonnet / Opus | Low |
| 08 Summary Before Clear | `phases/08-summary-before-clear.md` | Free/low-cost | Minimal |

## Policies

| Policy | File | Purpose |
|--------|------|---------|
| Output Policy | `policies/output-policy.md` | Controls verbosity, scan depth, print limits |
| Model Policy | `policies/model-policy.md` | Which model to use for which work |
| Budget Policy | `policies/budget-policy.md` | Token and cost discipline |
| File Allowlist | `policies/file-allowlist-policy.md` | Limits file access per phase |

## How to Use

1. Pick the phase skeleton that matches your current step.
2. Copy the `<prompt>` XML block.
3. Fill in every `{{PLACEHOLDER}}` with real values.
4. Optionally embed one or more policy blocks using the `<policy>` XML pattern shown in each skeleton.
5. Paste into Claude Code, Cursor, or your model interface of choice.
6. `/clear` when the phase is done before moving to the next.

## Workflow Sequence

```
01 Discovery → 02 Local Docs
  (pre-OpenSpec: SDD prompts only, no artifacts, no implementation)

→ /openspec-explore   (if requirements are still unclear)
→ /openspec-propose   (generates proposal.md + design.md + tasks.md)
→ /openspec-apply-change  (one task per session)
→ 05 Review → 06 QA → (07 Debug if needed)
→ 08 Summary Before Clear → /clear
→ /openspec-archive-change  (only after review + QA + summary are done)
```

**OpenSpec commands** (`/openspec-propose`, `/openspec-apply-change`, `/openspec-archive-change`, `/openspec-explore`) are the preferred way to propose, implement, and archive changes. The phase skeletons in `phases/03–04` are manual fallbacks for when you need fine-grained control.

Each phase runs in its own context window. Never carry implementation context into a review context.
