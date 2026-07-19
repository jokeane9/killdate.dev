---
title: "Testing as part of the build"
description: "Tests aren't a cleanup pass. They're part of the runbook. Golden fixtures, contract testing across language boundaries, and the drift signal."
part: 3
post: 17
section: playbook
group: "Testing"
draft: false
tags: ["testing", "golden-fixture", "contract-testing", "build-process"]
---

By the time a feature ships, the tests should already exist. Not as a cleanup pass at the end of the build, not as a "we should add tests" line item in the next sprint — as part of the task that built the feature. This is only possible if testing is built into the runbook structure from the start.

The VALIDATE block in every shared-code task requires a passing test before the task closes. Cursor writes the feature and the test in the same pass. The review loop checks both. By the time Claude Code signs off, the test exists — not because someone remembered to add it, but because the task couldn't close without it.

## What always gets tested

Three categories get tests in every build, no exceptions:

**Shared code** — anything that multiple parts of the system depend on. Models, utilities, auth, data loaders. If a regression here breaks silently, it breaks silently everywhere that depends on it. That's the exact failure mode tests exist to catch.

**Data contracts** — the schema your pipeline produces and your frontend consumes. Especially important if your stack crosses a language boundary or if an AI model is generating structured output. The contract is the agreement between the producer and the consumer. When it drifts without a test to catch it, you find out in production.

**Integration points** — anywhere two systems exchange data. An API that feeds a UI. A pipeline that writes to a database that a route reads from. The handoff between a Python data layer and a TypeScript frontend. These are where silent failures live.

## The golden fixture

If your stack involves an AI model generating structured output — JSON, a schema, a typed response — you need a golden fixture.

The golden fixture is a single file: a real response from a real run of your pipeline, not an invented example. It contains exactly the fields your prompt produces, in the exact shape it produces them. It's the source of truth for what your AI output is supposed to look like.

Every validator in your stack runs against this one file. When the schema changes — a field gets renamed, a new field is added, a type changes — the fixture gets updated. When the fixture changes, every validator that depends on it breaks simultaneously. You cannot ship a partial update that passes on one side only.

This property is the whole point. Without the golden fixture, you can update the Python validation layer and forget the TypeScript layer. Both will pass their own tests. The mismatch only surfaces in production when a component renders empty with no error and no warning.

## Contract testing across language boundaries

If your stack crosses a language boundary — a Python pipeline producing output that a TypeScript frontend consumes — you need three layers of validation running against the same golden fixture:

**Strict schema validation on the input side** — Pydantic, JSON Schema, or equivalent. Validates the AI output before it reaches the database. Strict mode matters: a lenient validator coerces wrong types rather than rejecting them. Coercion masks the problem. Strict validation surfaces it as an error you can act on.

**Runtime contract test on the output side** — a test that runs the actual golden fixture through the actual type definitions at runtime, not just at compile time. TypeScript's type system checks at compile time against declared types — it doesn't check at runtime against actual data. The contract test closes that gap. A field that's declared correctly in the interface but accessed with the wrong nesting structure passes the type check and fails at runtime. The contract test catches this.

**Render smoke test** — one test that renders the actual components with the golden fixture data and confirms nothing throws. Not a full integration test. Just enough to catch "component tried to access a property that doesn't exist on this shape of data."

These three run together as a single command, with no database required. A schema change breaks at least one of them. You can't miss it.

```bash
# Run your contract suite — adapt to your stack
npm run test:contract       # TypeScript: schema contract + render smoke tests
python -m pytest tests/ -v  # Python: pipeline + schema validation tests
```

## The drift signal

The golden fixture tests one known-good case. For AI-generated output, that's not enough.

AI output drifts. The same prompt doesn't always produce the same structure — field names vary slightly across runs, optional fields appear or disappear, nesting shifts. A single golden fixture catches a broken schema. It doesn't catch a schema that's drifting gradually across production runs.

The drift signal comes from fuzzing: generating N variations of the input — different data shapes, missing optional fields, edge-case values — and validating every output against your schema. When 8 out of 10 runs produce valid output and 2 produce unexpected field names, you have a prompt drift problem before it reaches users. The golden fixture is your unit test. The fuzzer is your stress test.

---

**In the repo:** The contract test structure and a golden fixture template are pre-populated. Run this in Claude Code before writing any tests for a new shared-code task:

> Read the runbook for task [N]. Tell me what the VALIDATE criterion requires in terms of tests — what needs to pass, what shape the test should take, and whether this task touches a language boundary that needs a contract test.

After building a new AI output schema:

> I've updated the output schema for [pipeline/feature]. Walk me through what needs to change in the golden fixture, which validators need updating, and what the contract test command should confirm before I ship.
