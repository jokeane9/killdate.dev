---
title: "MCP servers for your build stack"
description: "Which MCP servers actually help during a production SaaS build, and how to wire them into Claude Code in one file edit."
part: 1
post: 9
draft: false
tags: ["tooling", "mcp", "claude-code", "infrastructure", "postgres"]
---

*5 minute read*

## What MCPs are for

An MCP server gives Claude a live connection to something external — a database, an API, a service — so it can query it mid-conversation instead of working blind.

Without them, Claude Code operates on files and bash output. It can't observe live state unless you pipe it in manually. That creates a constant friction loop:

> "Run `aws ecs describe-services --cluster prod --services app` and paste the output."

Every deploy session. Every schema check. Every CI status. You run the command, paste the result, Claude answers, repeat. MCP servers eliminate the loop. Claude queries live state directly.

---

## The ones that matter for a SaaS build

### Postgres

The highest-leverage addition for any database-backed product. Direct schema inspection, live queries against real data, migration validation before a deploy — all mid-conversation, no terminal switching.

Wire it at two levels: user-level for personal dev use, project-level pointing at your local dev database. Every deploy session that starts with "check if this migration has run" becomes a one-word ask.

### GitHub

PR status, CI health, branch state — all inside Claude Code. If you're managing 100+ PRs across a build, the cost of switching to the GitHub web UI or a GUI client adds up. The GitHub MCP keeps it in the conversation.

Useful specifically for: checking what's merged before a deploy, confirming CI passed on the current branch, reviewing what's open without leaving your editor.

### Playwright

The hidden one. Most teams doing browser-based testing — billing flows, embedded app verification, auth redirects — are doing it manually or delegating to a read-only screenshot tool. The Playwright MCP gives Claude actual browser control: clicks, form fills, navigation.

Every manual verification session where you're describing what you see on screen is a candidate for Playwright automation. The billing flow verification sessions on Shelf should have been this.

### Brave Search

Live web search inside Claude Code. Useful when you're debugging something where the error message is ambiguous, or when you need to know what a Shopify API change actually means before deploying against it. Free tier covers most build use.

---

## The setup

One file. User-level (`~/.claude/settings.json`) makes MCPs available across every project. Project-level (`.claude/settings.json` in the repo root) scopes them to one codebase.

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "your-token-here" }
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/yourdb"
      ]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "your-key-here" }
    }
  }
}
```

Restart Claude Code. Type `/mcp` to confirm they're connected and see every tool available.

---

## What changes

The debugging loop gets shorter. Instead of: run command → copy output → paste into Claude → repeat — you get: ask Claude → it queries the tool → answers with live state.

The more significant change is what Claude can now initiate. It can check whether a migration has run before suggesting a deploy. It can verify CI status before telling you a branch is ready to merge. It can query your database to confirm data shape before writing a query against it.

It doesn't feel transformative until you've used it through a full deploy session. Then going back feels like debugging with your eyes closed.

---

**In the repo:** The killdate-kit `CLAUDE.md` template notes which MCPs to consider at project setup. Add the ones relevant to your stack on day one. The deploy sessions where you're pasting CLI output are the tell — each one is an MCP that should already be wired.
