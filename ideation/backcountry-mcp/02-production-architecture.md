# Backcountry MCP — Production Architecture (Mobile)

## The Key Principle

The mobile app has one job: talk to Claude.
It never touches the database, never calls AvCan, never knows what pgvector is.
Everything else happens behind Claude.

```
Mobile App → Claude → Cloudflare MCP Server → {APIs, AWS RDS}
```

---

## Full Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S PHONE (iOS)                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Native iOS App (Swift)                      │   │
│   │                                                                 │   │
│   │   [  HOLD TO TALK  ]  ← big haptic button, works with gloves   │   │
│   │                                                                 │   │
│   │   Danger: CONSIDERABLE ████████░░                               │   │
│   │   Problem: Persistent Slab — NW aspects, alpine                 │   │
│   │   Temp at 2100m: -3°C → +2°C by 1pm                            │   │
│   │                                                                 │   │
│   │   Offline cache: forecast ✓  weather ✓  snowpack ✓              │   │
│   │   (pre-fetched on launch, survives cell loss)                   │   │
│   │                                                                 │   │
│   │   Knows: user's GPS coordinates, conversation history           │   │
│   │   Sends: system prompt + GPS + conversation to Anthropic API    │   │
│   └───────────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    │ POST api.anthropic.com/v1/messages
                                    │ { system_prompt, messages, tools: [...] }
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                          ANTHROPIC CLOUD                                │
│                                                                         │
│                      Claude claude-sonnet-4-6                           │
│                                                                         │
│   Receives: system prompt + conversation + available MCP tools          │
│   Decides: which tools to call, in what order                           │
│   Reads: tool results                                                   │
│   Returns: synthesised plain-language response                          │
│                                                                         │
│   Knows nothing about: AWS, Cloudflare, pgvector, AvCan API internals   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ MCP — Streamable HTTP
                                    │ POST https://mcp.yourdomain.com/mcp
                                    │ { tool: "get_danger_rating",
                                    │   params: {lat: 49.43, lon: -117.15} }
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                        CLOUDFLARE WORKERS                               │
│                    your MCP server, runs at the edge                    │
│              routes to nearest Cloudflare node automatically            │
│                    ~300+ locations globally                             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     13 MCP Tool Functions                       │   │
│   │                                                                 │   │
│   │   FORECAST              WEATHER              TERRAIN            │   │
│   │   get_danger_rating     get_overnight        get_elevation      │   │
│   │   get_avy_problems      get_day_forecast     get_ates_rating    │   │
│   │   get_travel_advice     get_wind_at_elev                        │   │
│   │                         get_freezing_level   KNOWLEDGE          │   │
│   │   SNOWPACK              get_solar_window     search_knowledge   │   │
│   │   get_snowpack_loading                       ↑                  │   │
│   │   get_snow_depth_trend                       │                  │   │
│   │                                         queries AWS RDS         │   │
│   └──────────────────────────────────────────────┼──────────────────┘   │
│                                                  │                      │
│   ┌──────────────────────────────────────────────┼──────────────────┐   │
│   │              Cloudflare KV (cache)           │                  │   │
│   │                                              │                  │   │
│   │   "forecast:49.43:-117.15"                   │                  │   │
│   │     → {alpine:3, treeline:2...}  TTL:6hr     │                  │   │
│   │                                              │                  │   │
│   │   "weather:49.43:-117.15:2100"               │                  │   │
│   │     → {temp_min:-6, new_snow:8...} TTL:2hr   │                  │   │
│   │                                              │                  │   │
│   │   Cache miss → fetch from live APIs          │                  │   │
│   │   search_knowledge → always goes to RDS ─────┘                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────┬───────────────────────┘
           │                                      │
           │ cache miss                           │ search_knowledge()
           ▼                                      ▼
