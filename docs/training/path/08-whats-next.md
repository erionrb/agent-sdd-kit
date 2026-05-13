# 08 — What's Next for This Repo

This is the gap analysis and action plan. Everything in the learning path so far was theory and framework. This document is the backlog.

---

## Current state

What exists:

| Item | Location | Notes |
|---|---|---|
| OpenSpec CLI (opsx:propose, opsx:apply, opsx:explore, opsx:archive) | `.claude/skills/` | Core SDD workflow, ready to use |
| Cursor equivalents | `.cursor/skills/` | Same skills for Cursor IDE |
| OpenSpec config | `openspec/config.yaml` | Present but empty — no project context set |
| This learning path | `docs/training/path/` | The document you're reading |

What doesn't exist yet:
- `CLAUDE.md` — agents start every session discovering the project from scratch
- `docs/context/` — no architecture, thinking model, or coding conventions
- PRD generator skill (interactive)
- Tech Pack generator skill (with Context7)
- Task Reviewer skill
- QA runner skill (Playwright)
- Bug Fix skill
- Any completed SDD cycle — `openspec/changes/` is empty

---

## The action checklist

### 1. Create `CLAUDE.md`

**File**: `/Users/erion/dev/personal/ia/CLAUDE.md`

**What it unlocks**: Every agent session starts with full project context — no discovery tool calls. Estimated savings: 3-5 tool calls per session.

**How**: See the hands-on exercise in [step 07](./07-context-docs.md). Ask Claude Code to generate it from the repo, then review and commit.

**Covers**: Step 07 of this learning path.

---

### 2. Create `docs/context/architecture.md`

**File**: `/Users/erion/dev/personal/ia/docs/context/architecture.md`

**What it unlocks**: Agents understand where modules belong. No logic leaking across boundaries. ADRs explain why OpenSpec was chosen and what patterns to follow.

**How**: Start with the template from step 07. ADR-001 should document the decision to use SDD + OpenSpec. Add more ADRs as you make architectural decisions going forward.

**Covers**: Step 07 of this learning path.

---

### 3. Create `docs/context/thinking-model.md`

**File**: `/Users/erion/dev/personal/ia/docs/context/thinking-model.md`

**What it unlocks**: Agents apply consistent analytical patterns. Impact assessment before changes. Clean code principles enforced without reminders.

**How**: Use the template from step 07 as a starting point. Adjust the principles to match your actual preferences — if you prefer longer functions with more context, say so. This document is yours.

**Covers**: Step 07 of this learning path.

---

### 4. Create `docs/context/coding-conventions.md`

**File**: `/Users/erion/dev/personal/ia/docs/context/coding-conventions.md`

**What it unlocks**: Every agent across every session produces code in the same style. No more "the AI used snake_case in this file and camelCase in that one." Team consistency without code review debates.

**How**: Use the template from step 07. Be specific — vague conventions like "write clean code" are ignored. Explicit rules like "no magic numbers: every literal must be named" are enforced.

**Covers**: Step 07 of this learning path.

---

### 5. Update `openspec/config.yaml` with project context

**File**: `/Users/erion/dev/personal/ia/openspec/config.yaml`

**What it unlocks**: The `opsx:propose` skill will generate artifacts that match your actual stack and conventions instead of generic defaults.

**How**: Open `openspec/config.yaml` and fill in the `context` block:

```yaml
schema: spec-driven

context: |
  Tech stack: [your stack once CLAUDE.md is written]
  Conventions: see docs/context/coding-conventions.md
  Architecture: see docs/context/architecture.md

rules:
  proposal:
    - Keep scope section explicit with an out-of-scope list
    - Acceptance criteria must be Playwright-testable
  tasks:
    - Each task must include specific file paths to create/modify
    - Each task must include at least one test
    - Maximum 2 hours of estimated work per task
```

**Covers**: Steps 04 and 05 of this learning path.

---

### 6. Build or install the PRD generator skill

**Target path**: `.claude/skills/prd-generator/`

**What it unlocks**: Interactive PRD generation. The skill asks clarifying questions using the `AskUserQuestion` tool before writing the PRD. This produces higher-quality PRDs than the fast `/opsx:propose` flow because it interviews you about user types, scope, constraints, and success metrics before writing anything.

**How to build it**:
- Create `.claude/skills/prd-generator/SKILL.md`
- The skill should: activate via a command, use `AskUserQuestion` to collect context, generate a PRD following the template in step 05, save it to `openspec/changes/<name>/prd.md`
- The `AskUserQuestion` tool is the key — it blocks execution until the user answers, keeping the PRD grounded in real requirements rather than LLM assumptions

**Covers**: Steps 04 and 05 of this learning path.

---

### 7. Build or install the Tech Pack generator skill

**Target path**: `.claude/skills/techpack-generator/`

