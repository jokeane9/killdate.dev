---
title: "The V2 to V3 migration"
description: "Tech stack, eval process, what broke, and how we eventually stopped testing correctness and started testing whether merchants actually cared."
part: 6
post: 21
draft: false
tags: ["prompting", "evals", "migration", "v3", "shelf", "langflow", "pipeline"]
---

*4 minute read*

## The stack

**Crawl pipeline — four isolated Python layers.**
- Layer 0: HTTP fetch
- Layer 1: Parse — pricing, inventory, promotions
- Layer 2: Enrich — Playwright for JS-rendered storefronts
- Layer 3: Signal prep — ranking, market averages, trend computation
- Layer 4: Claude API — structured briefing from Layer 3 output

Each layer is independent. A prompt change in Layer 4 doesn't touch Layers 0–3. That isolation is what makes iteration safe.

**Eval tools.**
- `EVALUATION.md` — 32+ checks across four tiers: P1–P12 (canonical principles), R1–R8 (rejection list), N1–N6 (NOT list), C1–C6 (card grammar invariants). Any single fail blocks the prompt.
- `run.py` — one-way runner. Outputs to `readouts/`. Never touches the prompt.
- `validate_readouts.py` — automated structural checks across all readouts.
- 54 hand-written adversarial payloads — edge cases, cross-indexed scenarios, partial crawls. Not generated. Generated payloads reproduce your assumptions, not the hard cases.
- Pydantic strict validation in production — every Layer 4 response rejected (not coerced) on schema deviation.
- Fuzzer — N randomised input variations, schema pass rate reported. Regression = lower than baseline.

**Migration pattern — Strangler Fig.**
`merchants.prompt_version` column routes each merchant. V3 ran alongside V2. One merchant first, then expansion, then V2 deleted. Kill-date written before the first flip.

---

## What we tested and what broke

The scoring rubric (P1–P12) forced precision we didn't have before. P1 — zero imperative verbs directed at the merchant — caught prompt drafts that sounded observational but buried a "consider launching" in the Angle section. P6 — every card needs a defensible discriminator for why this card, not another — killed half of our early drafts.

The most useful discovery came from the v3.0.0 smoke test. On constraint-heavy payloads, Claude was emitting 20 lines of reasoning text before the JSON block. Root cause: "JSON only" instruction was buried at the bottom of a long prompt. By the time the model reached it, it had already started thinking out loud. Fix: OUTPUT PROTOCOL moved to the top of the file. Top-of-prompt instructions are load-bearing in large prompts.

The dual-language contract test caught a field rename (`competitor` → `competitor_name`) that Pydantic passed via alias but TypeScript didn't. No JavaScript error. Silent blank sections in production. One golden fixture validated by both Pydantic and Vitest — a schema change breaks both simultaneously. 77 contract tests catching this class of failure.

What we didn't catch: quality. Structural validity ≠ good output. A briefing can pass all 32 checks and still be generic or miss the most important signal. We read outputs manually. That doesn't scale and we know it.

---

## When we started testing business value

The structural eval work consumed the first month. Then we flipped a real merchant to V3 and the question changed.

Does the merchant open the briefing? Do they act on it? Does the card weight match the signal weight — are we producing verbose cards on quiet weeks?

These aren't eval questions. They're product questions. And we couldn't answer them from inside the test suite.

The honest version: we built a rigorous process for testing whether the output was *correct*, then discovered that correct and *valuable* are different measurements. The briefing surface shipped clean. Whether merchants find it worth opening every week is what we're actually trying to learn now.

Langflow is where we're starting to prototype the next layer — connecting signal patterns to observed merchant behaviour before building anything. The local Postgres setup with production data means we can sketch those patterns against real crawl history, not toy data.

We're not there yet. But the pipeline structure, the eval discipline, and the Strangler Fig migration are the foundation. What sits on top of them is the part we haven't figured out.

---

## Learnings

- Layer isolation makes prompt iteration safe. Change Layer 4 without touching 0–3.
- Top-of-prompt instructions are load-bearing. OUTPUT PROTOCOL goes first.
- Hand-write adversarial payloads. Generated ones test your imagination, not the hard cases.
- One golden fixture, validated by both Python and TypeScript simultaneously. Schema changes can't hide.
- Structural correctness and business value are different measurements. We optimised for one and are still learning the other.
- Write the sunset criterion before the first user flip. It's the only reason the old code actually gets deleted.

---

*Eval stack: `feature-builds/briefing-surface/PROMPT-VALIDATION/`. Fuzzer: `devops/validation/artifacts/scripts/fuzz_layer4_output.py`. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)*
