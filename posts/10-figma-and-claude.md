---
title: "Figma + Claude: how iterative design actually works"
description: "Three tools, three jobs, no overlap. Figma decides shape. Claude Design prototypes. Claude Code implements. The gap between them is where drift lives."
part: 4
post: 10
draft: true
tags: ["design", "figma", "workflow", "ui-ux", "iteration"]
---

The phrase "iterative design" usually means: open Figma, move things around for a while, call it done, hand it to someone to build. That's not iteration — that's exploration with a UI tool.

Actual iteration, in an AI-assisted workflow, means something more specific: a defined sequence where each step has a clear artifact, a clear gate, and a clear owner. You iterate until you reach a lock. Then you build.

## Three tools, three jobs

The Shelf design workflow runs on three tools with hard boundaries between them:

**Figma** decides shape. Layout, hierarchy, spacing, components. This is where "what does this look like" gets answered and then locked. The locked Figma frame is the spec — not a reference, not a suggestion, the spec. Claude Code implements exactly what Figma locked.

**Claude Design** (Claude's artifact mode) prototypes against real code. It's good for additive changes to existing screens — a new button, a first-run state, a new card type — because it's anchored to real code and can't drift toward imaginary UI. It's not the right tool for blank-canvas redesigns. Use Figma for those.

**Claude Code** implements what Figma locked. Zero interpretation. The spec is the spec.

The gap between "designed" and "built" is where drift lives. This workflow closes it by making each tool responsible for one thing and not overlapping with the others.

## Setup

One Figma page per feature, not per session. Three frame columns: `Current` (locked import of what exists now), `Working` (the target), `Explorations A/B/C`.

Lock the `Current` frame immediately. Never edit it. It's the "what exists now" reference. Every decision you make in `Working` is relative to `Current`. If you lose the reference, you're designing against your own imagination, not against the actual product.

**Figma drift** — importing a screen then redesigning without locking the original — is the most common failure mode in this workflow. You lose the reference and start making decisions without knowing what you're changing relative to what.

## The SingleFile workflow

The practical entry point for capturing a real production screen into Figma: the SingleFile browser extension captures the page as a single HTML file, then `html.to.design` imports it into Figma as an editable frame. You get the actual production UI as your `Current` frame — not a screenshot, an editable Figma component.

This is the thing that closes the divergence between mocks and production. If you build mocks without this step, you're mocking from memory or from old screenshots, and they'll diverge from what's actually in the browser. SingleFile + html.to.design gives you the source of truth.

## Tokens: minimum viable

Pre-revenue, you don't need a full design system. You need four token sets that match Polaris exactly:

- **Colors**: bg, surface, border, text, muted, accent, success, warning
- **Type**: page title, section title, body, meta, label
- **Spacing**: 4/8/12/16/24/32 — the Polaris spacing scale
- **Radius**: 8/12/16

That's enough to speak consistently with Claude. Don't build a full component library before you have real users — premature components add drag without value.

## How iteration actually works

The iteration process is gated, not open-ended. On Shelf, the pipeline is:

```
canonical → lock → mocks → runbook → code → prod
```

Mocks come before the runbook, which comes before any code. The mock sign-off (CP-2) is where design gets locked. After CP-2, no design changes without restarting from CP-1.

This is what "iterative but not infinite" means. You can iterate as much as you need in the mock phase — explore in Figma, prototype in Claude Design, refine, compare. But the moment CP-2 is signed off, design is frozen. The runbook is written against the locked mock. Claude Code implements the locked runbook.

The billing page mock on Shelf was a 7-tab HTML file: a state map showing all plan transition flows, plus six individual state renders (trial active, free, pending approval, basic active, pro active, cancelled). That was the artifact that got signed off. Not a single-state mockup, not a rough sketch — all six states, fully specified, before a line of code was written.

## The Claude Design prompt structure

When handing a design problem to Claude Design, one reusable prompt structure works:

```
I'm working in Figma on the Shelf Shopify dashboard.

Source of truth:
- Current screen: [frame name] — existing implementation, do not change
- Working frame: [frame name] — target for this change

Goal: [one sentence]

Constraints:
- Shopify admin embedded — must feel native
- Polaris-compatible structure only
- No flashy marketing UI
- Preserve: [list what must stay]

Focus: [what specifically to improve]
```

The `Preserve` list is the equivalent of the PROHIBITED block in runbooks. It names what cannot change, not just what should change.

## Single surgical change applies to design too

The same invariant that governs code — `V(N+1) = V(N) + exactly one surgical change` — applies in the design phase. One feature per Figma workspace page. One thing changing at a time.

"While we're here let's also redesign X" is scope creep in design, same as in code. It produces mocks that can't be reviewed cleanly, locks that can't be tested precisely, and builds that can't be validated independently.

---

**Action:** If you have an existing screen you want to redesign, run SingleFile on it, import it to Figma with html.to.design, lock it as `Current`, and do all your exploration in `Working`. The locked `Current` frame will save you from designing against an imaginary version of the product. The Shelf design workflow is documented in `project-management/DESIGN-WORKFLOW.md`. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
