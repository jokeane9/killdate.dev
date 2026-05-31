# Backcountry MCP — Memory, Prompt Caching & Feedback

## The Three Context Problems

Every AI app has to solve three things:

1. **Cost** — long prompts sent thousands of times per day get expensive fast
2. **Memory** — Claude forgets everything between sessions by default
3. **Improvement** — how does the tool get better over time from real usage

Prompt caching solves #1. Memory architecture solves #2. Eval-driven feedback solves #3.

---

## Prompt Caching

### What it is

Normally: every API call, Anthropic re-processes every token in your system prompt
from scratch. Your 2000-token operating manual — processed fresh every time.

With caching: you tell Anthropic "cache this section." They process it once, store
the result on their servers for 5 minutes. Every subsequent call within that window
skips re-processing those tokens entirely.

### What it costs

| Token type | Cost (relative) |
|---|---|
| Normal input tokens | 1x |
| Cache write (first call) | 1.25x |
| Cache read (subsequent calls) | 0.1x |

A 2000-token system prompt sent 1000 times a day:
- Without caching: 2,000,000 tokens charged at full rate
- With caching: 2000 tokens at 1.25x + 998 × 2000 tokens at 0.1x
- Roughly 10x cheaper. Not optional in production.

### How you set it up

One change to your API call. You do this, nobody else does it for you.

```javascript
// Cloudflare Worker
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  body: JSON.stringify({
    model: "claude-sonnet-4-6",

    system: [
      {
        type: "text",
        text: systemPromptBase,          // the 2000-token operating manual
        cache_control: { type: "ephemeral" }  // ← tell Anthropic to cache this
      },
      {
        type: "text",
        text: userContext,               // dynamic per-user section
        // no cache_control here — this changes per user, don't cache it
      }
    ],

    messages: conversationHistory
  })
})
```

### The TTL

Cache lasts 5 minutes from last use. Every call within 5 minutes resets the clock.
An active user conversation keeps the cache warm automatically.
A user who puts their phone in their pocket for 10 minutes: next message is a cache miss,
slightly slower first response, then warm again.

### What infra runs this

Nothing you manage. Anthropic's servers. You just add the flag. They handle everything.

---

## Memory

### The problem

Claude has no persistent memory by default. Session ends, everything is gone.
Next time the user opens the app: Claude has no idea who they are, where they ski,
what their experience level is, what happened last weekend.

For a trip planning tool this is a real problem. You want Claude to know:
- This person did their AST 1 last year, usually skis with two others
- They're most comfortable in the Kootenays, less familiar with Coastal terrain
- They've been caught in marginal conditions before — weight their risk tolerance accordingly
- Last trip they noted they felt uncomfortable on convex rolls

### The solution: external memory store

You build a memory system outside Claude. Claude doesn't hold the memory —
a database does. Claude reads from it at session start.

```
SESSION ENDS
    ↓
Background process: summarise what happened
    ↓
Extract key facts about the user
    ↓
Write to memory store (Cloudflare KV or pgvector)

NEXT SESSION STARTS
    ↓
Fetch user's memory from store
    ↓
Inject into system prompt before conversation begins
    ↓
Claude reads it, knows this person
```

### Two types of memory

**Working memory** — the current conversation
The full conversation history is sent with every API call. Claude "remembers"
everything in this session automatically. This is in-context memory.
It's why you can say "what about my objective from earlier" and Claude knows.
Downside: grows with every message. Gets expensive for long sessions.
For a day trip: probably 20-30 messages total. Fine.

**Long-term memory** — between sessions
Doesn't exist unless you build it. This is what you store in KV or pgvector.
Persists indefinitely. Injected back at session start.

### What gets stored in long-term memory

Not everything. Just what's genuinely useful across sessions.

