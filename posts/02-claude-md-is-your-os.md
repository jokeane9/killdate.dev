---
title: "Your CLAUDE.md is your operating system"
description: "CLAUDE.md isn't a readme. It's the persistent context layer that tells your AI agent who it is, what it's allowed to do, and how to behave across every session."
part: 1
post: 2
draft: true
tags: ["claude-md", "setup", "context-management", "session-discipline"]
---

Every time you open a Claude Code session, the agent reads `CLAUDE.md` before it does anything else. That's not a feature — it's the design. The file is your persistent context layer. It's the thing that makes the agent consistent across sessions instead of starting blank every time.

If you don't have one, the agent improvises. If you have a bad one — vague, outdated, missing the stuff that actually matters — it improvises with false confidence. Both are worse than you think.

**`CLAUDE.md` is your operating system.** Everything the agent does is downstream of it.

## The two tiers

There's a structural distinction that matters immediately: Tier 1 (read every session) and Tier 2 (read on trigger).

**Tier 1 is your always-on context.** These are the things the agent must know before it does anything — what the product is, what the build discipline is, where state lives, what the session rhythm looks like. On Shelf, Tier 1 is ~300 lines and includes:

- The last 80 lines of `_log.md` — what happened in the previous session
- The roadmap — what's next and in what order
- Known issues — open bugs only
- The canonical product definition — what the product actually IS

Every session, no exceptions, these get read. The agent can't operate without them.

**Tier 2 is your reference library.** These files exist and are documented in `CLAUDE.md`, but the agent only pulls them when the task demands it. The architecture doc, the testing philosophy, the deploy checklist, specific feature build folders — these live in Tier 2. You don't need to load everything; you need to know where everything is.

The reason for this split is practical: you don't want 3,000 lines read at the start of every session. You want the minimum viable context to be always-on, and everything else to be reachable.

## What goes in Tier 1

The test for Tier 1 is simple: if the agent doesn't know this, it will make a mistake in the first five minutes. For most projects, that means:

- **The build discipline spine** — what patterns govern how you ship changes (more on this in later posts)
- **The tool decision boundary** — Claude Code vs Cursor and when to use which
- **Session start and end ritual** — what to read at start, what to update at end
- **The state files** — where to find the log, the roadmap, the known issues
- **Any non-obvious project-level rules** — things the agent would never guess from reading the code alone

The Shelf `CLAUDE.md` opens with the product truth (where the canonical lives), then immediately goes into build discipline. The three-legged spine — rulebook, pipeline, lock template — is called out explicitly because those three documents govern every feature build and the agent needs to know they exist and that they work together.

## What goes in Tier 2

Tier 2 is documentation that's stable and reference-quality. The agent doesn't need it unless it's doing something specific. On Shelf:

- Architecture doc: read before any deploy or on first session of the day
- Dev setup: read when "load dev" is triggered
- Testing learnings: read before any session touching tests
- Feature build folders: read when working on that specific feature
- Stack decisions: read before any architecture or permanent decision

The key is that every Tier 2 file has a **trigger condition** written next to it. "Read when…" is not optional. Without triggers, Tier 2 is just a pile of docs that never gets read.

## The session rhythm

`CLAUDE.md` on Shelf explicitly defines what happens at session start and session end. This isn't bureaucracy — it's the mechanism that makes context transfer work between sessions.

Session start: check git status, read Tier 1 files, check overnight health status if applicable, give a status summary before starting work.

Session end: update `_log.md`, update the roadmap, note any new bugs, record any permanent decisions to `STACK.md`, run git status and summarize what's uncommitted.

This is how state survives between sessions. If it isn't written to `_log.md`, it's gone. The agent doesn't have memory between sessions — the files are the memory.

## The session greeting

One section worth stealing verbatim: the "Where are we?" handler. When a session opens with a status check — "catch me up," "where are we," "what did we do last" — the agent should not start work. It should read Tier 1, check for overnight alerts, summarize status, call out any "RESUME HERE" markers left in `_log.md`, and wait.

This single pattern has saved enormous amounts of session drift. You always know where you are before you start.

## The anti-improvisation principle

The whole point of `CLAUDE.md` is that the agent should never have to guess about project-level decisions. Where does state live? It's in the file. What tool handles this kind of build? It's in the file. What happens when a gate fails? It's in the file.

Every time you're in a session and you find yourself thinking "I've explained this before," that's a `CLAUDE.md` update. The file absorbs the decisions you've made so you don't have to re-make them.

---

**Action:** Fork the Shelf repo and use the `CLAUDE.md` there as your starting template. Strip out the Shelf-specific content, populate Tier 1 with your project's build discipline and state files, and write trigger conditions for everything in Tier 2. Don't overthink the first version — you'll update it after your first session. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
