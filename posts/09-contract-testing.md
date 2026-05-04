---
title: "One schema, two languages, one golden fixture"
description: "When Claude generates structured JSON output, you need to validate it from both sides. One fixture file, validated by Python and TypeScript independently. This is the cross-language contract."
part: 3
post: 9
draft: true
tags: ["contract-testing", "schema", "pydantic", "vitest", "json-validation"]
---

Here's the failure mode nobody talks about until it bites them.

You have a Claude pipeline that returns structured JSON. You validate it in Python with Pydantic — schema passes. The TypeScript frontend consumes it — everything renders. You ship.

Two weeks later, a field gets renamed. You update the Python side. You don't update the TypeScript side — or you do, but you get the casing wrong, or the types don't match exactly. In production, the component renders empty. No error. No warning. Just a blank section where data should be.

This is **L-002** in the Shelf testing learnings register. It happened. It's not hypothetical.

## The bug that built the solution

On 2026-04-02, a field in the Layer 4 Claude response changed from `competitor` to `competitor_name`. The Python Pydantic model was updated with a field alias — it accepted both. TypeScript interfaces were updated separately. But in the update, the type didn't match exactly how the component was consuming it. TypeScript's type checker didn't catch it because the interface had the right name but the component was reading a nested property with the old structure.

Production: the competitor detail section rendered empty. No JavaScript error in the console. No schema warning. The data was there — it just wasn't being read.

The root cause: two independent validation layers maintained separately. A change to one didn't automatically break the other.

## The fix: one golden fixture, two validators

The solution is a **triple-layer contract**:

1. **One golden fixture file** — `layer4_golden_response.json` — the single source of truth for what Claude's JSON output is supposed to look like. Every field, every type, every nested structure.

2. **Python validation** — Pydantic strict models validate the golden fixture. If the fixture doesn't match the Pydantic schema, `npm run test:contract` fails.

3. **TypeScript validation** — a Vitest contract test validates the same golden fixture against the TypeScript interfaces. If the fixture doesn't match the TS types, the same `test:contract` run fails.

4. **Render smoke test** — one additional test that actually renders the components with the golden fixture data and confirms nothing throws. Not a full integration test — just enough to catch "component tried to access a property that doesn't exist."

The key property: **a schema change breaks both validators simultaneously.** You can't update the Python side without the golden fixture changing. When the golden fixture changes, the TypeScript test breaks. You can't ship a partial update.

## How it works in practice

The golden fixture (`crawl/fixtures/layer4_golden_response.json`) is a real Claude response from a real crawl — not an invented example. It contains exactly the fields the prompt specifies, in the exact shape the prompt produces them.

When someone wants to add a field to the Claude response — say, `time_elapsed` — here's what happens:

1. Update the Layer 4 prompt to produce the new field
2. Update `layer4_golden_response.json` with the new field
3. Update the Pydantic model to require the new field
4. Update the TypeScript interface to expect the new field
5. Run `npm run test:contract`

If step 4 is forgotten, the contract test fails on the TypeScript side. If step 3 is forgotten, it fails on the Python side. You cannot have a partial update that passes.

```bash
npm run test:contract  # Vitest: schema contract + render smoke tests (no DB needed)
cd crawl && PYTHONPATH=. python -m pytest tests/ -v  # Python: all pipeline + schema tests
```

These two commands together constitute the contract validation. They run independently — no database needed for either.

## What the Pydantic side catches

The Python layer catches malformed Claude output before it ever reaches the database. If Claude returns a field with the wrong type — a string where a number is expected, an array where a string is expected — Pydantic rejects it with a validation error. That error is logged as a schema validation warning, not a crash.

Strict mode matters here. A lenient validator would coerce the wrong type rather than reject it. Coercion masks the problem. Strict validation surfaces it.

## What the TypeScript side catches

The TypeScript contract test catches interface drift — places where the code has diverged from what Claude is actually returning. TypeScript's type system is excellent at this during development, but it only checks at compile time against declared types, not at runtime against actual data. The contract test runs the actual golden fixture through the actual type definitions and confirms they match at runtime.

The render smoke test catches a third category: component access patterns. TypeScript might accept a type that has a property `competitor_name`, but if the component is reading `data.competitor?.name` (old nesting structure), the type check passes but the runtime access fails. The smoke test catches this because it renders with real data.

## The drift signal

The fuzzer (`devops/validation/artifacts/scripts/fuzz_layer4_output.py`) extends this. Rather than testing one golden fixture, it generates N variations of the input — different competitor counts, missing optional fields, edge-case values — and validates every output against both schemas.

When Claude's JSON output starts deviating from the schema across runs, the fuzzer surfaces it. Not on a single golden case, but across the distribution of production-plausible inputs. That's the drift signal. If 8 out of 10 fuzz runs produce valid schema and 2 produce unexpected field names, you have a prompt drift problem before it reaches production.

---

**Action:** If your project has a cross-language boundary where structured AI output is consumed on one side and displayed on another, create a golden fixture file right now. Validate it from both sides. The Shelf contract test structure is in `tests/` — fork it and adapt it for your schema. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
