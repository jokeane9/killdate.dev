---
title: "You're not building a product. You're building a question."
description: "Every build in software is a probe. The thing you ship is rarely the thing customers pay for — it's the thing that teaches you what they'll pay for. That insight has hard consequences for how you build."
part: 6
post: 14
draft: true
tags: ["process", "validation", "iteration", "founder", "product"]
---

Most businesses are legible. A restaurant opens, sells food, gets feedback, adjusts the menu. You can see the whole chain. Cause, effect, adjustment. Linear.

Software product development — especially AI-powered software — is different. You build things whose primary purpose is to tell you what to build next. The product is as much a research instrument as it is a product. The thing customers eventually pay for is often three iterations removed from the thing that taught you they had the problem.

This is not a flaw in the process. It's the nature of the medium. Understanding it changes how you build.

## Every ship is a probe

On Shelf, we built a crawl pipeline to discover what merchants actually wanted. The assumption was: give them competitor data, they'll know what to do with it. The reality: raw competitor data is noise. Merchants don't want a spreadsheet of signals. They want a briefing — a condensed, actionable read on what moved this week and what it means.

So we built the briefing. That taught us something else: the most valuable moment in the briefing isn't the insight itself, it's the handoff — the point where the merchant takes the insight and asks "what do I do about it?" That handoff belongs to Sidekick, not Shelf. Shelf is the observer. Sidekick is the actor.

We didn't know any of that before we shipped the crawl pipeline. We only knew it because we shipped the crawl pipeline.

This is the pattern. Each build is real, shippable, and usable — and also a probe into what the next build needs to be.

## The constraint this creates

If every ship is a probe, the worst thing you can do is ship something that doesn't teach you anything. That happens two ways:

**Shipping too slowly.** If you spend six months building before anything real reaches a user, you've run a six-month experiment with no data. The build may be technically correct and commercially wrong. You won't know until you ship. By then you've sunk the time.

**Shipping too much at once.** If one release contains five changes and something breaks or underperforms, you don't know which of the five caused it. The probe is ambiguous. You've generated noise, not signal.

These two failure modes pull in opposite directions. The constraint is the intersection: ship fast, ship small, ship one thing at a time.

This is why Shelf has a single invariant at the core of its build discipline: `V(N+1) = V(N) + exactly one surgical change`. Not as a bureaucratic rule — as a measurement constraint. If you change two things simultaneously, you can't attribute the outcome to either of them. The probe fails.

## The PRE-BUILD-LOCK as a forcing function

The pre-build lock process on Shelf has 15 gates that have to be filled before code gets written. From the outside this looks like overhead. From the inside it's a trap for a specific failure mode: the feeling that you understand the problem well enough to start building before you've written down what you're actually testing.

Gate 2 asks: what is the unique job this feature does that no existing surface already does? If the answer is "it shows the same data in a slightly different way," the feature doesn't get built. Not because it's wrong — because it doesn't teach you anything new.

Gate 13b is a blast radius audit: a matrix of every surface the change touches. Empty cells aren't assumed clean. They're investigated. This exists because the temptation in a fast-moving build is to assume the thing you're not looking at is fine. It usually isn't.

The gates are annoying when you're confident the build is right. They're valuable precisely because confidence at the start of a build is the weakest form of evidence available.

## Parallel tracks are not optional

One of the harder lessons: validation doesn't wait for the build to finish.

The natural instinct is sequential — build it, then test whether it works. The problem is that sequential operation means every learning is delayed by the full build cycle. If the build takes three weeks and the core assumption is wrong, you find out in week four.

Parallel tracks run simultaneously from day one: can this be built at quality, and can this be validated against real users? Neither waits on the other. The mock track never replaces the build track. Both are mandatory. The mock surfaces whether the idea works. The build determines whether it can be shipped. You need both answers and you need them at the same time.

This is more expensive in the short run. It's the only thing that works in the medium run.

## The Langfuse example

This week we shipped Langfuse observability on the Layer 4 pipeline. The instrumentation captures every Claude API call — token counts, latency, model version, merchant ID, the full prompt and response.

The immediate value is debugging. When a briefing is wrong, you open the trace and read what Claude saw. No log digging.

The actual purpose is a probe. We're now generating a dataset of every Layer 4 run in production. Over time that dataset will show us: which prompt versions produce which output quality, which merchant stores generate expensive calls, where the retry rate is high enough to warrant investigation, whether switching from Opus to Sonnet on certain call types costs quality or not.

None of those questions can be answered from inside the build. They require production data that doesn't exist yet. We shipped the observability layer to generate the data that will answer questions we haven't fully formed.

That's the pattern. You don't know what you're going to learn. You build the thing that makes learning possible.

## Why this is the most intellectually demanding thing I've encountered

Finance feels rigorous. The math is complex, the models are sophisticated, the stakes are high. But the game is legible: you're optimising within a defined system using known variables and established rules.

Software product development doesn't have defined variables. The problem itself is unknown while you're solving it. You have to be technical enough to know what's buildable, commercial enough to know what's valuable, empathetic enough to understand what customers feel versus what they say, and patient enough to iterate through failure without losing conviction that the next probe will teach you something real.

Most disciplines test one of those. This tests all of them, simultaneously, continuously, with no finish line.

The people who are genuinely good at it are strange. Too technical for business, too commercial for engineering, too creative for both. The weirdness is load-bearing. It's what the job actually requires.

---

**Action:** Look at the last thing you shipped. What question did it answer? If you can't name the question, the ship was a build, not a probe — and you probably don't know what to build next. Write the question down before the next build starts. The pre-build lock template is in `project-management/PRE-BUILD-LOCK-TEMPLATE.md` in the Shelf repo. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
