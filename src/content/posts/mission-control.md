---
title: "Mission Control: one window for every project"
description: "A local dashboard for every project's live git state and the facts you keep in your head — plus workspace views for your commits, roadmaps, and skills. Who it's for, why it's useful, and when to combine tools instead of leaving them standalone."
part: 0
post: 4
draft: false
tags: ["tooling", "git", "dashboard", "open-source"]
---

When you're running six projects at once, the thing you lose isn't the code. It's your place.

## What it is

Mission Control is a local dashboard. One window, every project you're working on, with two things side by side: the **live git state** of each repo — branch, uncommitted, unmerged, unpushed — and the **facts about the project that normally live in your head**: what it is, where prod runs, which accounts it's tied to, the one thing you're pushing on right now.

It reads git live from each repo every time it opens. The human facts live in one small file you edit — or now, edit right in the app. Nothing leaves your machine: no server, no account, no telemetry.

## Who it's for

Anyone juggling more than a couple of active repos. If you've ever `cd`'d into a folder, run `git status`, and thought *"wait — which project is this, and what was I doing here?"* — that's the person. Solo devs, indie hackers, anyone shipping several things at once with AI agents making changes across all of them. The more projects you run, the harder it earns its place.

## Why it's useful

Two reasons.

**Status at a glance.** Instead of opening ten terminals to find the two repos with uncommitted work — or the one you forgot to push — you see all of it in one colour-coded list. The things that need attention float to the top.

**Context in one place.** The stuff you rely on but never write down — a project's stack, its prod URL, its monthly cost, what you decided to focus on — sits right next to the live git state. Come back after a week away and you're oriented in five seconds instead of re-deriving it repo by repo.

## Beyond the repos

The per-project cards were the start. What kept getting added were the views that only make sense when you can see across everything at once:

- **Work Log** — every commit you've shipped, across all your repos, on one timeline. A commits-per-day chart and a day-by-day list, filtered to today, the week, the month, or the last quarter. There's a *Copy as standup* button that drops yesterday's commits on your clipboard — and, because these projects are built with AI agents, a second chart of Claude tokens used per day, read straight from the local session logs.
- **Roadmap** — every project's `ROADMAP.md` in one place. The Now and Next of everything you're building, without opening ten files.
- **Skills** — a searchable catalogue of your Claude Code skills wherever they live: installed plugins, per-project `.claude/skills`, your user folder. The one you can never remember you already wrote.
- **PM** — a plain scratchpad, always one click away, autosaved locally. Somewhere to park the thought you'd otherwise lose.

None of these had to be their own app. They're here because "what have I shipped, what's next, what can I run" is only worth asking across every project at once.

## One place for our open-source tools

We build a lot of small open-source tools — a route-and-architecture visualiser ([VizStack](/posts/22-vizstack-2)), an agent-pipeline visualiser (AgentViz), the per-repo git scanner that started this one. Each shipped on its own and ran on its own. Mission Control is turning into the place the ones that belong together converge.

The architecture and pipeline maps already live here, as tabs on every project — VizStack and AgentViz, the same tools, now reading each repo in context instead of being pointed at one folder at a time. The workspace views — Work Log, Roadmap, Skills — grew up *inside* it, because there was nowhere else that already had every project in one window. Rather than ship five more standalone binaries you'd have to remember to open, we put each one where the context already was.

That's the rule for what folds in and what stays out: **combine when the value is the overview; keep it standalone when the tool does one job you reach for on purpose.** A kill-date CLI, a one-shot visualiser — those stay separate; you run them deliberately, one at a time. Anything whose job is *"show me across all of it"* ends up here. You just leave Mission Control open, and the tools collect in it.

---

**Get it:** Free and open source, Mac and Windows — [github.com/jokeane9/mission-control-desktop](https://github.com/jokeane9/mission-control-desktop). On a Mac, `brew install --cask jokeane9/tap/mission-control-desktop`.
