# Phase 02 — Local Documentation

## Purpose

Convert a raw discovery file into a clean, stable reference document that future agents (and humans) can read without needing to re-research the topic.

## When to use

- After phase 01 Discovery produces a raw notes file
- When you have external docs, API contracts, or integration specs to formalize
- Before opening an OpenSpec change (phase 03 reads these docs)

## Recommended model

**Free / low-cost.** This is structured formatting and gap-filling, not deep reasoning.

## Token risk level

**Low** — reads one discovery file, writes one output doc.

## Required inputs

- `{{DISCOVERY_FILE}}` — the raw discovery file from phase 01 (e.g. `docs/discovery/stripe-webhooks.md`)
- `{{OUTPUT_FILE}}` — the clean output path (e.g. `docs/integrations/stripe-webhooks.md` or `docs/context/{{topic}}.md`)
- `{{UNKNOWN_RESOLUTIONS}}` — any UNKNOWN items from the discovery doc that you can now answer (paste as a list)

## Prompt template

```xml
<prompt>
  <role>
    You are a technical writer. Your job is to produce a clean, reusable reference document from a raw discovery file. Do not implement code. Do not add information not present in the source or in the resolutions provided.
  </role>

  <task>
    Read {{DISCOVERY_FILE}} and produce a clean reference document at {{OUTPUT_FILE}}.
    Apply the UNKNOWN resolutions listed below before writing.
  </task>

  <unknown_resolutions>
    {{UNKNOWN_RESOLUTIONS — paste here, or write "none" if all unknowns remain open}}
  </unknown_resolutions>

  <file_allowlist>
    read:
      - {{DISCOVERY_FILE}}
    write:
      - {{OUTPUT_FILE}}
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - openspec/
  </file_allowlist>

  <output_format>
    Write a Markdown file with these sections:
    - ## Purpose — one paragraph: what this doc is for and when to read it
    - ## Concepts — clean definitions, no raw notes
    - ## Integration Reference — contracts, endpoints, data shapes, constraints
    - ## Known Limitations — rate limits, unsupported features, deprecated paths
    - ## Open Questions — any remaining UNKNOWNs that need human input before planning
    - ## Last Updated — today's date
  </output_format>

  <output_policy>
    - Max 250 lines.
    - Do not print the source file; only the output file.
    - Preserve UNKNOWN markers for any items not resolved.
    - Do not add speculation or assumptions beyond the source.
    - Do not implement code.
  </output_policy>
</prompt>
```

## Anti-patterns to avoid

- Resolving UNKNOWNs by guessing — mark them, don't invent
- Merging multiple discovery files in one session (do one at a time)
- Writing implementation notes or code snippets in what is a reference doc
- Skipping this phase and feeding raw discovery notes to the OpenSpec planner

## Output policy

One clean Markdown file at `{{OUTPUT_FILE}}`. Max 250 lines. Remaining UNKNOWNs preserved. No code.

## Next phase

→ **Phase 03 — OpenSpec Planning**: the planner reads these clean docs to generate proposal, design, and tasks.
