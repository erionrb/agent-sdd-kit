# SDD with AI Agents — Learning Path

This is the SDD learning path for this repo — a structured guide to Spec Driven Development with AI agents, from fundamentals to a full working cycle. No hand-holding, just the essentials.

## What is SDD?

Spec Driven Development is the practice of generating formal, versioned specification artifacts (PRD → Tech Pack → Tasks) before any code is written. With AI agents, these artifacts serve as the persistent memory that stateless LLMs lack. They also make the agent's output deterministic and reviewable across the whole team.

The core loop:

```
Idea → PRD (what/why) → Tech Pack (how) → Tasks (steps) → Execute → Review → QA → Bug Fix
```

Each phase is a separate agent invocation with a clean context window, passing artifacts by reference between phases.

## What's already in this repo

| Item | Status | Path |
|------|--------|------|
| OpenSpec CLI skills (opsx:propose, opsx:apply, opsx:explore, opsx:archive) | Installed | `.claude/skills/` |
| Cursor equivalents of opsx skills | Installed | `.cursor/skills/` |
| OpenSpec config | Present (empty) | `openspec/config.yaml` |
| CLAUDE.md | **Missing** | — |
| docs/context/ | **Missing** | — |
| tasks/ folder with real PRD/TechPack/task files | **Missing** | — |
| PRD generator skill | **Missing** | — |
| Tech Pack generator skill | **Missing** | — |
| Task Reviewer skill | **Missing** | — |
| QA runner skill | **Missing** | — |
| Bug Fix skill | **Missing** | — |

## The 8 Steps

| Step | File | Topic |
|------|------|-------|
| 01 | [01-llm-fundamentals.md](./01-llm-fundamentals.md) | How LLMs work internally — tokens, tool calls, context windows, hallucinations |
| 02 | [02-prompt-engineering.md](./02-prompt-engineering.md) | Writing prompts that produce quality output with minimal tokens |
| 03 | [03-context-management.md](./03-context-management.md) | Managing context window across a development session |
| 04 | [04-sdd-framework.md](./04-sdd-framework.md) | The complete SDD framework — phases, artifacts, agent flow |
| 05 | [05-artifacts.md](./05-artifacts.md) | Deep dive on PRD, Tech Pack, and Tasks |
| 06 | [06-execution-and-review.md](./06-execution-and-review.md) | Running the implementation loop with agents |
| 07 | [07-context-docs.md](./07-context-docs.md) | The context documents every project needs (CLAUDE.md, architecture, conventions) |
| 08 | [08-whats-next.md](./08-whats-next.md) | Gap analysis and action plan for THIS repo |

## Recommended sequence

Work through steps 01–03 once to internalize the mental model, then jump to 04–06 for the SDD framework proper. Step 07 is the most immediately actionable — it tells you what to create in this repo right now. Step 08 is the action checklist.

If you're already comfortable with how LLMs work, start at step 04.
