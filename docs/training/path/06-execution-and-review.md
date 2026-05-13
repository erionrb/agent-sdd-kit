# 06 — Execution and Review

This is the phase where specs become code. The key principles: clean context per task, separate agents for review, never skip the review loop.

---

## How `/opsx:apply` works

When you run `/opsx:apply`, the agent:

1. Reads the change's `tasks.md` to find incomplete tasks (unchecked checkboxes).
2. Reads `proposal.md` and `design.md` for context.
3. Implements the next incomplete task:
   - Creates/edits files as specified in the task.
   - Runs tests after implementation.
   - If tests fail, attempts to fix and re-run.
4. Marks the task checkbox as done in `tasks.md`.
5. Moves to the next task.

The agent reads the spec files at the start of each task. It does not rely on memory from previous tasks — it re-reads the spec. This is the correct pattern: stateless execution guided by persistent artifacts.

### Interrupting and resuming

Because task state is tracked in `tasks.md` via checkboxes, you can interrupt mid-session. Clear context, come back later, run `/opsx:apply` again. The agent reads `tasks.md`, sees which tasks are done, and continues from the next incomplete one.

This is different from a session that tracks state in conversation history — that would be lost on clear.

---

## The Task Reviewer pattern

After each task, spawn a Task Reviewer in a separate context window. The reviewer:
1. Reads the task spec (what was expected)
2. Reads the implementation (what was produced)
3. Compares against the PRD acceptance criteria
4. Produces a verdict

**Why a separate context?** The implementation agent has been building. It has the full history of what it did and why. It will rationalize its own choices. The reviewer has no history — it sees only the spec and the output. That's the right perspective for an objective review.

The reviewer runs as a separate agent process with its own context. Simulate this by opening a second Claude Code session or using the Agent tool with a fresh prompt.

### Review verdicts

**Approved**
All acceptance criteria met. No significant issues. Implementation matches the Tech Pack structure.
→ Action: proceed to next task.

**Approved with minors**
Acceptance criteria met, but there are small issues (inconsistent naming, a magic number, missing null check). The feature works but could be cleaner.
→ Action: either fix the minors before the next task, or log them and fix in the Bug Fix phase. The reviewer should specify which minors are blocking vs. optional.

**Rejected**
A requirement is not met, a test is not written, or the implementation diverges significantly from the Tech Pack.
→ Action: do not proceed to the next task. Re-run the current task with the rejection notes as additional context: "Re-implement task 1, addressing the reviewer's notes in `review-task-1.md`."

### What the reviewer checks

- Does the code implement everything in the task's subtask list?
- Do the tests pass and do they cover the acceptance criteria?
- Does the file/folder structure match the Tech Pack's project structure section?
- Are there any obvious security issues (hardcoded secrets, SQL injection, etc.)?
- Are coding conventions followed (from `docs/context/coding-conventions.md` when it exists)?
- Any magic numbers, commented-out code, or inline comments (if conventions forbid them)?

---

## QA Agent with Playwright

After all tasks are complete and reviewed, the QA agent runs end-to-end validation:

1. **Spin up the application**: starts both frontend and backend processes.
2. **Run Playwright e2e tests**: covers the user flows from the PRD's user stories.
3. **Accessibility audit**: runs against WCAG 2.2 rules.
4. **Generates a bug report**: categorizes findings by severity.

### Bug severity levels

| Level | Definition | Example |
|---|---|---|
| Critical | Feature doesn't work at all | 500 error on main route |
| Major | Core user story fails | Token prices fail to refresh after 30 seconds |
| Minor | Feature works but with a defect | Date shows in wrong locale |
| Cosmetic | Visual/UX issue, no functional impact | Browser tab title shows "React App" |

The bug report includes:
- Severity
- Steps to reproduce
- Screenshot (if Playwright captures one)
- Whether it was in the PRD's acceptance criteria

### Running QA for this repo

QA runner skill does not exist yet (it's in the gap list). When it's built, it will live at `.claude/skills/qa-runner/`. For now, you can do manual QA:

1. Start the application.
2. Walk through each user story in `proposal.md`.
3. Check each acceptance criterion manually.
4. Log findings in `openspec/changes/<name>/qa-report.md`.

---

## Bug Fix Agent

After QA produces a bug report, the Bug Fix agent:

1. Reads the bug report.
2. For each cosmetic or minor bug:
   - Fixes the issue.
   - Updates the bug report status to "fixed".
3. For major/critical bugs: flags for human review. These may require re-opening the relevant task.

### What the Bug Fix agent does NOT do

- Does not re-architect. If a major bug reveals a design flaw, you go back to the Tech Pack, not to the Bug Fix agent.
- Does not fix bugs that would require changes outside the current feature's scope.
- Does not touch tests (unless the test itself was wrong).

The Bug Fix agent is a finisher, not a debugger. The spec is already correct — the agent just brings the code into alignment with it.

---

## Practical exercise

1. Run `/opsx:propose` on a small feature (or use one you already generated).
2. Run `/opsx:apply` and watch the first task execute.
3. When the task completes, open a second Claude Code session (or clear and start fresh).
4. Paste the following into the fresh session:
   ```
   Review the implementation of task 1 from `openspec/changes/<name>/tasks.md`.
   Read the task spec and the files it created/modified. 
   Provide a verdict: approved, approved with minors, or rejected.
   List any issues found with their severity.
   ```
5. Compare the reviewer's output to what you would have caught manually.

This gives you a concrete sense of what the Task Reviewer skill will automate.
