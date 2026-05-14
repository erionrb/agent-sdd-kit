# SDD with AI agents — learning path

Structured guide to **Spec Driven Development (SDD)** in an AI-assisted workflow: how LLMs behave, how to steer them with specs and context, and how this repository wires that practice through **OpenSpec** and IDE skills.

Use this folder as the **canonical curriculum** for the **agent-sdd-kit** project. The numbered steps build on each other; you can skip ahead if you already know the foundations.

---

## What you will be able to do

After working through the path (especially steps 04–08), you should be able to:

- Explain why specs act as **durable memory** for stateless models and how that changes team workflows.
- Map the SDD loop to **concrete artifacts** (what lives in `openspec/changes/<name>/` in this repo).
- Run the **propose → apply → explore → archive** flow using the bundled Claude Code and Cursor skills.
- Know which **context documents** (`CLAUDE.md`, architecture, conventions) reduce drift and rework—and where to add them in this repo.

---

## What is SDD?

**Spec Driven Development** means producing clear, versioned specification artifacts *before* or *alongside* implementation so that humans and agents share the same source of truth. With agents, those artifacts compensate for models that do not retain project state between sessions.

A typical high-level loop (names vary by toolchain; this repo uses OpenSpec filenames):

```text
Idea → proposal (what/why) → specs → design (how) → tasks (steps) → implement → review → QA
```

Each phase can be a separate agent turn with a clean context window, passing work forward **by file reference** instead of re-explaining the whole project every time.

---

## How this repo implements it

| Piece | Role |
|--------|------|
| [CLAUDE.md](../../../CLAUDE.md) (repo root) | Agent onboarding: purpose, OpenSpec commands, repo layout. |
| `.claude/skills/` & `.cursor/skills/` | **opsx** skills: propose, apply, explore, archive. |
| `.claude/commands/opsx/` & `.cursor/commands/` | Slash-style entry points that invoke those skills. |
| `openspec/config.yaml` | Project rules and context for OpenSpec (fill in as you adopt the workflow). |
| `openspec/changes/<name>/` | Per-change artifacts (`proposal.md`, `specs.md`, `design.md`, `tasks.md`, …) once you start changes. |

For day-to-day commands and CLI equivalents, start with **CLAUDE.md**; step **04** explains the framework in depth.

---

## The eight steps

| Step | Document | What it covers |
|:----:|----------|----------------|
| 01 | [01-llm-fundamentals.md](./01-llm-fundamentals.md) | Tokens, tools, context windows, failure modes (e.g. hallucination). |
| 02 | [02-prompt-engineering.md](./02-prompt-engineering.md) | Prompt patterns that improve quality and control cost. |
| 03 | [03-context-management.md](./03-context-management.md) | Keeping long sessions coherent within window limits. |
| 04 | [04-sdd-framework.md](./04-sdd-framework.md) | Full SDD picture: phases, artifacts, agent handoffs. |
| 05 | [05-artifacts.md](./05-artifacts.md) | PRD / Tech Pack / Tasks (and how they map to OpenSpec files here). |
| 06 | [06-execution-and-review.md](./06-execution-and-review.md) | Implementation loop, review habits, agent discipline. |
| 07 | [07-context-docs.md](./07-context-docs.md) | Context docs every serious project needs; exercises for this repo. |
| 08 | [08-whats-next.md](./08-whats-next.md) | Gap list and **action checklist** for extending this workspace. |

---

## Suggested order

1. **New to LLM behavior** — Read **01 → 02 → 03** once so later SDD material clicks faster.
2. **Comfortable with LLMs** — Start at **04**, then **05 → 06**.
3. **Ready to change this repo** — Do **07** (context docs), then **08** (prioritized backlog).

If you only read two documents after skimming this README, make them **04** (framework) and **08** (what to build next here).

---

## Related material

- Repository overview and OpenSpec version notes: [CLAUDE.md](../../../CLAUDE.md)
- Step **08** duplicates some “what exists / what’s missing” tables in more detail and ties each gap to an actionable task.

---

## Conventions

- **Numbered files** (`01-…` through `08-…`) are the curriculum; keep cross-links relative to this directory (`./07-context-docs.md`) so the path stays portable if the repo moves.
