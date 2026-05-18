---
title: "Building a production MCP server"
description: "How we built a custom MCP server for Shelf in a single autonomous session — 7 tools, 43 tests, live competitive intelligence in Claude Code."
part: 1
post: 24
draft: false
tags: ["mcp", "tooling", "claude-code", "postgres", "shelf"]
---

*6 minute read*

## The premise

Post 23 covered wiring up existing MCP servers — Postgres, GitHub, Playwright, Brave. This is the next step: building your own.

The use case: Shelf is a competitive intelligence product. It crawls competitor stores, detects pricing and promotional signals, and generates briefings. All of that data lives in Postgres. The question was whether we could expose it as a set of tools Claude could call mid-conversation — so instead of logging into a dashboard, a marketer could just ask Claude "what are my competitors doing right now?" and get a live answer.

That's a custom MCP server. Here's how we built it in one session.

---

## The architectural principle first

Before writing a line of code, the design decision that everything else follows from:

**Tools return data. Claude reasons over it.**

Shelf already has a clean separation between its data pipeline (Layers 0–3) and its reasoning layer (Layer 4, where Claude writes the briefings). MCP tools map onto Layer 3 — they return structured, pre-computed data from the database. Fast, cheap, no LLM call inside the tool. The Claude session where the user is working does the reasoning.

This matters for two reasons. First, it keeps tool latency under 200ms — a single SQL query, not a chained API call. Second, it avoids double-Claude-calls. The intelligence is already in the database. The MCP just surfaces it.

The one exception is `get_briefing`, which serves a cached Layer 4 response that Shelf already computed. That's not a new Claude call — it's a DB read of pre-written analysis.

---

## The seven tools

```
get_merchant_id        — discovery front door (external users start here)
get_briefing           — pre-computed V3 competitive briefing from layer4_cache
get_active_signals     — confirmed unresolved price/discount signals
get_price_history      — time-series pricing for confirmed product pairs
get_competitor_activity — promotional event timeline
get_competitor_profiles — homepage intelligence snapshot (banners, BNPL, loyalty)
get_matched_products   — head-to-head pricing on merchant-confirmed product pairs
```

Every tool except `get_merchant_id` requires a `merchant_id`. All queries are read-only. No tool modifies anything.

---

## How we built it

We used a spike branch (`spike/shelf-mcp-v1`) and ran Claude in dangerous mode — autonomous build, no permission prompts, no check-ins. The build prompt included the full DB schema, the V3 response schema, the Layer 3 signal constants, and the architectural rules. Claude read those files first, then built everything: directory structure, all 7 tool files, server entry point, auth module, asyncpg connection pool.

The spike + dangerous mode pattern is worth naming: it's a throwaway-friendly container for autonomous work. If the output is garbage, `git branch -D spike/shelf-mcp-v1` and it's gone. The main branch never knew it happened. If it's good, you merge it. The branch creates the eject button.

43 tests shipped with the server:
- **Unit tests** — mocked asyncpg pool, test logic and null handling in isolation
- **Protocol tests** — start the server as a subprocess, run the MCP JSON-RPC handshake, verify all 7 tools register with descriptions and input schemas
- **Integration tests** — hit the real local database, guarded by `SHELF_TEST_LIVE=1`
- **Schema cross-check** — validate live `get_briefing` output against the actual Pydantic V3BriefingResponse model

---

## What failed live and why it matters

Two bugs the unit tests couldn't catch:

**1. asyncpg returns JSONB columns as raw strings.**

The `layer4_cache.response_json` column is JSONB. asyncpg hands it back as a Python string unless you register a codec at pool init. The code was doing `resp.get("market_read")` on a string, which fails immediately. Fix: register `set_type_codec` for `jsonb` and `json` in the pool initialiser. One function, six lines.

**2. `competitor_url` isn't a column — it requires a JOIN.**

`crawl_signals` and `competitor_activity_log` both have a `competitor_id` foreign key, not a `competitor_url` column. The URL lives on the `competitors` table. The unit tests mocked the pool return value directly, so they never caught the missing JOIN. The integration tests (`test_live.py`) catch it immediately because they run against the real schema.

This is why integration tests exist. Unit tests verify logic. Integration tests verify you're talking to the right database.

---

## The tool descriptions are the product

Post 23 mentioned this but it's worth repeating with a concrete example.

The `@mcp.tool()` decorator takes a `description` parameter. That description is what Claude reads to decide *when* to call the tool — not just what it does, but which question routes to it.

Compare:

```
# Bad — defines what, not when
"Returns competitor activity log for a merchant."

# Good — routes correctly
"Use this when the user asks what promotional or banner changes competitors
made recently — promo starts, promo ends, new products, banner changes —
for a specific time window. Returns a timeline of events, not current state.
Use get_competitor_profiles for the current snapshot."
```

The routing distinction between `get_competitor_activity` (timeline of events) and `get_competitor_profiles` (current state snapshot) is entirely carried by the descriptions. Get them wrong and Claude calls the wrong tool for the question. Get them right and it routes correctly without being told which tool to use.

---

## What it looks like when it works

After wiring the server into `~/.claude.json` and restarting Claude Code:

> "Tell me what my competitors are doing?"

Claude calls `get_briefing`, `get_competitor_activity`, `get_competitor_profiles`, and `get_matched_products` simultaneously. Comes back with: Tower 28 has a 15% sitewide discount live for 3 days. Summer Fridays just launched a bronzer range across 7 SKUs. Kosas is running a bundle kit promo, holding prices on individual products. Dew Mist Hydrating Spray is priced 25% above the Summer Fridays equivalent on the matched pairs.

No dashboard. No tab switching. No copy-paste. Shelf's seven months of crawl data answering a question in a conversation.

---

## The structure

```
shelf-mcp/
  server.py          # FastMCP entry point, all 7 tools registered
  db.py              # asyncpg pool with JSONB codec registration
  auth.py            # merchant validation, two auth modes
  tools/             # one file per tool
  tests/             # 43 tests across 4 tiers
  requirements.txt   # mcp, asyncpg, pytest, python-dotenv
```

Wire it locally with three env vars: `DATABASE_URL`, `SHELF_MCP_API_KEY`, `SHELF_MERCHANT_ID`. The third one is internal mode — you know your merchant ID and skip the discovery step. External mode omits it and users call `get_merchant_id` first with their Shopify domain.

---

**The spike branch pattern is the methodology.** Dangerous mode + throwaway branch = autonomous build with a one-command eject. The right question before shipping to main isn't "did Claude write correct code" — it's "did the integration tests catch what the unit tests missed?" In this case: two bugs, both real, both caught before merge.
