# 07 — Context Documents

Context documents are the persistent knowledge base that all agents read before doing anything. They answer the questions an agent would otherwise spend tokens discovering: what is this project, how is it structured, how should code be written here.

Without these documents, each agent session is an archaeology dig. With them, agents go straight to work.

---

## CLAUDE.md

### What it is

`CLAUDE.md` is the root context document. Claude Code reads it automatically on every session start. It's the first thing agents see.

Location: `/Users/erion/dev/personal/ia/CLAUDE.md` (repo root)

### What goes in it

```markdown
# [Project Name]

## Project Overview
One paragraph: what this project is, what problem it solves, who uses it.

## Tech Stack
- Frontend: [framework, version]
- Backend: [framework, version]
- Database: [type, ORM]
- Testing: [unit, integration, e2e tools]
- Package manager: [npm/yarn/pnpm]

## Folder Structure
[Brief tree of the key directories, one line description each]

## Key Commands
- Install: `npm install`
- Dev: `npm run dev`
- Test: `npm test`
- Build: `npm run build`
- Lint: `npm run lint`

## Conventions
- [Link to docs/context/coding-conventions.md]
- [Link to docs/context/architecture.md]
- [Link to docs/context/thinking-model.md]

## Active Changes
[Optional: list of active openspec changes and their status]
```

### Why it matters

Without `CLAUDE.md`:
- The agent discovers your stack by reading `package.json` (1 tool call)
- Discovers your folder structure by listing directories (2-3 tool calls)
- Discovers your key commands by reading `package.json` again and `README.md` (1-2 more)
- Makes assumptions about conventions based on existing code (potentially wrong)

With `CLAUDE.md`: zero discovery tool calls. The agent reads one file and knows everything.

Multiply this across every session for every developer on the team. The savings add up immediately.

---

## Architecture Document

### What it is

A living document that describes the system's structure and the key decisions behind it.

Location: `docs/context/architecture.md`

### What goes in it

```markdown
# Architecture

## System Overview
High-level description of what the system does and how it's composed.

## Component Diagram
[ASCII or description of major components and how they communicate]

## Key Design Decisions (ADRs)

### ADR-001: [Decision title]
- Date: [YYYY-MM-DD]
- Status: Accepted
- Context: Why was this decision needed?
- Decision: What was decided?
- Consequences: What does this mean going forward?

## Data Flow
[How data moves through the system for key use cases]

## Component Boundaries
[What each major module is responsible for and what it is NOT responsible for]

## External Integrations
[Third-party APIs, services, and how they're connected]
```

### Why component boundaries matter

Without explicit boundaries, the agent will put logic wherever it fits. After 10 tasks, you have business logic in React components, API calls in utility files, and database queries leaking into routes. The architecture document establishes where things belong.

ADRs (Architecture Decision Records) are especially valuable for AI agents: they explain not just what was decided, but why. An agent that understands why a decision was made will not reverse it silently.

---

## Thinking Model

### What it is

A document that describes how to analyze problems, assess the impact of changes, and reason about quality. It shapes the agent's analytical style.

Location: `docs/context/thinking-model.md`

### What goes in it

```markdown
# Thinking Model

## Analyzing a Problem
1. Understand the business requirement before proposing a technical solution.
2. Identify all affected components before writing code.
3. Consider failure modes: what happens if the external API is down? If the DB is slow?

## Assessing Impact
Before modifying a module:
- List all consumers of that module.
- Check if the interface changes would break any callers.
- Check if the behavior changes would break any tests.

## Clean Code Principles
- Functions do one thing.
- A function should be readable without comments explaining it.
- If you need a comment, the function needs a better name.
- No magic numbers — name every constant.
- Small functions: if it's longer than ~20 lines, split it.
- Fail fast: validate inputs at the boundary, not deep in business logic.

## Architecture Principles
- Separate business logic from infrastructure (DB, HTTP, filesystem) concerns.
- Depend on abstractions, not concrete implementations.
- Changes to one module should not require changes to unrelated modules.
```

The Thinking Model turns an agent from a code generator into something closer to an opinionated senior developer. It applies consistent analytical patterns across every session.

---

## Coding Conventions

### What it is

The project's style guide. Explicit rules produce consistent code across all agents and all developers.

Location: `docs/context/coding-conventions.md`

### What goes in it

```markdown
# Coding Conventions

## Naming
- Variables and functions: camelCase
- Types and interfaces: PascalCase
- Files: kebab-case (e.g., `token-service.ts`, not `tokenService.ts`)
- Constants: UPPER_SNAKE_CASE for module-level, camelCase for function-local
- Boolean variables: prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)

## No Magic Numbers
Every literal value that isn't 0 or 1 must be named:
- Bad: `if (items.length > 10)`
- Good: `const MAX_PAGE_SIZE = 10; if (items.length > MAX_PAGE_SIZE)`

## Functions
- Maximum ~20 lines before splitting.
- Single responsibility: one function, one job.
- Name describes what the function does, not how.

## Comments
- No inline comments explaining what the code does.
- JSDoc on public interfaces only.
- If you need a comment to explain the code, the code needs to be rewritten.

## Error Handling
- Validate inputs at the boundary. Don't validate inside business logic.
- Throw specific error types, not generic Error.
- Never swallow errors silently.

## Imports
- Sort: external libraries → internal modules → relative imports
- No wildcard imports.

## Tests
- Test file lives next to the source file: `token.service.ts` → `token.service.test.ts`
- Test name: "should [expected behavior] when [condition]"
- One assertion per test where possible.
```

### Why this makes team consistency possible

Without conventions, two developers using the same AI on the same codebase will produce code in two different styles. Merge conflicts become style debates. Code reviews waste time on formatting rather than logic.

With explicit conventions read by every agent, all generated code follows the same rules. The conventions file is the automated style enforcer that never forgets.

---

## Why all four documents together compound

Each document reduces a class of unnecessary agent behavior:

| Document | Eliminates |
|---|---|
| CLAUDE.md | Stack discovery tool calls, key command questions |
| Architecture doc | Wrong module placement, boundary violations, reversed decisions |
| Thinking model | Inconsistent analysis, missing impact assessment, low-quality code patterns |
| Coding conventions | Style inconsistency, magic numbers, wrong naming, inline comments |

An agent with all four documents produces code that matches your project's patterns without any instruction. An agent without them produces code that matches its training data patterns — which may be fine, or may conflict with your choices.

---

## Practical exercise: Create CLAUDE.md for this repo

This is the highest-leverage action you can take right now. Do it step by step:

1. Open a new Claude Code session in this repo.
2. Run `/clear` to start clean.
3. Ask Claude Code: "Explore this repo and generate a `CLAUDE.md` for it. Include: project overview, tech stack (from `package.json`), folder structure, key commands, and links to `docs/context/` when those files exist."
4. Review the generated `CLAUDE.md`. Fix anything that's wrong or missing.
5. Commit it.

Then create `docs/context/`:

6. Create `docs/context/architecture.md` with the ADR-001 being "Use OpenSpec for SDD artifact management" (document why OpenSpec was chosen and what it means for the project).
7. Create `docs/context/thinking-model.md` with the clean code principles listed above, adapted to your preferences.
8. Create `docs/context/coding-conventions.md` with the conventions from this doc, adjusted to match what you actually want enforced.

Test it: clear your context, then ask Claude Code to "implement a small change" and observe whether it references the context docs. Compare to a session without them.
