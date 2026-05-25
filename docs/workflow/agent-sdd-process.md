# Agent SDD Process

> Operational workflow guide for using `agent-sdd-kit` inside a target repository.
> Copied into every target repository by `npm run setup:repo`.

**Goal:** Keep AI-assisted development spec-driven, reviewable, and token-efficient.

---

## 1. What `setup:repo` installs

Running `npm run setup:repo -- --target /path/to/repo --mode copy` (or `reference`) scaffolds:

| Path | Purpose |
|------|---------|
| `CLAUDE.md` | Agent onboarding — workflow, commands, constraints |
| `AI_CONTEXT.md` | Current session state — goal, active change, key paths |
| `.claude/commands/` | Slash-command wrappers for each SDD phase |
| `prompts/` | Prompt skeleton library (phases + policies + examples) |
| `docs/context/` | Architecture, thinking model, and coding conventions stubs |
| `docs/discovery/` | Discovery artifacts live here |
| `docs/integrations/` | Integration context docs live here |
| `openspec/` | OpenSpec config and `changes/` scaffold |
| `memory/` | Persistent agent memory across sessions |

---

## 2. First-time repo preparation

Before running any phase, fill in these files. Agents read them at the start of every session.

| File | What to add |
|------|-------------|
| `CLAUDE.md` | Project overview, tech stack, build/test commands |
| `AI_CONTEXT.md` | Current goal, active OpenSpec change, key file paths |
| `openspec/config.yaml` | Project name, artifact rules, context file list |
| `docs/context/architecture.md` | Component diagram, stack, data flows, integrations |
| `docs/context/thinking-model.md` | How to assess blast radius, investigation strategy |
| `docs/context/coding-conventions.md` | Naming, structure, import order, testing, commit format |

Agents that skip these files make wrong assumptions. Fill them before the first discovery run.

---

## 3. Standard workflow

Every feature follows this sequence. Run each phase in its own context window — `/clear` between phases.

```
discovery
→ local-documentation
→ /openspec-explore       (if requirements are still unclear)
→ /openspec-propose
→ review generated OpenSpec
→ /openspec-apply-change  (one task per session)
→ review-task
→ qa
→ (debug-compressed if bugs found)
→ summary-before-clear
→ /clear
→ repeat apply → review → qa for each remaining task
→ /openspec-archive-change
```

**Never skip the OpenSpec step.** Implementation before a formal spec produces unreviewed, undocumented, hard-to-reverse changes.

---

## 4. Phase-by-phase instructions

### Phase 1 — Discovery

| | |
|---|---|
| **Purpose** | Understand the problem space, gather facts, surface unknowns. No implementation. |
| **Command** | `Read .claude/commands/discovery.md and follow it` |
| **Input files** | `CLAUDE.md`, `AI_CONTEXT.md`, external API docs or codebase sections |
| **Output artifact** | `docs/discovery/<feature-name>-discovery.md` |
| **What not to do** | Do not propose solutions. Do not write code. Do not scan the entire repo. |

Discovery is complete when you can answer: what does this feature need, what is unknown, what must be confirmed before design begins.

---

### Phase 2 — Local Documentation

| | |
|---|---|
| **Purpose** | Generate or update context docs so every subsequent phase has accurate grounding. |
| **Command** | `Read .claude/commands/local-documentation.md and follow it` |
| **Input files** | Discovery artifact, codebase relevant sections |
| **Output artifact** | `docs/integrations/<service>-<feature>-api.md` and/or updates to `docs/context/` |
| **What not to do** | Do not include assumptions. Do not invent API behavior — mark unknowns explicitly. |

---

### Phase 3 — OpenSpec Explore (optional)

| | |
|---|---|
| **Purpose** | Think through requirements, scope, and approach before generating a formal spec. |
| **Command** | `/openspec-explore` |
| **Input files** | Discovery artifact, local documentation |
| **Output artifact** | Refined understanding — no file artifact is required |
| **What not to do** | Do not start implementation. Do not generate tasks yet. |

Use this phase when the problem scope is ambiguous or when there are unresolved architectural choices.

---

### Phase 4 — OpenSpec Propose

