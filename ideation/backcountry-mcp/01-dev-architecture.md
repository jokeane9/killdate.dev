# Backcountry MCP — Local Dev Architecture

## The Three Things Running on Your Laptop

```
TERMINAL 1          TERMINAL 2          TERMINAL 3
docker compose up   fastmcp dev         claude
      │             server.py               │
      │                 │                  │
      ▼                 │                  │
┌──────────┐            │       stdio      │
│ Docker   │◄───────────┴──────────────────┘
│          │
│ pgvector │  PostgreSQL 16 + vector extension
│ port 5432│  600 chunks, HNSW index
│ persisted│  Tremper + AvCan corpus
└──────────┘
```

## What Each Terminal Does

**Terminal 1 — docker compose up**
Starts PostgreSQL with pgvector extension on localhost:5432.
Data persists to disk so you don't lose chunks on restart.
First run automatically executes init.sql — creates the table and HNSW index.

**Terminal 2 — fastmcp dev server.py**
Runs your MCP server as a local process.
Transport: stdio (Claude talks to it as a subprocess, no network involved).
Hot reload — edit a tool, save, it reloads. No restart needed.

**Terminal 3 — claude**
Claude Code in terminal. Reads .claude/settings.json to discover the MCP server.
Shows tool calls inline as it works. This is where you test and iterate.

---

## docker-compose.yml

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: backcountry
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  pgdata:
```

## init.sql

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id         SERIAL PRIMARY KEY,
  source     TEXT,
  topic      TEXT,
  content    TEXT,
  embedding  vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);
```

## .claude/settings.json

```json
{
  "mcpServers": {
    "backcountry": {
      "command": "fastmcp",
      "args": ["run", "server.py"],
      "env": {
        "DATABASE_URL": "postgresql://dev:dev@localhost/backcountry",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

---

## Data Flow — Local

```
You type a query in Claude Code terminal
        │
        ▼
Claude decides which tools to call
        │
        ├──► get_danger_rating(49.43, -117.15)
        │         → server.py function runs
        │         → HTTP GET to api.avalanche.ca
        │         → pre-processes JSON
        │         → returns clean dict to Claude
        │
        ├──► get_day_forecast(49.43, -117.15, 2100)
        │         → server.py function runs
        │         → HTTP GET to api.open-meteo.com
        │         → slices hourly data for next 12hrs
        │         → returns to Claude
        │
        └──► search_knowledge("persistent slab NW aspect")
                  → server.py function runs
                  → embed("persistent slab NW aspect")
                      → OpenAI API → 1536 numbers
                  → SELECT from pgvector (Docker)
                      → HNSW finds 5 closest chunks
                  → returns 5 text chunks to Claude

Claude reads all results, synthesises, responds.
```

---

## One-Time Setup: Ingesting the Corpus

Run once. Re-run only when adding new source material.

```bash
python ingest.py --source corpus/tremper_staying_alive.txt --topic general
python ingest.py --source corpus/tremper_essentials.txt --topic general
python ingest.py --source corpus/avcan_glossary.txt --topic glossary
python ingest.py --source corpus/avcan_webinars/ --topic webinar
```

Cost: ~$0.05 in OpenAI embedding calls for the full corpus.
Time: ~5 minutes.

## Environment Variables (local)

```
OPENAI_API_KEY=sk-...          # for embed() calls
DATABASE_URL=postgresql://dev:dev@localhost/backcountry
AVCAN_BASE=https://avcan-services-api.prod.avalanche.ca
```

---

## Cache — Local Dev

Simple Python dict with TTL. Lives in memory, resets on server restart. Fine for dev.

```python
cache = {}  # { "forecast:49.43:-117.15": (timestamp, data) }
```

| Tool | TTL |
|---|---|
| get_danger_rating / get_avalanche_problems / get_travel_advice | 6 hr |
| get_day_forecast | 2 hr |
| get_overnight_conditions / get_wind_at_elevation / get_freezing_level | 1 hr |
| get_snowpack_loading / get_snow_depth_trend | 1 hr |
| get_elevation / get_ates_rating | 24 hr |
| search_knowledge | no cache |
