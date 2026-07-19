---
title: "One Click: Learning from the Long-Haul Driver"
description: "A driver who knows his routes still follows the blue line. Some thoughts on why recognition beats trust, why rerouting is the real product, and what people get back when known-pattern work stops consuming them."
part: 6
post: 34
section: essays
group: "A Take on Agentic Products"
draft: true
tags: ["product", "ux", "recommendations", "cognitive-load", "agents"]
---

*6 minute read*

Picture a long-haul driver who's run the same corridor for twenty years. He knows the routes the way you know your own kitchen — the pass that ices first, the construction season that never ends, the truck stop worth the extra twenty minutes. Nobody on earth needs navigation help less than this man.

He still follows the blue line.

Not because he's forgotten the road. Because Maps is doing something he can't do from the cab: re-running the entire route calculation, continuously, against circumstances that changed after he left — the jackknifed trailer forty minutes ahead, the pass that closed at noon, the weigh station backed up past the off-ramp. His twenty years built the judgment. The machine contributes something different: *fresh information, evaluated constantly, delivered as a conclusion.*

That division of labor is the product pattern we keep coming back to — and my growing suspicion, held loosely but acted on daily, is that it shows up next in every professional workflow with known patterns in it.

---

## Recognition, not trust

Notice what the driver does when a reroute appears. He doesn't obey it and he doesn't audit it. He *recognizes* it — glances at the detour and thinks, "Highway 3 around the slide area. Yeah, that's the move." Twenty years of manual runs built his evaluation function; the screen is just supplying the candidate. Verification takes two seconds, because he's not being asked to trust a black box. He's being asked to recognize an answer he's derived himself a hundred times. (Gary Klein's research on how experts actually decide calls this recognition-primed decision-making — pattern libraries built from experience do the evaluating, faster than analysis. The driver is running one.)

This is the bar I now think an agentic product has to clear, and it's worth being picky about: the recommendation doesn't need to be impressive. It needs to be **recognizable** — the conclusion the experienced user would have reached, arrived at the way they would have arrived at it, with the reasoning one glance away (the red traffic shading, the ETA delta) for the day recognition doesn't fire.

And when the top answer is wrong? The gray alternate routes are sitting right there, ranked, one tap away. His correction is a *selection*, not an investigation. Wrongness isn't the risk to eliminate — unrecoverable wrongness is. Maps has never once dumped him back to a paper map.

---

## Rerouting is the actual product

The first route is table stakes. The reason the driver keeps the app open is what happens at hour three, when the world stops matching the plan.

Most professional workflows are like this. The initial decision — the promotion calendar, the reorder quantities, the architecture choice — is made under one set of circumstances, and then circumstances move. The expensive part of the job was never the first plan. It's the continuous re-derivation: noticing that conditions changed, re-running the four-hour evaluation, and committing to the adjustment while everything is still in motion.

Humans are bad at this not for lack of judgment but for lack of bandwidth. The driver can't recalculate the corridor while driving it. The store owner can't re-evaluate every promotion while running the store. An agent chain can — that's the whole point of [shellware](../32-shellware/): the machinery re-runs the workflow continuously, and the surface only speaks when there's a conclusion worth a decision. *Circumstances changed. Here's the reroute. Approve it, or here are the alternatives.*

(Amazon Prime deserves its footnote here: some recurring questions shouldn't even be re-asked — decide them once, structurally, and remove them forever. Shipping choice was one. Every product has a few. Find them and delete the question, not just the workflow.)

---

## Every profession has its corridor

The pattern seems to generalize to any workflow where an experienced practitioner is re-deriving known patterns against changing conditions:

**Ecommerce promotions.** The owner has run a hundred sales. She knows what a good promotion looks like — the margin math, the timing, the products that carry it. What changes weekly is inventory position, competitor pricing, ad costs. That's a reroute: *conditions shifted, here's the adjusted promotion, approve or pick an alternative.*

**Inventory.** Reorder decisions are the same calculation every time, against supplier lead times and sales velocity that never hold still. The hundredth reorder isn't a judgment problem. It's a freshness problem.

**Supplier communications.** The follow-up email about the late shipment has been written, in substance, dozens of times. Drafted from the actual order data, it's a ten-second review — recognition again — instead of a twenty-minute composition.

**Development itself.** A developer who's fixed this class of bug fifty times, upgraded this dependency pattern a dozen times, wired this integration shape before — those are known routes. The agent proposes the fix; the developer recognizes it or selects an alternative. We work this way daily now, and it's the same shape as the driver and the blue line.

In every case the practitioner's hundred manual runs are what make the one-click model *safe* — they're the evaluation function. The product isn't replacing their expertise. It's finally putting it to better use: judging conclusions instead of manufacturing them.

---

## What the click buys back

Here's the part we've come to think matters most, and it's not the time saved.

Known-pattern work doesn't just consume hours — it consumes the *quality* of attention. A store owner who spends the morning re-deriving reorder quantities isn't merely busy; she's cognitively spent in a way that forecloses the other work. The work that, increasingly, we'd argue is the actual job:

**Creativity** — the promotion nobody's run, the product line that doesn't exist yet, the angle a pattern-matcher can't propose because there's no pattern to match.

**Systems thinking** — stepping back from the individual reorder to ask whether the supply chain itself is shaped right. [Zooming out](../31-zooming-in-zooming-out/), when every zoomed-in task is screaming for attention, is the first casualty of cognitive overload.

**The intuitive north star** — the professional's accumulated sense of where their craft, their store, their codebase *should be going*. The tacit judgment we wrote about in [the taste post](../16-taste-judgment-and-the-ai-partner/). It's the least automatable thing a practitioner has, and it's exactly what gets crowded out when known-pattern work fills the day.

These aren't the leftovers after automation. They're the most human parts of every profession, and they've been rationed for decades because the known-pattern work ate the budget. The one-click product isn't really selling a faster workflow. It's refunding the attention the workflow was taxing — so the driver watches the road, the owner builds the brand, and the developer designs the system.

The four-hour workflow was never the job. It was the tax on getting to the decision. Products that refund that tax don't feel like better tools. They feel like relief.
