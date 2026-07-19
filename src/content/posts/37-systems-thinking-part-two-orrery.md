---
title: "Systems Thinking, Part 2: Orrery, and Outsourcing the Abstraction"
description: "Part one said the tiring part is holding the whole system in your head at once. Part two is what I'm doing about it: Orrery, an open-source window that holds the repos, sessions, and skills so your head can hold the design."
part: 6
post: 37
section: essays
group: "A Take on Agentic Products"
draft: true
tags: ["systems-thinking", "orrery", "tooling", "open-source", "agents", "cognitive-load"]
---

<!-- DRAFT NOTE (John): grounded in mission-control-desktop's PRODUCT.md (Orrery v2.0.0, renamed from Mission Control) — one-liner, views, and local-first principles are quoted from there. Linked back to the published Mission Control post; flagged the rename explicitly since that post is live under the old name. -->

*4 minute read*

[Part one](../36-systems-thinking-part-one/) ended on the honest problem: the tiring part of this work isn't any single domain, it's holding all of them in your head *at once*. This part is about what I'm doing about it — because I think the answer is partly a piece of software, and the problem space is largely underexplored.

---

## Where the overload actually comes from

Here's what my head is actually juggling on a normal working day:

**Repos have skills now.** Each repo carries its own set of agent skills — the named workflows Claude Code can run there. Which repo has which skills, and which one you meant to use, is context you're expected to just know.

**One repo, several sessions.** You're often running two or three agent sessions against the same repo — one building, one reviewing, one exploring. Each has its own state, its own partial changes. Losing track of what session left what behind is a new and genuinely disorienting kind of mess.

**One project, several repos.** Vizidex is two repos — a JS app and a Python engine. Other projects are three or four. The *project* is the unit in my head; the *repo* is the unit on disk; nothing in the standard tooling holds the mapping.

**And the model changed underneath us.** When you wrote every line yourself, you got the ground-truth model of your workspace for free — every branch and stray checkout had passed through your hands. Agentic coding abstracts *doing* into *directing*, so that free model is gone. The agent did the doing; your head never saw it.

Every one of these is context I was holding biologically, refreshing it by cd-ing around and running `git status`, while also trying to hold the part of the system that actually deserves the headspace — the design questions from part one. That's the trade I want to stop making. If the abstraction can live in an interface, outsource it to the interface.

---

## Orrery

So we're building one, open source: **Orrery**. (Readers of the earlier [Mission Control post](../mission-control/) — same tool, renamed; an orrery is the desk instrument that shows every planet's position at once, in one frame, which is the product in one word. Also, Apple owns "Mission Control" on macOS, and the collision was real.)

The one-liner from its own product doc: *the observability layer for agent-assisted development — every repo's state, and what your agents left behind, in one local window.* To be precise about the shelf it does *not* sit on: this isn't "agent observability" in the Datadog/Langfuse sense — tracing agent runs in production. It's observability of the *workspace*, for the person directing. Each project card shows the live git state — branch, uncommitted, unmerged, unpushed — next to the human facts no tool can infer: what this project is, where prod lives, the one thing you're pushing on. Around the cards sit the workspace views that map straight onto the overloads above: a **Skills** catalog across every repo, a **Sessions** view of what agents are doing and what they left behind, a worktrees cleanup view, a work log, an aggregated roadmap.

The usage pattern is the point: it stays open on the second monitor while you work in Claude Code or Codex, and you glance instead of remember. Which repo had that skill — glance. What did the overnight session leave unmerged — glance. What was I mid-push on in this project — glance. Every glance is a piece of abstraction you didn't have to carry, and the carrying capacity it frees goes where [part one](../36-systems-thinking-part-one/) said the depth belongs: the design.

It also builds on the visualization tools we've already shipped. [vizstack](https://github.com/jokeane9/vizstack) — the architecture visualizer from the [route-visualizer](../18-remix-route-visualizer/) and [VizStack 2.0](../22-vizstack-2/) posts — and agentviz, its sibling for Python agent pipelines, plug into Orrery as per-project architecture and pipeline map tabs. So the same window that holds the workspace state can drop you into a map of any single system inside it: the whole solar system, then one planet's geography, without leaving the frame.

Which is the direction this is quietly heading: Orrery is becoming something like an **appliance for offsetting abstraction** — one instrument that absorbs the held state of AI-assisted work on non-trivial software, the way the physical orrery absorbed the held state of the sky. Each open-source piece we build seems to end up docking into it.

It restores *visibility*, not control — it tells you the state, it doesn't act on it. And it's local-first on principle: reads your disk live, no server, no account, no telemetry. Your workspace model shouldn't live on someone else's computer.

---

## The underexplored part

What surprises me is how empty this space is. There's endless tooling for making agents *do more* — and almost none for helping the human *hold more*: the observability layer for the person directing, whose working memory is now the system's scarcest resource. (The cognitive-load literature — Sweller, by way of Team Topologies — prescribes exactly this: strip the extraneous load so the capacity goes to the work that matters.) My current thinking is that this category barely exists yet and will matter a lot; every developer running agents across multiple repos is quietly rebuilding this model in their head every morning.

I don't know exactly what shape these tools should take — that's why Orrery is open source and why we use it on our own work daily. But the direction I'm confident in: the less of the system's *state* your head has to hold, the more of the system's *design* it can. Outsource the abstraction. Keep the judgment.
