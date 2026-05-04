---
title: "Claude Code vs Cursor — who does what and exactly when"
description: "The decision boundary isn't about preference. It's about scope, blast radius, and what kind of AI-assisted work actually produces clean output."
part: 2
post: 5
draft: true
tags: ["claude-code", "cursor", "build-process", "decision-boundary"]
---

The question isn't "which AI tool is better." It's "which AI tool produces clean output for this specific kind of work." The answer is different depending on what you're doing.

The decision boundary is in `CLAUDE.md` — written down, committed, used as a filter before any implementation work starts. On Shelf, it's nine words: "Before starting any implementation, check whether it should be a Cursor build instead." Then comes the list.

## The five questions

If any of these are true, it's a Cursor build:

1. **New data entering the system** — a value that isn't captured today needs to be stored, computed, or displayed for the first time. New column, new crawl field, new API response field.
2. **New UI surface** — a component, card, page, or section that doesn't exist yet. Not restyling or relabeling something that's already rendered — actually new screen real estate.
3. **Schema migration required** — if it needs an `ALTER TABLE`, the blast radius is high enough to warrant a constrained build.
4. **Full vertical slice** — the change touches 3 or more layers simultaneously (e.g. Python pipeline + database + React component). Each layer compounds drift risk.
5. **New user-facing flow** — onboarding steps, settings screens, billing pages, or any multi-step interaction a user clicks through.

The billing page on Shelf hit questions 1, 2, 3, and 5. New `plan` column in the database, new page that didn't exist before, schema migration, multi-step billing flow. That's a Cursor build — with a full runbook, hardened task structure, and explicit file-scope constraints on every task.

## What Claude Code handles

Everything that doesn't require new UI real estate or new data:

- Relabeling, reformatting, or rerouting existing data
- Bug fixes, null guards, error handling
- Prompt changes that don't alter the JSON schema
- Copy changes, CSS tweaks, config updates
- Test fixes and doc updates
- Infrastructure and DevOps — AWS CLI, GitHub Actions, monitoring, migrations (as discrete tasks)
- Prompt work — writing, versioning, wiring prompt flags
- Session management — log updates, roadmap updates, known issues

When the V3 layout integration shipped on Shelf — wiring the new BriefingSection into the existing dashboard — that was Claude Code. One file touched (`app/routes/app._index.tsx`, 70-line diff). No new UI surface. No schema migration. Cursor wasn't involved because Cursor would have been the wrong tool: the task required reasoning about how the V2 and V3 pipelines coexisted in the same loader, not file-level craftsmanship.

## Why using the wrong tool produces the wrong output

When you use Claude Code on a UI-heavy build with tight component requirements, you get output that's architecturally correct and visually approximate. It knows how the system fits together but it doesn't have a JSX skeleton locked in front of it as a target. The output drifts toward what "seems right."

When you use Cursor on a cross-codebase task — something that requires understanding how five files relate to each other — you get local optimality. The file looks right in isolation. It doesn't integrate correctly because Cursor was working with the file in front of it, not the whole system.

The failure mode for Cursor specifically is additive drift: it adds things you didn't ask for. An extra `Banner`, a `Layout.Section` wrapper, description text under radio options. Cursor rarely removes things or uses wrong components — it adds. This is why Cursor runbooks need explicit `PROHIBITED` blocks naming exactly what must not appear.

The failure mode for Claude Code on UI work is interpretive drift: prose turns into suggestions, suggestions get interpreted, interpretation accumulates. "Use a Card with a ChoiceList inside" is not the same fidelity as a copy-pasteable JSX skeleton. Claude Code is better at the former; Cursor is better at executing the latter.

## The practical check

Before starting any implementation on Shelf, the agent has an explicit instruction: stop and flag it if any of the five questions above are true.

That 10-second check is cheaper than unwinding drift. The V3 UI iteration where a misrouted build produced three sessions of rework could have been avoided by asking "does this need a Cursor build doc and mock first?" before starting.

When in doubt, flag it. That's the rule. Not "when clearly obviously certainly in doubt" — when in doubt.

## The tell

If you find yourself thinking "I'll just have Claude Code do it, it'll be faster" about something with a new schema or new screen, that's the tell. The faster feeling is real — you don't have to write a runbook, fill a lock, iterate a mock. But the faster feeling evaporates after the first rework session.

Write the runbook. Fill the lock. Iterate the mock. Then hand it to Cursor. That discipline is what makes Cursor builds clean.

---

**Action:** Right now, look at your last three builds. For each one, answer the five questions. Would any of them have been cleaner with the other tool? If yes, write the decision boundary into your `CLAUDE.md` — the same boundary that lives in the Shelf repo. It's not a huge section. It's a checklist. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
