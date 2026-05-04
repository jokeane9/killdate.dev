---
title: "Write the plan before the build"
description: "A runbook is not a spec doc. It's a machine-executable instruction set — every task has exactly five blocks, no exceptions."
part: 2
post: 6
draft: true
tags: ["runbooks", "cursor", "build-process", "drift-prevention"]
---

You've filled the pre-build lock. You've got the mocks approved. Now you write the runbook — the document Cursor actually executes.

A runbook is not a plan in the project management sense. It's not a list of things to do. It's a sequence of machine-executable instructions, where each instruction has enough information that an AI agent can complete it without interpretation.

The difference between "interpretation required" and "interpretation not required" is the difference between a clean build and a rework session.

## The 5 required blocks

Every task in a Shelf runbook has exactly these five blocks. There are no exceptions for "simple" tasks. Exceptions are where drift enters.

**1. FILES block** — an explicit list of every file the agent is allowed to modify. Hard boundary. "Do not modify any file not in the FILES block." This is the highest-leverage addition to any runbook. On Phase 0-8 dashboard builds, Cursor would open an imported file, notice something it wanted to "improve," and refactor it. The PR would have 12 changed files instead of 2. The FILES block closes that gap.

**2. TYPES block** — exact TypeScript interfaces with exact field names. Not example code — type declarations. Cursor matches field names against type declarations more reliably than against prose or examples. If the loader returns `suggestions` and the component expects `suggestions`, and Cursor renames it to `competitorSuggestions` because it "reads better," you get a runtime crash on an undefined prop. The TYPES block prevents this.

**3. SKELETON block** — copy-pasteable JSX with exact Polaris components and props. This is the highest-fidelity instruction format Cursor accepts. It reproduces JSX skeletons almost verbatim and fills in state logic around them. "Use a Card with a ChoiceList" is prose — high drift. An actual `<Card><BlockStack gap="400"><ChoiceList ...></BlockStack></Card>` skeleton is code — very low drift.

**4. PROHIBITED block** — five to seven specific items that must not appear. Not "don't add anything not in the skeleton" — that's too vague. Name the exact things Cursor tends to add. For the Shelf onboarding rewrite: "No back button. No Layout or Layout.Section wrapper. No description text under radio options. No Banner on this screen. Do not modify any file not in the FILES block." Short, specific, enforceable.

**5. VALIDATE block** — concrete checks that must pass before the task is done. Not "confirm the page renders." That catches nothing. "Query: `SELECT onboarding_step FROM merchants WHERE id = X` → confirm 'vertical_setup'" catches state bugs at the task boundary instead of three tasks later. The validate block includes DB queries, redirect confirmations, and typecheck.

## The global rules section

At the top of the runbook, before the tasks, there's a global rules section. These apply to every task without being repeated:

- Execution guardrail: "Do not modify any file not listed in the task's FILES block. Do not refactor existing code. Do not rename variables in files you import from."
- ErrorBoundary requirement: the exact component, copy-pasted. Every route exports it.
- Navigation invariant (for multi-step flows): every loader checks the expected state value and redirects if mismatched.
- State invariant table: a map of every step to its expected DB state and invariants, referenced by each task's VALIDATE block.

These are defined once. Each task doesn't repeat them — it references them.

## Why this feels like overhead until it doesn't

The F2 onboarding redesign on Shelf was the first build using the hardened runbook pattern: 11 tasks, 4 full route rewrites, 2 schema migrations, 0 additive drift in route files, 15 broken tests fixed in a dedicated alignment task, 123 tests passing after completion, CI passed first try, deploy went through clean.

The previous approach — the Phase 0-8 dashboard build — produced the same outputs, but required more manual intervention at each step. Cursor was interpreting. The hardened runbook eliminated interpretation.

The cost: more time writing the runbook. The payoff: a build that executes predictably from start to finish.

## The failure modes the runbook prevents

From the Shelf build learnings, nine specific failure modes have been catalogued. The five blocks address eight of them directly:

- **Late-catch validation** → VALIDATE per task catches issues at the boundary, not four tasks later
- **Blast radius** → FILES block prevents Cursor from refactoring files it shouldn't touch
- **Field name drift** → TYPES block locks field names as contracts
- **Structural drift** → SKELETON eliminates the 50 micro-decisions about padding, spacing, and component hierarchy
- **Additive drift** → PROHIBITED list names the specific things Cursor tends to add
- **Missing error boundaries** → global ErrorBoundary requirement with exact component
- **Cross-step state corruption** → state invariant table + VALIDATE blocks
- **URL manipulation / back-button navigation** → navigation invariant

The ninth failure mode — UX paradigm drift — is addressed by the mock (which comes before the runbook, during the pre-build pipeline).

## When to skip the hardened pattern

The full five-block structure is overkill for:
- Single-file bug fixes
- Backend-only model functions with exact SQL provided
- Cosmetic changes within an existing component
- Adding a single small component to an existing page

Rule of thumb: if the task involves rewriting a route file with UI, state, and navigation logic, use the hardened pattern. If it's isolated and small, a simple task description works.

The judgment is explicit. You make it per task. You don't silently skip the structure on complex tasks because writing the skeleton feels slow.

---

**Action:** Take your last Cursor prompt and restructure it as a hardened runbook task: FILES block, TYPES block, SKELETON block, PROHIBITED block, VALIDATE block. See how much you had to think to fill those blocks — that thinking is what prevents rework. The full runbook template is in the Shelf repo. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
