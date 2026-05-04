---
title: "Treat your prompts like code"
description: "Prompts need semver. A wording fix is not the same as a schema change. The MAJOR/MINOR/PATCH/NO BUMP decision tree keeps your prompt history coherent and your migrations safe."
part: 5
post: 12
draft: false
tags: ["prompts", "versioning", "semver", "production", "llm"]
---

A prompt is code. Not in the sense that it compiles and type-checks — but in the sense that changing it changes the behavior of your system, has downstream effects, and needs to be versioned, tested, and rolled back if it breaks things.

Most people treat prompts like config: just edit the text and see what happens. That works until you have paying users who rely on consistent output, at which point "see what happens" is a bad production strategy.

## The three axes problem

On Shelf there are three different versioning axes that look similar but mean completely different things:

- **Product version**: `Shelf V1`, `Shelf V2`, `Shelf V3` — capital V, integer. Big product-level changes.
- **Prompt version**: `prompt v2.0.0`, `prompt v3.0.1` — lowercase v, three-digit semver. Changes to the Layer 4 system prompt.
- **Storage**: `layer4_cache`, `dashboard_intelligence_cache` — bare table name, no version.

"V3 runs on V3" means nothing. "Shelf V3 runs prompt v3.0.2, data flows through `dashboard_intelligence_cache`" is unambiguous. Without the nameology discipline, every conversation about a production incident requires a clarification step to establish which version of which thing is actually being discussed.

Write the convention in your `CLAUDE.md`. Enforce it in every artifact.

## The decision tree

Before touching a prompt, walk four questions in order:

**MAJOR (V3 → V4):**
- Adds or removes a JSON schema field, movement type, or enum value
- Changes voice, posture, or persona
- Adds a new card slot or movement category

**MINOR (3.2 → 3.3):**
- Changes which signals fire (new payload field consumed)
- Tightens or loosens the rubric (density, length, evidence depth)
- Adds or removes few-shot examples

**PATCH (3.2.1 → 3.2.2):**
- Wording fix, typo, contradictory rule resolved

**NO BUMP:**
- Adds a payload field but the prompt text stays frozen — you're enriching the data that reaches the prompt, not changing the prompt itself

The rule of thumb: the bump level reflects what *downstream* must do to absorb the change. Schema change = MAJOR, because parsers break. Wording fix = PATCH, because nothing breaks. Voice change = MAJOR, because merchants perceive a different product.

If two categories apply, take the higher one.

## What each level means in practice

**PATCH**: diff the change, run the adversarial harness against 10 fixtures minimum, confirm zero schema breaks and zero voice drift, ship. No pre-build lock required.

**MINOR**: run the NO BUMP path first if a payload field is involved (prove the prompt absorbs it before touching prompt text). Open a focused pre-build lock with Path A Gates 1, 2, 3, 4 only. Adversarial harness, full fixture set. No N-1 fallback required pre-revenue — rollback via redeploy is enough.

**MAJOR**: update canonical first if posture, voice, or slot is changing. Walk all Path A gates in the full pre-build lock. Adversarial harness, full fixture set, plus drift fuzzer. Ship behind a feature flag via Parallel Change: new prompt alongside old, routed by `merchants.prompt_version`. Set kill-date for the old version. Conditions: 100% merchants on N+1, zero schema warnings, zero bug reports. After kill-date, delete the old prompt code.

**NO BUMP**: build mocked payloads with the new field (populated, null, edge-cased, adversarial, minimum 10 fixtures). Run the frozen prompt against them. Measure drift, hallucination rate, and value. If all three pass, ship the data change alone — no prompt PR. If any fail, you've discovered you're actually in MINOR or MAJOR territory.

## The V2 → V3 migration on Shelf

The V2→V3 prompt migration was a MAJOR bump: new JSON schema shape, new card grammar, new voice register. The migration used Parallel Change:

1. V3 prompt implemented alongside V2 prompt in the codebase
2. Feature flag (`merchants.prompt_version`) routes each merchant to their version
3. V3 deployed to production, flagged to zero merchants
4. First flip: one merchant. Crawl triggered. Pydantic validated. Dashboard rendered.
5. Sunset criterion written before shipping: "Delete prompt v2 once 100% of merchants are on v3 for ≥14 days with zero schema validation warnings"
6. Kill-date logged: 30 days post-global flip

When UI drift was discovered after the initial ship, rollback was a single SQL statement: one merchant flipped back to `"2.0.0"`. No redeploy. No rollback PR. Total time: seconds.

The feature flag is the entire point. Without it, V3 ships to all merchants simultaneously and rollback is a 15-minute redeploy cycle during which every merchant is seeing broken output.

## What a prompt migration looks like end to end

1. Classify the change — walk the decision tree
2. If MINOR or MAJOR: update the canonical document if posture or voice is changing
3. Copy the pre-build lock template, fill Path A gates
4. Run the adversarial harness against existing fixtures
5. For MAJOR: write the new prompt in a versioned file (`v3_system_prompt.py`, not overwriting `v2_system_prompt.py`)
6. Ship behind the feature flag; expand rollout by merchant
7. Write the sunset criterion and kill-date before flipping the first real merchant
8. After kill-date conditions are met: open a separate PR to delete the old prompt file, old cache table entries, old type definitions

Step 8 is the step that doesn't happen without discipline. The old code sits there because deleting it feels like unnecessary work. Without a written kill-date and written conditions, the feeling wins. The dead code accumulates.

## The over-versioning / under-versioning failure modes

**Over-versioning**: calling a wording fix V4. Bloats the sunset ledger. Every major version bump requires a full migration cycle. Use PATCH for wording fixes — that's what PATCH is for.

**Under-versioning**: calling a schema break a PATCH. Breaks parsers in production. The test: if downstream parsers have to change (Pydantic models, TypeScript interfaces, component render logic), it's a MAJOR.

**Commingled changes**: a data change and a prompt edit in the same commit, where you can't tell which one moved the needle on output quality. This is why NO BUMP exists — it proves the prompt handles the new data field without touching the prompt.

---

**Action:** Look at your most recent prompt change. Walk the decision tree. Was it versioned correctly? If you changed voice or schema and shipped without a version bump, you have a production system where the prompt doesn't match the version label. Fix the label, write a kill-date for the previous behavior. The full decision tree is in `project-management/PROMPT-CHANGE-DISCIPLINE.md` in the Shelf repo. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
