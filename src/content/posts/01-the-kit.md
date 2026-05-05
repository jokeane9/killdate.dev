---
title: "killdate-kit: a tour"
description: "The repo you fork before you start. What's in it, how the pieces connect, and how to orient yourself in Claude Code before writing a line of code."
part: 0
post: 1.5
draft: false
tags: ["setup", "killdate-kit", "getting-started"]
---

Before this series gets into the how, here's what you're working with.

[killdate-kit](https://github.com/jokeane9/killdate-kit) is the repo this entire series is built around. It's not a framework — it's a starting point. A set of files that gives your AI tools the context they need before the first session opens. Fork it, fill in the brackets, and you're oriented. Everything the series covers in depth lives here in skeleton form.

## Fork and clone

```bash
# Fork on GitHub, then:
git clone https://github.com/your-username/killdate-kit.git
cd killdate-kit
```

Open it in Claude Code. Before you touch anything else, run:

```
Read CLAUDE.md in full. Tell me the three things I need to fill in before the first session.
```

That's your onboarding. The repo tells you what it needs.

## What's in it

**`CLAUDE.md`** — the AI's operating contract. Every Claude Code session reads this before anything else. It defines the build discipline, the tool boundary, the session rhythm, and a manifest table pointing to every other doc and when to load it. This is the spine. Everything else hangs off it. Post 03 covers this in depth.

**`.cursor/rules/`** — three short files that constrain how Cursor behaves during execution: tool boundary (Cursor executes, it doesn't plan), scope guard (only touch files in the FILES block), review loop (stop after every task, don't auto-chain). These travel unchanged across projects. Post 05 covers runbooks and Cursor in depth.

**`project-management/`** — the process docs. Each one has a trigger condition — a moment in the build where it fires. The folder has a README that explains each file; read that first. The short version:

| File | Fires when |
|---|---|
| `FEATURE-LOCK.md` | Before writing any code for a feature |
| `SHIP-RULES.md` | Before any versioning or shipping decision |
| `SHIP-TO-PROD.md` | When deploying |
| `FIRST-BUILD.md` | When scoping the first build |
| `DEBUGGING-TAXONOMY.md` | When something breaks |
| `DEV-HEURISTICS.md` | By domain — fill in as you go |

**`marketing/canonical/`** — two skeleton files: `MARKETING-TRUTH.md` (who the product is for, how to talk about it) and `BEHAVIOR-SPEC.md` (what it does, what it doesn't do, what belongs in it). Fill these in before anything else. They're what every feature decision argues from. Post 04 covers this.

**`feature-builds/`** — where build artifacts live. `_playbook/` has the runbook template and a learnings doc; per-feature folders get created here as you build. Nothing to fill in upfront — this folder populates as you work.

## How to learn it in Claude Code

Don't read every file linearly. Instead, open Claude Code and ask questions:

> *Read CLAUDE.md and the project-management/README.md. Walk me through the folder structure. What should I fill in before my first session?*

> *What's the difference between FEATURE-LOCK.md and a runbook? When does each one fire?*

> *Read SHIP-RULES.md. Which pattern — Parallel Change, Strangler Fig, or Canary — applies to my first build?*

> *I'm about to start scoping my first feature. What do I open first?*

The repo is designed to be interrogated this way. The files answer questions; Claude Code connects them. You don't need to memorise the structure — you need to know what to ask.

## How it works as a system

The three tools have three jobs that don't overlap: **Claude Code** holds the context and does the thinking — it reads the lock, writes the runbook, reviews the output. **Cursor** executes against the runbook, one task at a time, only touching files it's been told to touch. **You** review the diff between every task and catch drift before it compounds.

The docs aren't documentation — they're the memory that makes this loop work. The agent has no memory between sessions. `CLAUDE.md` is the substitute. The process docs are what it reaches for when a specific moment in the build arrives.

The rest of this series covers each piece in depth. This post is just the map.
