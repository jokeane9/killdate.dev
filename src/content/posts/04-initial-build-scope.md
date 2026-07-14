---
title: "Scoping the minimum viable build (MVB) in Claude Code"
description: "Lock scope, build the mock, understand what you're shipping and why — before Cursor opens a single file. All of this happens in Claude Code."
part: 1
post: 7
draft: false
tags: ["mvb", "lock", "mocks", "claude-code", "build-process"]
---

**A note on scope:** This series covers how to build via agentic orchestration — not what to build or how to commercialize it. Those are separate fields. What you're building and whether it makes business sense should already be decided before you open a code editor. The product definition doc covers what the product is. This post covers how you execute the first technical build against that definition.

"Minimum viable build" is not "minimum viable product." An MVP is a product strategy concept — the smallest thing that validates a market hypothesis. A minimum viable build is a technical concept — the smallest build that proves your stack works end-to-end. They're not the same decision, they don't happen at the same time, and conflating them produces the wrong outcome in both directions.

---

The minimum viable build isn't a list of features. It's the smallest thing that proves the product works end-to-end — real infrastructure, real data flow, something a real user can actually touch. Preferably something commercially viable: a build a paying user can interact with, even in limited form. Tech is about making money, not producing sophisticated builds that go nowhere. The minimum viable build is also your first opportunity to test product assumptions against reality — CAC, activation rate, usage patterns, whether people come back. You can't learn any of that from a localhost demo.

Scope it too wide and you're building across multiple surfaces before you know if the core works. Multiple features in a single build is how drift becomes invisible: a shared type gets quietly refactored, an adjacent file gets "improved," and you can't tell what broke because you're debugging the interaction between half-built things.

**For a Node.js app with a Python data backend:** two builds, in sequence. Build 1 is the Node.js surface — two routes, two UI components, a live database connection. Build 2 is the Python layer — one data parsing file, one integration point. Build 1 ships and works. Build 2 is built against a working Build 1. At every point you have a verified base.

Infrastructure goes up before either build starts. ECS, RDS, ECR, secrets, deploy pipeline — all via CLI, not console clicks. Grant Claude Code CLI access and read every command it runs. The blast radius of an infrastructure mistake is larger than any application code mistake. One thing that will catch you before your first push: audit every tracked file for secrets. We found a plaintext database password in two commits during a pre-push audit, one session before the repo went public. Secrets Manager exists for this reason.

---

Before Cursor opens a single file, two things need to exist in Claude Code: a locked scope and a signed-off mock. This is the planning environment. Everything in this post happens here.

<div class="pipeline">
  <div class="ps">
    <span class="ps-num">01</span>
    <span class="ps-name">product def</span>
    <span class="ps-tool">marketing doc + product spec · already written</span>
  </div>
  <div class="ps ps--active">
    <span class="ps-num">02</span>
    <span class="ps-name">lock</span>
    <span class="ps-tool">freeze exactly what this build changes — and what it does not touch</span>
  </div>
  <div class="ps ps--active">
    <span class="ps-num">03</span>
    <span class="ps-name">mocks</span>
    <span class="ps-tool">HTML file confirming layout and data shape before any code</span>
  </div>
  <div class="ps">
    <span class="ps-num">04</span>
    <span class="ps-name">runbook</span>
    <span class="ps-tool">Cursor's instruction set · next article</span>
  </div>
  <div class="ps">
    <span class="ps-num">05</span>
    <span class="ps-name">code</span>
    <span class="ps-tool">Cursor executes · Claude Code reviews</span>
  </div>
  <div class="ps ps--prod">
    <span class="ps-num">06</span>
    <span class="ps-name">prod</span>
    <span class="ps-tool">GitHub Actions → AWS</span>
  </div>
</div>

## The lock

The lock template exists because of a specific failure: a build spec that named what was being added but didn't enumerate what wasn't changing. The AI agent read the gap as permission to rewrite the surrounding context. The code was technically correct per the spec. The spec was incomplete. Three hours of rework followed.

The primary job of the lock isn't to describe the feature. It's to enumerate invariants — every surface, route, table, and system that must behave identically after this build. Empty cell means investigate, not assume clean.

For the initial build, the lock for Build 1 makes one thing explicit above everything else: **Build 1 does not touch the Python layer. Build 2 does not touch the Node.js routes.** Written down. In the lock. Not implied.

The Scope section requires a single sentence stating what this build does that nothing existing does. If you can't write that sentence, the scope isn't defined yet. Descope or clarify before proceeding.

**Single invariant test:** confirm the change is expressible as *"V(N+1) = V(N) + exactly one surgical change."* If it can't be, split into multiple builds.

## The mock

The mock is a simple HTML file — two screens, real data shapes, no interactivity required. You're not designing; you're confirming the layout and what data each component expects before Cursor has to infer it from a description.

The mock does two things. First, it settles the data contract before the build starts — when you can see the component rendering, the TypeScript types and API response shape become derivable rather than invented. Second, it gives you something precise to point to when Cursor's output drifts. "This is not what the mock shows" is a precise correction. "This doesn't look right" is not.

The mock needs a companion doc: a section-by-section map of what each part of the UI is showing, what decision it traces back to, and what the empty/loading/error states look like. Without the companion doc the mock is a screenshot. With it, it's a spec.

## All of this happens in Claude Code

Lock and mock are planning-phase work. Claude Code is your planning environment — it reads the product definition doc, it knows the repo structure, it has the context to catch when the lock is inconsistent with the product spec or when the mock is missing a state that matters. Cursor doesn't have this context. Don't do planning work in Cursor.

The session pattern: open Claude Code, load the product definition doc, fill the lock via conversation, build the mock with Claude Code reviewing against the spec, sign off on both before you hand anything to Cursor. The runbook comes after — that's the next article.

## Testing starts in the MVB

The MVB is where you establish your test baseline. Not at the end of the project, not as a cleanup pass — here, as part of the build. Claude Code writes the test requirement into each runbook task as part of the VALIDATE criterion. Cursor implements the feature and the test in the same pass.

The rule: test shared code, skip the rest. Your data layer, your API contract, any function that multiple routes depend on — those get tests. A single-component UI that only exists on one page doesn't. Build the smallest test suite that protects the things that break other things.

If your stack crosses a language boundary — a Python data pipeline writing output that a TypeScript frontend consumes — set up the contract now. One golden fixture file, validated independently by both sides. When a schema field changes, both validators break simultaneously. You cannot ship a partial update that passes on one side only. The MVB is the right time to create this fixture because the schema is still simple. Adding it later means retrofitting a contract onto a system that's already drifted.

---

**In the repo:** `FEATURE-LOCK.md` and `FIRST-BUILD.md` are pre-populated. Run these in Claude Code in sequence.

**Lock**

> Open `FEATURE-LOCK.md` and `FIRST-BUILD.md`. Read both in full. Walk me through what each section is asking for in the context of my first build. Then ask me the questions you need answered — one at a time — to complete the lock for Build 1. Don't write the lock yet. Just ask.

**Mocks**

Mocks aren't pre-built — you create them in `feature-builds/_ux-reference/` before Cursor opens a file. Once the lock is filled, ask Claude Code:

> Based on the completed lock for Build 1, tell me the minimum my mock needs to show — what states, what surfaces, what data. Then tell me what format to build it in.
