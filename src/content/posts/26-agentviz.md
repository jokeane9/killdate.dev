---
title: "agentviz: visualizing an AI pipeline when routes are the wrong shape"
description: "vizstack maps web apps by route. Point it at a Python agent pipeline and it bails — because agent systems aren't organized around routes, they're organized around data flowing through stages. So I built a different analyzer."
part: 1
post: 12
section: workshop
group: "vizstack & agentviz"
draft: true
tags: ["tooling", "visualization", "agents", "python", "open-source"]
---

*6 minute read*

## The thing that didn't work

Back in post 18 I built a little tool that reads a Remix or Next app and draws a map of it — routes, the database, the AI calls, the external services. Post 22 turned it into [vizstack](https://github.com/jokeane9/vizstack). It's been genuinely useful: point it at an app, get one HTML file, see the whole shape.

So when I wanted the same picture for a Python pipeline I've been building — a thing that probes ChatGPT, classifies what it cites, and researches outreach targets — I pointed vizstack at it.

It bailed in under a second:

```
Could not detect framework. Is this a JS project with a package.json?
```

Fair. It's Python, there's no `package.json`, there are no routes. But the failure was more interesting than "wrong language." It was the *wrong shape entirely.*

## Routes are the wrong spine

Here's the thing I didn't appreciate until the tool fell over.

A web app's structure **is** its routes. A request comes in to `/api/checkout`, and it fans out — reads the cart, writes an order, calls Stripe. vizstack walks the routes folder and hangs everything off it, because that's the real skeleton. It's a *fan-out from entry points*.

An agent pipeline has no entry points like that. There's no route. The skeleton is **data moving through stages, in order, over time:**

```
probe → raw.jsonl → classify → citation_map.json → research → targets.json → brief
```

The stars of that picture aren't even the stages — they're the **files between them**. `raw.jsonl` is where the probe hands off to the classifier. `citation_map.json` is where the classifier hands off to the agent. That handoff *is* the architecture, and a routes-shaped tool has nowhere to put it.

And there's a second difference. A routes map answers *"what connects to what."* That's a structural question. But the questions I actually have about an agent pipeline are different:

- What runs in what **order**?
- Which steps hit an **LLM**, and which **model**?
- What's **cached** versus burning tokens every single run?
- What's **traced**, and what's flying blind?

Routes don't have a "cost" or a "cached" dimension. Agent stages do, and those are the dimensions you care about most, because that's where the money and the silent failures live. **Different question, different picture.**

## So I built agentviz

[agentviz](https://github.com/jokeane9/agentviz) is the same idea as vizstack — one command, one HTML file, no dependencies — but the analyzer is built around stages and data flow instead of routes. Stdlib Python, `ast` plus regex. It reads your source; it never runs it.

It detects, per stage:

- **LLM call sites** — the model, whether it uses web search, whether it's an agentic tool-use loop, whether it's behind a cache.
- **Database** — SQLite tables, read vs write.
- **Caching** — cached vs recomputed-every-run.
- **Tracing** — Langfuse / `@observe`, or nothing.
- **File hand-offs** — who writes each artifact, who reads it.
- **Cost guardrails and live web calls.**

The map lays out as a pipeline: inputs on the left, each step to the right, the data files as the rails between stages. Hover a node and everything else dims so you can read one stage's neighborhood at a time. And there are **lenses** — toggle the whole map to colour stages by cache, by tracing, by cost. Flip on the tracing lens and every untraced stage goes red; on my pipeline, the entire thing lit up red except the one stage I'd bothered to instrument. That's the picture I actually needed.

## It found bugs in my own code

This is the part that sold me. I ran it on a pipeline I wrote and thought I understood, and the findings panel surfaced things I'd missed:

- A **database table that gets written but never read** — an audit log I added and forgot to ever use.
- A **path bug**: one stage rooted its data directory differently from every other stage, so its output landed where the rest of the pipeline couldn't find it.
- **Model-version drift** — the core pipeline was on one Claude version, but three helper scripts were still pinned to an older one.
- A whole **cache module I'd forgotten existed**, doing real work off to the side.

None of that was visible from reading the files one at a time. It only shows up when something looks at all of them together and asks the boring questions.

## The visualization lesson

My first attempt at the map used an auto-layout graph library. It rendered — and it was a hairball. Every node shouted at the same volume; I spent more time fighting the layout than reading it.

The fix wasn't a fancier graph engine. It was stealing vizstack's actual trick, which isn't a graph engine at all: **deliberate columns, an SVG overlay for the edges, and hover-to-dim.** You never read the whole thing at once. You hover one node and only its world lights up.

But I kept the *interaction* and changed the *layout metaphor* — from "columns by type" (routes, services, db) to "columns by pipeline step." Same easy feel, but now the columns mean *order of execution*, which is the thing an agent pipeline is actually made of.

That's the takeaway, and it generalizes past this one tool: **when you visualize a system, the layout should match how the system actually runs.** A web app fans out from routes, so lay it out by route. An agent pipeline flows through data, so lay it out by flow. Force the second one into the first one's shape and you get a tool that bails in under a second — or worse, a tool that renders a tidy diagram of the wrong thing.

## Caveats, honestly

It reads one call site at a time, so if a stage picks its model indirectly — through a wrapper or a dict — the model shows up as a placeholder instead of the resolved name. Stage ordering is inferred from shared filenames, not proven. And the loop/cache detection is pattern-matching, so it'll occasionally mislabel something unusual. It's a map, not a proof. But a map you can regenerate in under a second beats a hand-drawn diagram that was stale the moment you added a file.

It's open source, MIT, here: [github.com/jokeane9/agentviz](https://github.com/jokeane9/agentviz).
