---
title: "Scoping the feature: lock, blast radius, mocks"
description: "You have a live product. Before any code, make two things explicit: what this build changes, and what it doesn't touch."
part: 2
post: 8
draft: false
tags: ["pre-build-lock", "blast-radius", "mocks", "drift-prevention", "scoping"]
---

You have a live product. The blast radius of a misscoped feature isn't hypothetical — it's real users hitting broken surfaces and no clean rollback path.

The pre-build lock is the mechanism that prevents this. It's not a planning document. It's a drift prevention mechanism. Its primary job is to enumerate what is NOT changing — because if you don't name what's protected, the AI agent has no way to know what's off-limits. It will optimize toward what you asked for, and anything adjacent to the change is fair game.

The most dangerous word in AI-assisted development is "and." As in: "fix the settings page and clean up the loader while you're in there." Every unscoped "and" is a bug waiting to be introduced into something that was working.

## The lock

Fill the lock before any code is written. Two sections do most of the work:

**Scope statement** — one sentence. What this build does that nothing currently does. If you can't write this sentence, the scope isn't defined yet. Descope or clarify before continuing.

**Invariants inventory** — a table of every surface, route, table, and system that must behave identically after this change. Every row has a verification method. "Trust the builder" is not a verification method.

| Surface / System | Unchanged? | Verification method |
|---|---|---|
| Onboarding flow | ☑ | Load each step, verify no regression |
| Settings page | ☑ | Verify content unchanged |
| Auth flow | ☑ | Smoke test login |
| Billing | ☑ | Load billing page, check state |

Empty cells in the invariants table are a problem, not a neutral state. An empty cell means you didn't check. "Investigate, don't assume clean."

## The single surgical change test

Every feature build must be expressible as: **V(N+1) = V(N) + exactly one surgical change.**

One component. One route. One field. If it can't be, split into multiple builds. The instinct to bundle feels like efficiency — in practice, bundled builds are where drift becomes invisible. A shared type gets quietly refactored, an adjacent file gets "improved," and by the time you notice, you're debugging the interaction between half-built things.

Write the surgical change sentence before opening a code editor. If you're revising it three times trying to cover two different changes, that's two builds.

## The blast radius audit

Before the mocks: a matrix of every touchpoint the change could affect. Routes, components, templates, notifications, webhooks, telemetry, tests. Empty cells are not neutral — they mean you didn't check.

The failure mode the audit prevents: you add a new field to a shared type. Everything that reads that type now has a new required field. Three components not in your FILES block silently break because they depended on the old shape. The audit surfaces those downstream dependencies before you write a line of code.

A useful framing: if someone changed this file six months ago, what else would they have had to check? That's your blast radius.

## Mocks for feature work

Same discipline as the MVB, different pressure. You're not proving the stack works — you're confirming the new surface fits the existing product.

The mock is a simple HTML file showing the new surface in context. Two things it must resolve before Cursor sees it:

**Data shape** — what exactly does this component receive? Name the fields. This makes the TYPES block derivable rather than invented.

**State coverage** — loading, empty, error, populated. Not all on one screen — but each state must be represented somewhere in the mock.

The companion doc maps every section of the mock to the product definition doc. A divergence between the mock and the product definition is caught here, not three tasks into a Cursor build.

---

**In the repo:** The pre-build lock template is pre-populated. Run this in Claude Code before writing any code for a new feature:

> Open the pre-build lock template. Read it in full. Walk me through what I need to fill in for [feature name] — ask me one question at a time, starting with the scope statement.

After the lock is filled:

> Read the completed lock for [feature name]. Check the invariants inventory against the current repo. Flag any listed surface that has changed recently and any empty cells in the verification method column.
