# Phase 03 — OpenSpec Planning

## Purpose

Generate the three OpenSpec artifacts — `proposal.md`, `design.md`, `tasks.md` — for a new change, grounded in local documentation and project context.

## Preferred command

**Use `/openspec-propose` instead of this template when it is available.** It generates all three artifacts interactively and registers the change in OpenSpec automatically. Use this manual template only when you need explicit control over artifact content or `openspec-propose` is unavailable.

If requirements are still unclear before proposing, run **`/openspec-explore`** first using your discovery and local-doc output as source material.

## When to use

- After local docs are in place (phase 02 done, no open UNKNOWNs)
- Before any implementation begins
- When starting a new feature, integration, or refactor

## Recommended model

**Sonnet.** Planning requires coherent multi-step reasoning and artifact quality directly determines implementation quality. Do not use a free model for this phase.

## Token risk level

**Medium.** Reads 3–5 files; writes 3 artifact files. Risk is low if the allowlist is respected. Risk becomes High if the model reads unnecessary files or generates verbose artifacts.

## Required inputs

- `{{CHANGE_NAME}}` — kebab-case name for the change (e.g. `stripe-webhook-integration`)
- `{{FEATURE_DESCRIPTION}}` — 2–5 sentence plain-English description of what to build and why
- `{{CONTEXT_DOCS}}` — list of local docs to read (from `docs/` — never raw discovery files)
- `{{CONSTRAINTS}}` — explicit constraints (max task size, tech stack restrictions, out-of-scope items)

## Pre-conditions

```bash
# Scaffold the change directory before running the prompt
openspec new change {{CHANGE_NAME}}
# Verify
openspec status --change {{CHANGE_NAME}}
```

## Prompt template

```xml
<prompt>
  <role>
    You are a senior software architect applying Spec Driven Development. Your job is to generate three OpenSpec artifacts for the change described below. Do not implement code. Do not modify files outside the write allowlist.
  </role>

  <task>
    Generate proposal.md, design.md, and tasks.md for the change "{{CHANGE_NAME}}".

    Feature description:
    {{FEATURE_DESCRIPTION}}
  </task>

  <constraints>
    {{CONSTRAINTS}}
    - Each task must be completable in one focused session (≤ 2 hours of work).
    - Each task must name specific files to create or modify.
    - Each task must include at least one test or acceptance criterion.
    - proposal.md must include an explicit out-of-scope list.
    - design.md must not re-state business requirements from proposal.md.
    - tasks.md must have numbered, sequential tasks with checkbox format.
  </constraints>

  <file_allowlist>
    read:
      - CLAUDE.md
      - openspec/config.yaml
      - {{CONTEXT_DOCS — list each doc explicitly}}
    write:
      - openspec/changes/{{CHANGE_NAME}}/proposal.md
      - openspec/changes/{{CHANGE_NAME}}/design.md
      - openspec/changes/{{CHANGE_NAME}}/tasks.md
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
    - Confirm completion with: "Done. Three artifacts written to openspec/changes/{{CHANGE_NAME}}/."
    - Do not add implementation code to any artifact.
    - Do not scan the filesystem beyond the allowlist.
  </output_policy>

  <model_policy>
    Use Sonnet for this phase. Do not delegate sub-tasks to free models during planning.
  </model_policy>
</prompt>
```

## Anti-patterns to avoid

- Starting planning before resolving all UNKNOWN items in the context docs
- Asking the model to also implement task 1 "since we're already here"
- Letting the model read source files outside the context docs (no peeking at implementation)
- Generating tasks that span more than one session of work

## Output policy

Three files written silently. Confirmation message only. No artifact content printed to conversation.

## Next phase

→ **Phase 04 — Task Implementation**: run `/openspec-apply-change` or use the task implementation skeleton for one task.
