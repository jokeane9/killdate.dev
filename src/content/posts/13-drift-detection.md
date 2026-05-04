---
title: "When your LLM output stops being what you shipped"
description: "Prompt drift is real, subtle, and expensive to debug after the fact. Schema validation as a drift signal. The fuzzer. What to actually build."
part: 5
post: 13
draft: false
tags: ["drift", "prompt-drift", "schema-validation", "fuzzer", "production"]
---

You ship a prompt. Output looks right. Tests pass. Users are happy.

Two weeks later: a user reports the output looks different. Not broken — different. The tone shifted. A field that used to be present sometimes isn't. The structure is slightly off.

You spend three days debugging. You eventually discover the prompt hasn't changed, the model version hasn't changed, but something in the distribution of real-world inputs has shifted, and the model is now interpreting the prompt slightly differently across a subset of cases.

This is **prompt drift**. It's not a bug in the conventional sense. It's the emergent behavior of a stochastic system interacting with changing real-world inputs. Most teams skip building detection for it. Then they spend three days debugging it.

Here's what to actually build.

## What drift is

Drift enters from two directions simultaneously:

**Input drift**: the data flowing into the prompt changes distribution. More edge-case inputs than usual. A new category of input the prompt hasn't seen. Data that's structurally valid but semantically different from the training distribution the prompt was written against. The prompt is the same; the output distribution shifts because the input distribution shifted.

**Model drift**: LLM providers update models without changing version identifiers. A model that was conservative with formatting in March might be more verbose in April. The prompt is the same; the model's interpretation shifted.

Both produce the same symptom: output that no longer matches what you shipped and validated. Both are invisible without instrumentation.

## Schema validation as the first signal

The cheapest and most reliable drift detection mechanism is strict schema validation on every model response.

Validate every AI output before it touches your database or gets served to users. If the model returns a field with the wrong type, adds a field that wasn't specced, or omits a required field — the validation fails. Log the failure with field-level detail. Preserve the previous cached result so users see stale data rather than a broken surface.

**Strict mode matters.** A lenient validator coerces wrong types rather than rejecting them. Coercion masks drift — a string where a number should be gets coerced through, validation "passes," the downstream component renders an incorrect value. You don't find out until a user reports that something looks wrong.

Strict mode means the validator rejects any deviation from the schema. Rejections accumulate as a time series. When rejections spike, you have a drift signal before users report it.

What to track per day:
- Schema validation pass rate (should be near 100%)
- Which fields are failing most often (tells you where the drift is concentrated)
- Whether failures cluster on specific input types (input drift) or appear evenly distributed (model drift)

## The golden fixture + dual validation

If your stack crosses a language boundary — an AI pipeline in Python producing output consumed by a TypeScript frontend — schema validation on one side is not enough.

A field changed from `competitor` to `competitor_name` in a recent build. The Python validation layer was updated with an alias that accepted both names — both passed. The TypeScript interface was updated separately. In production, a component was reading the data with the old nested structure. No error. No schema warning. Just a blank section.

The fix: one golden fixture file validated by both layers simultaneously. When the schema changes, the fixture changes. When the fixture changes, both validators break. You cannot ship a partial update that passes on one side only.

This pattern — one source of truth, two validators — is the cross-language contract. It catches the class of bug that each layer's independent tests miss entirely.

## The fuzzer

Schema validation tells you when something breaks in production. The fuzzer tells you before something breaks.

The fuzzer generates N variations of the prompt input — different input shapes, presence/absence of optional fields, edge-case values — and validates every output against the schema. Run it before any MINOR or MAJOR prompt change ships.

What it does:
1. Generates N test cases from your fixture set, randomizing input variation across the realistic range
2. Runs each case through the current or proposed prompt
3. Validates each output against the schema
4. Reports: schema pass rate, field presence consistency, variance across runs

If the pass rate is 95/100, you have a drift problem even though most outputs look fine. The 5% is telling you that under some real-world input distribution, the prompt breaks. Ship it and you're debugging that 5% in production.

Run it against the current prompt first to establish a baseline pass rate. Run it against the new prompt to see if the change introduces variance. If the new prompt's pass rate is lower than baseline, that's a regression before you ship.

```python
# Minimal fuzzer structure — adapt to your schema
import anthropic, json
from your_validators import validate_schema

client = anthropic.Anthropic()
results = []

for fixture in generate_fuzz_fixtures(n=50):
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": fixture}]
    )
    output = json.loads(response.content[0].text)
    results.append(validate_schema(output))

pass_rate = sum(r.valid for r in results) / len(results)
print(f"Pass rate: {pass_rate:.1%}")  # Require >= baseline before shipping
```

## The nightly health check

The fuzzer runs before you ship a change. The nightly check runs while nothing is changing, to catch model drift you didn't trigger.

Once a day, run schema validation against the last 24 hours of AI output in your cache or database. Compare the output shape against your current schema. Any deviation surfaces as a warning in the next session's status read.

This is how drift shows up before users report it. A session that opens with "3 schema warnings overnight, all on the `summary_text` field" tells you something specific changed in model behavior — you investigate before it becomes a user report.

Four metrics worth tracking per output entry:
- Schema validation pass/fail
- Field count (sudden change signals schema drift)
- Output token count (sudden increase signals verbosity drift)
- Time to generate (sudden change signals model behavior change)

These are cheap to collect. The absence of them is expensive when you're debugging a drift incident at 11pm.

## The minimum viable setup

If you have an AI pipeline producing structured output in production, here's the minimum viable drift detection:

1. **Strict schema validation on every response** — reject, don't coerce. Log rejections with field-level detail.
2. **Golden fixture + dual language contract test** — one fixture, validated from both sides of any language boundary. Schema change breaks both.
3. **Nightly validation against recent output** — compare last 24 hours against current schema. Alert on deviation.
4. **Fuzzer run before any prompt change ships** — N variations, measure pass rate against baseline. Require ≥ baseline before shipping.
5. **Field presence tracking** — which fields appear in what percentage of responses. A drop from 100% to 85% on a required field is a signal.

None of this is complicated. The fuzzer is ~50 lines of Python. The nightly check is a database query plus a validation loop. The contract test is ~30 lines of your test framework.

The teams that skip this spend three days debugging in production. The teams that build it spend three hours setting it up and don't have that incident.

---

**In the repo:** The drift detection setup — schema validator structure, fuzzer template, nightly check pattern — is pre-populated. Run this before shipping any prompt change:

> I'm about to ship a [MAJOR/MINOR/PATCH] prompt change. Run me through the pre-ship checklist: what the fuzzer needs to confirm, what the golden fixture needs to reflect, and what the baseline pass rate is that I need to meet or exceed.

When a schema warning surfaces:

> We had [N] schema validation warnings overnight, all on [field name]. Tell me whether this looks like input drift or model drift based on the pattern, and what the first diagnostic step is.
