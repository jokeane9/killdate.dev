---
title: "Building Shelf: a technical post-mortem"
description: "How we built a production Shopify competitor intelligence app end to end with this discipline — the stack, the pipeline, the prompting mistakes, and what the discipline actually gave us."
part: 4
post: 17
draft: false
tags: ["case-study", "pipeline", "shopify", "prompting"]
---

*10 minute read*

## What Shelf is

Shelf monitors your competitors on Shopify — pricing, inventory levels, active promotions, new product launches. Every morning a Claude-generated briefing lands inside the Shopify admin. One card. One signal. The merchant never leaves the admin.

It's a competitor intelligence tool built for small Shopify merchants who can't afford a dedicated analyst and don't have time to check five competitor stores manually every day. The product thesis is simple: remove friction from the competitive awareness loop.

Shelf is the first app built end to end with this discipline. Everything in killdate-kit was extracted from building it.

---

## The stack

**Frontend:** Remix, React, Polaris (Shopify's design system). Embedded in the Shopify admin via OAuth. The embedding is a constraint — Polaris components, admin chrome, session token auth — but it's also what removes the login problem. Merchants are already in the admin. Your app just appears there.

**Database:** PostgreSQL, raw SQL. No ORM. pg-boss for job scheduling — cron triggers, singleton keys to prevent duplicate crawl jobs, manual re-trigger without side effects. A small point that matters: pg-boss lives in the same Postgres instance. No Redis, no separate queue infrastructure. One fewer moving part.

**Pipeline:** Four-layer Python crawl pipeline running on AWS ECS/Fargate as on-demand tasks. Each layer is isolated — a failure in Layer 2 doesn't corrupt Layer 1 output.

- Layer 0: HTTP fetch. Standard requests library, BeautifulSoup, rate limiting.
- Layer 1: Parse. Structured product data, pricing, inventory signals, promotion detection from page HTML.
- Layer 2: Enrich. Playwright for JS-rendered storefronts — the stores that load pricing dynamically and would show empty results to a plain HTTP request. Homepage metadata, social signals, competitor profile extras.
- Layer 3: Metadata. Competitor-level aggregation, tech stack detection, profile enrichment.
- Layer 4: AI briefing. Claude synthesises the delta between this crawl and the last. What changed, what's significant, what warrants attention.

**Infrastructure:** ECS Fargate for the crawl tasks (on-demand, pay per run), RDS for Postgres, S3 for static assets, CloudFront, Route 53. GitHub Actions for CI/CD with OIDC auth to AWS — no long-lived keys in the repo.

**Build orchestration:** Claude Code and Cursor, with a hard boundary between them. Claude Code holds the session context — CLAUDE.md, the roadmap, architectural decisions, deploy operations. Cursor executes against a scoped brief: Remix routes, React components, Python pipeline layers. The discipline is in keeping those jobs separate. Claude Code makes the call; Cursor implements against a constrained scope. Neither tool sees the whole system unsupervised.

---

## The prompting arc: V1 → V2 → V3

This is where things got interesting. The pipeline stabilised. The prompt didn't — we rebuilt it twice.

**V1** was naive in the way first prompts always are. We gave Claude the full delta and asked it to produce a briefing. It did — every time, regardless of signal quality. Quiet cycle? Long briefing. Nothing changed? Still long briefing. The model was completing the task it was given, which was "write a briefing," not "determine whether a briefing is warranted and calibrate its length to what actually happened."

The failure mode is obvious in retrospect. The prompt had no concept of cycle density. It treated every morning as equally significant.

The other V1 problem: the briefing described what was observed rather than what it meant for the merchant. Competitors dropped prices — but was it a signal to match, or a clearance sale you should ignore? The prompt produced journalism. The product needed intelligence.

**V2** introduced cycle awareness — an instruction to judge whether the cycle was high-signal or low-signal and adjust verbosity accordingly. It helped. The briefings got shorter on quiet days. But the judgment was inconsistent. Some quiet days still produced padded output. The model was following the instruction in letter but not always in spirit.

The deeper problem we identified: the prompt was trying to do too many jobs at once. It was observing, judging, summarising, and framing — all in a single pass. The output reflected that. It was competent but never quite authoritative.

**V3** rearchitected the prompt's job. Rather than generating a full briefing, it now generates a structured intelligence summary routed to Shopify Sidekick. The voice changed from "here's what happened" to "here's what warrants attention and why." The format changed from a block of prose to structured sections with explicit hierarchy.

The bigger shift was structural: V3 is a section within the dashboard, not the dashboard itself. We stopped trying to make the AI briefing carry the entire merchant experience. It does one job — morning intelligence — and hands off to the broader dashboard for everything else.

Prompt versioning via semver (v1.x.x / v2.x.x / v3.x.x) meant we could A/B test versions against each other with real merchants before flipping everyone. N-1 fallback meant if V3 misbehaved we could revert in minutes without a deploy.

---

## What the discipline actually gave us

Build discipline sounds like overhead. In practice it was the only reason we didn't drift.

Three things in particular:

**The PRE-BUILD-LOCK.** Before any feature, you fill out a lock document: what's changing, what's explicitly not changing, the sunset criterion, the blast radius matrix. The act of writing it surfaces scope creep before a line of code is written. We caught two features mid-planning that would have silently widened the scope. The lock killed them before they started.

**Kill-dates on every N-1 fallback.** When V3 shipped, V2 code stayed in the codebase — but with a kill-date. Not "we'll clean this up eventually." An actual date, in the lock, tracked in ROADMAP.md. Without that mechanism, the codebase accumulates parallel implementations indefinitely and nobody has the authority to delete the old one.

**CLAUDE.md as session state.** Every session starts with a context read. Claude Code reads the log, the roadmap, the known issues. It knows what was done last session without you re-briefing it. The compound effect is real. Sessions end where the previous one left off instead of burning the first twenty minutes re-establishing context.

---

## What we'd change

The pipeline architecture held up. The prompt architecture didn't — we rebuilt it twice. In retrospect, V1 should have been a much smaller proof of concept: does the briefing produce value for one merchant on one real cycle? We validated the pipeline infrastructure thoroughly before we validated that question.

The other thing: the embedding constraint (Polaris, admin chrome, session tokens) added friction we underestimated. Shopify's embedded app auth model is opinionated and its edge cases are poorly documented. A session token expiry bug specific to a Shopify app bridge version cost us real time. The fix was three lines. Finding the right three lines was not.

Shelf is live on the Shopify App Store. The discipline that built it is in the kit.

