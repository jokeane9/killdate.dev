---
title: "Define what you're not changing before you start"
description: "A pre-build lock isn't a planning document. It's a drift prevention mechanism. Write what you're NOT touching before you write a line of code."
part: 2
post: 4
draft: true
tags: ["pre-build-lock", "anti-drift", "build-process", "planning"]
---

The most dangerous word in AI-assisted development is "and." As in: "fix the billing page and clean up the loader while you're in there." Every "and" is scope drift. Every unintended "and" is a bug waiting to be introduced into something that was working.

The **pre-build lock** is the mechanism that prevents this. It's a document you fill out before writing any code, and its primary job is to enumerate what is NOT changing. The scope of what you're building matters, but it's the explicit inventory of what you're leaving alone that actually prevents drift.

## Why this exists

PR #125 on Shelf is the reference failure. The build spec named the new thing — a Briefing Surface — but didn't enumerate the unchanged surfaces. The builder (Claude, in this case) read the gap as permission to replace surrounding context. The code was correct per the spec. The spec was incomplete. Three hours of rework followed.

The lock template was written in direct response to that failure. The first line of the template: "The primary job of this template is to lock out everything that is NOT changing."

That's the whole idea. If you don't name what you're leaving alone, the AI agent has no way to know what's protected. It will optimize toward what you asked for, and anything in the vicinity of the change is fair game.

## The 6-step anti-drift pipeline

Every feature build on Shelf walks this sequence:

```
canonical → [CP-0] → lock → [CP-1] → mocks → [CP-2] → runbook → [CP-3] → code → prod
```

CP-0 through CP-3 are checkpoints — sign-off moments where a human verifies the artifact before the next step begins. No step proceeds past a closed checkpoint.

The pipeline enforces one invariant at every step: **`V(N+1) = V(N) + exactly one surgical change`**. Every artifact — the lock, the mocks, the runbook, the code, the production validation — gets tested against that statement. If any artifact can't be reconciled with a single surgical change, it's drift. Split it into multiple builds.

This isn't theoretical. When the V3 briefing surface shipped on Shelf, the lock explicitly named: OpportunitiesSection replaced by BriefingSection in the V2 dashboard card stack, one component, one slot, nothing else. Four of five dashboard sections unchanged. Routes unchanged. Tables unchanged. Settings unchanged. Billing unchanged. All of that was written in the invariants inventory before a line of code was touched.

## What the lock contains

The lock template has 15 gates across two paths (A for prompt work, B for UI work). The critical structural pieces are:

**Gate 2 — Scope & Invariants Lock.** This is where you write what's IN and what's explicitly OUT. Then the section-vs-replacement: one sentence naming the exact slot, route, or component this change occupies. Then unique-job: one sentence saying what this surface does that nothing else does. Then the invariants inventory — a table of every surface, route, table, and system that must render identically after this change. Empty cells in that table aren't acceptable: "investigate, don't assume clean."

The invariants inventory looks like this:

| Surface / System | Unchanged? | Verification method |
|---|---|---|
| Onboarding flow | ☑ | Load each step, verify no regression |
| Settings page | ☑ | Verify settings content unchanged |
| Dashboard | ☑ | Spot-check cards |
| Authentication flow | ☑ | Install flow smoke test |

Every row that matters has to be there. Every row has to have a verification method. "Trust the builder" is not a verification method.

**Gate 2.5 — Sunset criterion and kill-date.** If this build replaces a previous version, when does the previous version get deleted? Under what conditions? Write it before shipping, not after. Shelf has three Layer 4 prompts sitting on disk right now because no kill-date was written when the newer versions replaced the older ones. Debt accumulates.

**Gate 13b — Blast radius audit.** A matrix of every touchpoint the change could affect: routes, components, templates, notifications, banners, email, webhooks, telemetry, tests. Empty cells are a problem, not a neutral state. If you didn't check a touchpoint, you're assuming it's clean. "Assuming" is where bugs come from.

## The single invariant

Everything in the pipeline tests against this: `Shelf V(N+1) = Shelf V(N) + exactly one surgical change.`

One component swap. One section addition. One field deletion. One copy change. Not a bundle. Not "a refresh and a cleanup." Not "while we're in there."

If a build can't be expressed as a single surgical change, it's two builds. The discipline of splitting — which feels like slowdown — is what makes each build reviewable, rollback-able, and diagnosable when something goes wrong.

## What this saves you

The 30-60 minutes to fill the lock is not overhead. It's the time you're trading against three hours of rework when an AI agent touches something it shouldn't have. On Shelf, the billing page build was 9 tasks in Cursor, a schema migration, a webhook handler, a soft paywall change, and a nav update. All gates were filled. Build went clean — CI passed first try, no additive drift, deploy went through without incident.

That's not luck. That's what happens when every task knows exactly what files it can touch and every surface that's protected is named explicitly.

---

**Action:** Before your next feature build, copy the pre-build lock template from the Shelf repo into your feature folder and fill Gate 2 completely — the IN list, the OUT list, and the invariants inventory. Everything else can come later. Gate 2 alone will prevent most drift. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
