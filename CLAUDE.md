# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a **Spec Driven Development (SDD) framework workspace** — a personal environment for practicing and extending AI-driven development using the SDD methodology. It is not a product codebase; it's the tooling and documentation layer that sits on top of projects.

## Workflow

All development in this repo follows the SDD cycle via OpenSpec CLI (v1.3.1):

```
Idea → proposal.md (what/why) → specs.md → design.md (how) → tasks.md (steps) → implement → review → QA
```

### Key commands

```bash
# Start a new change (interactive — generates all artifacts)
/opsx:propose

# Implement tasks from an existing change
/opsx:apply

# Explore / think through a problem before proposing
/opsx:explore

# Archive a completed change into main specs
/opsx:archive

# CLI equivalents
openspec new change <name>         # scaffold a new change
openspec status --change <name>    # check artifact completion
openspec list                      # list all active changes
openspec instructions apply --change <name> --json  # get implementation instructions
```

Changes live in `openspec/changes/<name>/` with `.openspec.yaml` and artifact files (`proposal.md`, `specs.md`, `design.md`, `tasks.md`).

The active schema is **spec-driven**: `proposal → specs → design → tasks`. Config is at `openspec/config.yaml`.

## Structure

```
.claude/skills/         OpenSpec skills for Claude Code (opsx:propose, apply, explore, archive)
.cursor/skills/         Same skills mirrored for Cursor
docs/training/path/     8-step SDD learning path (start at README.md)
openspec/               OpenSpec project root (config + future changes/)
memory/                 Persistent memory for Claude Code sessions
```

## What's missing (build these next)

The framework is partially set up. The `docs/training/path/08-whats-next.md` file has the full action checklist. Short version:

1. `docs/context/architecture.md` — system/stack overview agents read before coding
2. `docs/context/thinking-model.md` — how to analyze problems and assess change impact
3. `docs/context/coding-conventions.md` — naming, structure, style rules
4. PRD generator skill (interactive, asks clarifying questions)
5. Tech Pack generator skill (uses Context7 MCP for library docs)
6. Task Reviewer skill (spawned as a sub-agent after each task)
7. QA runner skill (Playwright e2e + accessibility)
8. Bug Fix skill (reads QA bug report, applies fixes)

## OpenSpec config

`openspec/config.yaml` is empty — fill in project context and per-artifact rules before generating artifacts for any real feature. See the file for the format.

## Learning path

`docs/training/path/README.md` is the entry point. If you're already familiar with how LLMs work, start at step 04 (SDD framework). Step 07 covers creating the missing context docs above.
