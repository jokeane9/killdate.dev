---
title: "When to test, when not to, and knowing your app"
description: "Coverage targets are not the goal. Regression protection is. And neither replaces actually understanding what you built."
part: 3
post: 12
draft: false
tags: ["testing", "90-10-rule", "judgment", "production"]
---

The testing trap in AI-assisted development isn't writing too few tests. It's writing too many of the wrong kind — and then trusting a green suite over your own understanding of the system.

An AI agent will write tests for everything you ask it to. Coverage climbs. The suite expands. You end up maintaining a test suite that's twice the size of the codebase it's supposed to protect, half of which tests CSS and single-surface UI components that break every time you make an intentional change. That's not regression protection. That's maintenance overhead that erodes your willingness to change anything.

## The 90/10 rule

Test when changes touch shared code. Don't test when they don't.

**Shared** means: if this breaks silently, other things break silently with it. Models, utilities, auth, data loaders, anything multiple routes or components depend on — these get tests. A regression in shared code is a silent regression everywhere downstream.

**Not shared** means: if this breaks, nothing else breaks with it. A single-surface UI component that only renders on one page. A CSS module. Copy changes. Colors, spacing, banner text. These don't get tests. A test for a contained UI element adds maintenance surface with no meaningful regression protection.

The rule goes in `CLAUDE.md` so it applies to every session without being re-explained. The agent reads it at session start and applies it to every task it writes. The VALIDATE block in a shared-code task includes a test requirement. The VALIDATE block in a cosmetic task doesn't.

## What production actually teaches

The failures that matter are not the ones your tests catch. They're the ones your tests didn't catch — and why.

The pattern is consistent across production failures: tests were written against clean, well-formed fixtures. Production data was not clean. Features passed testing and failed for real users.

**Build on fields that actually exist in production, not just in the docs.** API documentation says a field exists. Test fixtures use that field. The feature ships. In production, the field returns null for the majority of real users — either because the API removed it for newer accounts, or because the docs described an edge case, or because the fixture was invented. The feature renders nothing. No error, no fallback — just silence. Before building on any data field from an external source, verify it exists in real production data across a representative sample.

**Never ask an LLM to do deterministic calculations.** If your prompt asks an AI to compute averages, format numerical comparisons, or assemble data grids — the same input will not always produce the same output. The model rounds differently across runs, occasionally drops items, makes different formatting choices. The test passes on the fixture. In production, the output flickers. Users notice. The fix: if a function has a single correct answer given a fixed input, it belongs in code, not in a prompt. The test for this is simple — can I write an assertion that always passes? If yes, deterministic logic, write it in code. If no, AI judgment, prompts are fine.

**Test messy first, perfection second.** Every test suite needs production-shape fixtures before it needs happy-path fixtures. Null fields. Empty arrays. Missing optional keys. Stale timestamps. Mixed types. Failed pipeline runs. First run with no history. These are the shapes that real data takes. If you only have time for five fixtures, make them: (1) null data, (2) stale data, (3) mixed freshness, (4) failed run, (5) first run with no history. The happy path is fixture six.

## Your judgment is the overall test

This is the most important thing in this post, and the most consistently skipped.

YOLO'ing code with AI doesn't fail slowly. It fails fast — not because the test suite goes red, but because you stop understanding what you've built. You hand tasks to Cursor, the output looks right, CI passes, you ship. Three builds later, something breaks and you don't know where to look because you never actually read what Cursor produced.

A green test suite does not mean you understand your codebase. Tests validate that specific behaviors haven't regressed. They don't tell you whether the overall system makes sense, whether a function is doing something subtly wrong, whether a data flow has an assumption baked in that will break under a different production condition.

Your judgment — looking at code, reading diffs, understanding what a function actually does and not just that it exists — is the overall test. A developer who reads every PR, owns every diff, and can explain what each piece of the system does is more protected than one with 90% coverage who can't locate the source of a production bug.

The review loop exists for this reason. Claude Code reviewing Cursor's output after every task isn't bureaucracy — it's how you stay inside the codebase you're building. The codebase you reviewed task by task is yours. You know where things are, why decisions were made, what the edge cases are. The codebase you handed to Cursor and came back to when it was "done" belongs to the AI. You're a stranger in it.

Tests are a safety net. Understanding is the foundation. You need both, but if you have to choose what to prioritize, prioritize knowing your app.

---

**In the repo:** `TESTING-LEARNINGS.md` is pre-populated with a failure register template. Run this after any production incident or unexpected failure:

> Read `TESTING-LEARNINGS.md`. I just had a failure where [describe what happened]. Walk me through which learning category this falls into, what the root cause was at the test layer, and what one test would have caught it before it reached production.

When you're not sure whether to write a test:

> I'm about to change [describe the code]. Ask me the three shared-code questions: does this touch code multiple things depend on, would a silent regression here break other things silently, and has something like this failed in production before? Based on my answers, tell me whether this needs a test and what it should validate.
