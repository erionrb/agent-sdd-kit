# agent-sdd-kit

Open source **SSD/SDD AI workflow toolkit** — training material, prompt skeletons, policies, Claude Code commands, OpenSpec workflow, and a setup command for bootstrapping real projects.

This is **not** an application runtime. It is the **tooling, training, prompt, and setup layer** you apply to real repositories — once or repeatedly — to run a disciplined, spec-first, AI-assisted development workflow.

---

## Start here

| If you want to… | Go to |
|-----------------|-------|
| Learn SDD end-to-end | [docs/training/path/README.md](./docs/training/path/README.md) |
| Use the prompt skeletons in your own work | [prompts/README.md](./prompts/README.md) |
| Bootstrap a target repo with this workflow | [Quick start below](#quick-start-bootstrap-another-project) |
| Operate the workflow after bootstrapping | [docs/workflow/agent-sdd-process.md](./docs/workflow/agent-sdd-process.md) |
| Understand the Claude / OpenSpec command flow | [CLAUDE.md](./CLAUDE.md) / [.cursor/rules/project.mdc](./.cursor/rules/project.mdc) |
| Know what to build next in this repo | [docs/training/path/08-whats-next.md](./docs/training/path/08-whats-next.md) |

Familiar with LLMs already? Jump to **step 04** in the learning path, then **07** and **08**.

---

## What you get in this repo

| Asset | Description |
|-------|-------------|
| **SDD learning path** | `docs/training/path/01–08` — eight-step curriculum from LLM basics to full SDD execution |
| **Prompt skeleton library** | `prompts/` — reusable prompts by phase (discovery, proposal, apply, review, QA, summary) |
| **Policies** | `prompts/policies/` — standing rules injected into agent sessions |
| **Phase prompts** | `prompts/phases/` — one prompt per SDD phase, ready to copy or reference |
| **`setup:repo` command** | Bootstraps any target repository with the full SSD/SDD folder structure |
| **Operational workflow guide** | `docs/workflow/agent-sdd-process.md` — phase-by-phase instructions copied into every target repo |
| **Claude Code commands** | `/openspec-explore`, `/openspec-propose`, `/openspec-apply-change`, `/openspec-archive-change` |
| **Cursor commands** | `/opsx-explore`, `/opsx-propose`, `/opsx-apply`, `/opsx-archive` — mirrored in `.cursor/commands/` |
| **Cursor Rules** | `.cursor/rules/project.mdc` — auto-loaded project context for Cursor (equivalent of `CLAUDE.md`) |
| **OpenSpec root** | `openspec/config.yaml` and `openspec/changes/` scaffold |
| **Session memory** | `memory/` — persistent agent context across sessions |
| **Context docs** | `AI_CONTEXT.md`, `CLAUDE.md` — agent onboarding and operating instructions |

---

## Repository layout

```text
.claude/                  Claude Code commands and skills (opsx: propose, apply, explore, archive)
.cursor/rules/            Cursor Rules — project context auto-loaded by Cursor (equivalent of CLAUDE.md)
.cursor/commands/         Cursor slash commands (opsx-propose, opsx-apply, opsx-explore, opsx-archive)
.cursor/skills/           Same skills mirrored for Cursor
docs/training/path/       SDD learning path (entry: README.md)
openspec/                 OpenSpec config + changes/ (per-change folders live here)
prompts/                  Canonical prompt skeleton library
prompts/phases/           One prompt per SDD phase
prompts/policies/         Standing policy prompts injected into agent sessions
prompts/examples/         Annotated usage examples
scripts/setup-repo.js     Repo bootstrap script
memory/                   Persistent memory files for agent sessions
CLAUDE.md                 Agent onboarding: workflow, commands, structure, gaps
AI_CONTEXT.md             Stack and architecture context read by agents
package.json              npm package; exposes setup:repo script
LICENSE / NOTICE          Apache License 2.0 and copyright notice
```

---

## Quick start: bootstrap another project

Run from the cloned repository root:

```bash
# Default (reference mode — target points to canonical prompts here)
npm run setup:repo -- --target /path/to/project

# Explicit reference mode
npm run setup:repo -- --target /path/to/project --mode reference

# Copy mode — prompt tree copied into the target repo
npm run setup:repo -- --target /path/to/project --mode copy

# Copy mode with force — backs up existing files before overwriting
npm run setup:repo -- --target /path/to/project --mode copy --force
```

### Setup modes

| Mode | Behaviour |
|------|-----------|
| `reference` | Target repo's prompts point to this repository's `prompts/` directory; no file duplication; updates to prompts here apply everywhere |
| `copy` | Full prompt tree copied into the target repo; target is self-contained |
| `--force` | Before overwriting any existing file, creates a `.bak` backup |

The command is safe and idempotent: it validates the target path, creates only missing files and folders, and skips anything already present unless `--force` is passed. It uses no external npm dependencies.

---

## SSD/SDD workflow applied to a target repo

After bootstrapping, the standard development loop is:

```
setup:repo
  → discovery
  → local-documentation
  → /openspec-explore      (if problem needs scoping before proposal)
  → /openspec-propose
  → /openspec-apply-change (one task at a time)
  → review-task
  → qa
  → summary-before-clear
  → /openspec-archive-change
```

### SSD commands vs. OpenSpec commands

| Layer | Role |
|-------|------|
| **SSD prompt skeletons** (`prompts/phases/`) | Guardrails and phase discipline — structure how the agent thinks and what it produces at each step |
| **OpenSpec commands** (`/openspec-*`) | Preferred for proposing, applying, and archiving spec-driven changes — produce formal artifacts |
| **discovery / local-documentation** | Run *before* OpenSpec generation to ground the agent in the codebase |
| **review / qa / summary** | Run *around* OpenSpec implementation — after `apply-change`, before `archive-change` |

---

## Example: building a latest tokens dashboard with CoinGecko

**Product:** A dashboard that lists newly launched or recently tracked tokens from CoinGecko, showing name, symbol, price, 24h change, market cap, volume, and last updated time.

A concrete illustration of the full loop on a real project:

```bash
# 1. Bootstrap the target repo
npm run setup:repo -- --target ~/dev/coingecko-tokens-dashboard --mode copy

# 2. Open Claude Code in the target repo
# 3. Run discovery against CoinGecko API documentation
#    → produces docs/discovery/coingecko-latest-tokens-dashboard-discovery.md
#    Discovery must confirm: correct endpoint, rate limits, auth requirements,
#    response shape, and pagination. Mark any unknown field as UNKNOWN.

# 4. Create local integration context doc
#    → produces docs/integrations/coingecko-latest-tokens-api.md

# 5. Scope the change (if requirements are still unclear)
/openspec-explore     # clarify assumptions, edge cases, API contract shape

# 6. Propose the change
/openspec-propose     # generates proposal.md → specs.md → design.md → tasks.md
#    → openspec/changes/build-coingecko-latest-tokens-dashboard/

# 7. Implement task by task
/openspec-apply-change    # repeat per task; run review-task + qa after each
#    → review-task-N.md, qa-report.md, summary.md

# 8. Archive
/openspec-archive-change  # merges artifacts into main specs
```

---

## Cost control policy

**Output tokens are the main cost driver.** Every full file printed, every passing test log, every verbose summary burns output tokens at the same rate as Sonnet/Opus input.

| Task | Model |
|------|-------|
| Daily reports, summaries, session captures, mechanical docs, simple formatting | Free / low-cost (Haiku, Gemini Flash, DeepSeek) |
| Discovery, doc extraction, checklists | Free / low-cost |
| OpenSpec generation, implementation, review, QA, normal debugging | Sonnet (default) |
| Critical architecture, deep security audit, explicit high-stakes reasoning | Opus (escalation only — rare) |

**Rules:**
- Sonnet is the default for all SDD phases.
- Opus is escalation only — never the default for any phase. Justify before invoking.
- Use Haiku/free/low-cost for daily reports, summaries, mechanical documentation, first-pass discovery.
- Do not print full files or full diffs. Write artifacts to files; print only the summary.
- If tests pass, print command + pass summary only. Print failing output only on failure.
- Use file allowlists to prevent broad repo scans.
- `/clear` is context hygiene, **not** budget control. Set an OpenRouter spend cap as the financial brake.

---

## Prerequisites

- **Node.js** (for `npm run setup:repo`).
- **OpenSpec CLI v1.3.1** for `openspec` commands outside the IDE.
- **Claude Code** and/or **Cursor** for bundled slash commands and skills.

---

## npm

`package.json` exposes one real script:

| Script | What it does |
|--------|-------------|
| `setup:repo` | Bootstraps a target repository with the SSD/SDD folder structure, CLAUDE.md, AI_CONTEXT.md, prompt skeletons, and OpenSpec scaffold |

No external runtime dependencies are required.

---

## License

Licensed under the **Apache License, Version 2.0**. See [`LICENSE`](./LICENSE) for the full terms. [`NOTICE`](./NOTICE) lists copyright attribution for this project.

---

## Contributing

Contributions are welcome: **issues**, **doc fixes**, and **pull requests** all help.

- By opening a PR or otherwise contributing, you agree your contribution is licensed under the **same terms** as this repository (**Apache-2.0**), unless you clearly state otherwise for a specific file or excerpt.
- For larger changes (new skills, big doc restructures, workflow changes), opening an **issue first** helps align on direction and avoids duplicate work.
- Match the tone and structure of existing docs and skills; keep commits focused and easy to review.

There is no separate contributor agreement (CLA); the license above governs inbound contributions in the usual open source way.
