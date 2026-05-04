---
title: "Treat your prompts like code"
description: "Prompts need semver. A wording fix is not the same as a schema change. The MAJOR/MINOR/PATCH/NO BUMP decision tree keeps your prompt history coherent and your migrations safe."
part: 5
post: 12
draft: false
tags: ["prompts", "versioning", "semver", "production", "llm"]
---

A prompt is code. Not in the sense that it compiles and type-checks — but in the sense that changing it changes the behavior of your system, has downstream effects, and needs to be versioned, tested, and rolled back if it breaks things.

Most people treat prompts like config: just edit the text and see what happens. That works until you have users who rely on consistent output, at which point "see what happens" is a bad production strategy.

## The three axes problem

If your product has a version, a prompt has a version, and a data store has a name — these three things are not the same axis and must never be conflated.

- **Product version**: `V1`, `V2`, `V3` — capital V, integer. Big product-level changes that affect the whole system.
- **Prompt version**: `v2.0.0`, `v3.0.1` — lowercase v, three-digit semver. Changes to the system prompt.
- **Data storage**: bare table or cache name, no version appended.

"V3 runs on V3" means nothing. "Product V3 runs prompt v3.0.2, data flows through `intelligence_cache`" is unambiguous. Without this convention, every conversation about a production incident requires a clarification step to establish which version of which thing is actually being discussed.

Write the convention in your `CLAUDE.md`. Enforce it in every artifact — lock, runbook, log entry, PR description.

## The decision tree

Before touching a prompt, walk four questions in order. The bump level reflects what downstream must do to absorb the change.

**MAJOR bump:**
- Adds or removes a JSON schema field, type, or enum value
- Changes voice, posture, or persona
- Adds a new output category or card type
- Downstream parsers (Pydantic models, TypeScript interfaces, render components) must change

**MINOR bump:**
- Changes which signals fire or which data fields are consumed
- Tightens or loosens the output rubric (density, length, evidence depth)
- Adds or removes few-shot examples

**PATCH bump:**
- Wording fix, typo, contradictory rule resolved
- Nothing downstream needs to change

**NO BUMP:**
- Adds a data field to the payload but the prompt text stays frozen — you're enriching the data that reaches the prompt, not changing the prompt itself

If two categories apply, take the higher one. The rule of thumb: the bump level reflects what *downstream* must do to absorb the change. Schema change = MAJOR, because parsers break. Wording fix = PATCH, because nothing breaks.

## What each level means in practice

**PATCH**: diff the change, run your validation harness against 10 fixtures minimum, confirm zero schema breaks and zero output drift, ship. No pre-build lock required.

**MINOR**: run the NO BUMP path first if a data field is involved — prove the frozen prompt handles the new field before touching prompt text. Open a focused pre-build lock. Run the full fixture set. No feature flag required if rollback via redeploy is fast enough.

**MAJOR**: update the product definition doc first if voice, posture, or output shape is changing. Walk all lock gates. Run the full fixture set plus the drift fuzzer. Ship behind a feature flag using Parallel Change: new prompt alongside old, routed by a per-user version field in the database. Write the sunset criterion and kill-date before flipping the first user.

**NO BUMP**: build mocked payloads with the new field — populated, null, edge-cased, adversarial, minimum 10 fixtures. Run the frozen prompt against all of them. Measure drift and hallucination rate. If all pass, ship the data change alone with no prompt PR. If any fail, you've discovered you're actually in MINOR or MAJOR territory.

## A MAJOR migration in practice

A recent MAJOR prompt migration — new JSON schema shape, new output categories, new voice register — used Parallel Change:

1. New prompt implemented alongside the old prompt in the codebase
2. A per-user version field in the database routes each user to their prompt version
3. New prompt deployed to production, routed to zero users
4. First flip: one user account. Pipeline triggered. Validation passed. Output rendered correctly.
5. Sunset criterion written before shipping: "Delete old prompt once 100% of users are on the new version for ≥14 days with zero schema validation warnings"
6. Kill-date logged: 30 days post-global flip

When output drift was discovered after the initial ship, rollback was a single database update: one user flipped back to the previous version. No redeploy. No rollback PR. Total time: seconds.

The feature flag is the entire point. Without it, the new prompt ships to all users simultaneously and rollback requires a 15-minute redeploy cycle during which every user is seeing the degraded output.

## The failure modes

**Over-versioning**: calling a wording fix a MAJOR bump. Bloats the migration ledger. Every major bump requires a full parallel change cycle. Use PATCH for wording fixes — that's what PATCH is for.

**Under-versioning**: calling a schema break a PATCH. Breaks parsers in production. The test: if downstream parsers have to change — type definitions, validation models, render components — it's a MAJOR.

**Commingled changes**: a data field change and a prompt edit in the same commit. You can't tell which one moved the needle on output quality. This is why NO BUMP exists — it proves the frozen prompt handles new data without touching the prompt, so each axis of change can be attributed independently.

---

**In the repo:** The prompt change discipline template is pre-populated with the full decision tree and migration checklist. Run this before any prompt change:

> I'm about to change the system prompt. Here's what I'm changing: [describe]. Walk me through the decision tree — MAJOR, MINOR, PATCH, or NO BUMP — and tell me what process I need to follow before shipping this.

Before flipping a MAJOR change to the first real user:

> Read the sunset criterion and kill-date I wrote for the previous prompt version. Confirm they're specific enough to be checkable — not "when we feel confident" but a measurable condition. If they're not, help me rewrite them.
