# Backcountry MCP — Code Examples & Infrastructure

## Where Code Lives vs Where Data Lives

```
YOUR CODE lives on:   Cloudflare Workers
YOUR DATA lives on:   AWS RDS (chunks + vectors)
                      Cloudflare KV (cache + memory + system prompt)

The iOS app is just a screen. No logic there.
```

---

## The Folder Structure

```
backcountry-mcp/
  │
  ├── worker/                 ← deploys to Cloudflare
  │     ├── index.ts          ← entry point, handles all requests
  │     ├── tools/
  │     │     ├── forecast.ts   ← get_danger_rating etc.
  │     │     ├── weather.ts    ← get_day_forecast etc.
  │     │     ├── snowpack.ts   ← get_snowpack_loading etc.
  │     │     └── knowledge.ts  ← search_knowledge (hits AWS RDS)
  │     ├── memory/
  │     │     ├── read.ts       ← fetch user memory from KV
  │     │     └── write.ts      ← post-session summariser
  │     └── wrangler.toml     ← Cloudflare config, env vars
  │
  ├── db/
  │     ├── init.sql          ← runs once on AWS RDS setup
  │     └── ingest.py         ← runs once to load corpus
  │
  └── corpus/
        ├── tremper.txt
        └── avcan_glossary.txt
```

One command deploys everything in `worker/` to Cloudflare:
```bash
wrangler deploy
```

AWS RDS just sits there. You never "deploy" to it — you connect to it.

---

## What Lives Where

```
YOUR LAPTOP                CLOUDFLARE                    AWS
(source code)              (running code)                (data)

worker/
  index.ts        ──►   Worker entry point
  tools/
    forecast.ts   ──►   get_danger_rating()
    weather.ts    ──►   get_day_forecast()
    snowpack.ts   ──►   get_snowpack_loading()
    knowledge.ts  ──►   search_knowledge()  ──────────►  pgvector DB
  memory/                                                 (600 chunks)
    read.ts       ──►   fetch memory        ──►  KV
    write.ts      ──►   save memory         ──►  KV

                         KV store:
                           system-prompt-base
                           memory:user_abc123
                           forecast:49.43:-117.15
```

---

## Code Examples

### 1. A Tool Function — forecast.ts

Lives on Cloudflare. Claude calls it. Fetches from AvCan. Returns clean data.

```typescript
// worker/tools/forecast.ts

export async function getDangerRating(lat: number, lon: number) {

  // step 1: check cache first
  const cacheKey = `forecast:${lat}:${lon}`
  const cached = await KV.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)   // return immediately, no API call
  }

  // step 2: cache miss — fetch from AvCan
  const response = await fetch(
    `https://avcan-services-api.prod.avalanche.ca/forecasts/en/products/point
     ?lat=${lat}&long=${lon}`
  )
  const raw = await response.json()

  // step 3: clean up the raw API response into simple shape
  const result = {
    region:         raw.areaName,
    alpine:         raw.dangerRatings[0].dangerRating.value[0],
    treeline:       raw.dangerRatings[1].dangerRating.value[0],
    below_treeline: raw.dangerRatings[2].dangerRating.value[0],
  }

  // step 4: save to cache, expires in 6 hours
  await KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 21600 })

  return result
}

// what Claude gets back:
// { region: "Kootenay Boundary", alpine: 3, treeline: 2, below_treeline: 1 }
```

---

### 2. The Entry Point — index.ts

The main Worker. iOS app sends a message here. Assembles everything, calls Claude.

```typescript
// worker/index.ts

export default {
  async fetch(request: Request, env: Env) {

    const { message, userId, gps } = await request.json()

    // step 1: load the system prompt from KV
    const systemPrompt = await env.KV.get("system-prompt-base")
    // systemPrompt = "You are a backcountry skiing decision support tool..."

    // step 2: load this user's memory from KV
    const memory = await env.KV.get(`memory:${userId}`)
    // memory = "AST 1, 3 seasons, Kootenays, usually 3-person party..."

    // step 3: assemble the full system prompt
    const fullPrompt = `
      ${systemPrompt}

      USER MEMORY
      ${memory ?? "No previous sessions."}

      USER LOCATION
      lat: ${gps.lat}, lon: ${gps.lon}
    `

    // step 4: call Claude with message + assembled prompt + tools
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,   // lives in Cloudflare env vars
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: fullPrompt,
            cache_control: { type: "ephemeral" }  // cache the big static section
          }
        ],
        messages: [{ role: "user", content: message }],
        tools: MCP_TOOLS    // your 13 tool definitions
      })
    })

    // step 5: return Claude's response to the iOS app
    return new Response(await claudeResponse.text())
  }
}
```

