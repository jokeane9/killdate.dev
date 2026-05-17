# The Session That Changed How We See AI

*Working notes — May 17 2026*

---

## How It Started

The session opened with a real impasse. Shelf had a working pipeline. The Langflow agentic work was progressing. But the two weren't clicking into anything that felt like a step change. The frustration wasn't "this doesn't work." It was "I can see all the pieces but I don't see what they add up to."

By the end of the session, the framing had shifted on three things simultaneously: what Shelf is, what MCP is, and what AI actually is. Those three things turned out to be the same realisation approached from different angles.

---

## What MCP Actually Is

The session spent serious time on this because it's the kind of thing that sounds simple and isn't.

MCP (Model Context Protocol) is Anthropic's standard for connecting Claude to live external systems — databases, APIs, services — so it can query them mid-conversation instead of working blind. Before MCP, Claude operated on files and whatever you pasted in. It couldn't observe live state unless you piped it in manually.

That created a constant friction loop: run the command → copy the output → paste it into Claude → get an answer → repeat. Every deploy session. Every schema check. Every CI status. MCP eliminates the loop. Claude queries live state directly.

The mental model that cuts through the complexity: **Claude now has eyes on your running systems, not just your files.**

Before: Claude was reading a photograph of your codebase.
After: Claude can look out the window.

Everything else — server configs, scopes, transports, the `.claude.json` file — is just plumbing to make that one thing true.

---

## The Pivot on Shelf

Once MCP clicked, the Shelf framing changed immediately.

The original framing: Shelf is an observational dashboard. Merchants check it. It tells them what's happening with competitors. The briefing is delivered on a crawl schedule, in a fixed format, to a Shopify app.

The new framing: Shelf is a context layer. The data it accumulates — competitor pricing, promotional signals, merchant-confirmed product matches, time-series crawl history — is available to be queried by anyone making a marketing decision, wherever they're working.

The delivery mechanism was wrong, not the data.

An MCP server changes this. It exposes Shelf's database as tools Claude can call mid-conversation:

- `get_market_briefing(merchant_id)` — the current competitive intelligence
- `get_active_signals(merchant_id)` — live unresolved competitor signals
- `get_competitor_activity(merchant_id, days)` — promotional activity log
- `get_price_history(product_id)` — time-series pricing for matched products

None of these require new data. They're queries against what Shelf already has. The MCP is just the interface to it.

The first instinct was to build something substantial around this: LibreChat as a self-hosted chat UI, pgvector for RAG over brand guidelines, Langflow batch agents running overnight. That architecture is sound. But it has a simpler version — just the MCP server, plugged into Claude Code or Claude.ai. No custom UI. No new product surface to maintain. The intelligence layer shows up wherever the marketer is already working.

---

## The Apify Moment

Partway through the session, Apify's MCP server came up — 30,000+ scrapers exposed as a single MCP, meaning Claude can pull TikTok trends, Reddit sentiment, competitor ads, Amazon reviews, Google SERP data mid-conversation.

That's when the smart marketer use-case crystallised:

Wire up Shelf's competitive data via MCP. Wire up Apify scrapers via MCP. Wire up your CRM, Klaviyo, ad performance data via MCP. Then ask: "What's the positioning gap in the supplements market right now?"

Claude doesn't brainstorm from nothing. It pulls live TikTok trend data for the category, checks what competitor ads are running, reads your past campaign performance, cross-references your brand positioning, and comes back with a brief grounded in all of it.

That used to be a week of a strategist's time. It's now one session.

The key insight: TikTok trends have a 72-hour window. A competitor going on sale is a 48-hour opportunity. Static AI can't touch that. An intelligence layer wired to live data can act inside the window.

---

## What This Means for Every Role in an Organisation

The same pattern plays out across every function:

**Founders/builders** — Claude with live DB and GitHub. No more paste-the-output loops. Check schema before suggesting a migration. Verify CI before saying a branch is ready.

**Marketing** — Analytics MCP. "Did the homepage change move conversion?" Claude queries the data rather than you logging into Amplitude.

**Sales/ops** — CRM MCP. "What's the status of the Acme deal?" Claude checks live rather than you switching tabs.

**Customer support** — Ticketing MCP. Claude sees open tickets, checks account state, drafts the reply with real context.

**Finance** — Accounting MCP. "What's our runway?" Claude reads live financials.

The pattern is identical every time: whoever was copy-pasting data between systems stops doing that. The context-switching collapses into one surface. Not because AI got smarter — because the connection layer got standardised.

---

## What AI Actually Is Now

This is the conceptual shift that ran underneath the whole session.

Most people are stuck in the chatbot framing: you ask a question, you get an answer, you copy it somewhere useful. The output is the product. The interaction is the thing.

