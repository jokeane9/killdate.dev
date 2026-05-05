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

| File | Fires when | What it does |
|---|---|---|
| `FEATURE-LOCK.md` | Before writing any code for a feature | Gate-by-gate scope lock you fill in before Cursor opens a file. Defines what's IN and OUT, the single change this build makes, blast radius (what other surfaces it touches), mock requirements, and a kill date for any temporary code. A blank gate blocks the build. |
| `SHIP-RULES.md` | Before any versioning or shipping decision | The three shipping patterns — Parallel Change, Strangler Fig, Canary Release — and the versioning rubric (MAJOR/MINOR/PATCH/NO BUMP). Also the N-1 rule: N-1 must stay bootable, N-2 gets deleted. Rules you reason from, not just follow. |
| `SHIP-TO-PROD.md` | When deploying | Step-by-step deploy sequence: pre-deploy checks, migrations, canary (one user first), post-deploy verification. No skipped steps. Rollback is a flag flip, not a redeploy. |
| `FIRST-BUILD.md` | When scoping the first build | How to apply the feature lock to your very first build. Infrastructure pre-steps before Cursor opens a file, gate-by-gate notes for the MVB context. Read once at project start; use `FEATURE-LOCK.md` directly from build two onwards. |
| `DEBUGGING-TAXONOMY.md` | When something breaks | Classifies bugs by layer before you fix anything: Data / Model / API / UI / Integration / Config / Infrastructure. Includes bug ID prefixes for `KNOWN-ISSUES.md` and a diagnostic sequence. The point: most debugging time is wasted fixing the wrong layer. |
| `DEV-HEURISTICS.md` | By domain — fill in as you go | Blank entries indexed by domain: auth, database, API, deploy, testing. "If you're touching X, remember Y." Add an entry every time you re-learn something that should have been written down. Starts empty — the value accumulates. |

**`marketing/canonical/`** — two skeleton files: `MARKETING-TRUTH.md` (who the product is for, how to talk about it) and `BEHAVIOR-SPEC.md` (what it does, what it doesn't do, what belongs in it). Fill these in before anything else. They're what every feature decision argues from. Post 04 covers this.

**`feature-builds/_playbook/`** — two files you reach for every time you hand a task to Cursor.

`BUILD-RULES.md` is the runbook template. Five blocks: FILES, TYPES, SKELETON, PROHIBITED, VALIDATE. Includes a fully worked example. Copy it per task, fill it in, hand it to Cursor.

`BUILD-LEARNINGS.md` is a principles doc — hard-won lessons about how Cursor actually behaves, where it drifts, and what to put in the prompt vs. what to `@`-reference. Read this before writing your first runbook.

Per-feature folders live alongside the playbook (`feature-builds/your-feature/`) and get created as you build. Each one holds the runbook files for that feature.

## How to learn it in Claude Code

Don't read every file linearly. Instead, open Claude Code and ask questions:

> *Read CLAUDE.md and the project-management/README.md. Walk me through the folder structure. What should I fill in before my first session?*

> *What's the difference between FEATURE-LOCK.md and a runbook? When does each one fire, and what happens between them?*

> *Read SHIP-RULES.md. Which pattern — Parallel Change, Strangler Fig, or Canary — applies to my first build?*

> *I'm about to start scoping my first feature. What do I open first?*

The repo is designed to be interrogated this way. The files answer questions; Claude Code connects them. You don't need to memorise the structure — you need to know what to ask.

## How the repo works as a system

`CLAUDE.md` is the root. It points to everything else and defines when each file matters. Without it, the rest is just a pile of docs.

The files have a sequence. `marketing/canonical/` comes first — you fill in what the product is before anything else. `FIRST-BUILD.md` gets you through the initial build. From build two onwards, every feature starts with `FEATURE-LOCK.md`, uses `SHIP-RULES.md` to decide how to ship it, and deploys via `SHIP-TO-PROD.md`. `DEBUGGING-TAXONOMY.md` and `DEV-HEURISTICS.md` fill in as the project accumulates history.

The `feature-builds/` folder mirrors that history. Each feature leaves an artifact — the lock, the runbooks, the decisions made. The `_playbook/` is stable across all of them; the per-feature folders are the record.

Nothing is designed to be read all at once. The trigger conditions are the point — each file is the right file at a specific moment. The repo earns its value by being reached for, not by being studied.

The rest of this series covers each piece in depth. This post is just the map.
