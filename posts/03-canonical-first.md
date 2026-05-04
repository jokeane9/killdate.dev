---
title: "Canonical first"
description: "Before any code, write the source of truth document. It's not product requirements — it's what you argue from, not what you argue about."
part: 1
post: 3
draft: true
tags: ["canonical", "documentation", "product-truth", "process"]
---

Here's a failure mode that's very easy to fall into when you're building with AI: you describe what you want in a prompt, the AI builds something, you iterate, and at some point you have code that represents a series of prompt conversations rather than a coherent product decision.

The canonical document is the fix. It's a single source of truth that lives outside the code, outside the prompts, and outside any individual session. It contains the definitive answers to: what is this product, what does it do, what does it not do, and why.

**The canonical is what you argue from, not what you argue about.**

## What it is

The canonical document isn't a feature spec. It's not a PRD. It's closer to a constitution — the thing that makes every downstream decision derivable rather than invented.

On Shelf, the canonical split into two documents that do two different jobs:

- `canonical-v1-2026-04-14-marketing.md` — what Shelf IS as a product. Positioning, language, the merchant model, how to talk about it. This is the marketing truth.
- The canonical-v2 set (navigated via `SHELF-CANONICAL-INDEX.md`) — how Shelf works. Architecture, pipeline behavior, product principles, the feature grammar, validation criteria. This is the product behavior truth.

The split happened because these two things pull in different directions. Marketing language needs to be simple, evocative, and conversion-oriented. Product behavior documentation needs to be precise, exhaustive, and testable. Combining them into one document produces something that fails at both jobs.

## Why the split matters in practice

Every feature build on Shelf starts at Gate 1: canonical alignment. Before any code is written, the builder reads both canonicals and identifies any conflict between the proposed change and either document.

If there's a conflict, one of two things happens:
1. The feature adjusts to align with the canonical — build proceeds
2. The canonical gets updated first — build waits

This sounds slow. It isn't. It's the thing that prevents spending three days building something that contradicts a product decision that was already made, documented, and forgotten.

The canonical is also how you avoid re-arguing closed decisions. If the question of whether Shelf should be observational or prescriptive has already been answered in the canonical — and it has, explicitly — then a session that starts to drift toward prescriptive voice hits a hard wall: that decision is in the doc, it was made, here's why. Done.

## What a canonical document contains

Every project's canonical will look different, but the load-bearing sections are consistent:

**The product thesis** — one or two sentences. What this is, for whom, doing what. Not a marketing tagline — a precise technical statement. On Shelf: "Shelf is a market intelligence layer for independent Shopify merchants. It crawls competitor storefronts, analyzes pricing and promotional signals, and delivers a weekly briefing — observational, not prescriptive."

**What it does not do** — the NOT list is often more valuable than the does list. Every "should we add X" conversation ends faster when X is explicitly out of scope in writing.

**The principles** — the decisions that constrain every downstream choice. On Shelf: observational not prescriptive, peer-editorial voice not SaaS-notification, simplicity over density. These aren't vibes — they're written constraints that fail specific builds when violated.

**The behavioral spec** — how the product actually works at a functional level. Slots, grammar, data flow, states. The stuff that would be inconsistently reinvented if it weren't written down.

**Validation criteria** — what does "correct" look like? What would you look at to confirm a build stayed aligned with the canonical? This is what Gate 4 (hypothesis mapping) and Gate 9a (fuzzer drift check) test against.

## What happens when you skip it

You build toward what sounds right in the moment rather than what was decided. The AI agent does the same — it pattern-matches against your prompt history, not against a stable definition of the product. After several sessions of iteration, the code represents the AI's best interpretation of your accumulated prompts, not your product decisions.

The canonical doesn't prevent iteration. It gives iteration a fixed reference. You can change the canonical — but you change it deliberately, with a clear rationale, and then propagate that change downstream. The canonical gets updated; the code follows. Not the other way around.

## Canonical before code, always

The pipeline on Shelf is: canonical → lock → mocks → runbook → code → prod. The canonical is first for a reason. You cannot lock a feature spec against something that doesn't exist. You cannot evaluate whether a mock is correct if you have no definition of correct. Every artifact in the pipeline traces back to the canonical.

If you start from code, you have no foundation to trace back to. You have opinions, which are fungible.

---

**Action:** Before your next feature build, write a one-page canonical: product thesis, NOT list, three to five principles, and what correct output looks like. It doesn't have to be perfect — it has to be written down and agreed on. The Shelf canonical structure is in the repo as a template. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
