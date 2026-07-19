---
title: "Zooming In, Zooming Out"
description: "The skill set that transfers between products isn't a framework or a stack — it's altitude control. How the same systems thinking shows up across Vizidex and DiagnosticIQ."
part: 6
post: 31
group: "Unfiled"
draft: true
tags: ["systems-thinking", "product", "craft", "philosophy"]
---

<!-- NOT APPROVED — John, 2026-07-19: "I never signed off on this - it sucks." Pulled from the essays section (no `section:` field = renders nowhere). Kept on disk pending a rewrite or a decision to bin it. Posts 34 and 36 still link to it — fix or remove those links before publishing.

DRAFT NOTE (John): Vizidex details now filled from the vizidex-engine repo (README + architecture review) — verify the "scoring idea didn't survive the numbers" framing is how you want the GEO-score kill described publicly. -->

*5 minute read*

We're building two products at once — Vizidex and DiagnosticIQ. Different domains, different users, different codebases. Almost nothing transfers between them at the level of code.

Almost everything transfers at the level above it.

A note that covers this whole run of posts: these are working notes from the middle of two builds — patterns we keep bumping into, written down so we can argue with them later. Some of it will turn out wrong. That's sort of the point of writing it down.

---

## The skill is altitude control

The work of building a product alternates between two positions. Zoomed in: this button, this query, this error state, this one user trying to do this one thing. Zoomed out: what is this product actually for, where does the value accrete, what would make someone pay for it twice.

Neither position is the skill. The skill is the *transition* — knowing when to change altitude, and being able to do it without losing the thread.

The failure mode I keep seeing — and have committed in both directions — is getting stuck at one altitude: camping at ground level shipping beautiful features nobody asked for, or hovering at 30,000 feet producing decks about products that never exist. The products that work seem to get built by people who move between the two constantly — sometimes within the same hour.

Working across two products at once forces this. You cannot hold both codebases in your head at ground level. What you can hold is the shape of each system: what it takes in, what it promises, where the user feels the value. When you drop into one of them to work, you're descending from that shape — and the shape tells you what's worth doing down there.

---

## What actually transfers

When we started the second product we expected to reuse code. We reused almost none. What we reused was a set of judgments:

**Where value accretes.** Every product has one surface where the user actually gets what they came for. Everything else — settings, onboarding, dashboards, docs — is overhead in service of that surface. Identifying it early changes every decision after. (More on this in a later post.)

**What to refuse to build.** Both products generate constant pressure to add surface area. A second view. A configuration option. An export. Zoomed in, each addition looks cheap. Zoomed out, each one is a permanent tax on comprehension — the user's and ours. The discipline of saying no transfers perfectly between products because it was never about the product. It's about the user's attention as a finite budget.

**Flexibility about what the problem even is.** The problem space is not fixed. DiagnosticIQ started as "diagnostics for WooCommerce stores" and keeps revealing itself to be something closer to "a store owner's four hours of investigation, done for them." Vizidex made the same move harder: it began as AI-citation monitoring, and the data itself killed the obvious product — the scoring idea didn't survive contact with the numbers — so it became something better: not a monitoring dashboard, but a junior PR agent that compresses three days of coordinator research into an hour. The willingness to reinterpret the problem mid-build — rather than defending the original framing — is the difference between shipping the plan and shipping the product.

---

## Simplification is a direction, not an event

The through-line across both products is a relentless bias toward removing things. Not minimalism as aesthetics — simplification as a *systems property*.

Every element on the primary surface competes for the same budget: the user's cognition. A product that asks the user to understand it before it helps them has the exchange rate backwards. The zoomed-out question is always the same: *what is this user paying attention to that they shouldn't have to?* Then you zoom in and delete it, or automate it, or collapse it into a decision that's already been made for them.

That's not a launch task. It's a permanent direction of travel. Every version of both products should ask less of the user than the version before — even as the systems behind them get more capable. Especially then.

---

## Why this matters more now

AI collapses the cost of the zoomed-in work. Code is cheap. Features are cheap. Whole surfaces are cheap. Which means — this is the part I'd put money on — the constraint has moved to the zoomed-out layer: knowing what the system is for, where its value concentrates, and what to leave out.

That shift also changes what a product can *be* — when the expensive part was execution, software had to expose its machinery to the user and make them operate it. When execution is cheap, you can hide the machinery entirely and sell the outcome. We've started calling that delivery model shellware, and it gets its own post.

Two products, one skill we keep practicing: changing altitude on purpose, and simplifying at every level we visit.
