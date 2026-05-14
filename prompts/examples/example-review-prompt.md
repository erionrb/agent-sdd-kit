# Example — Task Review Prompt (Filled In)

This is a filled-in instance of the Phase 05 Task Review skeleton.
**Scenario**: reviewing Task 1 of the Stripe webhook integration in a clean context.

---

**Important**: this prompt is used in a fresh session — `/clear` was run after the implementation session, or a new Claude Code window was opened.

---

```xml
<prompt>
  <role>
    You are a Task Reviewer. You have no knowledge of how the implementation was done. Your job is to compare what was implemented against what was specified, and produce a verdict.
  </role>

  <task>
    Review the implementation of Task 1 from the change "stripe-webhook-integration".

    1. Read the task spec in tasks.md (Task 1 section only).
    2. Read proposal.md (acceptance criteria section only).
    3. Read the implemented files listed below.
    4. Produce a review report at openspec/changes/stripe-webhook-integration/review-task-1.md.
  </task>

  <file_allowlist>
    read:
      - openspec/changes/stripe-webhook-integration/proposal.md
      - openspec/changes/stripe-webhook-integration/tasks.md
      - src/routes/webhooks.ts
      - src/middleware/stripeSignature.ts
      - tests/webhooks.test.ts
    write:
      - openspec/changes/stripe-webhook-integration/review-task-1.md
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - design.md
      - src/payments/
      - src/notifications/
      - Any file not listed above
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
    Write review-task-1.md with:

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
    - Example: "APPROVED WITH MINORS — 0 critical, 0 major, 1 minor, 0 cosmetic. Report at review-task-1.md"
  </output_policy>
</prompt>
```

---

## Expected output

```
APPROVED — 0 critical, 0 major, 0 minor, 0 cosmetic. Report at review-task-1.md
```

or

```
APPROVED WITH MINORS — 0 critical, 0 major, 1 minor, 0 cosmetic. Report at review-task-1.md
```

(The full report, with details on any minors, is in the file — not printed to conversation.)

---

## Notes

- Model: Sonnet
- Estimated tokens: ~1200 input, ~400 output
- This session must be started fresh — no implementation history
- Next step: if APPROVED → `/clear` → Phase 04 for Task 2