The actual model is different. Every AI interaction is just: what's in the context window right now? MCPs, CLAUDE.md, tool results, your message — it's all context. The model isn't "smart" in a persistent way. It's smart *about whatever it can see right now*. Everything you do to improve AI output is just improving what's in that window.

The step change isn't a smarter model. It's a better-wired context window.

This reframes what Claude Code is becoming. It's not a better terminal. It's not a smarter editor plugin. It's an operating system where every tool — CRM, database, scraper library, browser, analytics platform — is an MCP, and all work happens in one surface with everything connected.

Klaviyo will ship an MCP. HubSpot already has one. Shopify already has one. Every major SaaS will follow — because if they don't, Claude can't see their data, and their users will migrate to tools that are visible. MCP compatibility becomes a procurement requirement.

---

## The Cheap Wrapper Problem

The session was clear-eyed about what Shelf is not.

A cheap wrapper is a text box that sends your message to Claude with a system prompt stapled to the front. Maybe some UI chrome. Zero live data, zero tools, zero memory between sessions. The tell: when the AI gives a wrong answer, there's nothing to check it against. No source of truth. Just vibes dressed up as software.

Shelf is the opposite. It has a crawl pipeline, a structured schema, signal detection, and Claude reasoning over confirmed data. The model can only say things the data supports. That's a real product. A wrapper could be cloned in an afternoon.

The data accumulation is the product. Not the MCP. Not the prompts. Not the UI. The merchant-confirmed product matches, the time-series pricing, the promotional patterns by vertical — that's what compounds, that's what's defensible, that's what gets more valuable every week it runs.

---

## The 80% Problem

The most uncomfortable insight of the session.

Everything becomes 80% done in 5 minutes. The last 20% — judgment, taste, knowing what good looks like — still requires a human who's done it the hard way. But the 80% feels so complete that most people ship it.

You end up with a world full of things that are almost right. Marketing that's almost on-brand. Code that almost works. Strategy that almost fits the business. Fast, plausible, slightly off. The volume of "almost" goes up 1000x. The quality of "actually right" stays scarce.

The skill isn't using Claude. Everyone uses Claude. The skill is knowing when to stop Claude — when the plausible brief misses the actual insight, when the generated code is technically correct but architecturally wrong, when the 80% answer is subtly off in a way that matters.

That requires having seen enough real things to have a calibrated sense of quality. Which you only get by doing hard things slowly first.

---

## The Real Risk Isn't Job Loss. It's Intuition Loss.

The fear that surfaced: everything can be partially done in Claude Code, and it's 1000x easier. That's genuinely scary once you understand what AI actually is.

The chatbot version of this fear is "AI will replace workers." That's too simple.

The real version: if Claude does all the wrestling with data, all the manual analysis, all the friction of figuring out why something works — the junior marketer, developer, designer who never does those things never builds the calibration to know when Claude is wrong. They become dependent on the model's judgment because they never built their own. And the model's judgment is average. Trained on everything, biased toward what everyone else does.

The people who stay dangerous are the ones who used to do it the hard way and now use Claude to go faster. They have the intuition to catch the 20%.

The ones who aren't scared of this yet are the ones who should be.

---

## What the AI Infrastructure Landscape Tells You

The session included deep research into the 50 companies building the picks-and-shovels layer — MCP connectivity, orchestration, RAG, observability, agent infrastructure, vertical agents. The full landscape is in `ai-infrastructure-landscape-2026.md`.

The meta-pattern matters more than any individual company:

**The value is shifting from the model to the data.**

When every app can plug into Claude via MCP, the model becomes a commodity. What isn't a commodity is the proprietary data underneath. Whoever has the cleanest, most structured, most unique dataset wins. The model is just the reasoning layer on top.

This is why Shelf's data accumulation matters more than Shelf's prompts, UI, or architecture. The crawl pipeline is the least interesting part. The time-series competitive intelligence is everything.

The companies that figured this out first — Harvey in legal, Glean in enterprise search, Perplexity in web research — built proprietary data assets first and AI interfaces second. The interface keeps changing. The data compounds.

---

## Where This Leaves Things

The session started with an impasse and ended with a reframe.

Shelf stops being a Shopify app that generates briefings and becomes a data infrastructure product that surfaces through AI interfaces — wherever the marketer is working, whenever the decision is happening.

The Shopify app is still the wedge. It's how merchants get in, how data gets collected, how trust gets established. But the value doesn't have to be delivered through the app.

MCP is not the product. The MCP makes the product accessible.

The product is seven months of competitor pricing data, promotional patterns, and merchant-confirmed signals accumulating in a Postgres schema that gets more valuable every crawl cycle.

That's not a joke. That's a data asset.

---

*Working notes from May 17 2026. Not a product decision — a conceptual clearing. The next step is prototyping the MCP server against real merchant data to see what questions it can actually answer.*
