---
title: "How to build a custom MCP server"
description: "A technical walkthrough of building a production MCP server in Python — FastMCP, asyncpg, tool descriptions, testing, and the gotchas we hit live."
part: 1
post: 11
section: playbook
group: "Tooling: MCP"
draft: false
tags: ["mcp", "python", "postgres", "claude-code", "tooling"]
---

*12 minute read*

> **This is the how-to.** For the real-world story of building one — 7 tools, 43 tests, one autonomous session — see [Building a production MCP server](/posts/24-building-an-mcp-server/). To choose which MCP servers to run in the first place, see [MCP servers for your build stack](/posts/23-mcp-servers/).

## What MCP actually is at the protocol level

Before the framework, the wire format. MCP is JSON-RPC 2.0 over stdio. When Claude calls a tool, it sends a newline-delimited JSON message to your server's stdin. Your server writes the result to stdout. That's it. No HTTP, no webhooks, no websockets — just two pipes.

A tool call looks like this on the wire:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_briefing",
    "arguments": { "merchant_id": 5 }
  }
}
```

Your server returns:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{ "type": "text", "text": "{...your JSON...}" }]
  }
}
```

Before any tool calls, there's an initialisation handshake. Claude sends `initialize` with protocol version and client info, your server responds with its capabilities and a list of available tools, Claude sends `notifications/initialized`, and then the session is live. Claude reads the tool list and their descriptions to decide what to call and when.

Understanding this matters because it tells you what you're actually building: a process that reads JSON from stdin, does something, and writes JSON to stdout. The framework handles the protocol. Your job is to write the functions.

---

## The stack

```
mcp>=1.0.0          # Anthropic's official Python MCP library (FastMCP)
asyncpg>=0.29.0     # Async Postgres driver
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
```

We used **FastMCP**, which is the high-level API in Anthropic's `mcp` package. It handles the JSON-RPC protocol, tool registration, input schema generation (from Python type hints), and the stdio transport. You write a decorated async function; FastMCP turns it into a tool Claude can call.

We used **asyncpg** instead of psycopg2 (which the existing Shelf codebase uses) because FastMCP runs an async event loop and asyncpg is natively async. Mixing asyncio with synchronous psycopg2 would require `run_in_executor` wrappers everywhere — ugly and slower. asyncpg also has better connection pool semantics for a long-running server process.

---

## The file structure

```
shelf-mcp/
  server.py          # MCP entry point, tool registrations
  db.py              # asyncpg connection pool
  auth.py            # merchant validation, API key check
  requirements.txt
  tools/
    merchant.py      # get_merchant_id
    briefing.py      # get_briefing
    signals.py       # get_active_signals
    price.py         # get_price_history
    activity.py      # get_competitor_activity
    profiles.py      # get_competitor_profiles
    products.py      # get_matched_products
  tests/
    conftest.py
    test_briefing.py
    test_live.py
    test_protocol.py
    ...
```

One file per tool keeps things navigable. Each tool file contains a single async function that takes a pool and returns a dict or list. `server.py` imports them and registers them as MCP tools. The separation makes testing clean — you can test the tool functions directly without touching the MCP layer.

---

## db.py — the connection pool

```python
import json
import os
import asyncpg

_pool: asyncpg.Pool | None = None


async def _init_connection(conn: asyncpg.Connection) -> None:
    await conn.set_type_codec(
        "jsonb",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
        format="text",
    )
    await conn.set_type_codec(
        "json",
        encoder=json.dumps,
        decoder=json.loads,
        schema="pg_catalog",
        format="text",
    )


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        url = os.environ.get("DATABASE_URL")
        if not url:
            raise RuntimeError("DATABASE_URL environment variable is required")
        _pool = await asyncpg.create_pool(
            url.replace("sslmode=no-verify", "sslmode=require"),
            min_size=1,
            max_size=5,
            init=_init_connection,
        )
    return _pool
```

Three things worth unpacking here.

**The JSONB codec.** This is the gotcha that bit us live. asyncpg returns `jsonb` and `json` columns as raw Python strings by default — it does not automatically deserialise them to dicts. When we called `resp.get("market_read")` on a JSONB column that came back as a string, it failed immediately. The fix is `set_type_codec` registered on every connection via the `init` callback. Once registered, asyncpg runs `json.loads` on every JSONB value automatically. This needs to happen at connection init, not at query time.

**The DSN normalisation.** The shared `DATABASE_URL` in Shelf uses `sslmode=no-verify`, which is valid for node-postgres but rejected by libpq (which asyncpg uses under the hood). One string replace at pool creation time fixes it. We carried this pattern from the existing Python codebase's `db_support.py`.

**The singleton pool.** The MCP server is a long-running process. One pool, initialised on the first tool call, reused for every subsequent call. `min_size=1` keeps one connection warm. `max_size=5` caps concurrent queries — overkill for a single-user local setup but right for a hosted server.

