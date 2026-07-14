---
title: "Shipping a feature: staging, flags, kill dates"
description: "Staging validation, feature flags as rollback, canary rollout, kill dates, and the N-1 rule. What 'done' means when real users are in the product."
part: 2
post: 16
draft: false
tags: ["shipping", "staging", "feature-flags", "kill-dates", "canary"]
---

Cursor is done. Claude Code signed off on the review loop. The tests pass. Now you ship it — not to localhost, not to a preview environment, to production. Against real infrastructure, real data, real users.

The patterns here are not optional overhead. They're what make "ship fast" safe rather than reckless.

## Staging first

Before prod, staging. Staging is real infrastructure — same container, same environment variables, same network config as production. Not a permanent environment: spun up, validated, torn down.

What staging catches that localhost doesn't:
- Environment variable mismatches between what the app assumes and what the infra provides
- Container behavior — memory limits, startup sequence, health checks
- DB query performance at real scale
- Network-level issues: timeouts, service discovery, load balancer behavior

### Run the tests first

The first thing that runs in staging isn't a manual check — it's the automated test suite you've been building since the MVB. The tests for shared code, the contract tests that validate your data schemas across language boundaries, the regression suite that proves nothing that was working is now broken. These run before you touch a browser.

This is why building tests as you go matters, not as a cleanup pass at the end. By the time you're shipping a feature, the test suite is already the first line of staging validation. A contract test failure in staging is a schema drift you caught before real users saw it. A regression test failure is a broken invariant you caught before it compounded. The tests aren't documentation — they're the gate.

For more on what to test and what to skip, and how to build a contract that catches cross-language drift before it ships, see the testing posts in Part 3. The short version: test shared code that breaks other things when it breaks. Skip cosmetics and single-surface UI. Automate the checks that would otherwise require a manual walkthrough every deploy.

### Manual validation follows

The automated suite passes. Now the manual validation sequence mirrors the MVB walkthrough: trigger the feature end to end, check the database, confirm the data was written, confirm it's read back correctly, confirm it renders as the mock specified. Data moving through real infrastructure, not a seed file.

When staging catches something — automated or manual — fix it, redeploy to staging, run the suite again. You don't go to prod until both layers are clean.

## Feature flags as the rollback mechanism

Deploy to production behind a flag before any user sees it. The flag routes traffic — initially to zero users. The code is in prod but nobody's running it yet.

The deploy sequence:
1. Deploy to prod, flag off
2. Flip the flag for yourself. Validate in prod with real data.
3. Flip for one more user. Watch for 24–48 hours.
4. Expand to 10%, 50%, 100% as confidence builds.

Rollback at any point: flip the flag back. No redeploy. No migration. Seconds, not minutes.

The flag lives at the user level, not at the deploy level. One database update can flip one user back to the previous surface while everyone else stays on the new one. This is the difference between a rollback that takes five seconds and one that takes fifteen minutes and a postmortem.

## The N-1 rule

At any time: production runs version N. Version N-1 stays bootable as rollback. Version N-2 and earlier get deleted.

Every new version ships with two things written before it ships:

**Sunset criterion** — the measurable condition under which the previous version gets deleted. "Delete previous surface once 100% of users have been on the new version for ≥14 days with no bug reports." Not "when we feel good about it" — a specific, checkable condition.

**Kill date estimate** — when the sunset criterion is expected to be met. Write it in the PR description. Log it in `ROADMAP.md` as a standing item.

Without the kill date, previous versions accumulate. This is not theoretical — it happens on every project that skips it. Dead code on disk that nobody touches because nobody wrote down when to delete it. The cost of writing the kill date is five minutes. The cost of skipping it is mounting technical debt with no natural cleanup trigger.

## What "done" actually means

Done isn't "Cursor finished and CI passed." Done is:

- Automated test suite passes in staging
- Manual staging walkthrough clean
- Flag deployed to prod, validated against real data by you personally
- Canary expanded, no regressions observed
- Previous version has a written sunset criterion and kill date
- Lock invariants verified in production — the surfaces listed as unchanged are still unchanged
- `_log.md` updated, roadmap updated, any new known issues logged

That last step is the handoff to the next session. Skip it and the next session starts cold — no record of what shipped, no kill dates tracked, no continuity.

The walkthrough in production matters even when everything passed in staging. On the first real build, a function existed that was supposed to write to a table. The table existed. The queries that read from it existed. Nobody had called the function. The data was never there — discovered weeks later, with features built on top of the assumption that it was. Do the production walkthrough before you declare the feature done.

---

**In the repo:** Two prompts for the shipping phase:

> I'm about to ship [feature name] to staging. Read the lock's invariants inventory and the VALIDATE criteria from the runbook. Give me a step-by-step staging validation checklist — specific checks, in order, starting from deploy.

Before expanding beyond the canary:

> The canary for [feature name] has been running for [X days]. Read the sunset criterion I wrote for the previous version. Tell me if the condition has been met and what the next step is — expand rollout, extend the window, or flag something that needs addressing first.
