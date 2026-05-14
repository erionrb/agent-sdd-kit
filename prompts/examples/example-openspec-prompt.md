# Example — OpenSpec Planning Prompt (Filled In)

This is a filled-in instance of the Phase 03 OpenSpec Planning skeleton.
**Scenario**: planning a Stripe webhook integration after discovery docs are ready.

---

```xml
<prompt>
  <role>
    You are a senior software architect applying Spec Driven Development. Your job is to generate three OpenSpec artifacts for the change described below. Do not implement code. Do not modify files outside the write allowlist.
  </role>

  <task>
    Generate proposal.md, design.md, and tasks.md for the change "stripe-webhook-integration".

    Feature description:
    We need to receive and process Stripe webhook events for payment lifecycle management.
    Specifically: handle payment_intent.succeeded, payment_intent.payment_failed, and
    customer.subscription.deleted events. Each event triggers an internal state update
    and a notification to the relevant user. Stripe signature verification is required
    on all incoming webhooks.
  </task>

  <constraints>
    - Each task must be completable in one focused session (≤ 2 hours of work).
    - Each task must name specific files to create or modify.
    - Each task must include at least one test or acceptance criterion.
    - proposal.md must include an explicit out-of-scope list.
    - design.md must not re-state business requirements from proposal.md.
    - tasks.md must have numbered, sequential tasks with checkbox format.
    - Out of scope: Stripe Checkout, refund handling, invoice events.
    - Tech stack: TypeScript, Node.js, Express, Jest.
  </constraints>

  <file_allowlist>
    read:
      - CLAUDE.md
      - openspec/config.yaml
      - docs/integrations/stripe-webhooks.md
    write:
      - openspec/changes/stripe-webhook-integration/proposal.md
      - openspec/changes/stripe-webhook-integration/design.md
      - openspec/changes/stripe-webhook-integration/tasks.md
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - Any source file (no implementation)
  </file_allowlist>

  <artifact_format>
    proposal.md:
      - ## Problem — what and why
      - ## Goals — numbered list
      - ## Non-Goals — explicit out-of-scope list
      - ## User Stories — "As a [role], I want [action], so that [outcome]"
      - ## Acceptance Criteria — numbered, testable

    design.md:
      - ## Architecture — component/module breakdown
      - ## Data Flow — how data moves through the system
      - ## Tech Decisions — libraries, APIs, patterns chosen and why
      - ## File Structure — exact paths to create or modify
      - ## Testing Approach — what to test and how

    tasks.md:
      - Numbered tasks, each with:
        - [ ] Task N: {{title}}
        - Files: list of files to create/modify
        - Steps: numbered sub-steps
        - Tests: what tests to write/run
        - Done when: acceptance criterion
  </artifact_format>

  <output_policy>
    - Write the three files. Do not print them to the conversation.
    - Confirm completion with: "Done. Three artifacts written to openspec/changes/stripe-webhook-integration/."
    - Do not add implementation code to any artifact.
    - Do not scan the filesystem beyond the allowlist.
  </output_policy>

  <model_policy>
    Use Sonnet for this phase. Do not delegate sub-tasks to free models during planning.
  </model_policy>
</prompt>
```

---

## Expected confirmation

```
Done. Three artifacts written to openspec/changes/stripe-webhook-integration/.
```

---

## Notes

- Model: Sonnet
- Estimated tokens: ~2000 input, ~3000 output (three artifact files)
- Pre-condition: `openspec new change stripe-webhook-integration` run before this prompt
- Next step: human reviews the three artifacts, then runs Phase 04 for Task 1
