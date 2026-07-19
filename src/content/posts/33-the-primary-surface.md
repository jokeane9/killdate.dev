---
title: "The Primary Surface: Why We Stopped Building Dashboards"
description: "Dashboards hand the investigation back to the user. What we're trying instead: LLMs that retrieve focused recommendations, shown with just enough thinking that an expert recognizes the work — a fisherman knows a fisherman."
part: 6
post: 33
section: essays
group: "Shorts"
draft: true
tags: ["product", "ux", "agents", "design-paradigm", "dashboards", "simplification"]
---

<!-- DRAFT NOTE (John): Vizidex example now filled from the vizidex-engine repo (primary surface = the intelligence brief). Microsoft references are real and linked: the microsoft.design agent UX principles and the HAX Toolkit guidelines (verified 2026-07). -->

*6 minute read*

When you're building a product that knows things about a user's business, there's a reflex that kicks in almost immediately: build a dashboard. Put the data on screen. Charts, panels, filters, a number in each corner. It feels like generosity — *look at everything we can show you.*

I've stopped seeing it as generosity. A dashboard is the product handing the investigation back to the user. Here are forty signals; you figure out which three matter, what they mean together, and what to do about it. The most expensive part of the workflow — the reading, the correlating, the deciding — is exactly the part the dashboard declines to do.

This is the design idea I find myself chewing on daily: **skip the dashboard, and build the surface that hands over what the dashboard would've made the user work out.**

---

## One surface is where value accretes

Open any mature SaaS product and count the screens. On how many does the user actually receive the thing they pay for? Almost always: one. There's one surface where the problem meets its answer — we call it the **primary surface** — and every other screen exists to feed, configure, or apologize for it.

Value doesn't distribute across a product; it accretes at that surface. Better recommendations make it more trusted, trust brings more decisions there, decisions produce signal, signal makes the recommendations better. Investment anywhere else depreciates quietly. So the question we've learned to ask of every unit of effort is a blunt one: *does this make the primary surface more valuable, or just make the product bigger?*

A dashboard fails this test in a specific way. It puts everything on the primary surface, which means it commits to nothing there. Showing all the data is a way of avoiding the product's actual job: having a view about what the data means.

---

## What the LLM changes

The honest defense of dashboards was always: *we can't know what the user needs to conclude, so we show everything.* Software could compute, but it couldn't read a situation. I think that defense has now dissolved — not everywhere, not for every workflow, but for more of them every month.

An LLM-driven chain can now do the sitting-with-the-data step — retrieve what's relevant from everything the product knows, correlate it the way an experienced operator would, and come back with a *focused recommendation*: not "here are your metrics" but "your repeat-purchase rate dropped because Tuesday's shipping change hit your top segment — here's the fix, ready to apply."

That's the inversion. The dashboard was a bulk-transfer interface: all data, no conclusions. The primary surface in this paradigm is a retrieval interface: one conclusion, drawn from all the data, with the data still reachable behind it. DiagnosticIQ's surface is exactly this — the ranked finding and the prepared fix, not the forty-panel diagnostics console. Vizidex's is the intelligence brief: named outreach targets, research cards, prepared drafts — the conclusion of the audit, not a citation-metrics dashboard with the audit left as an exercise for the client.

---

## Just enough thinking: a fisherman knows a fisherman

Here's the part of the paradigm that took longest to see clearly. The recommendation alone isn't enough — a bare verdict from a black box asks for blind trust. But the full reasoning trace is wrong too: dump the chain-of-thought and you've rebuilt the dashboard out of paragraphs.

The design target is **just enough thinking**: the recommendation, plus the two or three load-bearing cues from the reasoning — what was checked, the one correlation that mattered, the thing that was ruled out. (Design veterans will recognize the shape — it's progressive disclosure, the Nielsen Norman idea, applied to reasoning instead of controls.) Enough that an experienced user *recognizes the thinking as competent* the way one professional recognizes another's work.

A fisherman knows a fisherman. He doesn't need to watch you fish all day; he can tell from how you read the water, from one knot, whether you know what you're doing. Your user has run this investigation a hundred times by hand. Show them the two cues that only a competent investigation would surface, and recognition fires — *it checked the right things, in the right order, and ruled out what I would have ruled out.* That's a different mechanism than trust, and far stronger. Trust is extended reluctantly and revoked instantly. Recognition is instant and durable, because the user is verifying against their own expertise, not your marketing.

Calibrating "just enough" is real design work — the cues have to be the ones *an expert would look for*, not the ones that are easiest to log. Get it right and the reasoning display is a handshake between practitioners. Get it wrong in either direction and you've built either a black box or a dashboard.

---

## Microsoft's been circling the same idea

We're not the only ones circling this. Microsoft's design organization published a set of [agent UX principles](https://microsoft.design/articles/ux-design-for-agents/) that map almost one-to-one onto what we've been converging on independently — worth reading in full, but three of their named principles are load-bearing here:

**"Embrace uncertainty but establish trust."** Their formulation: the level of certainty and the reasoning behind a recommendation should be visible or easily accessible, precisely to avoid both blind overreliance and blanket distrust. That's the "just enough thinking" display, stated as policy.

**"Easily accessible yet occasionally invisible."** The agent works largely in the background and surfaces when relevant — the machinery stays behind the surface, the conclusion appears when there's a decision worth making. This is the anti-dashboard position: presence calibrated to relevance, not a wall of always-on panels.

**"Nudging more than notifying."** Proactive and contextual rather than static. A dashboard is the ultimate static notification — permanently on, never prioritized. A nudge is a retrieved, focused recommendation with a moment attached.

Their earlier [HAX Toolkit](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/) — 18 research-backed guidelines for human-AI interaction from a two-decade synthesis — got at the same joints years earlier: *show contextually relevant information* (G4, not all information), *make clear why the system did what it did* (G11, the recognition cues), and *support efficient correction* (G9 — when the recommendation is wrong, fixing it must be a gesture, not an investigation). The vocabulary is theirs; the conviction, for us, came from watching users meet real conclusions.

---

## Keeping it clear is the ongoing work

Everything in the development process conspires to turn the primary surface back into a dashboard. Features lobby for a panel. Edge cases lobby for caveats and toggles. Stakeholders want the four hours of invisible agent work *performed* on screen — spinners, feeds, look-how-hard-we're-working displays. Each addition is locally reasonable; the sum is the forty-panel console you started out refusing to build.

The test we keep returning to: could a user who's never seen the product act correctly on the primary surface within thirty seconds — and would an expert, glancing at the reasoning cues, nod? Every element that doesn't serve one of those two answers is a candidate for deletion.

The machinery of an agentic product is increasingly replicable — models improve for everyone. What compounds privately is the judgment embedded in the surface: what to retrieve, what to conclude, which two cues of thinking to show, and what to leave invisible. That judgment comes from watching real practitioners recognize — or fail to recognize — real conclusions. I don't think it can be forked.

So that's where we've landed, for now: less dashboard, more of the one surface a fisherman would nod at.

Next post: what the primary surface is ultimately converging toward — a single click.
