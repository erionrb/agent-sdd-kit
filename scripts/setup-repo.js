#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : null;
}

function hasFlag(name) {
  return args.includes(name);
}

const target = getFlag('--target');
const mode = getFlag('--mode') || 'reference';
const force = hasFlag('--force');

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

if (!target) {
  console.error('Error: --target <path> is required.');
  console.error('Usage: npm run setup:repo -- --target /path/to/repo [--mode copy|reference] [--force]');
  process.exit(1);
}

if (!['copy', 'reference'].includes(mode)) {
  console.error(`Error: --mode must be "copy" or "reference", got "${mode}".`);
  process.exit(1);
}

const targetAbs = path.resolve(target);

if (!fs.existsSync(targetAbs) || !fs.statSync(targetAbs).isDirectory()) {
  console.error(`Error: target path does not exist or is not a directory: ${targetAbs}`);
  process.exit(1);
}

const SOURCE_ROOT = path.resolve(__dirname, '..');

console.log(`\nSetting up SDD prompt stack in: ${targetAbs}`);
console.log(`Mode: ${mode} | Force: ${force}\n`);

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

const stats = { created: 0, skipped: 0, backed_up: 0, errors: 0 };

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  const exists = fs.existsSync(filePath);

  if (exists && !force) {
    console.log(`  SKIP     ${path.relative(targetAbs, filePath)}`);
    stats.skipped++;
    return;
  }

  if (exists && force) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const bakPath = `${filePath}.${ts}.bak`;
    fs.copyFileSync(filePath, bakPath);
    console.log(`  BACKUP   ${path.relative(targetAbs, filePath)} → ${path.basename(bakPath)}`);
    stats.backed_up++;
  }

  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  CREATE   ${path.relative(targetAbs, filePath)}`);
  stats.created++;
}

function copyFile(src, dest) {
  const exists = fs.existsSync(dest);

  if (exists && !force) {
    console.log(`  SKIP     ${path.relative(targetAbs, dest)}`);
    stats.skipped++;
    return;
  }

  if (exists && force) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const bakPath = `${dest}.${ts}.bak`;
    fs.copyFileSync(dest, bakPath);
    console.log(`  BACKUP   ${path.relative(targetAbs, dest)} → ${path.basename(bakPath)}`);
    stats.backed_up++;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`  CREATE   ${path.relative(targetAbs, dest)}`);
  stats.created++;
}

function copyDirRecursive(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// ---------------------------------------------------------------------------
// Skeleton directory structure (empty dirs get .gitkeep)
// ---------------------------------------------------------------------------

const EMPTY_DIRS = [
  'docs/context',
  'docs/discovery',
  'docs/integrations',
  'openspec/changes',
  'memory',
];

console.log('--- Directory scaffolding ---');
for (const rel of EMPTY_DIRS) {
  const dir = path.join(targetAbs, rel);
  ensureDir(dir);
  const keepFile = path.join(dir, '.gitkeep');
  if (!fs.existsSync(keepFile)) {
    fs.writeFileSync(keepFile, '', 'utf8');
    console.log(`  CREATE   ${rel}/.gitkeep`);
    stats.created++;
  }
}

// ---------------------------------------------------------------------------
// Prompts directory
// ---------------------------------------------------------------------------

console.log('\n--- Prompts ---');

if (mode === 'copy') {
  copyDirRecursive(path.join(SOURCE_ROOT, 'prompts'), path.join(targetAbs, 'prompts'));
} else {
  // reference mode: drop a README pointing to the canonical source
  writeFile(
    path.join(targetAbs, 'prompts', 'README.md'),
    `# Prompts

The canonical prompt stack lives in \`~/dev/ia/prompts\`.

To copy it locally run:

\`\`\`bash
npm run setup:repo -- --target . --mode copy
\`\`\`

## Structure

\`\`\`
phases/          Phase prompts (01-discovery … 08-summary-before-clear)
policies/        Shared policy files (output, model, budget, file-allowlist)
examples/        Example prompts for each phase
\`\`\`

Phases are loaded by the \`.claude/commands/\` shortcuts in this repo.
When a phase file is missing, copy it from \`~/dev/ia/prompts/phases/\`.
`
  );
}

// ---------------------------------------------------------------------------
// .claude/commands
// ---------------------------------------------------------------------------

// Resolves the path to reference inside a command file.
// In copy mode the file will exist locally; in reference mode we note it may
// need to be copied from the canonical source.
function phasePath(filename) {
  return `prompts/phases/${filename}`;
}

const POLICIES = [
  'prompts/policies/output-policy.md',
  'prompts/policies/model-policy.md',
  'prompts/policies/budget-policy.md',
  'prompts/policies/file-allowlist-policy.md',
];

function policyList() {
  return POLICIES.map(p => `- ${p}`).join('\n');
}

