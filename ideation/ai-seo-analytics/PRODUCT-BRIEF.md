# Gate 2 AI SEO — Product Brief
**Date:** 2026-06-01
**Status:** Mock design phase — 6 HTML files to build

---

## One line

On-page AI SEO optimization for mid-market Shopify brands — generates attribute-dense product descriptions, FAQPage schema, and missing attributes so LLMs with web search actually cite you.

---

## The problem

When a shopper asks ChatGPT "does [Brand] make a moisturizer for dry sensitive skin?", one of two things happens:

**Pass:** "Yes — their Moisturizing Gel Cream has ceramides, niacinamide, fragrance-free formula. $14.99."

**Fail:** "I don't have reliable information about this brand's moisturizer lineup."

The difference is page structure, not brand size. A product page with attribute-dense descriptions, FAQPage schema, and crawlable HTML enables the confident answer. A JS-rendered page full of marketing copy produces the hedge.

---

## The two gates

**Gate 1 — does your page appear in search results?**
ChatGPT uses Bing. Google AI Mode uses Google. Traditional SEO. Shopify's Agentic Storefronts handles this natively for free. Not a product.

**Gate 2 — when the LLM fetches your page, can it extract facts and form a confident recommendation?**
This is new and optimizable. Depends on:
- Crawlability (GPTBot not blocked, not JS-rendered)
- Attribute density (specific facts vs marketing copy)
- Schema markup (Product, FAQPage, AggregateRating)
- FAQ structure (common questions answered explicitly)

---

## The three-step LLM loop

**Step 1 — Audit (LLM with search = the "before" state)**
Fire R2/R3 queries with search ON for each product. The response IS the before state — captured once, stored. Also audit the page directly: parse schema, score attribute density, check crawlability. Gap analysis produced from both.

**Step 2 — Generate**
Community question mining (what people actually ask about this category) + community consensus (what Reddit/Sephora reviews say matters) + page data → generate:
- Rewritten attribute-dense description
- FAQPage JSON-LD (paste-ready `<script>` block)
- Missing metafields list (specific fields + example values)

**Step 3 — Verify (24h later)**
Push improvements to Shopify → wait 24h (Bing re-indexes established DTC pages within 24h) → run same R2/R3 queries again → compare before/after. The after response is shown verbatim in the UI alongside the before quote. That diff is the proof.

---

## Target customer

**Primary:** Mid-market DTC brands ($10-50M GMV) — has an SEO person, feels Google AI Overviews stealing clicks, comfortable paying $99-500/month for SEO tools.

**Secondary:** SEO/social agencies serving mid-market DTC — need a client deliverable, a competitive benchmark, something to charge for.

**Not:** micro retailers (can't act on it), enterprise (buys Profound/Evertune).

---

## Differentiation

| What exists | What this does differently |
|---|---|
| GEO monitoring (Profound $1B, Evertune) | Optimization output, not a score. Paste-ready content. Enterprise-only price point. |
| Generic schema SEO apps | Competitive benchmark — "your competitor has 12 structured attributes, you have 4" |
| Traditional SEO tools | AI-specific: community question mining, FAQPage schema, LLM crawlability |

**Shelf's data advantage:** existing competitor crawl. The benchmarking angle ("here's exactly what your competitor's page has that yours doesn't") is uniquely available from Shelf's crawl infrastructure.

---

## Scope — V1

- Product pages
- Category pages

Deferred to V2: blog posts, homepage, multi-platform (Perplexity, Google AI Mode). ChatGPT only for V1 validation.

---

## The traffic opportunity

AI referral traffic converts at 11.4% vs 5.3% organic. Revenue per visit: Claude $4.56, Perplexity $3.12, ChatGPT $2.34. Growing 7x YoY on Shopify. For a $20M GMV brand, moving from broken to strong Gate 2 signals is worth ~$65-130K annually — at zero ongoing cost. One-time optimization, compounding as AI shopping grows.
