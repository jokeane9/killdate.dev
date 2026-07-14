---
title: "The broader toolset"
description: "Adjacent tooling for orchestration. What each tool is actually for, where to learn, and what to avoid using wrong."
part: 0
post: 3
draft: false
tags: ["tooling", "claude-code", "cursor", "orchestration"]
---

Two tools. Different jobs. Most people use them interchangeably and then wonder why things go sideways.

## Claude Code

Terminal agent. Runs in your shell, reads your whole codebase, writes files, executes commands. It doesn't have a GUI. When you ask it to do something, it figures out what needs to happen across all the layers — config, schema, server logic, tests, docs — and does it.

Use it for: architecture decisions, infrastructure and deploy ops, bug fixes that span multiple files, prompt work, documentation, anything that requires seeing the whole project at once. If the task doesn't require new screen real estate, Claude Code is usually the right tool.

## Cursor

An IDE. Excellent at file-level work with tight scope: you're looking at a component, you want to rewrite it, you have the context right there. The AI assistance is good at what's in front of it. Not trying to reason about your whole project.

Use it for new surfaces, new interactions, schema migrations, anything that touches 3+ layers simultaneously — pipeline, database, UI. New user-facing flow? Cursor build. Claude Code writes the runbook. Cursor executes against it.

## OpenAI Codex

Codex is becoming a genuine go-to — not as a Claude Code replacement, but for a different kind of work. Where Claude Code executes and Cursor builds, Codex is strongest at **judgment**: reasoning through a problem before you've committed to an approach, second-opinions on architecture, thorough analysis when you want something divorced from whatever assumptions you've already baked in.

It tends to be more methodical than Claude when reasoning through ambiguous decisions — slower, but often more thorough. When I'm stuck on something structural, or I want a sanity check on a plan before I build it, Codex is where I go. The two tools complement each other well. Claude Code for execution. Codex for thinking out loud before you commit.

Worth watching closely — the gap between this and Claude Code on complex reasoning is narrowing fast.

## The broader tool landscape

**Perplexity** — research before you build. Real-time web index, cited sources. When you're trying to understand a customer segment or validate a problem, Perplexity beats a generic chatbot because it tells you where it got the information. Use it before you write a spec.

**Gemini** — good at bug identification. Paste a stack trace and context into Gemini before spending an hour reading the same code again. Often right in a way that's different from how Claude approached it — and that's the point.

**Claude Design (claude.ai)** — useful for ideation: UI/UX concepts, copy, visual hierarchy, feature framing. Not a replacement for Figma — you still need real mocks before any code gets written. But for generating and stress-testing ideas before you commit to a direction, it's genuinely useful. More on the design workflow later.

## Git tooling

**Fork** — Mac and Windows git GUI. When an AI has made changes across 12 files, you need to see exactly what's staged and what a diff actually looks like at the hunk level before you commit. Fork makes that review fast enough that you actually do it every time.

## What happens when you use the wrong one

Using Claude Code where you should be using Cursor: drift. Claude Code is reasoning about the whole project, not optimising for one screen. Output is harder to review because the scope is too wide.

Using Cursor where you should be using Claude Code: local optimality. The file looks right, but it doesn't integrate correctly with the rest of the system. Cursor doesn't have the context to know what it should and shouldn't touch. It'll "improve" adjacent files it didn't need to touch, rename variables, add things that weren't asked for.

The best control mechanism for Cursor is a runbook with explicit `FILES` blocks — a hard list of exactly which files can be modified per task. That's what makes Cursor safe on a living codebase. More on runbooks in a later post.

---

**In the repo:** The `CLAUDE.md` template has the Claude Code vs Cursor decision boundary written out as a starting reference. Read that section, then write your own version for your project. Five bullets per tool is enough to start.
