# Phase 07 — Debug (Compressed Context)

## Purpose

Diagnose and fix a specific error using a minimal, structured context. Avoid dumping logs or full files. Include only what is necessary to reproduce the problem.

## When to use

- A test is failing and the cause is not obvious from the diff
- A runtime error occurs after implementation
- A QA bug report contains a critical/major that needs root-cause analysis
- Sonnet's first implementation attempt produced a broken result

## Recommended model

**Sonnet** for first attempt. Escalate to **Opus** only if Sonnet fails twice on the same error with structured input.

## Token risk level

**Low** — if context is compressed. Risk becomes Very High if raw logs or full files are dumped without filtering.

## Required inputs

- `{{ERROR_MESSAGE}}` — the exact error, trimmed to relevant lines only (not the full log)
- `{{EXPECTED_BEHAVIOR}}` — one sentence: what should happen
- `{{ACTUAL_BEHAVIOR}}` — one sentence: what is actually happening
- `{{RELEVANT_FILES}}` — 1–3 files most likely involved (not the whole repo)
- `{{LAST_CHANGE}}` — what changed right before this error appeared (commit, file, function)

## Prompt template

```xml
<prompt>
  <role>
    You are a senior engineer debugging a specific, isolated error. You have compressed context. Work only with what is provided. Do not read additional files unless you explicitly explain why and ask first.
  </role>

  <error>
    {{ERROR_MESSAGE — paste only the relevant lines, not the full stack trace}}
  </error>

  <context>
    Expected: {{EXPECTED_BEHAVIOR}}
    Actual: {{ACTUAL_BEHAVIOR}}
    Last change: {{LAST_CHANGE}}
  </context>

  <file_allowlist>
    read:
      - {{RELEVANT_FILES — 1–3 files maximum}}
    write:
      - {{RELEVANT_FILES — same files; fix in place}}
    forbidden:
      - memory/
      - docs/training/path/
      - .claude/skills/
      - Any file not listed above
  </file_allowlist>

  <debug_process>
    1. State your hypothesis about the root cause in one sentence.
    2. Show the specific lines you believe are the problem.
    3. Propose the minimal fix.
    4. Ask for confirmation before applying if the fix touches more than 5 lines.
    5. Apply the fix.
    6. State what test command verifies the fix.
  </debug_process>

  <output_policy>
    - Do not print full files. Show only the specific lines relevant to the error.
    - State hypothesis before showing any code.
    - If you need a file not on the allowlist, say which one and why — do not read it without acknowledgement.
    - Max output: hypothesis + relevant lines + fix diff + test command.
  </output_policy>

  <escalation>
    If this is a second attempt after a previous Sonnet debug session failed:
    - Summarize what was tried and why it failed (1–3 bullets).
    - Escalate to Opus with this same structured prompt.
    - Do not start a free-form debugging session.
  </escalation>
</prompt>
```

## How to compress context before debugging

Before pasting into the prompt:

1. Extract only the error message (not the full log)
2. Identify the 1–3 files most likely involved
3. Write a one-sentence description of expected vs. actual behavior
4. Note what changed last (commit hash or function name)

Do not paste 200 lines of log. Do not say "here's the full output, find the problem." Structured input produces structured diagnosis.

## Anti-patterns to avoid

- Dumping the full test output and asking the model to "find the error"
- Opening the debug session before writing down expected vs. actual behavior
- Reading 10+ files "for context" before forming a hypothesis
- Using Opus as the first attempt
- Running debug in the same session as implementation (biased reasoning)

## Output policy

Hypothesis sentence. Relevant lines only. Fix diff. Test command. Nothing else.

## Next phase

If fixed → re-run `{{TEST_COMMAND}}` → back to **Phase 05 — Task Review** or **Phase 06 — QA**.
If not fixed after two Sonnet attempts → escalate to Opus with this same structured prompt.
