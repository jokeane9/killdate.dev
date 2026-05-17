---
title: "Prompts that run for hours"
description: "Large context windows aren't for greenfield builds. They're for production systems where you need a second set of eyes across the whole thing — code reviews, bug traces, targeted refactors, throwaway prototypes."
part: 6
post: 19
draft: false
tags: ["prompting", "context-window", "claude-code", "production", "shelf"]
---

*3 minute read*

## Where large context actually earns its cost

We're not using 250–300K context sessions to build new features. We're using them on Shelf — a live production system — for a specific set of tasks where seeing the whole thing at once is the point.

**Code review from an external perspective.** Before resubmitting to Shopify's app review, we loaded the entire Shelf codebase into context and asked Claude to act as a senior Shopify reviewer. Not "does this look clean" — specifically: check webhook compliance, scope alignment with the privacy policy, billing flow edge cases, CSP headers, uninstall handler correctness. The output surfaced a scope mismatch (`read_orders` declared in the toml but explicitly excluded in the privacy policy) that would have caused a rejection. A human reviewer would have caught it too, eventually. The full-context pass caught it in one session.

**Bug tracing across layers.** When a production bug touches multiple layers — a crawl pipeline failure that surfaces as a blank dashboard section six requests later — reading the code file by file is slow and lossy. Loading the full request chain into context (Layer 0 fetch → Layer 3 signal prep → Layer 4 Claude call → Remix loader → component render) and asking "where does this break and why" produces a trace that correctly identifies the failure point faster than grep-and-read. We used this to diagnose a field rename (`competitor` → `competitor_name`) that passed Pydantic validation via alias but silently blanked a component because TypeScript read the old shape.

**Targeted refactors with blast radius awareness.** When we killed the V2 prompt — 1,968 lines deleted across `signals.server.ts`, `v2_system_prompt.py`, `v2_response_schema.py`, and the dual-write block — we loaded the full codebase first and asked for a complete dead code audit. What references V2 anywhere? What will break? The session produced a precise deletion list with zero unintended side effects. This is a case where the large context isn't doing creative work — it's doing mechanical verification that's tedious and error-prone to do by hand.

**Throwaway prototypes for decision-making.** Before committing to the Strangler Fig pattern for the V2→V3 migration, we ran a large-context session that implemented both approaches — in-place replacement and parallel operation with a feature flag — and compared them side by side. We didn't ship either implementation. We read them, picked the parallel approach, and started fresh. The session cost a few dollars and saved days of going down the wrong path.

---

## What it's not good for

New features on an established system. If the task requires new screen real estate, a schema migration, or new data entering the pipeline — large context sessions produce drift. The model is reasoning across too much existing code to stay focused on a narrow new surface. That's a Cursor build with a tight runbook, not a long Claude Code session.

---

## The pattern

Load the whole thing. Ask the question you'd ask a senior engineer who'd been on the project for a year. Get an answer that's grounded in the actual codebase, not a generalisation. Throw it away if it's wrong. Repeat.

The value isn't in the generated code. It's in the perspective — a complete, fresh read across a system that you've been too close to for months.

---

## Learnings

- Large context sessions earn their cost on production systems, not greenfield builds.
- "Senior reviewer" framing (Shopify reviewer, senior engineer, security auditor) produces more useful output than open-ended questions.
- Blast radius audits and dead code sweeps are the highest-ROI use — mechanical work that's tedious by hand and fast at 250K context.
- Throwaway prototypes for decision-making are underrated. Spend $5 to not spend a week on the wrong approach.
- Don't use this for new features. That's a different tool and a different process.

---

*Shelf repo: [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf). The V2 dead code audit: PR #226.*
