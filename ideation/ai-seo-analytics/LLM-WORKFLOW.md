# Gate 2 — LLM Workflow Architecture
**Date:** 2026-06-01

---

## The full chain

```
AUDIT (LLM with search)           ← before state captured here
  ↓
GENERATE (LLM + community data)   ← content produced here
  ↓
PUSH (Shopify Admin API)
  ↓
WAIT 24h (Bing re-indexes)
  ↓
VERIFY (LLM with search)          ← after state captured here
  ↓
DIFF (before vs after)            ← shown in UI
```

---

## Step 1 — Audit

Two parallel jobs:

**Job A — Gate 2 page signals (deterministic, no LLM)**
- Fetch `robots.txt` → check for GPTBot, ClaudeBot, PerplexityBot
- Fetch product page HTML → detect JS-rendering (empty body = JS-gated)
- Parse `<script type="application/ld+json">` → extract schema types present
- Score attribute density: count specific facts (ingredient names, SPF values, size, price, certifications, skin type) per 100 words

**Job B — Before state (LLM with search)**
Run R2 and R3 queries for each product with search ON:
- R2: "Does [Brand] make a [product type] for [use case]?"
- R3: "Is [Brand]'s [product type] good for [specific need]?"

The LLM response IS the before state. Stored verbatim. Not analysed — quoted directly in the UI.

**Combined output:** 6 Gate 2 signals + before-state LLM quote per product.

---

## Step 2 — Generate

Three sequential LLM calls:

**Call 1 — Community question mining (Claude with search)**
```
Search for the most common questions people ask about [product category].
Look for Reddit threads, Sephora reviews, PAA boxes, beauty forums.
Return the 10 most specific questions shoppers ask.
Not generic ("is this good?") — specific ("does this work under makeup?",
"is this fragrance-free?", "what SPF is this?")
```

**Call 2 — Community consensus (Claude with search)**
```
Search Reddit (r/SkincareAddiction, r/AsianBeauty), Sephora reviews,
beauty forums. What attributes do people say matter most for
[product category]? What ingredients, claims, certifications?
Return ranked list of what the community actually cares about.
```

**Call 3 — Generate artifacts (Claude, no search)**
```
Product page content: {current_description}
Attributes found: {attribute_list}
Community questions: {step_1_output}
Community consensus: {step_2_output}
Competitor page data: {competitor_attributes} (if available)

Generate:
1. REWRITTEN DESCRIPTION (150-200 words, attribute-dense, answers
   community questions implicitly, uses community language, no marketing copy)
2. FAQPage JSON-LD (8 Q&A pairs answering the top questions,
   valid JSON-LD for <script type="application/ld+json">)
3. MISSING ATTRIBUTES (specific Shopify metafields to add,
   with example values from category norms)
```

**Output:** three paste-ready artifacts. Description goes to Shopify Admin API. JSON-LD blocks go to clipboard (theme head). Metafields go to Admin API or bulk editor export.

---

## Step 3 — Verify

Triggered by merchant: "I've pushed these improvements" → system waits 24h → fires verification.

**Verification call (Claude with search, same queries as audit):**
- R2: same query as audit
- R3: same query as audit
- Both with search ON

**Output:** after-state LLM quote. Stored alongside before-state quote.

**The diff shown in UI:**

```
BEFORE (audited 2026-06-01)
"I don't have reliable information about Vacation Inc.'s
moisturizer lineup. They're primarily known for sunscreen."

AFTER (verified 2026-06-02)
"Yes — Vacation Inc.'s Classic Whip is a reef-safe SPF 30
whipped sunscreen with zinc oxide, fragrance-free, water-resistant
for 80 minutes. Available at vacationinc.com for $22."
```

Not a score — the actual words. That's the proof.

---

## Timing

| Event | Timeline |
|---|---|
| Audit + Generate | Same session, minutes |
| Push improvements | Merchant action, same day |
| Bing re-index | ~24h for established DTC sites |
| Verify | 24h after push confirmation |
| Full loop | ~48h |

The 24h re-index estimate is conservative. Established Shopify stores on custom domains with regular product updates are typically re-crawled by Bingbot within 12-24h. The product states 24h to the merchant; actual results often appear sooner.

---

## Why the before state comes from the audit (not a separate baseline run)

The audit already fires the R2/R3 queries with search ON. That IS the before measurement. No separate baseline step needed. Audit run = gap analysis + before state in one API call.

This simplifies the loop and reduces cost. The before state is free — it's captured as part of the gap identification work.

---

## Cost per product per run (approximate)

| Step | Model | Estimated cost |
|---|---|---|
| Audit — Gate 2 signals | Code only | $0 |
| Audit — before state (R2+R3) | Sonnet with search | ~$0.06 |
| Generate — question mining | Sonnet with search | ~$0.04 |
| Generate — community consensus | Sonnet with search | ~$0.04 |
| Generate — artifacts | Sonnet | ~$0.03 |
| Verify — after state (R2+R3) | Sonnet with search | ~$0.06 |
| **Total per product per cycle** | | **~$0.23** |

At 25 products monthly: ~$5.75 COGS. At 25 products weekly: ~$23 COGS.
Viable at $79-99/month subscription price.
