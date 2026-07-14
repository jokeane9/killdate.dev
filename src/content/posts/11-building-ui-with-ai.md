---
title: "Building a complex UI surface with AI — a case study"
description: "Figma mockup → UX state map → prototype → feature lock → Cursor build → tests → production. What the workflow looks like on a real billing surface."
part: 4
post: 20
draft: false
tags: ["ui-ux", "case-study", "cursor", "remix", "runbook"]
---

The billing page in a Node.js/Remix app. Six distinct states, a billing API, a webhook handler, and a soft paywall. Here's how the process from the previous articles played out on a real surface — start to finish.

## The Figma mockup

Requirements first. The billing page needed to handle six states: trial, free, pending, basic, pro, and cancelled. Each state had its own banner, plan card layout, and CTA. Before anything opened in Cursor, the design was locked in Figma — one frame per state, exact spacing, exact copy, exact component hierarchy.

This is not optional. Without a locked Figma spec, Cursor invents the design as it goes. You end up with a billing page that works but looks like something assembled from three different design systems.

## The UX state map

With the Figma frames locked, Claude Code mapped every state transition. Every billing state, every trigger that moves a user from one state to another, every edge case — trial expiry, failed payment, cancellation during a billing period, reactivation.

The state map surfaced two states the Figma hadn't covered. Those went back into Figma before the prototype was built. Fixing a missing state in Figma takes minutes. Fixing it mid-build takes a rework session.

## The prototype

Claude Code built a 7-tab HTML/CSS prototype from the Figma spec and the state map. One tab per billing state, each showing exactly what the browser would render. The whole team could open it, click through it, and sign off on it before a single line of production code was written.

The prototype was the visual authority for the Cursor build. Cursor was told to open it and match it, state by state. No interpretation required.

## The feature lock

With the prototype signed off, the feature lock defined the exact scope:

**IN:** Schema migration for the plan column, billing server functions, full billing route rewrite, nav link, soft paywall change, webhook handler for subscription status changes.

**OUT:** Feature gating per tier — separate build. Email notifications — separate build. Enterprise billing — out of scope.

The OUT list is the discipline. Without it the billing build becomes the billing-and-enforcement-and-notifications build.

## The Cursor build

Nine tasks. Every task used the 5-block structure: FILES, TYPES, SKELETON, PROHIBITED, VALIDATE.

The state model went into the brief before any task ran:

```
BillingState: 'trial' | 'free' | 'pending' | 'basic' | 'pro' | 'cancelled'
```

Cursor matched each state to the corresponding prototype tab. The VALIDATE block for every task checked against the prototype, not against memory of what it was supposed to look like.

## Code review

Every task output went through a developer review before the next task started. Not a rubber stamp — an actual read of the diff. Cursor got a few things wrong: a UI library's `Button onClick` was typed as `() => unknown` rather than `(e: MouseEvent) => void`, which TypeScript caught at the VALIDATE step. A CSS module placed in the routes directory was treated as a route module by the build tool — CI failure, caught immediately. A `throw redirect()` in the cancel action broke the embedded app session token, because Remix redirects in that context happen outside the app frame; the fix was returning action data and driving the UI transition from it instead.

None of these required a rework session. All three were caught at the review step of the task they appeared in, not three tasks later when the blast radius would have been larger. The review loop is what makes that happen. Cursor is fast; the review loop is what keeps the build clean.

## Tests, then production

Automated tests ran in the local dev environment before staging. Contract tests validated the billing state derivation logic. Typecheck confirmed the interface extensions. Both passed.

Manual walkthrough in staging: every state loaded by injecting database state directly, every render confirmed against the prototype. And staging found things the automated tests didn't — edge cases in the transition logic, a banner that rendered correctly in isolation but overlapped a nav element in the actual page layout. The tests told us the contracts held. The manual walkthrough told us whether the product actually worked.

This is the distinction that matters. End-to-end testing in a real environment is not a formality and it is not a substitute for automated tests — it is a different thing entirely. Automated tests verify correctness against known cases. End-to-end testing surfaces the cases you didn't think to write a test for. On a billing surface, those are exactly the cases that matter: the user who upgrades mid-trial, the subscription that returns a pending state from the billing API while the database says active, the cancel flow that works on desktop and breaks in the embedded mobile view. You will always find something. Budget time for it.

Deploy to production. Canary — no regressions. Full rollout.

The whole build ran clean because every decision was made before implementation started. The prototype answered the design questions. The state map answered the interaction questions. The lock answered the scope questions. By the time Cursor opened the first file, there was nothing left to figure out. What remained was execution — and the review loop and the test suite were what kept execution honest.
