# File Allowlist Policy

Every prompt must declare an explicit allowlist of files the model may read and write. If a file is not on the list, the model must not touch it.

## Why

Unrestricted file access leads to:
- Broad repo scans that inflate input tokens
- Accidental overwrites of files outside the current task scope
- Context pollution from irrelevant file contents

## Allowlist format

```xml
<file_allowlist>
  read:
    - CLAUDE.md
    - openspec/config.yaml
    - openspec/changes/{{CHANGE_NAME}}/proposal.md
    - openspec/changes/{{CHANGE_NAME}}/design.md
    - openspec/changes/{{CHANGE_NAME}}/tasks.md
    - {{any other explicitly needed files}}
  write:
    - {{output file path}}
  forbidden:
    - memory/
    - docs/training/path/
    - .claude/skills/
    - .cursor/skills/
</file_allowlist>
```

## Per-phase defaults

| Phase | Typical read list | Typical write target |
|-------|------------------|----------------------|
| Discovery | Source docs explicitly listed by user | `docs/discovery/{{name}}.md` |
| Local Documentation | `docs/discovery/{{name}}.md` | `docs/integrations/{{name}}.md` |
| OpenSpec Planning | `CLAUDE.md`, `openspec/config.yaml`, local context docs | `openspec/changes/{{name}}/proposal.md`, `design.md`, `tasks.md` |
| Task Implementation | `proposal.md`, `design.md`, `tasks.md`, files listed in the task | Files listed in the task only |
| Task Review | `tasks.md`, implemented files listed in the task | `openspec/changes/{{name}}/review-task-N.md` |
| QA | `proposal.md`, `qa-report.md` | `openspec/changes/{{name}}/qa-report.md` |
| Debug | Error output, one or two relevant source files | Existing source file only |
| Summary | Current session context only | `docs/sessions/summary-{{date}}.md` |

## Always forbidden (all phases)

- `memory/` — persistent memory, do not read or write during prompt sessions
- `docs/training/path/` — learning path is read-only reference material
- `.claude/skills/` — skill definitions, never modify during feature work
- `.cursor/skills/` — same
- Any file not explicitly on the read list