function refNote() {
  if (mode === 'reference') {
    return `\n> **Reference mode:** prompt files are not bundled. Copy them from \`~/dev/ia/prompts\` if missing.\n`;
  }
  return '';
}

const COMMANDS = [
  {
    file: 'discovery.md',
    title: 'Discovery',
    phase: '01-discovery.md',
    description: 'Run the discovery phase to understand the codebase, gather requirements, and document unknowns before any implementation.',
  },
  {
    file: 'local-documentation.md',
    title: 'Local Documentation',
    phase: '02-local-documentation.md',
    description: 'Generate or update local context docs (architecture, conventions, integrations) so every subsequent phase has accurate grounding.',
  },
  {
    file: 'openspec-planning.md',
    title: 'OpenSpec Planning',
    phase: '03-openspec-planning.md',
    description: 'Create or refine an OpenSpec change. Prefer `/openspec-propose` (generates all artifacts interactively). If requirements are unclear first, run `/openspec-explore`. Use this command only as a manual fallback.',
  },
  {
    file: 'implement-task.md',
    title: 'Implement Task',
    phase: '04-task-implementation.md',
    description: 'Implement a single task from the active OpenSpec change. Prefer `/openspec-apply-change` (picks the next incomplete task automatically and enforces allowlist + output policies). Use this command only as a manual fallback.',
  },
  {
    file: 'review-task.md',
    title: 'Review Task',
    phase: '05-task-review.md',
    description: 'Review the last implemented task for correctness, style, and spec alignment.',
  },
  {
    file: 'qa.md',
    title: 'QA',
    phase: '06-qa.md',
    description: 'Run the QA phase: execute tests, check accessibility, and produce a bug report.',
  },
  {
    file: 'debug-compressed.md',
    title: 'Debug (Compressed)',
    phase: '07-debug-compressed.md',
    description: 'Focused debug session optimised for compressed context windows — reads the QA bug report and applies fixes.',
  },
  {
    file: 'summary-before-clear.md',
    title: 'Summary Before Clear',
    phase: '08-summary-before-clear.md',
    description: 'Produce a structured session summary before clearing context, capturing decisions, progress, and next steps. This does NOT replace `/openspec-archive-change` — run archive separately only after implementation, review, QA, and summary are complete.',
  },
];

console.log('\n--- .claude/commands ---');
for (const cmd of COMMANDS) {
  const content = `# ${cmd.title}

${cmd.description}
${refNote()}
## Phase prompt

- ${phasePath(cmd.phase)}

## Policies

${policyList()}

## Usage

Invoke this command from Claude Code:

\`\`\`
/${cmd.file.replace('.md', '')}
\`\`\`

Or reference it directly in a conversation by pasting the content of \`${phasePath(cmd.phase)}\`.
`;
  writeFile(path.join(targetAbs, '.claude', 'commands', cmd.file), content);
}

// ---------------------------------------------------------------------------
// docs/context stubs
// ---------------------------------------------------------------------------

console.log('\n--- docs/context stubs ---');

writeFile(
  path.join(targetAbs, 'docs', 'context', 'architecture.md'),
  `# Architecture

> **TODO:** Describe the system architecture. Include:
> - High-level component diagram or description
> - Tech stack (language, framework, DB, infra)
> - Key data flows
> - External integrations
> - Deployment topology

This file is read by AI agents before coding to avoid wrong assumptions about the stack.
`
);

writeFile(
  path.join(targetAbs, 'docs', 'context', 'thinking-model.md'),
  `# Thinking Model

> **TODO:** Describe how to analyse problems in this codebase. Include:
> - How to assess the blast radius of a change
> - Which areas are high-risk / need extra care
> - Preferred investigation strategy (read tests first, check types, etc.)
> - How to validate a hypothesis before coding

This file shapes the reasoning strategy agents use when approaching tasks.
`
);

writeFile(
  path.join(targetAbs, 'docs', 'context', 'coding-conventions.md'),
  `# Coding Conventions

> **TODO:** Document the project's coding standards. Include:
> - Naming conventions (files, functions, variables, types)
> - File and folder structure rules
> - Import order
> - Error handling patterns
> - Testing conventions
> - Commit message format

Agents read this before writing or reviewing code.
`
);

// ---------------------------------------------------------------------------
// openspec/config.yaml
// ---------------------------------------------------------------------------

console.log('\n--- OpenSpec config ---');

