---
title: "Building UI with AI — the billing page"
description: "A complete walkthrough: how the Shelf billing page went from state map to shipped code via mock-first discipline, a 9-task hardened runbook, and Cursor."
part: 4
post: 11
draft: false
tags: ["ui-ux", "billing", "case-study", "cursor", "mock-first"]
---

Abstract process only gets you so far. Here's what it actually looks like to build a non-trivial UI surface with AI — from the moment the feature was decided to the moment it was in production.

The billing page on Shelf: six billing states, a schema migration, a webhook handler, a new nav entry, a soft paywall change, and a billing callback route. Nine tasks. All of it through Cursor. CI green first try. Deploy clean.

## The starting point

The billing page was a stub — a single $50 plan card with an upgrade button. The requirement was: full plan management, 6 billing states, upgrade/downgrade, cancel, and a soft paywall that stops hard-redirecting merchants with expired trials.

Before touching code, the process is: canonical → lock → mocks → runbook. In that order.

## The canonical check

Gate 1 of the pre-build lock: read both canonical documents, identify conflicts.

Billing is infrastructure, not product surface. Neither canonical covers billing UX directly. No conflicts. Gate passed in five minutes.

The point of Gate 1 isn't to find conflicts — it's to confirm there aren't any. The act of checking prevents the failure mode where a build contradicts a product decision that was already made and documented somewhere.

## The scope lock

Gate 2 produced the IN/OUT list:

**IN:** Schema migration for the `plan` column, billing server updates (Basic and Pro plans), full billing page rewrite, billing nav link, soft paywall change, webhook handler for `app_subscriptions/update`.

**OUT:** Plan enforcement (3 competitor / 50 product caps) — separate build. Crawl frequency gating per plan — separate build. Email notifications on plan change. Enterprise billing. Shopify `trialDays` parameter (trial stays DB-managed).

The OUT list is the discipline. Without it, the billing build becomes the billing-and-enforcement-and-crawl-gating build, which is three times the blast radius and three times the drift risk.

Section-vs-Replacement in one sentence: "Replaces the existing placeholder `app.billing.tsx` (single $50 plan card) with a full state-aware billing page, and adds a Billing nav entry pointing to the existing `/app/billing` route."

## The mock

The billing page mock was built as a 7-tab HTML file. Not a Figma frame — a functional HTML prototype you could click through in a browser.

- **Tab 1**: State map showing all plan transition flows. Visual diagram of how trial → free → basic → pro → cancelled → free works. Every arrow named.
- **Tabs 2–7**: One tab per billing state (trial active, free, pending approval, basic active, pro active, cancelled). Each tab showed the exact banner, the exact plan card layout, the exact CTA.

Why an HTML mock over a Figma frame? Because Cursor can reference a URL or open a file. The HTML mock was the visual authority — Cursor was explicitly told to open it in a browser and use it as the UI reference for each task. A Figma frame requires export; an HTML file opens immediately.

The mock sign-off happened before the runbook was written. Not "we'll refine this during the build" — explicitly signed off, no design changes after that point.

## The state model

The billing page has six states derived from two signals: Shopify subscription status (API) and `merchant.plan` (DB). The state derivation function was written and locked before any route code was touched:

```
BillingState: 'trial' | 'free' | 'pending' | 'basic' | 'pro' | 'cancelled'
```

Precedence: Pending (Shopify awaiting approval) → Active paid plans → Cancelled grace period → Trial running → Default free.

This went in the Cursor brief at the top, before the tasks. Cursor needed to understand the state model before it could implement any of the six state renders. Getting this wrong in Task 5 (the route rewrite) would have produced subtly wrong state derivations that only manifested in edge cases.

## The 9-task runbook

Every task used the hardened 5-block structure: FILES, TYPES, SKELETON, PROHIBITED, VALIDATE.

**Task 1** — Migration: one file, exact SQL, validate with a direct DB query. Done in isolation so nothing downstream fails on a missing column.

**Task 2** — Add `plan` column to Merchant type and `updateMerchantPlan` function. TypeScript interface extension, one model file. Validates with typecheck.

**Tasks 3 & 4** — Billing server functions: `parseAppSubscriptionDetails`, `createShelfSubscription`, `cancelShelfSubscription`. Exact function signatures in the TYPES block. No guessing.

**Task 5** — Full `app.billing.tsx` rewrite. This is the heavy task. JSX skeleton for each of the 6 states. PROHIBITED block explicitly named what Cursor tends to add to billing pages: urgency copy, modal dialogs for cancel, Plan Names in the Shopify API format mixed into display copy. VALIDATE: load each state by injecting DB state directly, confirm renders match the mock.

**Tasks 6 & 7** — Callback and webhook handlers. Write `plan` to DB when Shopify confirms subscription. Validate with a manual subscription trigger in test mode.

**Task 8** — Nav link in `app.tsx`. One component, one line.

**Task 9** — Soft paywall: remove the hard redirect from `app._index.tsx`. Validate that trial logic still gates correctly.

## What happened during the build

CI failed once — not from drift, but from a Polaris type mismatch. `Button onClick` is typed as `() => unknown`, not `(e: MouseEvent) => void`. Cursor added the event parameter (it's a common React pattern). TypeScript rejected it. One-line fix.

The CSS module path caused a CI failure on a follow-up PR: `app.billing.module.css` was in `app/routes/` which the Remix Babel plugin tried to parse as JS. Moved to `app/styles/`. CI green.

One behavioral discovery during testing: `throw redirect()` from an action in a Shopify embedded app breaks the session token. The fix was `return json({ exit: true })` and drive the exit from `useActionData()`. This wasn't in the original runbook — it was discovered during the billing walkthrough. Added to the session log as a permanent decision.

## When you know you're done iterating

Not when the design feels right. When:

1. All six states are covered by the mock
2. All six states match the mock in the browser
3. All applicable lock gates are passed
4. Tests pass (in this case, contract tests + typecheck)
5. The deploy checklist is complete and a canary confirms no regressions

"Feels right" is not a gate. "State 3 (cancelled) renders the correct banner with the correct copy and the correct button and typecheck passes" is a gate. The specificity is what makes "done" mean something.

---

**Action:** For your next UI build, write the state model before you write any JSX. If the feature has N states, draw the state transition diagram. Make sure every state has a mock before the runbook is written. The billing page build artifacts are in `feature-builds/billing-page/` in the Shelf repo. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
