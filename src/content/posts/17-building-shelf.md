---
title: "Building Shelf: a technical post-mortem"
description: "How we built a production Shopify competitor intelligence app end to end with this discipline — the stack, the pipeline, the prompting mistakes, and what the discipline actually gave us."
part: 4
post: 17
draft: false
tags: ["case-study", "pipeline", "shopify", "prompting"]
---

*3 minute read*

## What Shelf is

Shelf monitors your competitors on Shopify — pricing, inventory levels, active promotions, new product launches. Every morning a Claude-generated briefing lands inside the Shopify admin. One card. One signal. The merchant never leaves the admin.

Built for small merchants who can't afford a dedicated analyst and don't have time to check five competitor stores manually every day.

---

## The stack

**Frontend:** Remix, React, Polaris. Embedded in the Shopify admin via OAuth — merchants are already there, the app just appears.

**Database:** PostgreSQL, raw SQL, pg-boss for job scheduling. pg-boss lives in the same Postgres instance — no Redis, no separate queue. One fewer moving part.

**Pipeline:** Four-layer Python crawl running on AWS ECS/Fargate. Each layer is isolated — a failure in Layer 2 doesn't corrupt Layer 1.

- Layer 0: HTTP fetch
- Layer 1: Parse — pricing, inventory, promotions from HTML
- Layer 2: Enrich — Playwright for JS-rendered storefronts
- Layer 3: Metadata — competitor profile aggregation
- Layer 4: Claude synthesises the delta. What changed, what warrants attention.

**Infrastructure:** ECS Fargate, RDS, S3, CloudFront. GitHub Actions with OIDC auth — no long-lived keys in the repo.

**Build orchestration:** Claude Code holds session context and architectural decisions. Cursor executes against a scoped brief. Neither tool sees the whole system unsupervised.

---

## The prompting arc

The pipeline stabilised. The prompt didn't — we rebuilt it twice.

**V1** gave Claude the full delta and asked for a briefing. It always produced one — quiet cycle, nothing changed, didn't matter. The model was completing "write a briefing," not "determine if a briefing is warranted." It also described what was observed rather than what it meant. Journalism, not intelligence.

**V2** added cycle density awareness — judge whether the cycle was high or low signal, adjust verbosity. Better. Still inconsistent. The prompt was trying to observe, judge, summarise, and frame in a single pass.

**V3** rearchitected the job entirely. Structured intelligence summary routed to Sidekick. Voice shifted from "here's what happened" to "here's what warrants attention and why." V3 is a section within the dashboard, not the dashboard itself — one job, handed off cleanly.

Prompt versioning via semver meant we could A/B test versions with real merchants before flipping everyone. N-1 fallback meant revert in minutes without a deploy.

---

## What the discipline gave us

**The PRE-BUILD-LOCK.** Before any feature: what's changing, what's not, the sunset criterion, the blast radius. Writing it surfaces scope creep before a line of code is written. We killed two features mid-planning that would have silently widened scope.

**Kill-dates on every fallback.** When V3 shipped, V2 code stayed — but with a date. Not "we'll clean this up." An actual date in the lock, tracked in ROADMAP.md. Without it, parallel implementations accumulate indefinitely.

**CLAUDE.md as session state.** Every session starts with a context read. Sessions end where the previous one left off instead of burning twenty minutes re-establishing context.

---

## What we'd change

Validate the prompt before the pipeline. V1 should have been a much smaller proof of concept — does the briefing produce value for one merchant on one real cycle? We validated infrastructure thoroughly before we validated that question.

Shelf is live on the Shopify App Store. The discipline that built it is in [killdate-kit](https://github.com/jokeane9/killdate-kit).
