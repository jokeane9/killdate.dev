---
title: "The V2 to V3 migration"
description: "The real eval stack behind migrating a production LLM prompt on Shelf — a 32-check scoring rubric, a one-way runner, 54 adversarial payloads, Pydantic strict validation, and a hard rule about who can approve prompt edits."
part: 6
post: 21
draft: false
tags: ["prompting", "evals", "migration", "v3", "shelf", "pipeline"]
---

*6 minute read*

## What we were migrating

Shelf V2 produced a fixed four-slot competitive intelligence report. V3 rewrote the entire surface: new JSON schema, new voice register, new card grammar, and prompt-level judgment about what to surface rather than filling fixed slots.

That's a MAJOR bump in our versioning discipline — schema change, voice change, new card types. The migration required a real eval process.

---

## The stack

**Four isolated Python layers.**
- Layer 0: HTTP fetch
- Layer 1: Parse — pricing, inventory, promotions
- Layer 2: Enrich — Playwright for JS-rendered storefronts
- Layer 3: Signal prep — ranking, market averages, trend computation
- Layer 4: Claude API — structured briefing from Layer 3 output

Each layer is independent. A prompt change in Layer 4 doesn't touch Layers 0–3. That isolation is what makes iteration safe.

**The eval tools.**

`EVALUATION.md` — a 32-check scoring rubric across four tiers:
- P1–P12: the 12 canonical principles (observational posture, peer-editorial register, card grammar, contrastive sourcing). Each has a precise pass/fail definition. Any single fail blocks the prompt.
- R1–R8: the rejection list. Hard fails — one hit disqualifies the readout. Action cards, prescriptive next steps, invented data, urgency language.
- N1–N6: the NOT list. Prompt constraints grep-checked against every output.
- C1–C6: hard card-grammar invariants.

`run.py` — a one-way runner. Runs the prompt against payloads, writes outputs to `readouts/`. Never touches the prompt. The loop is: run → score → stop → present → approve edits → re-run. No silent iteration.

`validate_readouts.py` — automated structural checks so human review can focus on semantic failures.

54 hand-written adversarial payloads — zero competitors, 200-SKU competitors, no pricing data, all competitors on sale, very long product names, partial crawl data, cross-indexed signals. Not generated. Generated payloads reproduce your assumptions about what's hard, not the actual hard cases.

Pydantic strict validation in production — every Layer 4 response rejected (not coerced) on schema deviation. Failures logged with field-level detail.

The fuzzer — N randomised input variations, schema pass rate reported. 95/100 means you have a latent bug even if most outputs look fine.

**Migration pattern — Strangler Fig.**
`merchants.prompt_version` column routes each merchant. V3 ran alongside V2. One merchant first, then expansion, then V2 deleted on a written kill-date.

---

## What the eval process found

**The pre-output narration problem.** On the first v3.0.0 smoke test, Claude was emitting 20 lines of reasoning text before the JSON block on constraint-heavy payloads. The "JSON only" instruction was buried at the bottom of a long prompt — by the time the model reached it, it had already started thinking out loud. Fix: OUTPUT PROTOCOL moved to the top. Top-of-prompt instructions are load-bearing.

**The dual-language contract test catch.** A field rename (`competitor` → `competitor_name`) passed Pydantic via alias but broke the TypeScript component silently. No error. Just blank sections. Fix: one golden JSON fixture validated by both Pydantic and Vitest simultaneously. A schema change breaks both. You can't do a partial update that passes.

**The fixture set we haven't maintained.** The 54-payload matrix was built during V3 development and is the most thorough eval surface we have. We haven't kept it current as the prompt evolved. Real gap.

---

## What we don't have

Automated quality scoring. Strict validation tells you the output is structurally correct. It doesn't tell you if it's good. A briefing can pass all 32 checks and still be generic or miss the most important signal. We evaluate output quality manually. That doesn't scale.

---

## What eventually started to matter

After the structural eval work, we flipped real merchants to V3 and the question changed. Does the merchant open the briefing? Do they act on it? Is the card weight matching the signal weight?

These aren't eval questions. They're product questions. And the test suite couldn't answer them.

The honest version: we built a rigorous process for testing whether the output was correct, then discovered that correct and valuable are different measurements.

---

## Learnings

- Top-of-prompt instructions are load-bearing. OUTPUT PROTOCOL goes first, always.
- Hand-write adversarial payloads. Generated ones test your assumptions, not the hard cases.
- One golden fixture, validated by both Python and TypeScript. Schema changes can't hide.
- Layer isolation makes prompt iteration safe — change Layer 4 without touching 0–3.
- Write the sunset criterion before the first user flip. It's the only reason old code actually gets deleted.
- Structural correctness and business value are different measurements. We optimised for one.

---

*Eval stack: `feature-builds/briefing-surface/PROMPT-VALIDATION/`. Fuzzer: `devops/validation/artifacts/scripts/fuzz_layer4_output.py`. Repo: [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)*
