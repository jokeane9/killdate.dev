---
title: "What Is the Model Context Protocol (MCP)?"
description: "MCP is how you give an AI model a live connection to your tools and data — databases, APIs, browsers — so it can act on real state instead of working blind. Here's what it is and where to go next."
part: 1
post: 8
section: playbook
group: "Tooling: MCP"
draft: false
tags: ["mcp", "model-context-protocol", "claude-code", "tooling", "ai-agents"]
---

*4 minute read*

The Model Context Protocol (MCP) is a standard way to give an AI model a live connection to something outside itself — a database, an API, a browser, a file system — so it can query real state and take real actions mid-conversation, instead of guessing from whatever you pasted into the chat.

That's the whole idea. Everything else is detail.

## The problem it solves

Without MCP, a coding assistant works blind. It sees your files and whatever command output you hand it, and nothing else. So you end up in a loop:

> "Run `SELECT count(*) FROM orders WHERE status = 'paid'` and paste the result."

You run it. You paste it. The model answers. Repeat — every schema check, every deploy, every CI status. The model can't see live state, so *you* are the integration layer, copying data back and forth by hand.

MCP removes you from that loop. The model queries the database directly, checks CI directly, drives the browser directly. It stops guessing and starts observing.

## How it works, in one breath

An MCP **server** is a small program that exposes a set of **tools** — typed functions the model can call. The model (the **client**) sends a tool call as JSON, the server runs it and returns JSON. That's it: two pipes, structured messages, no HTTP or webhooks required. The server describes each tool in plain language, and the model reads those descriptions to decide which one to call for a given question.

The protocol is the standard part. Once a tool speaks MCP, any MCP-aware client can use it — Claude Code, Cursor, and others — without custom glue for each one.

## What you can actually do with it

Three moves, from easiest to most powerful:

- **Wire up existing servers.** Postgres, GitHub, Playwright, web search — already built, one file of config. Start here → [MCP servers for your build stack](/posts/23-mcp-servers/).
- **Build your own.** When the off-the-shelf servers don't cover your product's data, you write a custom server — it's thinner than you'd think. The full how-to → [How to build an MCP server](/posts/25-mcp-server-technical-deep-dive/).
- **See it end to end.** A real one, built in a single autonomous session — 7 tools, 43 tests, the bugs that only showed up live → [Building an MCP server: a case study](/posts/24-building-an-mcp-server/).

## Why it matters

Any product with data behind a dashboard has answers trapped there — reachable only by logging in and clicking around. MCP is how that data starts answering questions in the conversation where you're already working. The model stops being a clever autocomplete and starts being something that can see, and act on, the actual state of your systems.

That shift — from blind to connected — is the whole point. The rest of this cluster is how you make it real.

---

**Next:** if you're setting up a build, start with [which servers to wire](/posts/23-mcp-servers/). If you're ready to build your own, go straight to the [technical how-to](/posts/25-mcp-server-technical-deep-dive/).
