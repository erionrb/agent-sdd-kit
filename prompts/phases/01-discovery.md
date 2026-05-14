# Phase 01 — Discovery

## Purpose

Research a topic, integration, or system to understand what is known, what is unknown, and what needs to be documented before any planning begins.

## When to use

- Before writing any OpenSpec artifact
- When integrating an external API or library you haven't used in this project
- When exploring an unfamiliar domain, service, or codebase section

## Recommended model

**Free / low-cost** (Gemini Flash, DeepSeek, Haiku, or similar). Discovery is high-volume, low-stakes summarization. Save Sonnet credits for planning and implementation.

## Token risk level

**Low** — if the allowlist is respected. Risk becomes High if the model scans the repo freely.

## Required inputs

- `{{TOPIC}}` — what you are discovering (API name, feature area, integration, etc.)
- `{{SOURCE_LIST}}` — explicit list of URLs, files, or docs to read (no open-ended searching)
- `{{OUTPUT_FILE}}` — where to write the discovery output (e.g. `docs/discovery/stripe-webhooks.md`)

## Prompt template

```xml
<prompt>
  <role>
    You are a senior technical researcher. Your job is to produce a structured discovery document, not to implement anything.
  </role>

  <task>
    Research {{TOPIC}} and produce a discovery document at {{OUTPUT_FILE}}.
  </task>

  <file_allowlist>
    read:
      - {{SOURCE_LIST — list each file or URL explicitly}}
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
    - ## Overview — 3–5 sentences on what this is and why it matters
    - ## Key Concepts — bullet list of terms/concepts with one-line definitions
    - ## Integration Points — what this connects to in our system
    - ## Constraints & Gotchas — limits, rate limits, quirks, deprecated APIs
    - ## Unknowns — explicitly list everything that needs human clarification, marked UNKNOWN
    - ## Sources — list every source read
  </output_format>

  <output_policy>
    - Max 300 lines for the discovery document.
    - Do not print full source files; summarize only.
    - Do not scan directories not listed above.
    - Do not implement any code.
    - Do not create files other than {{OUTPUT_FILE}}.
    - Mark any information you are uncertain about as UNKNOWN.
  </output_policy>

  <budget_policy>
    This is a discovery session. Use the cheapest model that can read and summarize.
    Do not perform open-ended web searches beyond the listed sources.
  </budget_policy>
</prompt>
```

## Anti-patterns to avoid

- Letting the model scan `openspec/`, `memory/`, or `.claude/skills/` for "context"
- Asking for implementation ideas during discovery (that belongs in phase 03)
- Using Sonnet or Opus for this phase
- Listing "the whole repo" as a source — always be explicit

## Output policy

Single Markdown file at `{{OUTPUT_FILE}}`. Max 300 lines. No code implementation. UNKNOWN markers for gaps.

## Next phase

→ **Phase 02 — Local Documentation**: convert the discovery file into a clean, reusable doc under `docs/`.
