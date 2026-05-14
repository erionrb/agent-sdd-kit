# Phase 05 — Task Review

## Purpose

Review the implementation of one task against its spec. Produce a structured verdict. Run in a clean context — no implementation history.

## When to use

- After each task implementation (phase 04), in a fresh session
- Always before moving to the next task
- After a rejection + re-implementation cycle

## Recommended model

**Sonnet.** The reviewer needs to read spec and diff analytically and produce a structured verdict. Analytical, bounded, low output volume.

## Token risk level

**Low.** Reads spec files + implemented files only. Output is a short verdict report.

## Required inputs

- `{{CHANGE_NAME}}` — the change directory name
- `{{TASK_NUMBER}}` — which task was implemented
- `{{IMPLEMENTED_FILES}}` — files that were created or modified (copy from task's file list)

## Critical: clean context

Do not paste this into the same session that ran the implementation. Open a new Claude Code window, a new Cursor chat, or run `/clear` before using this prompt. The reviewer must not have access to the implementation agent's reasoning.

## Prompt template

```xml
<prompt>
  <role>
    You are a Task Reviewer. You have no knowledge of how the implementation was done. Your job is to compare what was implemented against what was specified, and produce a verdict.
  </role>

  <task>
    Review the implementation of Task {{TASK_NUMBER}} from the change "{{CHANGE_NAME}}".

    1. Read the task spec in tasks.md (Task {{TASK_NUMBER}} section only).
    2. Read proposal.md (acceptance criteria section only).
    3. Read the implemented files listed below.
    4. Produce a review report at openspec/changes/{{CHANGE_NAME}}/review-task-{{TASK_NUMBER}}.md.
  </task>

  <file_allowlist>
    read:
      - openspec/changes/{{CHANGE_NAME}}/proposal.md
      - openspec/changes/{{CHANGE_NAME}}/tasks.md
      - {{IMPLEMENTED_FILES — list each file}}
    write:
      - openspec/changes/{{CHANGE_NAME}}/review-task-{{TASK_NUMBER}}.md
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - design.md (not needed for review)
      - Any file not implemented in this task
  </file_allowlist>

  <review_checklist>
    Check each of the following. Mark as PASS, FAIL, or N/A:
    1. All sub-steps in the task are implemented
    2. Tests listed in the task are present and passing
    3. "Done when" acceptance criterion is satisfied
    4. No files outside the task's file list were modified
    5. No obvious security issues (hardcoded secrets, injection vectors)
    6. No unrelated refactoring or feature additions
  </review_checklist>

  <verdict_format>
    Write review-task-{{TASK_NUMBER}}.md with:

    ## Verdict
    [APPROVED | APPROVED WITH MINORS | REJECTED]

    ## Checklist Results
    | Check | Result | Notes |
    |-------|--------|-------|
    ...

    ## Issues Found
    | Severity | Description | File | Line |
    |----------|-------------|------|------|
    (critical / major / minor / cosmetic)

    ## Recommended Action
    [Next task / Fix minors then next task / Re-implement with notes below]

    ## Re-implementation Notes (if REJECTED)
    ...
  </verdict_format>

  <output_policy>
    - Write the review file. Do not print it in full to the conversation.
    - Print only: verdict line + count of issues by severity.
    - Example: "APPROVED WITH MINORS — 0 critical, 0 major, 2 minor, 1 cosmetic. Report at review-task-{{TASK_NUMBER}}.md"
  </output_policy>
</prompt>
```

## Verdict guide

| Verdict | Meaning | Action |
|---------|---------|--------|
| APPROVED | All criteria met, no significant issues | Proceed to next task |
| APPROVED WITH MINORS | Criteria met; small issues present | Fix minors or log for Bug Fix phase, then proceed |
| REJECTED | A requirement is unmet or tests missing | Re-run phase 04 with rejection notes as added context |

## Anti-patterns to avoid

- Running the review in the same session as implementation (biased reviewer)
- Approving a task without checking that tests actually pass
- Using the reviewer to redesign the task (that's a spec change, not a review)
- Writing long prose instead of the structured verdict format

## Output policy

Review file written silently. One-line verdict summary printed. Nothing else.

## Next phase

If APPROVED or APPROVED WITH MINORS → **Phase 04** for the next task.
If last task approved → **Phase 06 — QA**.
If REJECTED → **Phase 04** again with rejection notes.
