---
title: "Prototyping with Langflow and production data"
description: "We used Langflow to sketch agentic patterns before hardcoding them in Python. We wired it to a local Postgres with production-level data. Here's what we learned and where we're still stuck."
part: 6
post: 28
section: workshop
group: "Shelf"
draft: false
tags: ["langflow", "agentic", "postgres", "pipeline", "prototyping"]
---

*5 minute read*

## The problem with committing too early

The Shelf crawl pipeline is four layers of Python. It works. But it took us longer than it should have to find the right shape — because we kept committing to code before we understood the pattern.

A layer that should have been two became one. A function that should have been isolated got tangled. We'd build a thing, realise the data flow was wrong, refactor. Repeat.

What we needed was a way to sketch the agentic pattern before hardcoding it.

---

## What Langflow actually is

Langflow is a visual builder for LLM workflows. You drag nodes — prompts, parsers, memory stores, API calls, Python functions — and wire them together. You can run the flow immediately and see the output at each step.

It's not production infrastructure. Think of it the way a designer thinks about Figma: you're not shipping the Figma file, you're using it to find out what you're actually building before you write a line of code.

For agentic patterns specifically, the visual representation is useful in a way that's hard to replicate in code. When you see a five-node flow laid out, it becomes immediately obvious whether the data shapes match at each handoff, where memory needs to persist, and where parallel branches are possible.

---

## The local Postgres integration

Here's where it got interesting. Most Langflow tutorials use toy data. That works for exploring the tool. It doesn't tell you anything about whether your pattern will survive real data.

We wired our local Langflow instance to a local Postgres database running actual Shelf production data. Schema, crawler output, competitor records, pricing history — the real thing, running locally.

What this gives you: you find out immediately when your prompt chokes on a competitor with 200 SKUs, or a merchant whose competitors have no pricing data, or a product name that's 180 characters long. Those edge cases are invisible in toy data. They're everywhere in production data.

---

## What we prototyped

We used Langflow to sketch three patterns before building them in Python:

**Signal ranking.** Given a list of competitor moves, what order should they appear in the briefing? We tried five different prompt approaches — recency-weighted, impact-weighted, confidence-weighted — against real data before committing to one. The winner wasn't the one we expected.

**Per-competitor summarisation.** One call per merchant with all competitors in context vs. one call per competitor. We ran both against real data. One call per merchant was more coherent but more expensive. We know the trade-off now because we measured it on real data, not hypothetically.

**Fallback logic.** What should the prompt produce when there's nothing interesting to report? Figuring out the boundary conditions for "interesting" requires real data. A week where nothing happened is very different from a week where you have no data.

In all three cases, Langflow let us try things in an afternoon that would have taken days to write, deploy, and test in Python.

---

## Our initial take

The customers who will get the most from AI-augmented software are the ones where focused Python pipelines with specific ontologies meet very structured prompts.

**Focused pipeline.** Not a general-purpose agent. A pipeline that does one thing well. Narrow scope, predictable behaviour, debuggable failures.

**Specific ontology.** A defined vocabulary for the domain. On Shelf: `price_drop`, `new_sitewide_discount`, `new_product_launch` are real concepts with real definitions. The prompt uses those terms. The schema enforces them. The UI renders them. One vocabulary end-to-end.

**Structured prompt.** Not "summarise this competitor data." A prompt with explicit sections, explicit output format, explicit rules for what to include and exclude.

When all three are present, the AI output is reliable enough to put in front of paying customers.

---

## Where we're struggling

**The gap between Langflow and production.** A Langflow flow that works doesn't automatically translate to clean Python. Error handling, retries, partial failures, logging, cost management — the prototype hides all of this. Every pattern we tested in Langflow required significant rework to productionise.

**Ontology drift.** The vocabulary you define at the start drifts as you learn. On Shelf, `visible_discount` and `sitewide_discount` started as one concept and became two. Updating an ontology mid-flight, across pipeline, schema, prompt, and UI, is expensive.

---

## Learnings

- Langflow is a pattern-discovery tool, not production infrastructure. Use it that way.
- Local Postgres with production data eliminates an entire class of surprises.
- Focused pipeline + specific ontology + structured prompt is the combination that produces reliable AI output.
- The gap between prototype and production is larger than it looks from inside Langflow.
- We haven't cracked this. The value is accumulating slowly and we're figuring it out by doing.

---

*The Shelf pipeline is in `crawl/`. The ontology lives in `crawl/layer1_validation.py`. Repo: [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)*
