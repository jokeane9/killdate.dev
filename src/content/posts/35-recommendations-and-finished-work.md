---
title: "A Hunch About the Next 90% SaaS Margins"
description: "SaaS earned its 80% margins selling access to tools — dashboards you operate yourself. My hunch is the next tier sits somewhere else: recommendations and finished work, one click from live. Two Shopify examples, and what we're learning about how hard this is to build."
part: 6
post: 35
section: essays
group: "Shorts"
draft: true
tags: ["product", "recommendations", "shopify", "agents", "discovery", "design-paradigm"]
---

<!-- DRAFT NOTE (John): reframed per your note — premise-first (recommendations + finished work, one-click), two Shopify openers, extrapolation, then the design challenges with DiagnosticIQ as the worked example. "Seam" vocabulary dropped; the theory survives in plain language inside the challenges section. Old file 35-finding-the-seams.md deleted. -->

*5 minute read*

SaaS earned its famous 80% gross margins selling **access to tools**: seats, licenses, a login to a dashboard that helped you do the work yourself. Fair deal — tools were the best software could offer, and the alternative was hiring.

My current thinking — stated plainly so it can be tested, and wrong in ways I'll find out about — is that the next tier of margin, the 90% kind, the kind priced against labor instead of against other software, won't be found there. I think it gets found in two things: a **recommendation** the customer recognizes as right, and the **work already finished**, one click from live. Everything between those two and the user is overhead. (The pricing conversation already has names for this — "service-as-software," outcome-based pricing. My interest is the other half: what the interface has to be for a customer to actually pay that way.)

Two Shopify examples make it concrete.

**A merchant's checkout abandonment jumps three points.** The dashboard version of help: here are your funnel analytics, go investigate. The version she'd actually pay for: *"Abandonment spiked Tuesday — it's the new shipping rate on orders under $50. Recommendation: free-shipping threshold at $45; margin impact is covered by the recovered carts. The threshold change and announcement banner are built — publish."* One click. She reads it, recognizes it — she's diagnosed this before, it took a weekend — and approves it from her phone.

**A colorway isn't moving, six weeks before the fall drop needs the cash and the shelf space.** The dashboard version: an inventory report with an aging column. The payable version: *"This line won't clear by September at current velocity. Recommendation: 20% end-of-line promotion now. The discount is scheduled, the collection page is built, the email to past buyers of this category is drafted — approve, or see the two alternatives."* The recommendation is the thinking; the drafts are the finished work; the click is the whole interface.

I think the premise extrapolates well past commerce. Bookkeeping: not a transaction feed — the quarter categorized and the filing prepared. Recruiting: not a resume database — the shortlist with drafted outreach. Development: not a static-analysis report — the pull request, ready to merge. Marketing: not campaign analytics — next month's campaign, built, scheduled, pending approval. Same shape every time: conclusion on top, finished work behind it, [one click](../34-one-click/) between the customer and done.

---

## Simple to say, hard to design

Stating the premise takes a paragraph. Building it is the hardest design work I've done — and it *is* design, in its deepest sense: not arranging screens, but deciding which steps of a human's workflow a machine may absorb and which it must respect.

DiagnosticIQ is the worked example. The promise is exactly the premise: a WooCommerce store owner gets *"here's what's wrong, here's the fix, apply it"* instead of a diagnostics console. Delivering that has meant bumping into, one at a time, the challenges the premise hides:

**Which steps can collapse is non-obvious.** The owner's four-hour investigation looks like pure toil, but some of those steps are where her judgment quietly forms — collapse the wrong one and the recommendation arrives unrecognizable, unearned. Others that look essential are ceremony. The official description of anyone's workflow is reliably wrong about where the real work happens, and you can't tell which is which from outside the building.

**"Finished" has a safety edge.** Prepared work that touches a live store — a config change, a discount, a fix — has to be genuinely one-click *and* genuinely reversible, with the [alternatives one gesture away](../34-one-click/) for the day the top recommendation is wrong. A recommendation with no exits converts one miss into abandoned trust.

**The thinking must be visible, but barely.** Just enough of the chain's reasoning — what was checked, what was ruled out — that an experienced owner [recognizes competent work](../33-the-primary-surface/), the way she'd recognize a good contractor's. Dump the full trace and you've rebuilt the dashboard out of paragraphs.

**You're testing recommendations, not features.** A dashboard makes no claims; it gets judged like furniture. A recommendation sticks its neck out and gets judged like a colleague's work — *is this right, would I have concluded this, do I trust you with the next one?* That's a far more human and far more difficult bar, and it's the entire reason the product is worth paying for. Meeting it takes [evals](../32-shellware/), not unit tests: continuous, empirical grading of whether the thinking holds up.

---

## The method: constant contact

None of these challenges resolve at a desk, because the answers live in the tacit layer of how people actually work. So the method is Steve Blank's — there are no facts inside the building — updated for what building now costs:

Ask about events, not preferences: *walk me through the last time. Where did it end? What crossed the desk? Who judged it?* Then build the smallest version that finishes the work, put it into the real workflow on the real calendar, and watch what the practitioner does — not what they say. Where they approve, you've found it. Where they quietly redo a step you collapsed, you've found a load-bearing one no interview would have surfaced.

And don't linger in the questioning — that used to be prudence when building was expensive; now that agentic chains actually work and a probe takes days, it's avoidance. This is a contact sport: customers beat you up over the ranking, the timing, the missing cue, and that bruising is the only data that reaches the tacit layer. Between rounds it's a half-ironman a day, intellectually — the conditioning of knowing what the chain can actually reach, what the evals will hold, what can feasibly collapse. Consistent customer contact isn't a research phase. It's the standing rhythm the whole method runs on.

---

## What the click frees

The payoff extends past the product. AI jump-stepping these workflows drives real productivity — and the mental bandwidth it returns flows to the most human parts of the job: empathy for customers, collaboration, strategic discussion, better work at every handoff.

So that's the current bet, held with conviction and open to revision: customers will pay — at software margins — for recommendations and finished work. Build the thinking, show just enough of it, finish the job, and put one click between them and done.
