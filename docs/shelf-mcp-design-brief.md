# Shelf MCP Server — Design & Build Brief

*Framing: senior MCP engineer + senior Shelf engineer*
*Constraint: existing data only. No new pipeline work.*

---

## What This Is

An MCP server that exposes Shelf's existing database as a set of tools Claude can call mid-conversation. When a marketer, founder, or operator asks Claude a competitive intelligence question, Shelf's data shows up in the answer — not as a static briefing, but as live queryable context.

No new UI. No new product surface. The intelligence layer becomes available wherever Claude is being used.

---

## The Architectural Principle: Follow Layers 3 and 4

Shelf's pipeline already makes the right distinction:

- **Layers 0–3** — data work. Crawl, validate, confirm, rank, structure. No Claude.
- **Layer 4** — reasoning work. Claude receives a structured payload, returns a briefing.

The MCP maps onto this cleanly:

- **MCP tools** = Layer 3 equivalent. Return structured, pre-computed data from the database. Fast, cheap, no LLM call inside the tool.
- **The Claude session** = Layer 4 equivalent. The user's Claude Code or Claude.ai session receives the tool output and reasons over it.

**The key decision: MCP tools do NOT call Claude internally.** They return data. Claude reasons over that data in the session context. This avoids double-Claude-calls, keeps tool latency under 200ms, and preserves the existing pipeline separation.

The one exception is `get_briefing` — which serves the cached Layer 4 output that Shelf already computed. That's not a new Claude call; it's serving pre-computed reasoning.

---

## The Tools

### Tool 1: `get_briefing`
**Maps to:** `layer4_cache` table

The crown jewel. Returns Shelf's pre-computed V3 briefing for a merchant — `market_read` (≤25 words, the one-line market state) and `briefing_cards` (natural-order array of competitor movements with evidence, catalog_overlap, sidekick_referral).

This is already validated Claude reasoning. Serving it is a single DB read. Latency: <50ms.

```
Input:  merchant_id
Output: {
  market_read: string,           // "Two competitors running simultaneous 20% promos — first time this vertical has coordinated discounting."
  briefing_cards: [{
    movement_type: "product_promo" | "general_promo" | "new_product" | "observation",
    competitor: string,
    time_elapsed: string,        // "3d", "12h"
    movement: string,            // ≤20 words
    evidence: [string, string],  // exactly 2 bullets
    catalog_overlap: string,     // ≤12 words, nullable
    sidekick_referral: string    // ≤12 words
  }],
  crawl_timestamp: datetime,
  store_state: "MOVING" | "STABLE" | "NEW"
}
```

**When Claude uses this:** "What's happening with my competitors right now?" The briefing is already written. Claude reads it, adds session context, answers.

---

### Tool 2: `get_active_signals`
**Maps to:** `crawl_signals` table (WHERE resolved_at IS NULL AND crawls_seen >= 2)

Returns confirmed, unresolved price and discount signals ranked by importance. Layer 2 guard already applied (crawls_seen >= 2 = confirmed). Layer 3 importance ranking already applied (price_drop/increase = 1, sitewide discount = 2, visible discount = 3/4).

```
Input:  merchant_id, limit? (default 20)
Output: [{
  signal_type: "price_drop" | "price_increase" | "new_sitewide_discount" | etc,
  competitor_url: string,
  product_title: string | null,
  previous_value: decimal | null,
  current_value: decimal | null,
  delta_pct: decimal | null,
  discount_depth_pct: decimal | null,
  source_label: string,
  importance_rank: int,          // 1 = highest
  first_seen_at: datetime,
  last_seen_at: datetime,
  days_active: int               // computed: now - first_seen_at
}]
```

**When Claude uses this:** "Are any competitors dropping prices right now?" Returns confirmed signals only — no noise, no unconfirmed single-crawl detections.

---

### Tool 3: `get_price_history`
**Maps to:** `price_history` + `products` + `matches` tables

Returns time-series pricing for merchant-confirmed matched product pairs. The Layer 3 `compute_price_trend_note` function already exists — the MCP returns the raw history rows AND the trend note string so Claude can reason over both.

```
Input:  merchant_id, days? (default 56 — matches TREND_WINDOW_DAYS)
Output: [{
  merchant_product_title: string,
  competitor_product_title: string,
  competitor_url: string,
  quantity_differs: bool,
  quality_differs: bool,
  price_trend_note: string | null,   // "Down $3.00 over 14 weeks (Dec 22 – Mar 24)"
  history: [{
    listed_price: decimal,
    compare_at_price: decimal | null,
    crawl_timestamp: datetime
  }]
}]
```

**When Claude uses this:** "Is my competitor consistently undercutting me on protein powder?" Returns matched pairs only — merchant-confirmed ground truth, not fuzzy guesses.

---

### Tool 4: `get_competitor_activity`
**Maps to:** `competitor_activity_log` table

