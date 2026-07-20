---
title: "Agentic orchestration: what it is, what it isn't"
description: "The term is everywhere. The meaning is buried. Here's the simplest version that's still true."
part: 0
post: 0
section: playbook
group: "Foundations"
draft: false
tags: ["orchestration", "intro"]
---

"Agentic orchestration" has become one of those phrases that sounds impressive in a LinkedIn post and means almost nothing by the time it reaches you. Founders use it to describe their SaaS dashboards. VCs use it to justify round sizes. Twitter uses it to mean "I gave ChatGPT a long prompt."

I'm going to try to pin it down simply — not because the simple version is the complete version, but because the simple version is the one that's actually useful when you're trying to ship something.

## What it is

You have multiple AI tools. Each one is good at different things. **Orchestration** is the practice of deciding which tool does which job, in what order, with what context, so the output of the whole system is better than any single tool could produce alone.

That's it. It's not magic. It's not autonomous. You are still the one making decisions. The AI tools are executing within a structure you've defined.

The "agentic" part means the AI can take sequences of actions — not just answer one question, but read a file, write code, run a command, check the output, and repeat. It can reason across multiple steps without you prompting each one manually.

Put them together: **agentic orchestration** is building a working system where multiple AI tools operate across sequences of tasks, each in their lane, within a structure you've designed.

## What it isn't

It's not autonomous. Every serious practitioner I know is still deeply in the loop. The AI handles execution. You handle judgment, direction, and the decisions that have real consequences.

It's not just using Claude or ChatGPT in a chat window. That's prompting. Valuable, but not the same thing. Orchestration involves structure, context management, tool boundaries, and a repeatable process.

It's not the same as "vibe coding" — prompting an AI to generate code and hoping it works. That produces output. Orchestration produces systems.

It's not product strategy or commercialization. This series covers how to build — not what to build, whether the market wants it, or how to price it. Those are real disciplines and they matter, but they're not covered here. Come to this series having already made those decisions.

## Why it matters right now

The tools got good enough, fast. Claude Code can read an entire codebase, reason about how pieces connect, write code that actually integrates, and run it. Cursor can open a file, understand the component it's looking at, and produce tight implementation against a spec. GitHub Actions can deploy what they built.

A year ago these tools existed but weren't reliable enough to trust with real work. Now they are — if you structure the work correctly. That's the unlock. Not the tools themselves. The structure around them.

Most people using AI for development are still prompting one tool at a time, context-switching manually, and losing thread between sessions. Orchestration is what replaces that pattern with something that compounds.

## The structure that makes it work

Three things:

**1. A context document your AI tools read every session.** On this project I use `CLAUDE.md` — it tells every AI tool what the project is, what the rules are, what each tool is responsible for, and what not to touch. It's the thing that makes "agentic" not mean "unpredictable." I'll cover this in detail in the next post.

**2. Clear tool boundaries.** Claude Code for reasoning across the whole system. Cursor for tight implementation on specific surfaces. Each tool does what it's actually good at. When you blur the boundary you get drift — output that looks right but doesn't integrate.

**3. A process for each type of work.** Bug fix, new feature, prompt change, deploy — each has a defined sequence. Not because process is good in itself, but because without it you lose the ability to reason about what went wrong when something breaks in production.

The rest of this series walks through all three in detail, grounded in an actual AI product we built and shipped. The repo with everything — the `CLAUDE.md` template, the playbook, the process docs — is there for you to fork.

This isn't theory. It's a description of how we worked. Some of it will be wrong for your stack. Some of it will be exactly what you needed. Take what's useful.

## If you've already internalized this

For a lot of practitioners reading this, the above is old news. You already have a tool boundary. You already know Claude Code is for reasoning across the system and Cursor is for tight implementation. You've probably already felt the pain of not having it written down. Worth noting: **OpenAI Codex** is rapidly becoming a serious contender to Claude Code in this space — the tool landscape is moving fast and this comparison will look different in six months.

