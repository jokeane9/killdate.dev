---
title: "Shipping the Minimum Viable Build"
description: "The lock is signed, the mock is approved. Now you write the runbook, hand it to Cursor task by task, and validate everything before it goes to production."
part: 1
post: 6
draft: false
tags: ["runbook", "cursor", "build-process", "production"]
---

The lock is signed off. The mock is approved. You're in Claude Code with a clear scope and a confirmed layout. Now you write the runbook — and then you hand it to Cursor.

This is where the two tools split. Claude Code is your planning environment. Cursor is your coding environment. The runbook is what connects them.

<div class="pipeline">
  <div class="ps">
    <span class="ps-num">01</span>
    <span class="ps-name">product def</span>
    <span class="ps-tool">done</span>
  </div>
  <div class="ps">
    <span class="ps-num">02</span>
    <span class="ps-name">lock</span>
    <span class="ps-tool">done · previous article</span>
  </div>
  <div class="ps">
    <span class="ps-num">03</span>
    <span class="ps-name">mocks</span>
    <span class="ps-tool">done · previous article</span>
  </div>
  <div class="ps ps--active">
    <span class="ps-num">04</span>
    <span class="ps-name">runbook</span>
    <span class="ps-tool">write it in Claude Code · Cursor executes it</span>
  </div>
  <div class="ps ps--active">
    <span class="ps-num">05</span>
    <span class="ps-name">code</span>
    <span class="ps-tool">Cursor · one task at a time · review each before the next</span>
  </div>
  <div class="ps ps--prod">
    <span class="ps-num">06</span>
    <span class="ps-name">prod</span>
    <span class="ps-tool">GitHub Actions → AWS · verify end-to-end</span>
  </div>
</div>

## Writing the runbook in Claude Code

The runbook is not a plan. It's a sequence of machine-executable instructions where each task has enough information that Cursor can complete it without interpretation. You write it in Claude Code — because Claude Code has the full project context, the lock, the mock, and the product definition doc. Cursor doesn't.

Every task has exactly five blocks. No exceptions for "simple" tasks — exceptions are where drift enters.

**FILES** — the explicit list of every file Cursor is allowed to modify. Hard boundary. This is the single highest-leverage thing in the runbook. Without it, Cursor opens an imported file, notices something it wants to improve, and refactors it. The PR has 12 changed files instead of 2. With it, scope is enforced at the file level.

**TYPES** — the TypeScript or Pydantic types the task produces or consumes. Written in advance. Cursor matches against them, it doesn't invent them.

**SKELETON** — the shape of the output. Not the implementation — the function signature, the component structure, the export. Cursor fills in a known shape, not one it chose.

**PROHIBITED** — explicit list of what this task must not do. No sort logic. No new dependencies without checking the registry. The things that seem reasonable but aren't in scope.

**VALIDATE** — how to confirm the task is done correctly. Specific, not vague. "Run the test suite and confirm the contract test passes" is a validation criterion. "Make sure it looks right" is not.

Sequence matters. Write it explicitly — which tasks depend on prior output, which can run in parallel. Before handing anything to Cursor, do a pre-flight pass: confirm every file in every FILES block actually exists, and confirm you know how to verify every VALIDATE criterion. A runbook with a stale file path or an unverifiable gate will produce output you can't trust.

## Handing to Cursor — one task at a time

The instinct is to hand the whole runbook and come back when it's done. That instinct is wrong. By the time you come back, drift has accumulated across four tasks and untangling it takes longer than the build would have.

Hand Cursor one task. Read what it produces. Validate before moving to the next one.

Three checks after every task:

**1. FILES check.** Every file Cursor modified must be in the task's FILES block. If it touched something outside, stop. The fix may be benign. The habit of expanding scope is not.

**2. VALIDATE check.** Run the criterion. If the runbook says the route returns a 200 with this shape, check it. Vague verification leads to discovering a problem at task 6 that originated in task 2.

**3. Mock check.** The output matches the mock — not "roughly." Data in the right place, correct states handled. A divergence is either a runbook gap (note the decision, update the runbook) or a Cursor interpretation (correct it before continuing).

## Reading the code, not just the diff

The diff shows what changed. Reading the code shows whether it makes sense.

For each task, read the files that were modified. Understand what the function does, not just that it was created. Ask yourself whether a new reader could follow it. This matters for two reasons: first, the AI produces confident-looking code that is structurally plausible but functionally wrong — wrong constant, missing null check, wrong index. Diffs don't surface this. Reading does. Second, you're building a mental model of the codebase you own.

When something looks wrong, don't tell Cursor to fix it directly. Bring it to Claude Code first: describe what you're seeing, ask it to read the specific file and check it against the runbook. Let Claude Code produce the precise correction, then hand that to Cursor. Vague corrections produce vague fixes.

The feedback loop per task:
1. Cursor executes
2. You read — FILES check, VALIDATE check, mock check
3. Drift found → Claude Code diagnoses → precise correction → Cursor re-executes
4. Clean → approve, move to next task

## Shipping to production

When the build is complete, it goes to production — not to localhost. The walkthrough that matters is the one that runs against real infrastructure with real data moving through the real pipeline.

GitHub Actions handles the deploy. ECS picks up the new container. Then you walk every layer in sequence: trigger the pipeline, check the database, confirm the data was written, confirm the route reads it, confirm it renders on screen. Not "the UI renders" — the data is actually there, written by the actual pipeline, readable by the actual queries.

This is where gaps in the foundation announce themselves. On the first real build, a function existed that was supposed to write to a table. The table existed. The queries that read from it existed. Nobody had called the function. The data was never there — discovered weeks later, with features built on top of the assumption that it was.

Do this walkthrough in production before you declare the build done.

## Getting used to the codebase

By the end of this build, you should know where everything is — not from reading the architecture doc, but from the review loop. You approved every type. You read every route. You asked Claude Code to explain every pattern you didn't immediately understand.

A codebase you've reviewed task by task is yours. A codebase you handed to Cursor and came back to belongs to the AI. The review loop is how ownership transfers.

---

**In the repo:** The runbook template and build rules are pre-populated. Start with these two prompts in Claude Code to understand the structure before you write anything.

**Understanding the runbook template**

> Open the runbook template. Walk me through what each block is for — FILES, TYPES, SKELETON, PROHIBITED, VALIDATE — and why each one exists. Then show me what a fully written task looks like using this structure, using my actual repo as the example.

**Understanding the review loop**

> Open the build rules. Walk me through the three checks that happen after each Cursor task — FILES, VALIDATE, and mock. Tell me what each one is protecting against and what a failure in each looks like in practice.
