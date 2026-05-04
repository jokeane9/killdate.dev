---
title: "The tools you actually need"
description: "Claude Code is not Cursor. Cursor is not Claude Code. Using the wrong one for the wrong job is where projects start to drift."
part: 1
post: 1
draft: true
tags: ["tooling", "claude-code", "cursor", "orchestration"]
---

Two tools. Different jobs. Most people use them interchangeably and then wonder why things go sideways.

**Claude Code** is a terminal agent. It runs in your shell, reads your whole codebase, writes files, executes commands, and operates across the entire project. It doesn't have a GUI. It doesn't care about what tab you have open. When you ask it to do something, it figures out what needs to happen across all the layers — config, schema, server logic, tests, docs — and does it.

**Cursor** is an IDE. It's excellent at file-level work with tight scope: you're looking at a component, you want to rewrite it, you have the context right there. The AI assistance is good at what's in front of it. It's not trying to reason about your whole project.

That's the core distinction. Claude Code = project-wide. Cursor = file-level.

## What "orchestration layer" actually means

When people say "orchestration layer," they usually mean something vague about AI managing AI. Ignore that.

In practice, orchestration means: there's a document that tells your AI agent what it's allowed to do, in what order, under what constraints, and what to do when things go wrong. That document is your `CLAUDE.md`. It's the operating system for your project — the instructions that run before anything else.

The orchestration is Claude Code reading `CLAUDE.md` at session start and understanding: what patterns govern this codebase, which tool should do which job, what the decision boundaries are, when to stop and ask.

Without that, you have an AI that's improvising. Sometimes that's fine. On a living product with paying users, it's not.

## When to use Claude Code

Claude Code handles anything that requires seeing the whole project at once:

- **Architecture decisions** — connecting the dots between layers, understanding blast radius, reasoning about what a change touches across the codebase
- **Infrastructure and deploy ops** — AWS CLI, GitHub Actions, running migrations, monitoring deploys
- **Bug fixes** — tracing a bug through multiple files, fixing it in the right place, not just the obvious place
- **Prompt work** — editing system prompts, versioning them, wiring feature flags
- **Documentation** — updating `CLAUDE.md`, session logs, runbooks
- **Relabeling or rerouting existing data** — changes to what existing fields display, not new data entering the system

On Shelf, the rule is simple: if the task doesn't require new screen real estate, Claude Code is the right tool.

## When to use Cursor

Cursor earns its place when the build is primarily UI — new surfaces, new interactions, code that needs a high-fidelity visual reference alongside it. Five questions tell you it's a Cursor build:

1. Is new data entering the system for the first time?
2. Is this a component, card, page, or section that doesn't exist yet?
3. Does it require a schema migration?
4. Does it touch 3 or more layers simultaneously (e.g. Python pipeline + database + React component)?
5. Is it a new user-facing flow — onboarding, settings, billing?

If any of those are yes, it's a Cursor build. The billing page on Shelf — 9 tasks, 6 billing states, schema migration, webhook handler, nav update — went through Cursor. It's the right tool for that kind of contained, UI-heavy vertical slice.

## What happens when you use the wrong one

Using Claude Code where you should be using Cursor: you get drift. Claude Code is reasoning about the whole project, not optimizing for one screen. It'll do what you ask, but the output is often harder to review because the scope is too wide.

Using Cursor where you should be using Claude Code: you get local optimality. The file looks right, but it doesn't integrate correctly with the rest of the system. Cursor doesn't have the context to know what it should and shouldn't touch. It'll "improve" adjacent files it didn't need to touch, rename variables, add things that weren't asked for.

The best control mechanism for Cursor is a runbook with explicit `FILES` blocks — a hard list of exactly which files can be modified per task. That's what makes Cursor safe on a living codebase. (More on runbooks in a later post.)

## The simple version

Open Claude Code when you need to think across the project. Open Cursor when you need to build a specific UI thing. Write down the decision boundary somewhere so both tools know the rules.

That somewhere is `CLAUDE.md`.

---

**Action:** Fork the Shelf repo, read the `Claude Code vs Cursor — Build Boundaries` section in `CLAUDE.md`, and write your own version of that section for your project. Five bullets per tool is enough to start. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
