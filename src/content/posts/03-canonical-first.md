---
title: "Define the product. Constrain the AI."
description: "Before any code, write the product definition doc. It's not product requirements — it's what you argue from, not what you argue about."
part: 1
post: 6
section: playbook
group: "The Minimum Viable Build"
draft: false
tags: ["product-definition", "documentation", "product-truth", "process"]
---

Here's a failure mode that's very easy to fall into when you're building with AI: you describe what you want in a prompt, the AI builds something, you iterate, and at some point you have code that represents a series of prompt conversations rather than a coherent product decision.

The product definition doc is the fix. It's a single source of truth that lives outside the code, outside the prompts, and outside any individual session. It contains the definitive answers to: what is this product, what does it do, what does it not do, and why.

**The product definition doc is what you argue from, not what you argue about.**

## What it is

The product definition doc isn't a feature spec. It's not a PRD. It's closer to a constitution — the thing that makes every downstream decision derivable rather than invented.

In practice, it tends to split into two documents that do two different jobs:

- **The marketing truth** — what the product IS. Positioning, language, who it's for, how to talk about it. Needs to be simple, evocative, conversion-oriented.
- **The product behavior truth** — how the product works. Architecture, pipeline behavior, product principles, the feature grammar, validation criteria. Needs to be precise, exhaustive, and testable.

The split matters because these two things pull in different directions. Combining them into one document produces something that fails at both jobs.

For small teams shipping fast, keeping both in the same repo as your code turns out to be more effective than it sounds. The context is right there when you need it — no switching between tools, no docs that drift away from what's actually built.

## Why the split matters in practice

Every feature build should start from the product definition doc. Before any code is written, read both docs and check for conflict between the proposed change and either document.

If there's a conflict, one of two things happens:
1. The feature adjusts to align with the product definition doc — build proceeds
2. The product definition doc gets updated first — build waits

This sounds slow. It isn't. It's what prevents spending three days building something that contradicts a product decision that was already made, documented, and forgotten.

The doc is also how you avoid re-arguing closed decisions. If a question has already been answered in it — explicitly, with rationale — then a session that starts to drift back to it hits a hard wall. Done.

## What the product definition doc contains

Every project's product definition doc will look different, but the load-bearing sections are consistent:

**The product thesis** — one or two sentences. What this is, for whom, doing what. Not a marketing tagline — a precise technical statement.

**What it does not do** — the NOT list is often more valuable than the does list. Every "should we add X" conversation ends faster when X is explicitly out of scope in writing.

**The principles** — the decisions that constrain every downstream choice. These aren't vibes — they're written constraints that fail specific builds when violated.

**The behavioral spec** — how the product actually works at a functional level. The stuff that would be inconsistently reinvented if it weren't written down.

**Validation criteria** — what does "correct" look like? What would you look at to confirm a build stayed aligned with the product definition doc?

## What happens when you skip it

You build toward what sounds right in the moment rather than what was decided. The AI agent does the same — it pattern-matches against your prompt history, not against a stable definition of the product. After several sessions of iteration, the code represents the AI's best interpretation of your accumulated prompts, not your product decisions.

The product definition doc doesn't prevent iteration. It gives iteration a fixed reference. You can change it — but you change it deliberately, with a clear rationale, and then propagate that change downstream. The doc gets updated; the code follows. Not the other way around.

## The doc before code, always

Every feature build follows the same sequence. The product definition doc is first because nothing downstream can be validated without it.

<div class="pipeline">
  <div class="ps ps--active">
    <span class="ps-num">01</span>
    <span class="ps-name">product def</span>
    <span class="ps-tool">marketing doc + product spec · lives in repo</span>
  </div>
  <div class="ps">
    <span class="ps-num">02</span>
    <span class="ps-name">lock</span>
    <span class="ps-tool">scope frozen · lock template filled out · no code until signed off</span>
  </div>
  <div class="ps">
    <span class="ps-num">03</span>
    <span class="ps-name">mocks</span>
    <span class="ps-tool">Claude Design for ideation · Figma for real mocks</span>
  </div>
  <div class="ps">
    <span class="ps-num">04</span>
    <span class="ps-name">runbook</span>
    <span class="ps-tool">Claude Code authors the step-by-step build plan</span>
  </div>
  <div class="ps">
    <span class="ps-num">05</span>
    <span class="ps-name">code</span>
    <span class="ps-tool">Cursor builds new surfaces · Claude Code spans multiple layers</span>
  </div>
  <div class="ps ps--prod">
    <span class="ps-num">06</span>
    <span class="ps-name">prod</span>
    <span class="ps-tool">GitHub Actions → AWS · S3 + CloudFront + Route 53</span>
  </div>
</div>

You cannot lock a feature spec against something that doesn't exist. You cannot evaluate whether a mock is correct if you have no definition of correct. Every artifact traces back to the product definition doc.

If you start from code, you have no foundation to trace back to. You have opinions, which are fungible.

---

**In the repo:** Two product definition docs are pre-populated with structure and examples — `marketing/canonical/MARKETING-TRUTH.md` and `marketing/canonical/BEHAVIOR-SPEC.md`. Open them in Claude Code and run this:

> Read `MARKETING-TRUTH.md` and `BEHAVIOR-SPEC.md` in full. Walk me through what each section is asking for, what's already filled in as an example, and what's blank. Then ask me the questions you need answered to complete the product thesis — one at a time.

That's the fastest way in. Answer the questions and the product definition doc writes itself.