┌──────────────────────┐          ┌───────────────────────────────────────┐
│   PUBLIC APIs        │          │              AWS                      │
│                      │          │                                       │
│  avalanche.ca        │          │  ┌─────────────────────────────────┐  │
│  api.open-meteo.com  │          │  │    VPC (private network)        │  │
│  env.gov.bc.ca       │          │  │                                 │  │
│  geogratis.gc.ca     │          │  │  ┌──────────────────────────┐   │  │
│  openmaps.gov.bc.ca  │          │  │  │  RDS Aurora Serverless v2 │   │  │
│                      │          │  │  │  PostgreSQL 16 + pgvector │   │  │
│  No auth needed      │          │  │  │                           │   │  │
│  on any of these     │          │  │  │  documents table          │   │  │
└──────────────────────┘          │  │  │  600 rows                 │   │  │
                                  │  │  │  text + 1536-dim vectors  │   │  │
                                  │  │  │  HNSW index               │   │  │
                                  │  │  │                           │   │  │
                                  │  │  │  Scales to zero           │   │  │
                                  │  │  │  when not in use          │   │  │
                                  │  │  │  No public IP             │   │  │
                                  │  │  └──────────────────────────┘   │  │
                                  │  │                                 │  │
                                  │  │  Cloudflare → RDS               │  │
                                  │  │  via Cloudflare Hyperdrive      │  │
                                  │  │  (keeps connections warm,       │  │
                                  │  │   handles cold start problem)   │  │
                                  │  └─────────────────────────────────┘  │
                                  └───────────────────────────────────────┘
```

---

## What Lives Where — Summary

| Thing | Where | Notes |
|---|---|---|
| Conversation UI | iOS app | Swift, native |
| Voice input | iOS app | Push-to-talk, AVFoundation |
| Offline data cache | iOS app | Pre-fetched on launch |
| GPS coordinates | iOS app | CoreLocation |
| Claude model | Anthropic cloud | API call per message |
| MCP tool functions | Cloudflare Workers | Your code, edge-deployed |
| Tool cache | Cloudflare KV | TTL per tool type |
| RAG search function | Cloudflare Workers | search_knowledge() lives here |
| Vector database | AWS RDS (private VPC) | Only Cloudflare can reach it |
| Embeddings (query) | Called from Cloudflare | OpenAI API at query time |
| Corpus embeddings | AWS RDS | Stored during ingestion |
| Live API data | Public internet | AvCan, Open-Meteo etc. |

---

## Session Awareness in Production

The spec is going stateless — no server-side session. Session context lives two places:

**1. The conversation itself (Anthropic API)**
The app sends the full conversation history with every message.
What you said at the trailhead is in the context when you ask something at the ridgeline.
Handled automatically by the Anthropic SDK.

**2. Cloudflare KV for data snapshot**
On trip start, app writes a lightweight session record to KV:
```json
{
  "session_id": "trip-2026-05-28-whitewater",
  "objective": {"lat": 49.43, "lon": -117.15, "elevation_m": 2100},
  "aspect": "NW",
  "party_size": 3,
  "started_at": "2026-05-28T07:30:00-07:00"
}
```
TTL: 24 hours. Tools receive session_id as a parameter, can pull context from KV.
Survives cell loss. Survives app restart.

---

## Deploy Command

```bash
wrangler deploy
# same server.py, different transport
# KV namespace replaces Python dict cache
# DATABASE_URL points to AWS RDS
# zero code changes from local version
```

---

## Differences: Local Dev vs Production

| | Local Dev | Production |
|---|---|---|
| Transport | stdio | Streamable HTTP |
| Cache | Python dict (memory) | Cloudflare KV |
| Database | Docker (localhost) | AWS RDS Aurora Serverless |
| DB connection | Direct psycopg2 | Via Cloudflare Hyperdrive |
| Claude client | Claude Code terminal | iOS app → Anthropic API |
| Embeddings | Same OpenAI call | Same OpenAI call |
| Tool code | Identical | Identical |