---

## Building a tool — get_briefing walkthrough

The tool function lives in `tools/briefing.py`:

```python
import asyncpg

async def get_briefing(pool: asyncpg.Pool, merchant_id: int) -> dict:
    row = await pool.fetchrow(
        """
        SELECT response_json, store_state, crawl_timestamp
        FROM layer4_cache
        WHERE merchant_id = $1
        """,
        merchant_id,
    )

    if row is None:
        return {
            "market_read": None,
            "briefing_cards": [],
            "store_state": None,
            "crawl_timestamp": None,
            "message": "No briefing available yet.",
        }

    resp = row["response_json"]   # dict, because JSONB codec is registered
    return {
        "market_read": resp.get("market_read"),
        "briefing_cards": resp.get("briefing_cards", []),
        "store_state": row["store_state"],
        "crawl_timestamp": row["crawl_timestamp"].isoformat()
                           if row["crawl_timestamp"] else None,
        "message": None,
    }
```

Then in `server.py`, the tool is registered:

```python
from mcp.server.fastmcp import FastMCP
from tools.briefing import get_briefing as _get_briefing

mcp = FastMCP("shelf")

@mcp.tool()
async def get_briefing(merchant_id: int) -> dict:
    """
    Return the latest pre-computed competitive intelligence briefing.

    Use this for broad competitive questions: what's happening with my competitors,
    give me a market overview, what's the competitive landscape right now.
    Returns market_read (one-line state) and briefing_cards (ranked movements
    with evidence). Already written by Shelf's AI pipeline — single DB read.
    Check crawl_timestamp to assess data freshness.
    """
    pool = await get_pool()
    await validate_merchant(pool, merchant_id)
    return await _get_briefing(pool, merchant_id)


if __name__ == "__main__":
    mcp.run()
```

FastMCP reads the type hint (`merchant_id: int`) to generate the JSON Schema for the tool's input. It reads the docstring as the tool description. It handles wrapping the return value in the correct MCP content envelope. `mcp.run()` starts the stdio transport. That's the entire MCP layer — one decorator, one docstring, one `mcp.run()`.

---

## Tool descriptions are routing logic

The docstring isn't documentation. It's what Claude reads to decide which tool to call for a given question. This is the part most custom MCP builds get wrong.

Consider two tools that both return competitor data:

- `get_competitor_profiles` — current state: what banners, incentives, BNPL tools are running *right now*
- `get_competitor_activity` — event timeline: what *changed* over the past N days

If both descriptions say "returns competitor data," Claude will pick one arbitrarily. If the descriptions say *when to use this vs the other*, Claude routes correctly.

```python
@mcp.tool()
async def get_competitor_activity(merchant_id: int, days: int = 14) -> list[dict]:
    """
    Return the promotional event timeline for all competitors over a time window.

    Use this when the user asks: what promos started or ended recently,
    what banners changed, what happened across competitors in the last two weeks.
    This is a timeline of EVENTS, not current state — use get_competitor_profiles
    for the current snapshot. Ordered newest-first. Default: 14 days.
    """
```

The description explicitly says "not current state — use get_competitor_profiles for the current snapshot." That routing instruction eliminates ambiguity. Write descriptions as if you're writing a routing rule, not a definition.

---

## Auth: two modes in one server

We wanted the server to work for internal use (John querying his own data) and eventually for external merchants (anyone who installs Shelf). Two modes, same server:

```python
# auth.py

def get_internal_merchant_id() -> int | None:
    val = os.environ.get("SHELF_MERCHANT_ID")
    return int(val) if val else None

async def validate_merchant(pool: asyncpg.Pool, merchant_id: int) -> None:
    row = await pool.fetchrow(
        "SELECT id FROM merchants WHERE id = $1", merchant_id
    )
    if row is None:
        raise ValueError(f"Merchant {merchant_id} not found")
```

**Internal mode**: set `SHELF_MERCHANT_ID=5` in the env. You know your merchant ID, pass it directly to every tool call. No discovery needed.

**External mode**: omit `SHELF_MERCHANT_ID`. External users call `get_merchant_id("mybrand.myshopify.com")` first, which looks up their internal ID and returns onboarding status. Every subsequent tool call uses that ID.

The `get_merchant_id` tool is the front door for external users — the equivalent of Apify's actor discovery. Without it, users have to know an internal database ID, which isn't a viable external product.

---

## Testing: four tiers

**Tier 1 — unit tests (mocked pool)**

Test the tool functions directly with a fake asyncpg pool:

```python
class FakeRecord:
    def __init__(self, data: dict):
        self._data = data
    def __getitem__(self, key: str):
        return self._data[key]

def make_pool(fetchrow_result=None, fetch_result=None):
    pool = MagicMock()
    pool.fetchrow = AsyncMock(return_value=fetchrow_result)
    pool.fetch = AsyncMock(return_value=fetch_result or [])
    return pool
```

