---
title: "When your LLM output stops being what you shipped"
description: "Prompt drift is real, subtle, and expensive to debug after the fact. Schema validation as a drift signal. The fuzzer. What to actually build — not theory."
part: 5
post: 13
draft: false
tags: ["drift", "prompt-drift", "schema-validation", "fuzzer", "production"]
---

You ship a prompt. Output looks right. Tests pass. Merchants are happy.

Two weeks later: merchant reports that the competitive intelligence section looks different. Not broken — different. The tone shifted. The structure is slightly off. A field that used to be present sometimes isn't.

You spend three days debugging. You eventually discover the prompt hasn't changed, the model version hasn't changed, but something in the distribution of inputs has shifted, and Claude is now interpreting the prompt slightly differently across a subset of cases.

This is **prompt drift**. It's not a bug in the conventional sense. It's the emergent behavior of a stochastic system interacting with changing real-world input distributions. Most people skip building detection for it. Then they spend three days debugging it.

Here's what to actually build.

## What prompt drift is

Drift enters from two directions simultaneously:

**Input drift**: the data flowing into the prompt changes distribution. On Shelf, this could mean: a competitor starts a sitewide sale (more promotional signals than usual), a merchant's competitor catalog grows (more products to compare), or a new competitor type appears that the prompt hasn't seen before. The prompt is the same; the output distribution shifts because the input distribution shifted.

**Model drift**: LLM providers update models without version changes. A model that was conservative with formatting in March might be more verbose in April. The prompt is the same; the model's interpretation shifted.

Both produce the same symptom: output that no longer matches what you shipped and validated.

## Schema validation as the first signal

The cheapest and most reliable drift detection mechanism is strict schema validation on every Claude response.

On Shelf, every Layer 4 output is validated by a Pydantic strict model before it touches the database. If Claude returns a field with the wrong type, adds a field that wasn't specced, or omits a required field — the validation fails. The failure is logged as a schema warning, not a crash. The previous cache entry is preserved. The merchant sees stale data rather than a broken page.

The key word is **strict**. A lenient validator coerces wrong types rather than rejecting them. Coercion masks drift — a string where a number should be gets coerced to a number, the validation "passes," the downstream component renders an incorrect value. You don't find out until a merchant mentions that a price looks wrong.

Strict mode means the validator rejects any deviation from the spec. Rejections accumulate as a time series. When rejections spike, you have a drift signal.

What to track:
- Schema validation pass rate per day (should be near 100%)
- Which fields are failing most often (tells you where the drift is)
- Whether failures cluster on specific merchants or specific competitors (input drift vs model drift)

## The fuzzer

Schema validation tells you when something breaks. The fuzzer tells you before something breaks.

The fuzzer on Shelf is `devops/validation/artifacts/scripts/fuzz_layer4_output.py`. It runs N variations of the prompt input against the Layer 4 system prompt and validates every output against the schema. Run it before any MINOR or MAJOR prompt change ships.

What it does:
1. Generates N test cases from the fixture set, randomizing: number of competitors, presence/absence of optional fields, edge-case values (very long product names, zero prices, missing homepage extras)
2. Runs each case through the frozen prompt (or the proposed new prompt)
3. Validates each output against the Pydantic schema
4. Reports: schema pass rate, field presence consistency, voice score variance across runs

If the pass rate is 95/100, you have a drift problem even though most outputs look fine. The 5% is telling you that under some real-world input distribution, the prompt breaks. Ship it anyway and you're debugging that 5% in production.

```bash
ANTHROPIC_API_KEY=sk-... python devops/validation/artifacts/scripts/fuzz_layer4_output.py --runs 10
```

Run it against the current prompt to establish a baseline. Run it against the new prompt to see if the change introduces variance. If the new prompt's pass rate is lower than the baseline, that's a regression before you ship.

## What actually broke on Shelf

L-002 in the testing learnings register is the concrete example. A field changed from `competitor` to `competitor_name` in the Layer 4 prompt. The Python Pydantic model was updated with an alias that accepted both. The TypeScript interface was updated separately.

In production, the component was reading a nested property with the old structure. No JavaScript error. No schema warning (because the Pydantic alias accepted both names). Just a blank section where competitor details should have been.

The fix was the golden fixture + dual validation pattern: one fixture file validated by both Pydantic and TypeScript Vitest tests. A schema change breaks both validators simultaneously. You can't do a partial update that passes.

The fuzzer would have caught this too — output field name inconsistency across runs is a classic fuzzer signal.

## The monitoring setup

On Shelf, the overnight health check (`devops/validation/overnight-status/`) runs at 4 AM. It includes schema validation of recent cache entries — comparing the shape of what Claude produced in the last 24 hours against the current Pydantic schema. Any deviation surfaces as a YELLOW in the next morning's status report.

The session greeting reads the most recent one or two overnight status files before doing anything else. If anything is YELLOW or RED, it gets surfaced first. This is how drift shows up before merchants report it.

What to log per cache entry:
- Schema validation pass/fail
- Field count (sudden change signals schema drift)
- Output token count (sudden increase signals verbosity drift)
- Time to generate (sudden change signals model behavior change)

These four metrics are cheap to collect and expensive not to have when you're debugging a drift incident.

## The practical build list

If you have a Claude pipeline producing structured JSON in production, here's the minimum viable drift detection setup:

1. **Strict Pydantic validation on every response** — reject, don't coerce. Log rejections with field-level detail.
2. **Golden fixture + dual language contract test** — one fixture, Python and TypeScript both validate it. Schema change breaks both.
3. **Nightly schema validation against recent cache entries** — compare last 24 hours of cache against current spec. Alert on deviation.
4. **Fuzzer run before any prompt change ships** — N variations, measure pass rate and variance. Require ≥ baseline pass rate before shipping.
5. **Field presence tracking** — which fields are present in what percentage of responses. A drop from 100% to 85% on a required field is a signal.

None of this is complicated. The fuzzer is 50 lines of Python. The nightly check is a SQL query + a Pydantic validation loop. The contract test is 30 lines of Vitest.

The people who skip it spend three days debugging in production. The people who build it spend three hours setting it up and then don't have that incident.

---

**Action:** Add strict Pydantic validation to your Claude pipeline today if you don't already have it. Coercive validation is not validation — it's silent failure. The Shelf schema validation setup, fuzzer, and overnight health check structure are all in the repo. Start with the golden fixture approach from post 9 and add the fuzzer before your next prompt change. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
