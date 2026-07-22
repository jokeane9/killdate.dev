---
title: "Claude Code vs Cursor: it's not either/or"
description: "Everyone frames it as a fight. It's a division of labor — Claude Code plans and orchestrates, Cursor executes. Here's where each one wins, and why running both beats picking one."
part: 1
post: 12
section: playbook
group: "Tooling"
draft: false
tags: ["claude-code", "cursor", "workflow", "orchestration", "tooling"]
---

*6 minute read*

Every "Claude Code vs Cursor" comparison I've read tries to crown a winner. That framing is the reason people get worse results than they should — out of both tools.

They're not competitors. They're two halves of one workflow. Claude Code is where you think; Cursor is where you build. Pick one for everything and you're using a screwdriver as a hammer half the time.

Here's the division of labor I actually run, and why it lands where it does.

## What Claude Code is good at: the whole picture

Claude Code reads the entire repo before it touches anything. That's the whole game. When I'm scoping a feature — enumerating what's protected, writing the [pre-build lock](/posts/14-scoping-the-feature/), mapping the blast radius — I need a tool that can hold the codebase in its head and answer *"if I change this shared type, what else breaks?"* That's not a code-completion question. It's a whole-repo question, and it's where Claude Code is unmatched.

So Claude Code owns:

- **Planning and scoping** — the lock, the invariants inventory, the single surgical-change sentence.
- **Orchestration** — deciding which tool does which job, wiring [MCP servers](/posts/23-mcp-servers/), reading logs, running the harness.
- **Authoring the runbook** — the step-by-step a build will follow.
- **Anything that needs the full repo as context** — audits, refactors-on-paper, "where is this actually used."

It's the planner. It decides *what* happens and in *what order*.

## What Cursor is good at: the surgical change

Cursor is where the [runbook](/posts/06-runbooks/) becomes code. Once I know exactly what changes — one component, one route, one field — Cursor's tight in-editor loop is faster than anything else: see the diff, accept, adjust, repeat, with the file right in front of you.

So Cursor owns:

- **Executing a scoped build** — one surgical change at a time, from a runbook.
- **The edit–review loop** — fast iteration on a known target.
- **Staying inside the lines** — because the scope was already set upstream, in Claude Code.

It's the executor. It does the thing, and it does it well — when the thing is already defined.

## The handoff is the whole point

The mistake isn't picking the wrong tool. It's skipping the handoff.

| Job | Tool |
|---|---|
| Read the repo, decide scope | Claude Code |
| Write the pre-build lock | Claude Code |
| Author the runbook | Claude Code |
| Make the surgical change | Cursor |
| Iterate on the diff | Cursor |
| Verify the invariants held | Claude Code |

When people say *"Cursor made a mess,"* it's usually because they asked Cursor to plan — to figure out scope on the fly, in a tool that can't see the whole board. When people say *"Claude Code is slow,"* it's usually because they're using it for the tight edit loop that Cursor does better.

Use Claude Code to decide. Use Cursor to do. The runbook is the seam between them — and if you've read anything else here, you know how much I care about that seam.

## So which should you use?

Both. In that order.

If you only have room for one in your head right now: **Claude Code** — because the planning is where the leverage is. A bad plan executed fast in Cursor is just a mess arriving sooner. A good plan makes the execution tool almost interchangeable.

The "vs" was never the right question. The question is which one you hand each job to.

---

**In the repo:** this is the same workflow the lock and runbook docs assume. Start a feature in Claude Code, hand the runbook to Cursor, come back to Claude Code to verify the invariants held.