writeFile(
  path.join(targetAbs, 'openspec', 'config.yaml'),
  `# OpenSpec configuration
# Schema: spec-driven (proposal → specs → design → tasks)
schema: spec-driven

context:
  files:
    - CLAUDE.md
    - AI_CONTEXT.md
    - docs/context/architecture.md
    - docs/context/thinking-model.md
    - docs/context/coding-conventions.md

artifacts:
  proposal:
    rules:
      - State the problem clearly before proposing a solution.
      - Include success criteria and out-of-scope items.
      - Keep it under one page.

  specs:
    rules:
      - List every functional and non-functional requirement.
      - Use numbered items so tasks can reference them by ID.
      - Flag ambiguities as open questions.

  design:
    rules:
      - Explain HOW, not what (what belongs in specs).
      - Include data model changes, API contracts, and component interactions.
      - Call out risks and alternatives considered.

  tasks:
    rules:
      - Each task must be implementable in a single focused session.
      - Include acceptance criteria per task.
      - Order tasks so each builds on the previous.

  review:
    rules:
      - Verify each task against its acceptance criteria.
      - Check spec coverage — no unimplemented requirement.
      - Flag any new tech debt introduced.
`
);

// ---------------------------------------------------------------------------
// memory/README.md
// ---------------------------------------------------------------------------

console.log('\n--- Memory ---');

writeFile(
  path.join(targetAbs, 'memory', 'README.md'),
  `# Memory

This directory stores persistent memory files for Claude Code sessions.

Files here are loaded automatically when referenced in \`CLAUDE.md\` or via the
\`/remember\` pattern. Use them to persist facts that should survive context clears:

- \`user.md\` — team roles, preferences, domain knowledge
- \`project.md\` — active goals, deadlines, architectural decisions
- \`feedback.md\` — what worked / what to avoid
- \`reference.md\` — links to external systems (Linear, Notion, Slack channels)

Keep entries short. One fact per bullet. Delete stale entries.
`
);

// ---------------------------------------------------------------------------
// Root files: CLAUDE.md and AI_CONTEXT.md
// ---------------------------------------------------------------------------

console.log('\n--- Root files ---');

writeFile(
  path.join(targetAbs, 'CLAUDE.md'),
  `# CLAUDE.md

This file is read by Claude Code at the start of every session.

## Project overview

> **TODO:** One paragraph describing what this project does and who uses it.

## Tech stack

> **TODO:** List language, framework, database, infrastructure, and key libraries.

## Key commands

\`\`\`bash
# TODO: Add the commands needed to build, test, lint, and run the project.
\`\`\`

## SDD Workflow

All feature work follows the Spec Driven Development cycle:

\`\`\`
/discovery → /local-documentation
  (pre-OpenSpec: gather requirements and context, no artifacts, no implementation)

→ /openspec-explore        if requirements are still unclear
→ /openspec-propose        generates proposal.md + design.md + tasks.md
→ /openspec-apply-change   implements the next incomplete task (one per session)
→ /review-task → /qa → (debug if needed)
→ /summary-before-clear → /clear
→ /openspec-archive-change  (only after review + QA + summary are complete)
\`\`\`

**OpenSpec commands are the preferred way to propose, apply, and archive changes.**
The \`.claude/commands/\` SDD shortcuts are guardrails and policy wrappers — use them for
phases that don't have a dedicated OpenSpec command (discovery, local docs, review, QA, debug, summary).

| Phase | Preferred |
|-------|-----------|
| Discovery | \`/discovery\` |
| Local docs | \`/local-documentation\` |
| Explore requirements | \`/openspec-explore\` |
| OpenSpec planning | \`/openspec-propose\` |
| Implement task | \`/openspec-apply-change\` |
| Review task | \`/review-task\` |
| QA | \`/qa\` |
| Debug | \`/debug-compressed\` |
| Summary | \`/summary-before-clear\` |
| Archive change | \`/openspec-archive-change\` |

## Constraints

- Do not scan the entire repository. Use the file allowlist in \`prompts/policies/file-allowlist-policy.md\`.
- Keep output concise. Follow \`prompts/policies/output-policy.md\`.
- Select models per task size. Follow \`prompts/policies/model-policy.md\`.
- Respect token budgets. Follow \`prompts/policies/budget-policy.md\`.
`
);

writeFile(
  path.join(targetAbs, 'AI_CONTEXT.md'),
  `# AI_CONTEXT.md

Update this file at the start of each session with current project state.

## Current goal

> **TODO:** What is the team working on right now? One sentence.

## Active OpenSpec change

> **TODO:** Name and path of the active change, e.g. \`openspec/changes/my-feature/\`

## Important paths

> **TODO:** List the key files/directories an agent should know about for the current task.

## Output policy summary

- Responses: concise, no padding.
- Code: minimal comments, no placeholders.
- Diffs: show only changed lines.
- No unsolicited refactors outside task scope.

## Current constraints

> **TODO:** List any active constraints — frozen files, WIP migrations, blocked PRs, etc.
`
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n----------------------------------------');
console.log(`Created:  ${stats.created}`);
console.log(`Skipped:  ${stats.skipped}`);
console.log(`Backed up: ${stats.backed_up}`);
if (stats.errors) console.log(`Errors:   ${stats.errors}`);
console.log('Done.\n');