| | |
|---|---|
| **Purpose** | Generate the full OpenSpec change: `proposal.md` → `specs.md` → `design.md` → `tasks.md`. |
| **Command** | `/openspec-propose` |
| **Input files** | Discovery artifact, integration docs, context docs |
| **Output artifact** | `openspec/changes/<change-name>/` with all four artifacts |
| **What not to do** | Do not implement during this phase. Do not skip the review of generated artifacts. |

After the command completes, read the generated artifacts. Check that tasks are small enough to implement in a single session, and that the design matches what discovery found.

---

### Phase 5 — Task Implementation

| | |
|---|---|
| **Purpose** | Implement a single task from the active OpenSpec change. |
| **Command** | `/openspec-apply-change` |
| **Input files** | `openspec/changes/<change-name>/tasks.md`, design doc, context docs |
| **Output artifact** | Working code change for the task; updated task status |
| **What not to do** | Do not implement multiple tasks in one session. Do not skip the file allowlist. Do not refactor outside task scope. |

One task per session. `/clear` after each task-review-QA cycle before starting the next task.

---

### Phase 6 — Task Review

| | |
|---|---|
| **Purpose** | Verify the implemented task against its acceptance criteria and spec. |
| **Command** | `Read .claude/commands/review-task.md and follow it` |
| **Input files** | Implemented code diff, `tasks.md`, `specs.md` |
| **Output artifact** | `review-task-N.md` with findings and pass/fail verdict |
| **What not to do** | Do not merge or archive before review passes. Do not review in the same context window as implementation. |

---

### Phase 7 — QA

| | |
|---|---|
| **Purpose** | Run tests, check behavior, and produce a bug report if issues are found. |
| **Command** | `Read .claude/commands/qa.md and follow it` |
| **Input files** | Implementation, test suite, `specs.md` |
| **Output artifact** | `qa-report.md` — pass/fail per criterion; bug list if applicable |
| **What not to do** | Do not skip QA. Do not fix bugs during the QA phase — write the report, then run debug-compressed. |

---

### Phase 8 — Debug Compressed (when needed)

| | |
|---|---|
| **Purpose** | Fix bugs from the QA report in a focused, token-efficient session. |
| **Command** | `Read .claude/commands/debug-compressed.md and follow it` |
| **Input files** | `qa-report.md` — do not paste raw logs; summarize failures |
| **Output artifact** | Code fix and updated QA status |
| **What not to do** | Do not dump full stack traces or log files into the prompt. Do not use Opus in a long loop. |

---

### Phase 9 — Summary Before Clear

| | |
|---|---|
| **Purpose** | Capture decisions, progress, and next steps before resetting context. |
| **Command** | `Read .claude/commands/summary-before-clear.md and follow it` |
| **Input files** | Current session context |
| **Output artifact** | `summary.md` (or append to an existing session log) |
| **What not to do** | Do not substitute this for `/openspec-archive-change`. This is session hygiene, not archival. |

After summary, run `/clear`. The artifacts on disk are your memory.

---

### Phase 10 — Archive

| | |
|---|---|
| **Purpose** | Finalize the change — merge OpenSpec artifacts into the main spec history. |
| **Command** | `/openspec-archive-change` |
| **Input files** | All change artifacts under `openspec/changes/<change-name>/` |
| **Output artifact** | Archived change; change directory marked complete |
| **What not to do** | Do not archive before review, QA, and summary are done. |

---

## 5. Example feature flow

**Feature:** Build a latest tokens dashboard using CoinGecko.

### Step 1 — Discovery

Run discovery against the CoinGecko API documentation. Discovery must confirm:

- Correct endpoint for latest/recently added tokens
- Authentication requirements (API key, OAuth, none)
- Rate limits and pagination behavior
- Full response shape (field names, types, nesting)
- Which fields are available vs. computed
- Any unknowns — mark these explicitly as `UNKNOWN` in the artifact

Output: `docs/discovery/coingecko-latest-tokens-dashboard-discovery.md`

Do not guess API behavior. If a field is not confirmed in the documentation, mark it unknown.

### Step 2 — Local Documentation

Create an integration context doc from the discovery artifact.

Output: `docs/integrations/coingecko-latest-tokens-api.md`

### Step 3 — OpenSpec Explore (if needed)

If the dashboard scope is unclear (which tokens to show, pagination vs. scroll, data freshness requirements), run `/openspec-explore` to resolve these before proposing.

### Step 4 — OpenSpec Propose

