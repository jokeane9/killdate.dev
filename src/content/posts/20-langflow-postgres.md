---
title: "Langflow as customer research"
description: "We opened Langflow to prototype agentic patterns. What we found instead was a map of how a marketing operator thinks — and it's almost exactly what Shelf automates."
part: 6
post: 20
draft: false
tags: ["langflow", "agentic", "customer-thinking", "pipeline", "shelf"]
---

*4 minute read*

## What we were trying to do

We set up Langflow to prototype agentic patterns before committing them to Python. The idea: sketch a workflow visually, run it against real data, understand the shape before writing a layer.

We installed it, opened the template library, and stopped.

---

## The template library is a customer mind map

Langflow ships with a set of built-in flow templates. Ours showed:

- **Market Research** — researches companies, extracts key business data
- **Price Deal Finder** — searches and compares prices across e-commerce platforms
- **SEO Keyword Generator** — generates keywords based on pain points and customer profiles
- **Instagram Copywriter** — creates posts with AI-generated content
- **Twitter Thread Generator** — transforms inputs into threads, maintaining brand voice
- **Blog Writer** — auto-generates posts from instructions and referenced articles
- **Social Media Agent** — searches and analyses social media profiles

Read them in sequence. That's not a random template library. That's the weekly workflow of a Shelf merchant's marketing operator — written out as discrete, automatable steps.

They research what competitors are doing. They find the price moves and deals. They identify the content angle. They write the response — Instagram, blog, tweet. They monitor the conversation.

That's the job. Those templates map it exactly.

---

## Shelf is that sequence, automated

Look at the four-layer crawl pipeline:

- **Layer 0–1** — HTTP fetch + parse: pricing, promotions, new products across competitor stores. This is Market Research + Price Deal Finder, running automatically.
- **Layer 2–3** — Enrich + signal prep: what actually moved this cycle, ranked by significance. This is the SEO Keyword Generator's job — finding what's worth paying attention to out of everything that changed.
- **Layer 4** — Claude briefing: a structured daily read on what the competitive set did and what it means. This is the input to the content creation step — the thing that tells you *what to write*, before you open the Instagram Copywriter.

Shelf doesn't replace the last step. It automates the first three so the merchant arrives at the content creation moment with context instead of having to go find it.

The pipeline architecture we spent months designing maps almost exactly to the Langflow template sequence. We didn't know that when we designed it. We designed it by watching what merchants were doing manually and asking what was automatable. Langflow just made the underlying pattern explicit.

---

## Why this matters for building

When you see customer cognition mapped into workflow templates, you understand the product differently.

The question isn't "what features should Shelf have?" The question is "which steps in this sequence are worth automating, and which require human judgment?" The research and signal-detection steps are clearly automatable — they're data-intensive, time-consuming, and the merchant adds no unique value doing them manually. The content creation step requires merchant voice, brand judgment, and creative decisions that can be assisted but not replaced.

That's the Shelf/Sidekick split. Shelf owns steps 1–3 (research, price intel, signal ranking). Sidekick owns step 4 (content creation, action). The boundary isn't arbitrary — it's where automatable pattern-matching ends and human judgment begins.

Langflow made that boundary visible.

---

## Where we are now

We're running Langflow as a local server with the LangChain repo pulled down alongside it. The next phase: using these flows connected to local Postgres with real Shelf data — actual crawl outputs, real competitor records, real price histories — to prototype how the full agentic sequence could work end to end.

The specific question we're testing: can we model not just what competitors did, but what a merchant should *notice* about it based on their own catalog? That's the gap between Layer 3 (signal ranking) and Layer 4 (briefing). Right now Layer 4 knows the signals but not the merchant's priorities. Closing that gap is the next layer.

We don't know if it works yet. Langflow is where we find out before writing a production layer.

---

## Learnings

- The Langflow template library is a taxonomy of marketing operator workflows. Read it as customer research, not a feature catalogue.
- Shelf's four-layer pipeline maps almost exactly to those workflow steps. We didn't design it that way — we discovered the pattern after the fact.
- The Shelf/Sidekick boundary is where automatable pattern-matching ends and human judgment begins. Langflow made that boundary visible.
- Use Langflow to understand customer cognition before building. The templates are a shortcut to the mental model.
- We're still figuring out the gap between signal ranking and merchant-specific relevance. That's the next problem.

---

*Shelf pipeline: `crawl/` in [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf). Langflow: [langflow.org](https://langflow.org).*
