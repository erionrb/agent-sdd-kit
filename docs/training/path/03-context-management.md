# 03 — Context Management

Context management is where developers lose most of their token budget and degrade output quality without realizing it. This covers the strategies to stay efficient across a full development session.

---

## Why context accumulates and why it hurts

Every message, tool call, and tool result gets appended to the context window. You cannot remove items from the middle. The context only grows.

The cost model is:
- `input tokens = all previous messages + tool schemas + current message`
- Every new tool call adds its input and result to that running total

A typical SDD session without context hygiene:

```
Start: 2% used
After PRD generation: 15% used
After Tech Pack generation: 35% used
After task generation: 55% used
After task 1 execution: 75% used — quality starts degrading
After task 2 execution: 90% used — compaction kicks in, output quality drops
```

With context hygiene (clearing between phases):

```
PRD generation session: peaks at 15%, cleared
Tech Pack generation session: peaks at 25%, cleared
Task generation session: peaks at 20%, cleared
Task 1 execution: starts at 0%, peaks at 30%
Task 2 execution: starts at 0%, peaks at 30%
```

You get better outputs at lower cost. Each phase starts with a clean slate.

---

## The SDD phase boundary rule

**Clear context between phases. Pass artifacts by reference, not by re-generating.**

When you finish generating the PRD and start the Tech Pack:
1. `/clear` to reset the context
2. Reference the PRD by file path in your new prompt

```
Generate the Tech Pack for the feature in `openspec/changes/my-feature/proposal.md`.
Use /opsx:apply to begin.
```

The LLM reads the file directly. It does not need to re-process the conversation history of the PRD generation session. You save all those tokens.

After generating the PRD, run `/clear` and reference the PRD file path when prompting for the Tech Pack.

---

## Skills as demand-loaded context

Skills (like the OpenSpec skills in `.claude/skills/`) are loaded into the context only when you invoke them. They are not resident in every request.

This means:
- Do not invoke a skill unless you're in the relevant phase.
- When you're done with a phase, clear context before starting the next.

The `openspec-propose` skill loads when you run `/opsx:propose`. After it creates the artifacts, you don't need it anymore. Clearing context unloads it.

If you run `/opsx:explore`, `/opsx:propose`, and `/opsx:apply` in the same context window, you're paying for all three skill definitions on every request.

---

## MCPs: load only what you need

When an MCP is enabled, all of its tool definitions are sent with every request — even if you never use those tools. The Supabase MCP, for example, might add 40+ tool definitions.

Strategy:
- Keep only the MCPs enabled that are relevant to your current task.
- During PRD and Tech Pack generation: you might want Context7 (for library docs) and web search.
- During execution: you might only need file system and bash.
- During QA: you need Playwright.

Rotate MCPs in and out by task. In Claude Code: `/mcp` shows your enabled MCPs. Disable what you don't need.

MCPs are powerful but load all their tool definitions on every request — treat them as expensive dependencies.

---

## Passing artifacts between phases

The correct pattern for multi-phase SDD:

```
Phase 1: PRD
  - Invoke /opsx:propose (or PRD generator skill)
  - Answer clarifying questions
  - Artifact written to: openspec/changes/<name>/proposal.md
  - /clear

Phase 2: Tech Pack / Design
  - New session: "Generate design for the change in openspec/changes/<name>/proposal.md"
  - LLM reads the file — no history needed
  - Artifact written to: openspec/changes/<name>/design.md
  - /clear

Phase 3: Tasks
  - New session: "Generate tasks for openspec/changes/<name>/, reading proposal.md and design.md"
  - LLM reads both files
  - Artifact written to: openspec/changes/<name>/tasks.md
  - /clear

Phase 4: Execution (one task at a time)
  - New session per task: "Implement task 1 from openspec/changes/<name>/tasks.md"
  - LLM reads tasks.md, proposal.md, design.md at the start
  - /clear after each task completes
```

Each session is clean. Each session reads the artifacts it needs. No history cruft.

---

## Multi-agent parallelism for review

The Task Reviewer pattern: after implementing a task, spawn a separate agent (separate context window) to review it. This means:

1. Implementation agent finishes task 1 — context is at 35%
2. Review agent is spawned with clean context (0%)
3. Review agent reads: the task spec + the diff/code
4. Review agent produces a verdict

The reviewer starts clean. It has no bias from watching the implementation happen. It sees only the spec and the result, which is the right perspective for a reviewer.

Each reviewer runs as a separate process with its own context. They can run in parallel with the implementation agent.

---

## Context budget: the 60% rule

Use `/status` in Claude Code to monitor context usage. When you hit 60%, either:

1. **Complete the current atomic task** and then `/clear` before the next one.
2. **Summarize the current state** into an artifact and start fresh.

Do not push past 80%. Past that point, the model starts losing track of earlier context. Past 90%, the client will trigger automatic compaction, which is lossy.

### Model choice by phase

- **Complex reasoning tasks** (PRD generation, Tech Pack): use Opus or the best available model. High-quality output here matters because all downstream artifacts depend on it.
- **Execution tasks** (implementing code from a well-specified task file): use Sonnet. The spec is already solid; you need speed and token efficiency, not deep reasoning.

The spec files carry the intelligence. The execution agent just needs to follow them.

---

## Practical exercise

1. Open Claude Code in this repo.
2. Run `/status` — record your baseline context %.
3. Run `/opsx:propose` and describe a small feature.
4. After the artifacts are created, run `/status` again. Record the %.
5. Run `/clear`.
6. Run `/status` — you should be back near baseline.
7. In a new message, reference the proposal.md by path and ask a question about it.
8. Run `/status` — compare this cost to what it would have been if you hadn't cleared.

The numbers make the concept concrete.
