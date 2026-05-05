---
title: "CLAUDE.md / AGENTS.md: pre-build session discipline"
description: "CLAUDE.md isn't a readme. It's the persistent context layer that tells your AI agent who it is, what it's allowed to do, and how to behave across every session."
part: 1
post: 3
draft: false
tags: ["claude-md", "setup", "context-management", "session-discipline"]
---

Every time you open a Claude Code session, the agent reads `CLAUDE.md` before it does anything else. That's not a feature — it's the design. The file is your persistent context layer. It's the thing that makes the agent consistent across sessions instead of starting blank every time.

If you don't have one, the agent improvises. If you have a bad one — vague, outdated, missing the stuff that actually matters — it improvises with false confidence. Both are worse than you think.

**`CLAUDE.md` is your operating system.** Everything the agent does is downstream of it.

## Core and Reference

There's a structural distinction that matters immediately: **Core** (read every session) and **Reference** (read on trigger).

**Core is your always-on context.** These are the things the agent must know before it does anything — what the product is, what the build discipline is, where state lives, what the session rhythm looks like. A tight Core is typically ~300 lines and covers:

- The last 80 lines of `_log.md` — what happened in the previous session
- The roadmap — what's next and in what order
- Known issues — open bugs only
- The canonical product definition — what the product IS — and a manifest table that indexes every reference doc: what it covers, when to load it, and when to flag that a process is undocumented

Every session, no exceptions. The agent can't operate without them.

**Reference is your library of process docs and project state.** These files exist and are documented in `CLAUDE.md`, but the agent only pulls them when the task demands it. You don't need to load everything; you need to know where everything is.

The reason for this split is practical: you don't want 3,000 lines read at the start of every session. You want the minimum viable context always-on, and everything else reachable.

## What goes in Core

The test for Core is simple: if the agent doesn't know this, it will make a mistake in the first five minutes. For most projects, that means:

- **The build discipline spine** — what patterns govern how you ship changes (more on this in later posts)
- **The tool decision boundary** — Claude Code vs Cursor and when to use which
- **Session start and end ritual** — what to read at start, what to update at end
- **The state files** — where to find the log, the roadmap, the known issues
- **Any non-obvious project-level rules** — things the agent would never guess from reading the code alone

Your `CLAUDE.md` opens with the product truth (where the canonical lives), then immediately goes into build discipline. The three-legged spine — rulebook, pipeline, lock template — is called out explicitly because those three documents govern every feature build and the agent needs to know they exist and that they work together.

## What goes in Reference

Reference docs split into two distinct groups — and keeping them separate matters.

**State and planning** — for humans. Day-to-day orientation, architecture decisions, lessons from production. The agent uses these too, but they exist primarily so *you* always know where things stand.

| Doc | What it is |
|---|---|
| `_log.md` | Session history — what happened, what's mid-flight |
| `ROADMAP.md` | What's next, in priority order |
| `KNOWN-ISSUES.md` | Open bugs only |
| `STACK.md` | Permanent architecture decisions |
| `TESTING-LEARNINGS.md` | Lessons from production failures |
| `ARCHITECTURE.md` | How the system fits together |

**Process controls** — these constrain how the LLM works on a given task. Without them, the model defaults to its training data: generic patterns, invented processes, no memory of what broke last time. These docs are what replace that with *your* process.

| Doc | What it stops the AI from doing | Fires when |
|---|---|---|
| `SHIP-RULES.md` | Inventing its own versioning / shipping pattern | Before any feature build |
| `FEATURE-LOCK.md` | Treating feature scope as open-ended, writing code before scope is locked | Before writing code |
| `SHIP-TO-PROD.md` | Winging deploys, skipping preflight and canary | When shipping |
| `DEBUGGING-TAXONOMY.md` | Jumping to a fix before diagnosing the right layer | When something breaks |
| `DEV-HEURISTICS.md` | Re-learning known pitfalls in the same domain | By domain |

The key is that every Reference file has a **trigger condition** written next to it. "Read when…" is not optional. Without triggers, Reference is just a pile of docs that never gets read.

## The session rhythm

`CLAUDE.md` explicitly defines what happens at session start and session end. This isn't bureaucracy — it's the mechanism that makes context transfer work between sessions.

Session start: check git status, read Core files, check overnight health status if applicable, give a status summary before starting work.

Session end: update `_log.md`, update the roadmap, note any new bugs, record any permanent decisions to `STACK.md`, run git status and summarize what's uncommitted.

This is how state survives between sessions. If it isn't written to `_log.md`, it's gone. The agent doesn't have memory between sessions — the files are the memory.

## The session greeting

One section worth stealing verbatim: the "Where are we?" handler. When a session opens with a status check — "catch me up," "where are we," "what did we do last" — the agent should not start work. It should read Core, check for overnight alerts, summarize status, call out any "RESUME HERE" markers left in `_log.md`, and wait.

This single pattern has saved enormous amounts of session drift. You always know where you are before you start.

## The anti-improvisation principle

The whole point of `CLAUDE.md` is that the agent should never have to guess about project-level decisions. Where does state live? It's in the file. What tool handles this kind of build? It's in the file. What happens when a gate fails? It's in the file.

Every time you're in a session and you find yourself thinking "I've explained this before," that's a `CLAUDE.md` update. The file absorbs the decisions you've made so you don't have to re-make them.

## Testing policy belongs here too

The testing rule belongs in `CLAUDE.md` — not in your head, and not left to Cursor's judgment. Without it, Cursor writes tests for everything or nothing, depending on what the task prompt implies. Both outcomes are bad: a test suite that's bigger than the codebase it protects, or a codebase with no regression coverage at all.

The rule that works: test when a change touches shared code. If a function is used by multiple routes, models, or services, a silent regression there propagates everywhere. That's the boundary. Single-route UI components, CSS, copy changes — skip it.

This goes in Core. Claude Code reads it at session start and applies it to every runbook task it writes. The VALIDATE criterion for a shared utility task includes running the relevant tests. The VALIDATE criterion for a CSS change doesn't mention them. The decision is pre-made in `CLAUDE.md` and enforced via the task spec — Cursor doesn't decide, Claude Code does, and it does so consistently because the rule is always loaded.

---

**In the repo:** Clone it, open it in Claude Code, and run this:

> Read CLAUDE.md in full. Walk me through what's in Core vs Reference, what trigger conditions are already defined, and what I need to fill in for my own project. Then tell me the first three things I should change before starting any real work.

That's the fastest way in. The file will tell you what it needs.