Run `/openspec-propose`. The agent reads the discovery and integration docs and generates:

```
openspec/changes/build-coingecko-latest-tokens-dashboard/
  proposal.md
  specs.md
  design.md
  tasks.md
```

Review all four files before proceeding. Confirm tasks are independently implementable.

### Steps 5–9 — Implement, Review, QA, Debug, Summarize

For each task in `tasks.md`:

1. `/openspec-apply-change` — implement the task
2. `review-task.md` — produce `review-task-N.md`
3. `qa.md` — produce `qa-report.md`
4. `debug-compressed.md` — fix bugs if any
5. `summary-before-clear.md` — produce `summary.md`
6. `/clear`

### Step 10 — Archive

`/openspec-archive-change` — marks the change complete.

---

## 6. Cost control policy

**Output tokens are the main cost driver.** Every full file printed, every passing test log, every verbose summary burns tokens at the same rate as Sonnet/Opus input.

| Task | Model |
|------|-------|
| Daily reports, summaries, session captures, mechanical docs, simple formatting | Free / low-cost (Haiku, Gemini Flash, DeepSeek) |
| Discovery, doc extraction, checklists | Free / low-cost |
| OpenSpec generation, implementation, review, QA, normal debugging | Sonnet (default) |
| Critical architecture decisions, security review, deep debugging after Sonnet fails | Opus (escalation only — rare) |

**Rules:**
- Sonnet is the default for all SDD phases.
- Opus is escalation only — never the default for any phase. Justify before invoking.
- Use Haiku/free/low-cost for daily reports, summaries, mechanical documentation, first-pass discovery.
- Do not print full files or full diffs. Write artifacts to files; print only summaries in chat.
- If tests pass, print command + pass summary only. Print failing output only on failure.
- Never use Opus in a long implementation loop. Reserve it for single-turn decisions where correctness outweighs cost.

---

## 7. Budget discipline

- **OpenRouter spend cap** is the financial safety brake. Set it before starting any project.
- `/clear` resets context — it is **context hygiene**, not budget control.
- Use file allowlists (`prompts/policies/file-allowlist-policy.md`) to prevent broad repo scans.
- Avoid prompts that request long outputs across many files simultaneously.
- Use local Markdown artifacts (`docs/discovery/`, `docs/integrations/`, `openspec/`) as durable memory — do not re-derive information the agent already produced.
- **One task per session.** Long sessions accumulate context debt; short sessions are cheaper and easier to review.

---

## 8. Anti-patterns

Avoid these — each one wastes tokens, produces unreviewable changes, or breaks the spec discipline.

| Anti-pattern | Why it fails |
|-------------|-------------|
| Asking the agent to read the whole repo | Burns tokens on irrelevant context; use allowlists |
| Running discovery + design + implementation in one prompt | No reviewable artifact; no spec; impossible to audit |
| Implementing before an OpenSpec change exists | Changes are undocumented and hard to reverse |
| Skipping task review | Bugs reach QA or production without a checkpoint |
| Using Opus in long implementation loops | Disproportionate cost for routine work |
| Dumping raw logs or stack traces into debug prompts | Exceeds token budget; use compressed summaries |
| Relying on conversation memory instead of file artifacts | Memory evaporates after `/clear`; artifacts persist |
| Implementing multiple tasks in one session | No isolation; makes review and rollback difficult |
| Archiving before review and QA pass | Spec history records incomplete or buggy work |

---

## 9. Quick command reference

| Phase | How to invoke |
|-------|--------------|
| Discovery | `Read .claude/commands/discovery.md and follow it` |
| Local Documentation | `Read .claude/commands/local-documentation.md and follow it` |
| OpenSpec Explore | `/openspec-explore` |
| OpenSpec Propose | `/openspec-propose` |
| Task Implementation | `/openspec-apply-change` |
| Task Review | `Read .claude/commands/review-task.md and follow it` |
| QA | `Read .claude/commands/qa.md and follow it` |
| Debug Compressed | `Read .claude/commands/debug-compressed.md and follow it` |
| Summary Before Clear | `Read .claude/commands/summary-before-clear.md and follow it` |
| Archive Change | `/openspec-archive-change` |

---

*This guide is maintained in [agent-sdd-kit](https://github.com/erionbarasuol/agent-sdd-kit) and copied into target repositories by `npm run setup:repo`.*
