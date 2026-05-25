# Phase 04 — Task Implementation

## Purpose

Implement exactly one task from the change's `tasks.md`, guided by `proposal.md` and `design.md`. Make the smallest working change. Run the relevant tests. Mark the task done.

## Preferred command

**Use `/openspec-apply-change` instead of this template when it is available.** It reads the next incomplete task automatically and enforces file allowlist and output policies. Use this manual template only when you need explicit control over task selection or the command is unavailable.

## When to use

- After OpenSpec artifacts exist and have been reviewed by a human
- Once per session — one task, then `/clear`
- After a Task Review verdict of "rejected" with notes (re-implement that same task)

## Recommended model

**Sonnet.** Implementation requires spec fidelity and code quality. Do not use a free model.

## Token risk level

**Medium.** Reads 3 spec files + task-specific source files. Writing is bounded by the task's file list. Risk becomes High if the model reads files not on the task's list.

## Required inputs

- `{{CHANGE_NAME}}` — the change directory name
- `{{TASK_NUMBER}}` — which task to implement (e.g. `1`)
- `{{TASK_FILE_LIST}}` — files listed in the task (from `tasks.md`) — copy them here explicitly
- `{{TEST_COMMAND}}` — the test command to run after implementation (e.g. `npm test`, `pytest tests/unit/`)

## Pre-conditions

```bash
# Confirm the task is not already done
grep -A 5 "Task {{TASK_NUMBER}}:" openspec/changes/{{CHANGE_NAME}}/tasks.md
```

## Prompt template

```xml
<prompt>
  <role>
    You are a senior software engineer applying Spec Driven Development. Implement only the task specified. Make the smallest working change. Do not refactor, do not add features, do not touch files outside the allowlist.
  </role>

  <task>
    Implement Task {{TASK_NUMBER}} from openspec/changes/{{CHANGE_NAME}}/tasks.md.

    Read the task spec carefully. Implement it exactly as described. Run {{TEST_COMMAND}} after implementation. Mark the task checkbox as done in tasks.md.
  </task>

  <file_allowlist>
    read:
      - openspec/changes/{{CHANGE_NAME}}/proposal.md
      - openspec/changes/{{CHANGE_NAME}}/design.md
      - openspec/changes/{{CHANGE_NAME}}/tasks.md
      - {{TASK_FILE_LIST — paste all files listed in the task}}
    write:
      - {{TASK_FILE_LIST — same list; only these may be created or modified}}
      - openspec/changes/{{CHANGE_NAME}}/tasks.md  (checkbox only)
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - Any file not in the task's file list
  </file_allowlist>

  <implementation_rules>
    - Implement the task's sub-steps in order.
    - Make the smallest change that satisfies the "Done when" criterion.
    - Do not refactor unrelated code.
    - Do not add features not in the task.
    - Write tests as specified in the task's "Tests" section.
    - Run {{TEST_COMMAND}} and confirm it passes before marking done.
    - If a test fails, fix it before proceeding.
  </implementation_rules>

  <output_policy>
    - Do not print full diffs unless explicitly requested. Show only changed lines.
    - Print only failing test output. If tests pass, print: command + pass summary (e.g. "npm test — 12 passed").
    - Final response must be under 120 words.
    - Confirm with: "Task {{TASK_NUMBER}} complete. Tests: [pass/fail summary]. Checkbox marked done."
    - Do not summarize what you did beyond the confirmation line.
  </output_policy>

  <budget_policy>
    One task per session. After this task completes, do not start Task {{TASK_NUMBER + 1}}.
    Run /clear after this session and open a fresh context for the next task.
  </budget_policy>
</prompt>
```

## Anti-patterns to avoid

- Chaining multiple tasks in one session ("since task 1 is done, let me do task 2")
- Reading files not listed in the task (spec drift)
- Refactoring surrounding code "while you're there"
- Skipping the test run and just marking the task done
- Printing full modified files instead of diffs

## Output policy

Changed lines only (no full diffs). Failing test output only (pass = command + summary). Final response under 120 words. One-line confirmation. No summaries.

## Next phase

→ **Phase 05 — Task Review**: open a clean session and review the implementation against the spec.
