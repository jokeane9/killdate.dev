---
title: "Testing without over-testing"
description: "Coverage targets are not the goal. Regression protection is. The 90/10 rule: test what breaks other things, don't test what doesn't."
part: 3
post: 8
draft: true
tags: ["testing", "90-10-rule", "regression", "philosophy"]
---

Here's the testing trap on AI-assisted projects: the AI agent will happily write tests for everything you ask it to. Coverage climbs. The test suite expands. And then you're maintaining a test suite that's twice as big as the codebase it's supposed to protect, half of which is testing CSS and single-route UI components that break constantly when you change anything.

The **90/10 rule** is the antidote. Test when changes touch shared code. Don't test when they don't. The goal is regression protection, not coverage targets.

## What triggers tests

On Shelf, the decision is explicit in `CLAUDE.md`:

> "Test when changes touch shared code: models, utilities, auth, loaders, or libraries used by multiple routes."

Shared code is the key phrase. If a change touches something that multiple other things depend on, a regression there silently breaks all of them. That's exactly what tests are for.

Concretely on Shelf, tests get written for:
- Changes to `app/models/` — the database layer that every route reads from
- Changes to `app/lib/` — shared utilities like the auth layer, the db connection pool, the paywall logic
- Any loader change that touches shared types
- Schema contract tests — the golden fixture that both Python (Pydantic) and TypeScript (Vitest) validate

When the V2→V3 migration changed the loader pipeline, the `tests/` suite had to be updated. That's correct — the loader is shared across every route that touches `layer4_cache`. Breaking it silently breaks the dashboard for all merchants.

## What doesn't trigger tests

Explicitly, from the same `CLAUDE.md` section:

> "Do not write tests for cosmetic changes, single-route UI tweaks, or CSS."

This sounds obvious until you're in a session with an AI agent that has a strong prior toward comprehensive test coverage. You'll change a CSS module, and the agent will ask if it should add snapshot tests. No. The answer is no.

A single-route UI component that only renders on one page and only depends on data from that page's loader is not shared code. Breaking it won't break anything else. A test for it adds maintenance surface with no meaningful regression protection. Skip it.

Same for copy changes, `Banner` copy, colors, spacing. If the change is visual and contained, no tests.

## What production actually taught

The **TESTING-LEARNINGS.md** file in the Shelf repo is a production failure register. Eight learnings. All eight are about what tests didn't catch — and why.

The pattern is consistent: tests were written against clean, well-formed fixtures. Production data was not clean. The features passed testing and failed in production.

**L-001** is the inventory velocity disaster. Built a feature on `inventory_quantity` from Shopify's `/products.json`. Worked perfectly in test fixtures — clean data, decreasing counts, nice velocity labels. Shipped it. Shopify removed `inventory_quantity` from the public products endpoint for all stores created after ~2017. The field returns `null` on 90%+ of production stores. Feature was completely silent for almost every real merchant. No error, no fallback, just nothing rendered.

The lesson: before building on any data field, verify that field exists in production across a representative sample of real stores. "The API docs say it's there" is not the same as "real stores return it."

**L-002** is the schema drift between Python and TypeScript. Claude's response JSON is validated by Pydantic in Python and consumed by TypeScript interfaces in Remix. When a field name changed (`competitor` → `competitor_name`), the Python side accepted both via a Pydantic alias. TypeScript crashed silently — component rendered empty where the field was used. Nobody had tested the handoff between the two validation layers.

The fix: a single golden fixture file (`layer4_golden_response.json`) validated by both Python and TypeScript independently. Schema change breaks one → it breaks both → you catch it before production.

**L-004** is about not asking an LLM to do math. V1 prompt asked Claude to compute market averages, format price deltas, assemble comparison grids. Claude does this mostly — but rounds differently across crawls, occasionally omits products, picks different emojis for the same category. The dashboard flickered. Merchants noticed and lost trust.

Lesson: never ask an LLM to do deterministic calculations. Same input should produce same output. If it should be deterministic, it belongs in code. The test for this is: does this function have a single correct answer given these inputs? If yes, test it. If not (judgment, synthesis, narrative), the LLM is fine and test fixtures are the wrong tool.

## The process rule that comes out of this

"Test messy first, perfection second." Every test suite needs a production-shape fixture before it needs a happy-path fixture. That means: null fields, empty arrays, missing optional keys, stale timestamps, mixed types.

On Shelf, the V2 test fixtures were explicitly built to include `homepage_extras` null, failed crawls, first crawl with no history, noisy signals, no merchant product overlap. Because L-001 through L-004 existed. The happy-path fixtures came after.

If you only have time for five fixtures, write: (1) null data, (2) stale data, (3) mixed freshness, (4) failed crawl, (5) first crawl with no history. The happy path is fixture #6.

## Practical application

Before writing any test on Shelf, three questions:

1. Does this change touch code that multiple other things depend on?
2. If this breaks silently, would anything else break silently with it?
3. Has a feature like this failed in production before, and why?

If the answer to 1 and 2 is no, skip the test. If 3 has a relevant entry in the learnings register, write a test that specifically targets that failure mode first.

The goal is not coverage. It's not "tests exist." It's that when something breaks unexpectedly, you find out before a merchant sees it.

---

**Action:** Read `TESTING-LEARNINGS.md` in the Shelf repo. Pick the learning most relevant to your current stack. Write one test that would have caught it. That test is worth more than 50 happy-path tests for components that only exist in one place. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
