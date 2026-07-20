---
title: "Systems Thinking, Part 1: Learning to Run a Team of Agents"
description: "What I currently mean by systems thinking: not the old T-shaped playbook, but the skill set we're slowly building for orchestrating agents and the humans working with them — with the real depth spent on design."
part: 6
post: 36
section: essays
group: "Shorts"
draft: false
tags: ["systems-thinking", "agent-orchestration", "design", "agents", "craft", "product"]
---

*5 minute read*

What I'm actually trying to do, building this next kind of software, is hold a problem space steady in my head. Not a spec — a space: a handful of workflows I know to be true customer difficulties, the people who run them, and the question of what software with agentic systems inside it should do about them.

The two I'm holding right now are simple enough to describe in a line each. Vizidex: a deterministic pipeline probes what ChatGPT actually cites for a client's category, and one bounded research agent turns the gaps into an outreach brief. DiagnosticIQ: an agent chain runs the diagnostic investigation a WooCommerce store owner would have done by hand and returns a ranked finding with a prepared fix. Neither is particularly complex. Far more complex software than this is coming — but the thought process for building it, I think, looks the same. That's what this post and the next one are about.

---

## What actually collapsed

The common claim is that AI collapsed the cost of engineering. I'd put it more carefully: it collapsed the cost of a broad band of implementation work — and honestly, I'm not sure I'd have called most of it engineering in the first place. Building Node.js apps is mostly lower-to-medium-complexity JavaScript work. That band — CRUD, glue, front-end assembly, deployment plumbing — is now cheap, fast, and largely delegable to an LLM that's better at the syntax than I'll ever need to be.

What didn't collapse: knowing what to build, whether it's working, and what it should feel like. The expensive skill moved from writing the layers to *directing across* them.

---

## Not the T-shaped playbook

There's an older name adjacent to what I'm describing — **T-shaped skills**: breadth across many domains, depth in one. Worth naming, because it's close enough to be confused with this and different enough that the difference is the point. The T-shape described a person slotting into a human team. What I'm describing is the skill of *running the team* — and the team is now mostly agents, plus the humans working alongside them.

That's why I keep reaching for *systems thinking*, in something near its original sense — the discipline of interconnections and feedback loops — because that's what agent orchestration actually is. It's not a stack, it's a system in motion: agents building across the layers, evals feeding quality signal back into the chains, customer feedback feeding the design, design decisions changing what the agents build next, your own corrections becoming tomorrow's conventions. Nobody has written the playbook for this. The skill set is genuinely new: part engineer, part editor, part manager of a workforce that works at machine speed and goes confidently wrong at machine speed. The job is sitting inside those loops, reading them, and keeping them honest.

---

## The new breadth — and where the depth goes

Running that system demands a breadth that never used to be one job. In our products it spans roughly six domains: back end, front end, infrastructure and deployment, analytics and customer feedback, agentic orchestration and evals, and design/UX.

My working rule: **mechanical** across nearly all of them, **deep** in about two.

Mechanical means: enough understanding to direct an agent through the work and to smell when the output is wrong. Not mastery of the basics — *sufficiency* for supervision. I can work mechanically across the back end, across infrastructure, across analytics when we're reading customer feedback. I don't need to be the best at any of it; I need to never be lost in any of it — because an agent team amplifies whichever domain you can't supervise into the place where the system quietly fails.

Deep is different, and for me the depth belongs to design — deeper on design than anything else, with front end as its executing arm. Because in products like these, so much of the outcome seems to concentrate into a few design questions: how is the recommendation articulated in the UI? What does it actually look like on screen? What confidence do we attach to it, and how is that confidence shown? Get those wrong and the six layers underneath are perfectly executed plumbing to a surface nobody trusts. The agents can write the component; they cannot decide [what the recommendation should look like](../33-the-primary-surface/) to a practitioner who's done the workflow a hundred times.

---

## Why it's tiring

The catch — and the reason this work is genuinely exhausting — is that none of it is sequential. You hold the loops simultaneously: the chain's structure, the eval results, the state of three repos and their sessions, what the customer said Tuesday, and the design question at the center — all in your head at once, zooming between altitudes as the day demands. The breadth is manageable. The *concurrent* breadth is what wears you down.

I've started building open-source tools for exactly this, because it feels like a largely underexplored problem space: how much of that held system can a human legitimately outsource to software? That's part two.
