---
title: "Agile development in an AI environment"
description: "The development loop, the tool boundary, the three environments. How you build features on a live product without breaking what's working."
part: 2
post: 13
draft: false
tags: ["agile", "development-loop", "claude-code", "cursor", "environments"]
---

The MVB is live. Real users are touching it. This is where the workflow starts earning its keep.

Building from scratch is forgiving — you can experiment, break things, start over. Building on a live product is different. Every deploy touches something real. The blast radius of a careless change isn't hypothetical. And the particular challenge of AI-assisted development — that the tools produce fast, confident-looking output — compounds that risk unless the structure around them is explicit.

This post is the map for Part 2. Everything that follows — scoping, building, shipping — fits inside this framework.

## How a feature session actually works

Open Claude Code. Before anything else, it reads three files: `ROADMAP.md`, `_log.md`, `KNOWN-ISSUES.md`. That's not a ritual — it's how the agent knows where you are. What shipped last session. What's still open. What the next priority is. Without this read, every session starts cold and you spend the first twenty minutes reconstructing context that was already established.

The session opens with a status summary: here's what's live, here's what's next, here's what's broken. You pick one thing from the roadmap. One surgical change. You scope it, build it, ship it, update the log, close the session. The next session picks up from there.

This is your sprint cycle. No separate PM tool required. The roadmap is the backlog. The log is the sprint record. The known issues list is the bug board. Claude Code reads them every session and holds the thread between them.

If your team has people who need visibility outside Claude Code sessions, a tool like Linear or Notion makes sense at that scale. The docs-in-repo system works when everyone is in Claude Code. When they're not, you need something they can read independently.

## What Claude Code does, what Cursor does

Claude Code is the persistent intelligence across the whole project. It reads the codebase, holds the architectural context, writes the runbook, reviews Cursor's output, and updates session state. Use it for anything that requires reasoning across multiple files or layers — planning, reviewing, diagnosing, infrastructure, cross-layer integration.

Cursor is the craftsman for a defined task. Give it a FILES block, a JSX skeleton, a types declaration — and it fills it in cleanly. Ask it to reason across the codebase or make architectural decisions, and it produces something that looks right locally but doesn't integrate.

### Design comes before both

Neither tool replaces design. Before Cursor opens a file with UI intent, the surface needs to exist in Figma — real mocks, not rough sketches — with every state mapped: loading, empty, error, populated. Without this, you're asking Cursor to invent UX decisions mid-implementation. It will. You won't like the answers. The workflow: Claude for ideation and state coverage, Figma as the source of truth, Cursor given a component skeleton derived from the spec. Prose produces interpretation. Skeletons produce implementation.

### The highest failure rate in AI-assisted development

Scope creep from AI is the highest failure rate in AI-assisted development — and it's not dramatic. It looks like a sensible refactor of an adjacent file. A variable renamed because the new name "reads better." An imported utility rewritten because the AI noticed a pattern it preferred. None of it is in the diff you expected, and all of it is now your problem.

Cursor's specific failure mode is additive drift: it expands into whatever it can see that looks related. Extra wrappers, description text, layout components, helper functions. It rarely removes things or uses wrong components — it adds.

### The hard perimeter

The pre-build lock is the defense. The FILES block is an explicit allowlist — every file Cursor may touch, named exactly, with a hard rule in every task: "Do not modify any file not in the FILES block." The invariants inventory names every surface that must stay unchanged, with a specific verification method for each. The PROHIBITED block names the exact patterns Cursor tends to add for this class of task — not "don't add anything extra," but the specific things: no back button, no description text, no Layout wrapper. Cursor responds to specificity. Vague constraints produce vague compliance.

Together these define a hard perimeter. Inside it, Cursor has full latitude. Outside it, nothing. That perimeter is what separates a clean build from three hours of figuring out what the AI touched that it shouldn't have.

## Where you build

Three environments. Each has one job.

**Local dev** is where the runbook runs. Fast feedback, no infrastructure cost, DB seeded or local. You break things here freely because nothing real is affected. This is where Cursor works — task by task, review after each one.

**Staging** is where you validate before real users see anything. Same container, same environment variables, same network config as production — not a permanent environment, spun up for validation and torn down. What staging catches that localhost doesn't: environment variable mismatches, container startup behavior, query performance at real data volumes. These don't surface locally. They do surface for users if you skip this step.

**Production** is one surgical change at a time, behind a feature flag, with monitoring before you expand. Real data. Real users. No surprises.

The flow is always local → staging → prod. The feature doesn't move to the next environment until the current one is clean.

### Git is not optional reading

Give Cursor Git CLI access. It should be able to check its own diff, read recent commits, and understand what changed in the files it's working in — that context makes its output materially better. For your own workflow, [Fork](https://git-fork.com) is the best Git GUI available: branch visualization, staged hunks, side-by-side diffs. Use it to review every PR before it merges, not just skim the summary.

Read the PR. The whole thing. Not because you don't trust the build — because this is how you understand your own codebase. Every PR that merges without you reading the diff is a part of the system you don't own. AI-assisted development moves fast enough that if you stop reading, you stop understanding what you've built. The review is not overhead. It's how ownership transfers.

## The one rule

**V(N+1) = V(N) + exactly one surgical change.**

Every artifact — the lock, the mock, the runbook, the code, the production validation — gets tested against this. One component. One route. One field. Not "a refresh and a cleanup." Not "while I'm in there."

If a feature can't be expressed as a single surgical change, it's two features. Splitting feels like slowdown. In practice it's what makes each build reviewable without untangling, rollback-able without a migration, and diagnosable in minutes rather than hours when something breaks in prod.

The invariant is simple. Applying it every time, without exception, is the whole game. The rest of Part 2 is how.

---

**In the repo:** `ROADMAP.md`, `_log.md`, and `KNOWN-ISSUES.md` are pre-populated with structure. Run these in Claude Code as you work through the feature loop.

**Session start**

> Read `ROADMAP.md`, `_log.md`, and `KNOWN-ISSUES.md`. Tell me the current state — what's been shipped, what's next, what's open. Then tell me what the single next surgical change should be based on priority order in the roadmap.

**Before you scope**

> Given [feature name], apply the V(N+1) invariant. Tell me in one sentence what the single surgical change is, what it adds or replaces, and what must stay unchanged.

**Before you build — invariants check**

> Read the pre-build lock for [feature name]. Walk me through the invariants inventory — every surface listed as unchanged. Tell me which ones have any recent commits touching them, and flag anything that might need re-verification before Cursor starts.

**After each PR**

> Read the diff for the last commit on this branch. Tell me every file that changed, whether each change was in the runbook's FILES block, and whether anything looks like it was added outside the defined scope. Flag any drift.
