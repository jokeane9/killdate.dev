---
title: "Figma + Claude: how iterative design actually works"
description: "Three tools, three jobs, no overlap. Figma decides shape. Claude prototypes. Claude Code implements. The gap between them is where drift lives."
part: 4
post: 19
draft: false
tags: ["design", "figma", "workflow", "ui-ux", "iteration"]
---

AI tools don't replace design skill. They change where the skill gets applied. There is zero replacement for a designer who is genuinely skilled in Figma — the fundamentals of hierarchy, spacing, state coverage, and interaction logic still have to come from somewhere. If they don't come from a designer, they come from the AI making it up. And without a locked design spec, you are in no man's land: open territory where nothing has been agreed and anything can drift in from any direction. You will not like what gets built.

## What the AI tools are actually good for

**Claude Design** is excellent for ideation. Novel layout ideas, exploring interaction patterns, generating options quickly. What it cannot do is execute. It produces interesting starting points, not finished design. Treat its output as raw material — useful for direction, not for handing to Cursor.

**Claude Code** is an underrated prototyping tool. Give it a design brief and it will produce a working, clickable HTML/CSS prototype. Not a mock — something the whole team can open in a browser, click through, and react to. This is often faster than building in Figma for complex flows, and the output is real enough to surface interaction problems before a line of production code is written.

## The workflow that actually works

Lock the design in Figma first. Real frames, real spacing, real component hierarchy — not rough sketches. Figma is the spec. Claude Code implements what Figma locked, not what it thinks Figma meant.

Before the Figma lock: **UX state diagrams**. Every surface a user touches has states — loading, empty, error, populated, and all the edge cases between. Draw them before you design them. A state you didn't diagram is a state Cursor will invent mid-build. The billing page example elsewhere in this series had six billing states mapped in a transition diagram before a single Figma frame was touched. That diagram was what made the subsequent design work fast and the build clean.

When a feature is complex enough that stakeholders need to feel it before committing to the design, skip straight to a Claude Code prototype. Describe the interaction, hand it a skeleton, and get back a clickable HTML/CSS prototype in minutes. The whole team can open it, click through it, and give real feedback. This closes the gap between "described in a doc" and "actually understood" faster than any other tool in the workflow.