What you're more likely here for is the process underneath — how we constrain these tools so they behave like a senior engineer who's read every doc and never forgets anything:

- **Canonical first.** Product canonical documentation — what you're building, grounded in actual customer conversations. Before any code, this goes in a doc. Your `CLAUDE.md` (or `agents.md` on Codex) internalizes it every session. New features validate against it before a line is written, either against the original or a new section from recent conversations. No drift. No AI building the wrong thing.

- **Features ship via runbooks.** Every build starts with a written runbook — scope, constraints, blast radius. Claude Code writes it. Cursor executes against it. Nothing moves until it's signed off. We built a full suite: pre-build lock, 6-step anti-drift pipeline, Cursor brief, prompt change discipline, deploy checklist, debugging taxonomy, dev heuristics register. Each exists because something broke without it. No larger feature gets built outside Cursor. We tried other tools. They fail, hard.

- **Testing has its own docs.** We wrote dedicated testing learnings from every production failure — what broke, which layer, why the test didn't catch it. The 90/10 rule keeps the suite lean: test shared code with downstream consequences, skip cosmetics. For AI output, a cross-language contract (Pydantic + TypeScript, one golden fixture) catches schema drift before it ships.

- **Dev → staging → production.** Features run in local dev first, then an on-demand staging environment (spun up, tested, torn down — zero ongoing cost), then a canary rollout to one user in production before full expansion. Every version ships with a kill-date and sunset criterion in the PR. The prior version stays bootable until the sunset is confirmed. We also give Claude Code direct GitHub CLI and AWS CLI access — it runs in YOLO mode, bypassing permission prompts, and handles deploys end to end. This is fast. It's also why being technical isn't optional here.

- **`CLAUDE.md` (or `AGENTS.md`) is the memory.** Without it, the model makes trash up. It has no memory between sessions — every time you open one, it starts cold. `CLAUDE.md` is what you read every session without exception: session log, roadmap, open bugs, canonical index. That's Tier 1 — always loaded, always current, stops drift before it starts. Tier 2 is where we define focused development processes — runbooks, the agile playbook, deploy checklist, debugging taxonomy — and force the model to run them when we're working together. It doesn't get to freestyle. For small teams and solo work, this also turns out to be the best PM system we've found. You open a session and know exactly where you are.

- **No PM overhead.** Scoping, sequencing, drift prevention, session handoff — it's all in the docs. Smaller team, fully technical, ships faster because the process is in the tools, not managed by a person in the middle.

That's the model. The rest of this series is the detail. Honestly? I personally wouldn't read half this prose — I'd grab the repo, open it in Claude Code, and start asking questions. Explore it like a new codebase. Read a post when you get lost. Then back to Claude Code. That's the fastest way in. The blog is scaffolding. The repo is the tool.

Those are Part 2 through Part 5 of this series. Skip Part 1 if you want. It'll still be there.

## Who this is for

If you're still reading: this series is written for technical PMs, product engineers, and developers who want to ship faster on independent or small-team projects. You need to be comfortable in a terminal. You need to be able to read a diff. You don't need to be a senior engineer, but you need to be close enough to the code that you can tell when something's wrong.

The practitioner moving toward this kind of workflow isn't abandoning engineering rigour — they're applying it to a new set of tools. The CLAUDE.md is your spec. The runbook is your build plan. The anti-drift pipeline is your QA process. Nothing here replaces thinking. It replaces the parts that don't need thinking — the boilerplate, the context-switching, the "where were we" overhead that eats hours without producing anything.

That's the intended audience. If that's you, the repo is the fastest place to start. If it's not — I'd personally avoid all of this.

Next post is the tools you need to know and the technologies to be familiar with. Then straight into the practical: working with agentic tools in a controlled, structured way — built for shipping and getting to production.

---

**Repo:** Everything referenced in this series — the `CLAUDE.md` template, runbooks, playbook, process docs — is at [killdate.dev](https://killdate.dev). Fork it, break it, make it yours.
