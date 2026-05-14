# Phase 08 — Summary Before Clear

## Purpose

Capture the current session state in a compact Markdown file before running `/clear`. The summary becomes the compressed context input for the next session.

## When to use

- Before every `/clear`
- At the end of a planning, implementation, review, or debug session
- When a session is getting long and context is becoming expensive to maintain
- Before handing off work to a different model or tool

## Recommended model

**Free / low-cost.** Summarization is mechanical. This is the one place where using Sonnet is wasteful — you are about to clear the context anyway.

## Token risk level

**Minimal.** Reads only the current session context. Output is capped at 10 bullets.

## Required inputs

No file reads needed. The model summarizes the current conversation context.

## Prompt template

```xml
<prompt>
  <role>
    You are a session recorder. Produce a compact, factual summary of this session. Be precise about state. Do not editorialize.
  </role>

  <task>
    Write a summary file at {{OUTPUT_FILE}} (e.g. docs/sessions/summary-{{DATE}}.md or openspec/changes/{{CHANGE_NAME}}/session-summary.md).

    The summary must allow the next session — with no conversation history — to pick up exactly where this one ended.
  </task>

  <output_format>
    ## Session Summary — {{DATE}}

    **Change**: {{CHANGE_NAME or "N/A"}}
    **Phase completed**: {{PHASE — e.g. "Task 2 Implementation"}}
    **Status**: {{one-line status}}

    ## What happened (max 10 bullets)
    - ...

    ## Files changed
    - {{file}}: {{one-line description of change}}

    ## Tests run
    - Command: {{test command}}
    - Result: {{pass/fail summary}}

    ## Blockers
    - {{any open issues, failing tests, UNKNOWNs, or decisions deferred}}
    - "none" if clean

    ## Next action
    {{single next step — one sentence, specific enough to start the next session without this summary}}
  </output_format>

  <output_policy>
    - Max 10 bullets in the "What happened" section. No exceptions.
    - No prose paragraphs. Bullets and tables only.
    - Do not print contents of changed files.
    - Do not re-explain what SDD is or summarize the methodology.
    - Write the file and print only the "Next action" line to the conversation.
  </output_policy>
</prompt>
```

## Checklist before /clear

Run through this mentally before clearing:

- [ ] Summary file written
- [ ] `tasks.md` checkbox updated (if this was an implementation session)
- [ ] Any review or QA report saved
- [ ] Blocker documented if session ended without completing the phase
- [ ] "Next action" is specific enough to start the next session cold

> **Note:** This phase does NOT replace `/openspec-archive-change`. Summary captures session state for the next context window. Archive closes the change in OpenSpec and should only run after implementation, review, QA, and summary are all complete.

## Anti-patterns to avoid

- Running `/clear` without writing a summary (next session starts from scratch)
- Writing a summary longer than 10 bullets (defeats the purpose)
- Putting the summary in memory instead of a file (memory is not session-specific)
- Using Sonnet for this — use the cheapest model or write it yourself

## Output policy

Summary file written. One line printed: "Next action: {{next action text}}". Nothing else.

## Next phase

After `/clear`:
- Next task → **Phase 04 — Task Implementation** (read summary + spec files)
- Next review → **Phase 05 — Task Review** (read summary + spec + diff)
- Done → **`/openspec-archive-change`** to close the change
