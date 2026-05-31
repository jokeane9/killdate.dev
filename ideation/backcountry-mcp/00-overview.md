# Backcountry MCP — Project Overview

## What This Is

An MCP server + iOS app for AI-native backcountry ski day-trip planning in BC.

Not a go/no-go machine. Not an avalanche guide replacement.
The structured thinking that helps someone who took their AST 1
actually apply it to today's conditions — in the parking lot,
on the skin track, at the ridgeline.

## Documents In This Folder

| File | What it covers |
|---|---|
| 01-dev-architecture.md | Local setup: Docker + FastMCP + Claude Code terminal |
| 02-production-architecture.md | Production: Cloudflare + AWS RDS + iOS app |
| 03-testing-strategy.md | Unit tests, integration tests, eval golden set |
| 04-system-prompt.md | The system prompt — the most important file in the project |
| 05-memory-and-caching.md | Prompt caching, memory architecture, feedback loops |
| 06-code-and-infra.md | Folder structure, code examples, deployment commands |

## The Stack In One View

```
iOS App (Swift)
    ↓ Anthropic API
Claude claude-sonnet-4-6
    ↓ MCP Streamable HTTP
Cloudflare Workers (13 tools)
    ├── Live APIs (AvCan, Open-Meteo, BC ASWE, NRCan)
    ├── Cloudflare KV (cache, TTL per tool)
    └── AWS RDS Aurora Serverless
          pgvector, 600 chunks
          Tremper + AvCan corpus
          HNSW index, 1536-dim embeddings
```

## The Tools

```
FORECAST          WEATHER               SNOWPACK
get_danger        get_overnight         get_snowpack_loading
get_problems      get_day_forecast      get_snow_depth_trend
get_travel_advice get_wind_at_elevation
                  get_freezing_level    TERRAIN
KNOWLEDGE         get_solar_window      get_elevation
search_knowledge                        get_ates_rating
```

## Key Decisions

- No intelligence in tools — atomic data only, Claude reasons
- One tool per question a skier would actually ask
- RAG database lives on AWS, never on mobile
- System prompt is the product — version control it, eval it
- Local dev is identical to production code — only transport changes
