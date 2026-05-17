---
title: "Prompts that run for hours"
description: "Before committing to a feature, we load the full codebase into context and ask for 2–3 implementations: a code path, a UX approach, a tooling option. Read them in the morning, pick a direction. Cheaper than building the wrong thing."
part: 6
post: 19
draft: false
tags: ["prompting", "context-window", "claude-code", "prototyping", "shelf"]
---

*3 minute read*

## The problem with committing early

New features on an established system are expensive to undo. You pick a direction, build it, realise it doesn't fit, rework it. The rework costs more than the original build because now you're fighting existing code that assumed the wrong approach.

The large context session is the step before committing. Load everything — the full codebase, the spec, the constraints, the adjacent surfaces that will be affected — and ask for the feature delivered two or three ways. Not a recommendation. Actual implementations of each approach, far enough along that you can compare them.

On Shelf we do this before any non-trivial feature decision. The session runs for hours. In the morning you have options.

---

## The three angles

The framing that works best isn't "show me different implementations." It's three distinct perspectives that genuinely produce different outputs:

**Code path.** How does this land in the existing architecture? Which layers does it touch, what migrations does it require, what's the blast radius? This is the engineering assessment — technically correct, integrated, no UX opinion.

**UX/UI path.** How does a merchant actually encounter this? What does the screen look like, what's the interaction model, what does the empty state say? This produces a different answer than the code path because the constraints are different. Sometimes the UX path reveals that the technically correct implementation produces a confusing user experience.

**Tooling path.** Is there a third-party integration, a different pipeline architecture, or an existing pattern (Langflow flow, a library, a Shopify API we haven't used) that changes the approach entirely? This is the option you miss if you only think about building it yourself.

Reading all three side by side tells you things none of them would tell you individually. The code path might be clean but the UX path reveals a missing state. The tooling path might eliminate two weeks of work. Or they converge — all three point to the same core approach — and now you know you're on solid ground before writing production code.

---

## What loads into the session

The reason this requires 250–300K context: you need the full picture for the comparison to be meaningful.

A partial context produces partial implementations. If the session doesn't have the current schema, the prototype misses a constraint. If it doesn't have the relevant route files, the UX path assumes a navigation structure that doesn't exist. If it doesn't have the CLAUDE.md operating contract and the PRE-BUILD-LOCK, the implementations drift from the product definition.

On Shelf a feature assessment session loads: the full codebase, `CLAUDE.md`, the relevant PM files (`ROADMAP.md`, `ARCHITECTURE.md`), the PRE-BUILD-LOCK for the feature, and the existing tests. That's the minimum for implementations that are actually comparable.

---

## What you do with the output

You don't ship any of it. That's the point.

You read each implementation as a decision document. What assumptions did each one make? Where do they diverge? Which trade-offs are you willing to accept? The session surfaces the choices. You make them.

Then you brief the actual build — Cursor for UI-heavy work, Claude Code for cross-layer changes — with the chosen approach, the constraints that emerged from the comparison, and the things the other approaches revealed that the winning approach still needs to handle.

The large context session is the research. The build is separate.

---

## Where we've used this on Shelf

The V2→V3 prompt migration: ran a session with both Strangler Fig (parallel operation with a feature flag) and in-place replacement. Didn't ship either. Read them, picked parallel operation, briefed the actual build. The session took an evening. Getting it wrong would have taken weeks to undo.

The billing redirect loop fix: three approaches to where the `host` param should live and how it should survive the OAuth round-trip. Each one had a different surface area in the route handlers. Session ran overnight. Morning: one approach was clearly cleaner, two were valid but verbose. Fixed in a single PR.

The onboarding skip button: UX path revealed a state we hadn't specced — what happens if the merchant closes the tab mid-onboarding and comes back? None of us had thought about it. The code path had no answer. The UX path made it obvious.

---

## Learnings

- Large context sessions are a pre-commitment tool, not a production tool. Use them before building, not instead of building.
- Three angles (code, UX/UI, tooling) produce genuinely different outputs because the constraints are different.
- Full context is the minimum — partial context produces partial implementations that miss existing constraints.
- You don't ship the output. You read it as a decision document and brief the real build from what you learned.
- The session is cheap relative to building the wrong thing. A few dollars and a few hours vs. weeks of rework.

---

*Shelf repo: [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf). PRE-BUILD-LOCK template: `project-management/PRE-BUILD-LOCK-TEMPLATE.md`.*