Returns promotional activity events for a time window — banner changes, incentive changes, promo starts/ends, new product detections. The V2 Phase 0 activity timeline.

```
Input:  merchant_id, days? (default 14)
Output: [{
  competitor_url: string,
  activity_type: "promo_started" | "promo_ended" | "banner_changed" | "new_product_detected" | etc,
  subject: string | null,
  previous_value: string | null,
  current_value: string | null,
  crawl_timestamp: datetime
}]
```

**When Claude uses this:** "What promotional changes happened in the last two weeks across my competitor set?" The activity log gives Claude the full timeline, not just the current state.

---

### Tool 5: `get_competitor_profiles`
**Maps to:** `competitors` + `homepage_extras` JSONB column

Returns the Playwright-detected homepage signals for each competitor — site banners, signup incentives, capture tools, BNPL tools, loyalty tools. The enriched profiles from the competitor profile enrichment feature.

```
Input:  merchant_id
Output: [{
  store_url: string,
  display_name: string | null,
  vertical: string | null,
  positioning_tier: "low" | "mid" | "high" | null,
  shopify_confirmed: bool,
  last_crawl_at: datetime | null,
  homepage_extras: {
    site_banner: string | null,
    signup_incentive: string | null,
    capture_tools: string[] | null,
    bnpl_tools: string[] | null,
    loyalty_tools: string[] | null
  } | null
}]
```

**When Claude uses this:** "What onsite tactics are my competitors using right now?" Returns the full homepage intelligence snapshot.

---

### Tool 6: `get_matched_products`
**Maps to:** `matches` + `products` tables (WHERE merchant_confirmed = TRUE)

Returns merchant-confirmed product pairs with current pricing on both sides. The human-validated ground truth of what's actually competing with what.

```
Input:  merchant_id
Output: [{
  merchant_product_title: string,
  merchant_listed_price: decimal | null,
  competitor_product_title: string,
  competitor_url: string,
  competitor_listed_price: decimal | null,
  competitor_compare_at_price: decimal | null,
  quantity_differs: bool,
  quality_differs: bool,
  price_delta: decimal | null,       // competitor - merchant
  price_delta_pct: decimal | null,
  confirmed_at: datetime
}]
```

**When Claude uses this:** "Where am I priced above or below my competitors on my hero products?" Returns only confirmed matches, with both sides of the comparison.

---

### Tool 7: `get_market_snapshot`
**Maps to:** Layer 3-style assembly across multiple tables

A single tool that returns a structured market overview — the kind of context Claude needs to answer broad strategic questions. Assembles: store_state, signal count by type, active competitor count, pricing position summary, last crawl timestamp.

This is a Layer 3-style pre-assembly: compute the aggregates in SQL, return structured JSON. No Claude call.

```
Input:  merchant_id
Output: {
  store_state: "MOVING" | "STABLE" | "NEW",
  last_crawl_at: datetime | null,
  competitors: {
    total: int,
    active: int,           // not crawl_failed
    shopify_confirmed: int
  },
  signals: {
    active_total: int,
    by_type: { price_drop: int, price_increase: int, ... },
    highest_importance_rank: int | null
  },
  matched_products: {
    total_confirmed: int,
    priced_below_competitor: int,    // merchant cheaper
    priced_above_competitor: int,    // merchant more expensive
    priced_equal: int
  },
  vertical: string | null,
  positioning_tier: string | null
}
```

**When Claude uses this:** "Give me a one-line read on where I stand in my market." The snapshot gives Claude the aggregates. Claude produces the synthesis.

---

## What's NOT in V1

Deliberately excluded:

- **`access_token`** — never exposed. The Shopify OAuth token stays server-side only.
- **Raw prompt payloads** — the Layer 3 payload sent to Claude is internal. Not exposed.
- **Cross-merchant data** — every tool is scoped to a single `merchant_id`. No cross-merchant queries, no aggregate market intelligence across all Shelf merchants (that's V2 and requires consent framework).
- **Merchant PII** — `shopify_domain` returned only as the lookup key, not exposed in tool outputs.
- **Write operations** — V1 is read-only. No tool modifies any table.

---

## Implementation

### Stack
- **Language:** Python — matches the existing crawl codebase, same DB connection patterns
- **Framework:** `mcp` SDK (Anthropic's official Python MCP library, `pip install mcp`)
- **Transport:** stdio for local dev (Claude Code), HTTP/SSE for hosted deployment
- **DB:** Existing `node-postgres` connection pool is Node. Python side uses `asyncpg` (already in crawl/requirements.txt via `psycopg2`) — or wrap the existing DB connection from `db_support.py`
- **Auth:** API key header for hosted, environment variable for local

### File structure
```
shelf-mcp/
  server.py          # MCP server entry point, tool registrations
  tools/
    briefing.py      # get_briefing → layer4_cache
    signals.py       # get_active_signals → crawl_signals
    price.py         # get_price_history → price_history + matches
    activity.py      # get_competitor_activity → competitor_activity_log
    profiles.py      # get_competitor_profiles → competitors
    products.py      # get_matched_products → matches + products
    snapshot.py      # get_market_snapshot → assembled aggregates
  db.py              # asyncpg connection pool, shared across tools
  auth.py            # merchant_id validation, API key check
  requirements.txt
```

### Local config (Claude Code user scope)
```json
{
  "mcpServers": {
    "shelf": {
      "command": "python",
      "args": ["/path/to/shelf-mcp/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://shelf_app:localdev@localhost:5432/shelf",
        "SHELF_MCP_API_KEY": "local-dev"
      }
    }
  }
}
```

### Build time
Senior engineer, focused build: 2-3 days for all 7 tools + auth + local testing. The SQL is the existing queries Shelf already runs — no new query logic required. The MCP wiring is boilerplate once the first tool is working.

---

## Pros and Cons

### Pros

**Data is already there.** Every tool in this brief is a query against tables that already exist and are already being populated. No new pipeline work. No new data sources. The MCP is a read layer over what's already running.

**Layer 3-4 separation holds.** Tools return structured data. Claude reasons over it. The same discipline that makes Shelf's pipeline reliable — guards before Claude sees anything, confirmed signals only, structured payload — applies here. Claude in the MCP session only sees what Shelf's pipeline has already validated.

**Merchant-confirmed ground truth.** The `matches` table is the most defensible thing Shelf has — human-validated product pairs. Every pricing comparison the MCP returns is grounded in confirmed matches, not fuzzy similarity. Other tools don't have this.

**Zero new product surface.** No UI to design, no dashboard to maintain, no onboarding flow. The MCP plugs into Claude Code or Claude.ai. The marketer is already there.

**Composable with Apify.** Wire Shelf MCP + Apify MCP in the same session. Ask: "My competitor just dropped 15% — is this category-wide or just them?" Shelf provides the signal. Apify pulls TikTok/Reddit context. Claude synthesizes. That's the marketer's intelligence layer.

**Time-series is the moat.** Other competitive intelligence tools show current state. Shelf has 7+ months of crawl history in `price_history` and `competitor_activity_log`. The price trend note, the activity timeline, the signal history — that compounds. The MCP exposes it.

---

### Cons

**merchant_id is the auth model and it's manual.** V1 requires knowing your `merchant_id` to query anything. There's no discovery layer — "show me all merchants" is deliberately excluded. Fine for internal use (John querying his own data), awkward for selling to external users who don't know their merchant_id.

**Read-only means no closing the loop.** The MCP surfaces intelligence but can't act on it. Claude can tell a marketer "your competitor dropped 15% — you're now 8% above market on protein powder." But it can't draft the Klaviyo email, update the Shopify price, or schedule the response. That's V2 and requires write tools + approval flows.

**No cross-merchant intelligence in V1.** The highest-value long-term capability — "what's happening across all brands in the supplements vertical" — requires querying across merchants. The consent framework, anonymisation logic, and aggregate query design aren't built yet. V1 is single-merchant only.

**Layer 4 cache freshness is crawl-dependent.** `get_briefing` serves cached Claude output. If the merchant's last crawl was 3 days ago, the briefing is 3 days old. The MCP has no way to trigger a new crawl — it's read-only. A stale briefing is a real answer quality problem for live market decisions.

**Python vs Node split.** The Remix app is Node. The crawl pipeline is Python. The MCP would be Python (natural fit for the DB patterns and the existing `db_support.py`). A third runtime isn't a dealbreaker but it's worth noting — especially if the MCP ever needs to share logic with the Remix app's loader layer.

**No semantic search over briefing history.** The `layer4_cache` is one row per merchant — current state only. Past briefings aren't stored. "What was the market doing 6 weeks ago?" requires reconstructing from `crawl_signals` and `competitor_activity_log`, which is doable but not a single tool call. A briefing history table (append-only, one row per crawl cycle) would unlock this properly — but that's schema work, not MCP work.

---

## What to Build First

The minimum useful MCP is two tools:

1. `get_briefing` — serves the cached V3 response. One DB read. The full Claude analysis is already there.
2. `get_active_signals` — returns confirmed, ranked signals. Tells Claude what's actually moving right now.

Those two tools together answer 80% of the questions a marketer would ask. Build them, wire them into Claude Code locally, and use Shelf's own data to test whether the MCP answer quality is better than the dashboard. If it is, build the remaining 5 tools. If it isn't, figure out why before building more surface area.

The test question: *"What should I be doing right now in response to what my competitors are doing?"*

If Claude can answer that well with just `get_briefing` + `get_active_signals`, the MCP has proven its value. Everything else is additive.

---

*Brief written May 2026. Assumes existing schema unchanged. All tool designs are read-only against current DB. V2 scope (write tools, cross-merchant, briefing history) requires separate brief.*