---

### 3. The RAG Search Tool — knowledge.ts

Lives on Cloudflare. Connects to AWS RDS. Converts query to numbers, finds closest chunks.

```typescript
// worker/tools/knowledge.ts

export async function searchKnowledge(query: string) {

  // step 1: convert query to 1536 numbers using OpenAI
  const embedResponse = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: query,
      model: "text-embedding-3-small"
    })
  })
  const { data } = await embedResponse.json()
  const queryVector = data[0].embedding
  // queryVector = [0.041, -0.203, 0.756, ...] (1536 numbers)

  // step 2: ask pgvector on AWS RDS for the 5 closest chunks
  const results = await db.query(`
    SELECT content, source, topic,
           1 - (embedding <=> $1) AS similarity
    FROM documents
    ORDER BY embedding <=> $1
    LIMIT 5
  `, [queryVector])

  // step 3: return the matching text to Claude
  return results.rows.map(row => ({
    content:    row.content,    // "Shooting cracks indicate the slab is propagating..."
    source:     row.source,     // "tremper_staying_alive"
    topic:      row.topic,      // "instability_signs"
    similarity: row.similarity  // 0.91
  }))
}
```

---

### 4. Memory — Writing After a Session — memory/write.ts

Runs on Cloudflare after session ends. Summarises what happened. Saves to KV.

```typescript
// worker/memory/write.ts

export async function saveSessionMemory(userId: string, transcript: string) {

  // step 1: ask Claude to extract key facts from the session
  const extraction = await callClaude({
    system: `Extract key facts about this user's backcountry experience.
             Return JSON only. Fields: trips, experience, preferences, notes.`,
    message: `Session transcript:\n${transcript}`
  })
  // extraction = {
  //   trips: [{date: "2026-05-28", zone: "Whitewater", decision: "went"}],
  //   experience: {ast: 1, seasons: 3, region: "Kootenays"},
  //   preferences: {communication: "direct"},
  //   notes: ["uncomfortable on convex rolls"]
  // }

  // step 2: merge with existing memory (don't overwrite, append)
  const existing = await env.KV.get(`memory:${userId}`)
  const merged = mergeMemory(
    existing ? JSON.parse(existing) : {},
    JSON.parse(extraction)
  )

  // step 3: save back to KV — no TTL, memory persists indefinitely
  await env.KV.put(`memory:${userId}`, JSON.stringify(merged))
}
```

---

### 5. wrangler.toml — The Cloudflare Config

Tells Cloudflare where to put everything. Lives in your repo.

```toml
# worker/wrangler.toml

name = "backcountry-mcp"
main = "src/index.ts"

# Cloudflare KV namespace
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
# created once with: wrangler kv:namespace create KV

[vars]
ENVIRONMENT = "production"

# Secrets — set via CLI, never written in this file:
# wrangler secret put ANTHROPIC_API_KEY
# wrangler secret put OPENAI_API_KEY
# wrangler secret put DATABASE_URL
```

---

## The Full Picture

```
Your laptop:
  write code in worker/
  run: wrangler deploy
      ↓

Cloudflare receives your code,
runs it at edge nodes globally.

When iOS app sends a message:
  ┌─────────────────────────────────────┐
  │         index.ts (entry point)      │
  │                                     │
  │  1. load system prompt  → KV        │
  │  2. load user memory    → KV        │
  │  3. call Anthropic API              │
  │       Claude calls tools:           │
  │         forecast.ts  → AvCan API    │
  │         weather.ts   → Open-Meteo   │
  │         knowledge.ts → AWS RDS      │
  │  4. return response to iOS app      │
  └─────────────────────────────────────┘

After session ends:
  ┌─────────────────────────────────────┐
  │       memory/write.ts               │
  │                                     │
  │  1. transcript → Claude extract     │
  │  2. merge with existing memory      │
  │  3. save to KV                      │
  └─────────────────────────────────────┘
```

One Worker handles all of it. One deploy command. One place your code lives.

---

## Key Commands

```bash
# deploy to Cloudflare
wrangler deploy

# update system prompt instantly (no app release)
wrangler kv:key put --binding=KV "system-prompt-base" "$(cat prompt.txt)"

# set secrets (API keys — stored in Cloudflare, never in code)
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put DATABASE_URL

# tail live logs from production
wrangler tail

# run locally (dev mode)
wrangler dev
```
