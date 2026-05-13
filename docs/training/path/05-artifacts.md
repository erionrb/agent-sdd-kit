# 05 — The Three Artifacts

Every SDD cycle produces three artifacts. Each one has a specific job, a defined structure, and a clear failure mode. This covers what goes in each one and what makes them good or bad.

---

## PRD — Product Requirements Document

### Job
Describes **what** to build and **why**. Nothing else.

The PRD is the business layer. It is written before any technical decisions are made. If you find yourself writing "we'll use React" or "the backend will expose a REST endpoint" in the PRD, you've crossed into Tech Pack territory. Stop.

This boundary is important because:
- The PRD can be written by a PO, business analyst, or developer with product context.
- The Tech Pack is written by a developer with technical context.
- Mixing them conflates two separate reasoning tasks and degrades both.

### Sections

```markdown
# PRD: [Feature Name]

## Context
Background. What problem exists today? Why does it matter now?

## Objectives
What we want to achieve. Measurable outcomes where possible.

## Scope
What is in scope. What is explicitly out of scope.

## User Stories
- As [user type], I want [action], so that [outcome].

## Functional Requirements
Numbered list. What the system must do from the user's perspective.

## Non-Functional Requirements
Performance, accessibility, security, i18n, browser support, etc.

## Acceptance Criteria
Specific, testable conditions. This is what the Task Reviewer checks against.

## Success Metrics
How will we know the feature is successful? (e.g., error rate < 1%, page load < 2s)

## Risks
What could go wrong? Dependencies on external systems, unclear requirements, etc.
```

### What makes a bad PRD

- Mentions frameworks, libraries, databases, or architecture patterns.
- "The frontend will have a React component that..." — that's a Tech Pack sentence.
- Acceptance criteria that aren't testable ("it should be fast" vs "it should render in < 500ms").
- Missing scope — no out-of-scope list means the agent will fill gaps with its own assumptions.
- No user stories — the AI doesn't know who it's building for.

### Hands-on

Run `/opsx:propose` and describe a feature for this repo. When the `proposal.md` is generated:
- Check every paragraph: is this business language or technical language?
- Find one sentence that belongs in the Tech Pack and remove it.
- Check the acceptance criteria: can you write a Playwright test for each one?

---

## Tech Pack / Design

### Job
Describes **how** to implement the PRD. The developer's translation of business requirements into technical decisions.

### Sections

```markdown
# Tech Pack: [Feature Name]

## References
- PRD: [link to proposal.md]

## Executive Summary
2-3 sentence technical overview. What are the main architectural decisions?

## Tech Stack Decisions
Why these libraries? What alternatives were considered?
Be explicit: "Using Node Cache over Redis because the free tier has no Redis. 
Acceptable for < 100 req/day API quota."

## Project Structure
New files and folders this feature will add. Show the tree.

## Component Overview
What are the main pieces? How do they relate?
- Backend: routes, services, controllers
- Frontend: pages, components, hooks

## Data Flows
How does data move through the system for each key user action?
Use simple diagrams if helpful.

## Integration Points
External APIs, third-party services, other internal services.
Paste the relevant contracts here.

## Testing Approach
Unit tests: what to test, what framework.
Integration tests: which endpoints, what tool.
E2E tests: which user flows, Playwright or other.
```

### What makes a bad Tech Pack

- No reference to the PRD — you can't verify it covers all the requirements.
- Missing library decisions — the agent will pick its own.
- No project structure section — the agent will invent its own folder layout.
- No testing approach — the agent may skip tests or use the wrong framework.
- Vague integration descriptions — "call the API" without pasting the contract means the agent will web-search.

### Hands-on

After `/opsx:propose` generates `design.md`, open it and audit:
1. Does it reference the PRD?
2. Does it list all the libraries with reasons?
3. Is there a project structure section?
4. Does it specify the testing approach with framework names?
5. Does it cover every functional requirement from the PRD?

Add any missing sections manually before running `/opsx:apply`.

---

## Tasks

### Job
An ordered, atomic list of implementation steps. Each task is a deliverable: working code + passing tests. No task is complete without its tests.

### Structure

```markdown
# Tasks: [Feature Name]

## References
- PRD: [link]
- Design: [link]

## Task 1: [Name]

**Dependencies**: none

**Description**: What to implement in this task.

**Subtasks**:
- [ ] Create `src/api/tokens.routes.ts` with GET /tokens endpoint
- [ ] Add request validation middleware
- [ ] Implement TokenService.fetchPrices()

**Tests**:
- [ ] Unit test: TokenService returns normalized price data
- [ ] Integration test: GET /tokens returns 200 with token price array

**Acceptance Criteria**:
- Backend returns prices from cache if TTL not expired
- Backend fetches from CoinGecko API if cache is cold
- Response matches the contract in design.md section 4.2

## Task 2: [Name]

**Dependencies**: Task 1 complete

...
```

### What makes a bad task list

- Tasks that have no acceptance criteria — the reviewer has nothing to check against.
- Tasks without tests — you'll have untested code.
- Tasks that are too large — an agent can't implement "the entire frontend" as a single task. Break it down.
- Missing dependencies — if Task 2 uses an interface defined in Task 1, it must declare that dependency explicitly. Otherwise the agent may implement Task 2 before Task 1 and have undefined types.
- Tasks without file references — "implement the service" is ambiguous. "Create `src/tokens/token.service.ts`" is not.

### Task granularity

Compressing 10 tasks into 5 makes each task heavier and slower for the agent to execute. The general guidance:

- **Good granularity**: 1-2 hours of work per task for a human developer. A few hundred lines of code maximum.
- **Too large**: "implement the entire backend". The agent may lose coherence partway through.
- **Too small**: "add one import statement". The overhead of the task spec is more than the work.

For most features: 5-10 tasks is a reasonable range.

### Hands-on

After `/opsx:propose` generates `tasks.md`:
1. Count the tasks. Are they granular enough?
2. Pick any task and verify: does it have acceptance criteria? Does it have tests? Does it list specific files?
3. Check the dependencies: do they form a valid order? Is there a task that depends on another without declaring it?
4. Identify the riskiest task (most external dependencies, most unknowns). Should it be Task 1 or Task 2, not buried at Task 7?
