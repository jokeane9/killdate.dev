---
title: "Prompts that run for hours"
description: "What 250K context actually feels like in production. How we structure long-running prompt jobs, what the industry is beginning to understand about this shift, and why we haven't really cracked it yet."
part: 6
post: 27
section: workshop
group: "Shelf"
draft: false
tags: ["prompting", "context-window", "production", "llm", "agentic"]
---

*5 minute read*

## The shift nobody planned for

A year ago, a "long" prompt was 4,000 tokens. Today Claude Code sessions routinely hit 250K tokens and run for hours. We're not using prompts as query tools anymore. We're using them as long-running jobs — processes that load a project, reason across everything, write files, run commands, and hand back a complete artifact.

Most of the mental models for prompting were built for the short window. They don't fully transfer.

---

## What long-context actually changes

**Order matters more than you think.** In a 250K context, what you put at the top and what you put at the bottom both get attended to differently. Instructions buried in the middle of a 50,000-token document get missed. On Shelf, we load the full competitive data payload before the system prompt instructions. That's the wrong order. We know it and haven't fixed it yet.

**Expensive to iterate.** Short prompt cycles (write → test → revise) work at 1,000 tokens. At 250K, one bad run costs real money and real time. You can't just throw 20 variations at it and pick the best one. You have to think harder before you run. This forces a discipline we weren't used to.

**The output is better.** More context means fewer hallucinations on the specifics. When the full Shelf product catalogue, competitor data, and pricing history are in context, the briefing is noticeably more accurate than when we summarise and compress. The model reasons about the actual data, not a compressed version of it.

---

## How we set up the Shelf Layer 4 job

Shelf's Layer 4 is a Claude API call that takes everything Layer 0–3 produced — crawled HTML, parsed pricing, enriched competitor data, historical trends — and produces a merchant briefing in a strict JSON schema.

The payload can be large. A merchant with five competitors, fifty products each, and 8 weeks of price history generates a context window of 30,000–80,000 tokens. The structural problems are the same as 250K:

1. **Schema is locked before the run.** The Pydantic model defines what's allowed. Claude can't invent fields. If it tries, validation fails and the run is rejected.
2. **Adversarial fixtures pre-run.** Before any prompt change ships, we run it against edge-case payloads — zero competitors, very long product names, missing price history, all competitors on sale simultaneously.
3. **Frozen prompt during data changes.** When we add a new data field to the payload, we prove the frozen prompt absorbs it without touching the prompt text first.

The pattern: the prompt is the last thing you change, not the first.

---

## What the industry is figuring out

**Context compaction is real infrastructure.** When you hit the limit, you don't just truncate — you summarise the conversation history intelligently so the model keeps relevant state. Claude Code now does this automatically. For custom pipelines, you have to build it yourself or your runs die at context limit.

**Prompt caching changes the economics.** Repeated context is cached and reads at a fraction of the original price. For long-running production pipelines, designing for cache hits changes the cost structure significantly.

**Structure is load-bearing.** Long prompts with no internal structure are fragile. Headers, explicit sections, numbered instructions — these are navigation aids for the model in a very long document. We learned this on Layer 4: an unstructured system prompt produced significantly worse output than a structured one at the same length.

---

## Where we're struggling

We don't have a principled approach to context loading order. We have heuristics and a lot of things we haven't tested.

The eval problem is worse in long contexts. Short prompts can be evaluated against 50 fixtures in minutes. A long prompt that takes 90 seconds per run means 50 fixtures takes over an hour. We evaluate less than we should.

Debugging is slow. When a long-context run produces wrong output, tracing why is hard. Is it the instruction buried on page three? The data structure at the bottom? There's no fast answer.

---

## Learnings

- Context loading order matters. Instructions buried in the middle of large contexts get attended to less.
- Prompt caching is worth designing for — repeated context is significantly cheaper on cache hit.
- Structure isn't cosmetic. Headings and sections are navigation for the model.
- The frozen prompt principle: prove the data change works before touching the prompt text.
- We don't have systematic answers to most of these questions yet.

---

*The Layer 4 prompt discipline is in `project-management/PROMPT-CHANGE-DISCIPLINE.md`. Repo: [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)*