```
User ID: user_abc123

Trips:
  - 2026-05-15: Whitewater sidecountry, Ymir NW face
    Conditions: Considerable, PS problem on NW aspects
    Decision: went, returned safely
    Noted: uncomfortable on convex rolls near summit

Experience:
  - AST 1 completed 2025
  - 3 seasons backcountry
  - Primary region: Kootenays

Party:
  - Usually 3 people
  - Mixed experience levels

Communication preference:
  - Direct, not verbose
  - Wants specific aspect/elevation callouts
  - Doesn't want to be over-warned on Low danger days
```

### How it gets written — the post-session summariser

After each session ends (user closes app or 30min inactivity),
your Worker calls Claude one more time with the transcript:

```javascript
// runs after session ends — not the user-facing call
const summary = await callClaude({
  system: `Extract key facts about this user's backcountry experience,
           preferences, trip history, and risk tolerance from this session.
           Return structured JSON only. Be brief.`,
  messages: [{
    role: "user",
    content: `Session transcript: ${sessionTranscript}`
  }]
})

// merge with existing memory
const existing = await kv.get(`memory:${userId}`) || {}
const updated = mergeMemory(existing, JSON.parse(summary))
await kv.put(`memory:${userId}`, JSON.stringify(updated))
```

Claude does the extraction. You just run it and store the result.

### How it gets read — injected at session start

```javascript
// at the start of every new session
const userMemory = await kv.get(`memory:${userId}`)

const systemPrompt = `
${await kv.get("system-prompt-base")}

${userMemory ? `
USER MEMORY
${userMemory}
` : ""}
`
```

That's it. The memory becomes part of the system prompt. Claude reads it and
treats it as background knowledge about this person.

### What infra runs this

| Piece | Where |
|---|---|
| Memory store | Cloudflare KV (simple) or pgvector on RDS (semantic search on memory) |
| Post-session summariser | Cloudflare Worker — triggered by session end event |
| Memory injection | Cloudflare Worker — at session start, before first message |
| Who builds it | You, in the Worker code |
| Who manages the infra | Nobody — Cloudflare KV is fully managed |

---

## Feedback and Improvement

### The three feedback signals

**Explicit** — user rates a response (thumbs up/down, or "that was wrong")
**Implicit** — user behaviour: did they ask a follow-up that suggests Claude was off?
Did they correct Claude? Did they abandon the session?
**Eval-driven** — you run your golden scenario set against the current prompt, measure pass rate

### What you do with it

You don't fine-tune the model. You tune the system prompt.

```
Eval shows: Claude is over-hedging on Low danger days
    ↓
Identify the pattern in failing scenarios
    ↓
Add a line to the <behavior> section of the system prompt:
  "Low danger (1) does not require caveats about unpredictability.
   State it clearly: today is a low-risk day."
    ↓
Re-run evals
    ↓
Pass rate improves → deploy to KV
```

One change to a KV value. Live in 30 seconds. No App Store. No redeployment.

### The feedback loop over time

```
Week 1:  basic prompt, basic evals
         ↓ real users, real sessions
Week 2:  pattern: Claude keeps asking for AST level even when user already told it
         fix: inject user profile earlier in session start
         ↓
Week 4:  pattern: users correcting Claude on Coastal snowpack specifics
         fix: add a Coastal climate section to system prompt
         ↓
Month 2: eval pass rate: 72% → 89%
         memory system shows users returning for second trips
```

The system prompt is a living document. Version controlled. Eval-gated. Deployed
like code. This is what separates a tool that works on demo day from one that
works six months later with real users in real conditions.

### Who does all this

You. Or one engineer. This is not a data science team problem.

The infra is:
- Cloudflare KV: memory store + system prompt store
- Cloudflare Worker: session management, memory read/write, post-session summariser
- pgvector on RDS: RAG corpus (separate from memory)
- A test runner (pytest): eval suite, runs on demand or in CI

None of this requires ML infrastructure. No GPUs. No training pipelines.
The model is Anthropic's problem. Yours is the data that flows into and out of it.
