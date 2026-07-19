---
title: "Shellware"
description: "Shellware: software where the product is a thin shell over agentic machinery — the chain does the work, the surface presents decisions. A definition, why it's newly possible, and what the stack looks like when you build one."
part: 6
post: 32
section: essays
group: "A Take on Agentic Products"
draft: true
tags: ["shellware", "agents", "product", "software-delivery", "architecture"]
---

<!-- DRAFT NOTE (John): definition now leads and the coinage is credited to you. The Vizidex stack section is grounded in vizidex-engine's ARCHITECTURE-REVIEW-2026-06-06.md (deterministic skeleton / one bounded agent / evals) and the engine README — kept at the level of detail the blog already reveals in the agentviz draft. Check I haven't exposed anything you'd rather hold back. -->

*6 minute read*

**Shellware** — a term I've coined, because nothing existing quite named what we kept building — is software where the product the user touches is a thin shell, and the actual work happens in agentic machinery behind it. (No relation to *shelfware*, the old pejorative for software bought and never used — though the two make a tidy pair: shelfware was all surface and no use; shellware is barely any surface at all.) The shell doesn't expose controls. It presents *conclusions* — a diagnosis, a recommendation, a prepared action — and asks for a decision.

That's the definition — a working one, from the middle of building two of these, and I expect it to sharpen with use. The rest of this post is why it's newly possible, what the stack looks like when you build one, and what the shell owes the user in exchange for hiding the machinery.

---

## The inversion

Traditional software is a set of controls. The product exposes its machinery — screens, settings, workflows — and the user operates it. The better the user operates it, the more value they extract. The manual might be gone, but the deal is unchanged since the desktop era: we build the machine, you drive it.

Shellware inverts the proportions. In a classic SaaS product, 80% of the build is surface: views, forms, states, settings, the apparatus the user manipulates. In shellware, 80% of the build is behind the surface — chains of agents that investigate, cross-reference, rank, and prepare — and the surface is deliberately small, because its job is not to *be operated*. Its job is to be *answered*.

DiagnosticIQ is shellware. A WooCommerce store owner doesn't want a diagnostics console with forty panels. They want to know what's wrong with their store and what to do about it. The agent chain does what the owner would have done across a four-hour afternoon — check the logs, compare the configs, correlate the symptoms, rank the causes — and the shell shows the result: *here's what we found, here's what we recommend, approve it or see the alternatives.*

The user never sees the machinery. That's not a limitation. That's the product.

---

## Why now

This wasn't a viable way to deliver software until recently, for one reason: the machinery couldn't be trusted to reach conclusions. Software could compute, but it couldn't *investigate*. So we built surfaces that let humans investigate, and called the surface the product.

Agent chains change the economics. A sequence of focused agents — each with a narrow job, each feeding the next — can now do the investigative middle of a workflow reliably enough to present its output as a recommendation rather than a report. Not "here are 200 log lines," but "it's the payment webhook, it broke on Tuesday's plugin update, here's the fix."

When the machinery can carry conclusions, the surface no longer needs to carry controls. The interface can shrink to the width of a decision.

---

## The stack tends toward the shell

Look at what a shellware codebase actually contains, because it's stranger than the definition suggests. Vizidex — our AI-visibility audit and PR engine — is the clean example, split across two repos that mirror the paradigm exactly.

The app repo is a JavaScript front-end stack: accounts, intake, presentation of the brief. That's the shell, and it's deliberately unremarkable — familiar web tech doing familiar web things.

The engine repo is where the product lives, and here's the strange part: **almost no conventional computation happens in it.** The Python is thin — snapshot diffs, dedup, classification plumbing, assembling the final brief. If you audited it looking for the algorithmic core, the proprietary engine room of classical software, you wouldn't find one. There's no engine in the old sense.

Nearly all of the value is produced by two things instead:

**The agentic chain.** Probe what the AI models actually cite for a client's category, classify what comes back, research the gaps, prepare the outreach targets. When we ran a formal architecture review on it, the verdict was a shape worth naming: a *deterministic skeleton with bounded agentic limbs*. The orchestration is ordinary, reproducible code; the intelligence lives in a small number of tightly-scoped LLM steps — the review concluded the whole system justifies exactly **one** true agent, with everything else demoted to deterministic steps or single-shot LLM calls. The industry data pointed the same way: production agent systems that survive are overwhelmingly deterministic orchestration with bounded LLM steps and a human at the end, not free-running autonomy — the same line Anthropic draws in [*Building Effective Agents*](https://www.anthropic.com/research/building-effective-agents), which remains the best short thing written on the subject.

**The evals.** When the machinery is a chain of judgment calls rather than an algorithm, quality doesn't come from unit tests — it comes from evaluation: tracing every LLM call, measuring whether the chain's conclusions hold up, freezing the measurement instruments so movement in the numbers means something. A shellware team spends its engineering effort where a classical team spent it on the algorithm: on knowing, continuously and empirically, whether the thinking is any good.

So the stack profile of shellware is: a familiar JS front end, a thin scripting layer, no algorithmic core — and the real assets are the chain design, the prompts, the eval harness, and the boundary controls. The parts a classical code review would skim past are the product.

And the test that any of this matters is client-shaped, not architecture-shaped: the chain compresses what used to be three days of a PR coordinator's research into about an hour, and what lands on the client's desk isn't a dashboard or a score — it's a brief with named targets and prepared drafts. The client reviews, decides, sends. Useful is the eval that counts.

---

## What the shell owes the user

Thin doesn't mean opaque. The shell owes the user a few things precisely *because* they can't see the machinery:

**Show the reasoning on demand.** The default is the conclusion. But the chain's work — what it checked, what it found, what it ruled out — must be one tap away. Trust is built by the option to verify, exercised rarely.

**Present alternatives when the recommendation might be wrong.** A single answer with no exits asks too much of the user's patience. The shell leads with its best recommendation and keeps the runners-up reachable. The user corrects the system in one move, and the correction is signal.

**Keep a human on the irreversible steps** — human-in-the-loop, in the industry's phrase, with irreversibility as the gate. In Vizidex, the chain prepares the outreach; a person approves what actually gets sent. That's not a training-wheels compromise — the approve/reject stream is labeled signal that makes the chain better, and it keeps the shell's promises honest at the one point where a mistake can't be recalled.

**Never convert saved labor into new labor.** If the shell asks the user to configure the agents, tune the chain, or babysit the process, the machinery has leaked into the surface and the product has failed at its one job.

---

## The uncomfortable implication

If the shellware framing is right, most of what we've historically called "the app" — the navigation, the dashboards, the settings trees — was never the value. It was scaffolding around a gap in capability. The user operated our machinery because nothing else could.

That gap is closing. My bet — and it is a bet, not a report from the future — is that the products that win the next cycle won't be the ones with the richest surfaces but the ones with the *smallest* surfaces over the deepest machinery, where a workflow that used to take an afternoon arrives as a single prepared decision.

We're building both of our current products this way. The next two posts cover the halves of it: where value accretes when the surface shrinks, and what it takes to earn the one-click approval.