These tests run in milliseconds, need no database, and test logic: null handling, computed fields (`days_active`, `price_delta`, `price_delta_pct`), date serialisation to ISO strings. 40 tests, all mocked.

**Tier 2 — protocol tests (subprocess)**

Start the server as a subprocess and exercise the actual MCP JSON-RPC handshake:

```python
def test_tools_list_contains_all_seven():
    proc = subprocess.Popen(
        [sys.executable, SERVER_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "SHELF_MCP_API_KEY": "test",
             "DATABASE_URL": "postgresql://localhost/nonexistent"},
    )
    # Send initialize
    send_recv(proc, {"jsonrpc": "2.0", "id": 1, "method": "initialize", ...})
    # Send initialized notification
    # Send tools/list
    response = send_recv(proc, {"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
    tools = {t["name"] for t in response["result"]["tools"]}
    assert tools == {"get_merchant_id", "get_briefing", "get_active_signals", ...}
```

This catches import errors, registration bugs, and malformed tool schemas. It doesn't need a real database — the pool only initialises on the first actual tool call, not at import time. The `DATABASE_URL` can point at a nonexistent database for this test.

**Tier 3 — integration tests (live DB)**

Guarded by `SHELF_TEST_LIVE=1`. Hit the real local database with real merchant IDs. Assert the response shape without asserting exact values (data changes):

```python
pytestmark = pytest.mark.skipif(
    not os.environ.get("SHELF_TEST_LIVE"),
    reason="Set SHELF_TEST_LIVE=1 and DATABASE_URL to run"
)

async def test_live_get_competitor_profiles_shape(pool):
    results = await get_competitor_profiles(pool, MERCHANT_ID)
    for row in results:
        assert "store_url" in row
        assert "shopify_confirmed" in row
        assert isinstance(row["shopify_confirmed"], bool)
```

This is where the real bugs surface. The JSONB codec issue and the missing `competitor_url` JOIN both would have been caught here before they hit live testing.

**Tier 4 — schema cross-check**

Call `get_briefing` live and validate the output against the actual Pydantic model that Shelf's pipeline uses:

```python
from layer4.v3_response_schema import validate_v3_response_json

errors = validate_v3_response_json({
    "market_read": result["market_read"],
    "briefing_cards": result["briefing_cards"],
})
assert errors == []
```

This catches drift between what the pipeline writes to `layer4_cache` and what the MCP returns. If the briefing schema changes in a future pipeline version, this test breaks before anything ships.

---

## Wiring into Claude Code

One entry in `~/.claude.json`:

```json
{
  "mcpServers": {
    "shelf": {
      "type": "stdio",
      "command": "/path/to/shelf/.venv/bin/python",
      "args": ["/path/to/shelf/shelf-mcp/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://shelf_app:localdev@localhost:5432/shelf",
        "SHELF_MCP_API_KEY": "local-dev",
        "SHELF_MERCHANT_ID": "5"
      }
    }
  }
}
```

Use the absolute path to your virtualenv's Python, not the system Python. Claude Code spawns the process on session start and keeps it alive for the session. Restart Claude Code after any change to the server code — the process doesn't hot-reload.

Add it via the CLI to avoid editing the JSON directly:

```bash
claude mcp add --scope user \
  -e DATABASE_URL="postgresql://..." \
  -e SHELF_MCP_API_KEY="local-dev" \
  -e SHELF_MERCHANT_ID="5" \
  -- shelf /path/to/.venv/bin/python /path/to/shelf-mcp/server.py
```

Verify it connected: `/mcp` in Claude Code shows all registered servers and their tool lists.

---

## What the live session taught us

We ran the full session in dangerous mode on a spike branch — autonomous build, no permission prompts, eject button at `git branch -D spike/shelf-mcp-v1`. Two things failed when we first hit the real database.

**SHELF_MERCHANT_ID=3 doesn't exist in the local DB.** Production merchant IDs don't map to local dev merchant IDs. The fix was a one-line Postgres query to find the actual local IDs (`SELECT id, shopify_domain FROM merchants`), then updating the env var. Not a code bug, but a reminder: local dev data is not a mirror of production.

**JSONB came back as strings.** Covered above — the asyncpg codec. The protocol test caught the startup behaviour. The integration test would have caught the JSONB issue. We caught it by testing live, which is the correct order: unit → protocol → integration → live. Each tier catches a different class of failure.

The build took one session. The protocol test has been the most useful artifact since — every time the server is modified, the three protocol tests run in under a second and confirm the MCP handshake still works before anything touches the database.

---

**The pattern generalises.** Any database-backed product has data that could be answering questions in a Claude Code session instead of sitting behind a dashboard login. The MCP layer is thin — FastMCP, asyncpg, a connection pool, typed functions with descriptive docstrings. The work is in the SQL, the output shapes, and the descriptions that make Claude route correctly.