**What it unlocks**: The Tech Pack generator uses Context7 MCP (for library docs) and web search (for API contracts and constraints). It reads the PRD, asks technical clarifying questions, and generates the design document. A well-built Tech Pack skill will surface things like API rate limits, breaking library changes, and integration constraints before any code is written — exactly the kind of pre-implementation discovery that saves hours of debugging.

**How to build it**:
- Create `.claude/skills/techpack-generator/SKILL.md`
- The skill should: require a PRD as input, use Context7 to research library options, use web search for external API constraints, ask technical clarifying questions, generate a design document following the template in step 05
- Important: instruct the skill to invoke Context7 tools explicitly (Context7 MCP must be enabled during this phase)

**Covers**: Steps 04 and 05 of this learning path.

---

### 8. Build the Task Reviewer skill

**Target path**: `.claude/skills/task-reviewer/`

**What it unlocks**: Automated review after each task with consistent verdict format (approved / approved with minors / rejected). The reviewer runs with a clean context and checks: acceptance criteria met, tests written and passing, file structure matches Tech Pack, conventions followed.

**How to build it**:
- Create `.claude/skills/task-reviewer/SKILL.md`
- The skill should: accept a task identifier or file path, read the task spec, read the implemented files, compare against PRD acceptance criteria and coding conventions, produce a structured verdict report in `openspec/changes/<name>/review-task-N.md`
- Verdict format should include: overall verdict, list of issues with severity (critical/major/minor/cosmetic), recommended next action

**Covers**: Step 06 of this learning path.

---

### 9. Build the QA runner skill (Playwright)

**Target path**: `.claude/skills/qa-runner/`

**What it unlocks**: End-to-end validation of the complete feature after all tasks are done. The QA agent starts the application, runs Playwright e2e tests covering the PRD user stories, runs a WCAG 2.2 accessibility audit, and generates a structured bug report.

**How to build it**:
- Create `.claude/skills/qa-runner/SKILL.md`
- The skill should: require the Playwright MCP to be enabled, start the dev servers, run e2e tests against the user stories in the PRD, run accessibility tests, generate `openspec/changes/<name>/qa-report.md` with findings categorized by severity
- Use the Playwright MCP (`@playwright/mcp`) — the Microsoft-maintained official implementation

**Covers**: Step 06 of this learning path.

---

### 10. Build the Bug Fix skill

**Target path**: `.claude/skills/bug-fix/`

**What it unlocks**: Automated cosmetic and minor bug fixes from the QA report. Fixes the class of bugs that are clear from the spec (wrong locale, missing title, color inconsistency) without requiring a full task re-run.

**How to build it**:
- Create `.claude/skills/bug-fix/SKILL.md`
- The skill should: read the QA report, fix all cosmetic bugs and minors that don't require architectural changes, update the QA report status field for each fixed bug, flag majors/criticals for human review with an explanation of why they need manual attention

**Covers**: Step 06 of this learning path.

---

### 11. Run the first full SDD cycle on a real feature

**What it unlocks**: Everything above becomes concrete. You'll discover what works, what needs adjustment in your skills, and what the actual token cost is for a full cycle.

**Suggested first feature**: A real, useful addition to this project — for example:
- A feature tracker dashboard that reads all `openspec/changes/` and shows their status
- A CLAUDE.md generator that inspects the repo and produces a first draft
- A conventions linter that checks generated code against `docs/context/coding-conventions.md`

**How**:
1. Run `/opsx:propose` (or the PRD generator once built) to generate the three artifacts.
2. Review all three artifacts manually. Fix any gaps.
3. Run `/opsx:apply` task by task.
4. After each task, run the Task Reviewer (manually if the skill isn't built yet — see step 06 for the manual version).
5. After all tasks, run QA manually against the PRD acceptance criteria.
6. Log any bugs and fix them.
7. Run `/opsx:archive` to close the change.

**Covers**: All steps in this learning path.

---

## Recommended order

If you're starting from scratch today:

```
Week 1:
  [x] Items 1-4: Create CLAUDE.md and docs/context/ documents
  [x] Item 5: Update openspec/config.yaml

Week 2:
  [ ] Item 11: Run first full SDD cycle using /opsx:propose (before building the custom skills)
      This gives you concrete experience with what the flow produces
      before you invest in customizing it

Week 3-4:
  [ ] Items 6-7: Build PRD generator and Tech Pack generator
  [ ] Run a second cycle using the new skills, compare output quality to cycle 1

Week 5:
  [ ] Items 8-10: Build Task Reviewer, QA runner, Bug Fix
  [ ] Run a third cycle with the full automated review loop
```

The first full cycle (item 11) should happen before building the custom skills. You'll understand what to customize much better after experiencing the baseline flow end-to-end.
