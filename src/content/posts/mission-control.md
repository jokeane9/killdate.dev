---
title: "Mission Control: one window for every project"
description: "A local dashboard that puts every project's live git state next to the facts you keep in your head. Who it's for, why it's useful, and when to combine tools instead of leaving them standalone."
part: 0
post: 26
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

## Combined, not bundled

Mission Control is where a few of our smaller tools ended up together: the per-repo git scanner, plus the architecture and pipeline maps that now show up as tabs on each project. They merged because the value *is* the overview — seeing everything at once is the whole point.

That's the rule we use for whether to combine tools or leave them apart: **combine when the value is the overview; keep it standalone when the tool does one job you reach for on purpose.** A kill-date CLI, a single visualiser — those stay separate. You run them deliberately, one at a time. Mission Control you just leave open.

---

**Get it:** Free and open source, Mac and Windows — [github.com/jokeane9/mission-control-desktop](https://github.com/jokeane9/mission-control-desktop). On a Mac, `brew install --cask jokeane9/tap/mission-control-desktop`.
