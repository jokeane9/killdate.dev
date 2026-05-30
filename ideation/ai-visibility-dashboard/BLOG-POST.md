---
title: "Designing an AI visibility dashboard — process notes"
description: "How a single working session moved from 'is Lovable the right tool' to three working B&W shadcn prototypes with a scoped diagnostic deep-dive, and what the design process surfaced about the actual competitive wedge."
draft: true
tags: ["ui-ux", "case-study", "ai-search", "shadcn", "design-process"]
---

A working session that started with stack questions and ended with three rendered prototypes and a calibrated product thesis. Here's the shape of the process, with the load-bearing insights flagged.

## The setup

The question on the table: design a dashboard that tells a Shopify DTC merchant how their products show up in ChatGPT. Product by product. Per query. Scored on multiple dimensions.

The wedge the session sharpened:

- **Data advantage** — our crawl pipeline already produces structured competitor product data. Other AI SEO tools have to build that layer. We start one infrastructure tier ahead.
- **Eval discipline** — 16 queries per product, grouped into 3 sections (Awareness, Correct Info, Ability to Purchase), scored on 2–4 atomic dimensions each. 40–60 atomic data points per product per run. Not "does ChatGPT mention you" — *which specific failure modes, with grounded evidence.*
- **Product-by-product specificity** — most tools report at the brand level. Brand-level reports are interesting once. Per-product diagnostics tied to specific Shopify metafield writes are *actionable.*
- **Cost structure** — at the same revenue per merchant, our gross margin is structurally better because we don't pay for the competitor data pipeline. We can be priced cheaper and still healthier.

Better product, cheaper. Made structural, not aspirational.

## The five phases

The session moved through five distinct phases. Each one's load-bearing insight is flagged.

### Phase 1 — Stack interrogation

Walked through Lovable, Base44, Claude Design, the vibe-coder landscape.

**Insight:** vibe-coders structurally can only produce commoditized categories because their primitive sets encode the median of training data. So the rule for what to build is: *only build the things vibe-coders' primitive sets can't produce.* For AI visibility with deep eval discipline + a domain data layer, that bucket holds.

### Phase 2 — Product framing

Sharpened from "AI SEO observability" (generic) to "AI visibility for Shopify DTC, with competitive benchmarking from existing crawl data" (specific, leverages the unfair starting point).

**Insight:** the wedge isn't the dashboard. The wedge is the data layer that nobody else has cheaply. The dashboard makes it visible.

### Phase 3 — The brief

Structured brief with B&W shadcn aesthetic, tech stack (Remix + Tailwind + shadcn + Tremor + zod, no Lovable), minimal data shape, three approaches varying along density × visual unit × drill-down, and five dashboard sections (Home / Catalogue / Products / Competitors / Diagnostics).

**Insight:** the design space exploration only works if the dimensions of variation are named explicitly. Otherwise you produce three flavors of the same thing.

### Phase 4 — Three prototypes

Built three self-contained HTML prototypes — Tailwind via CDN, no build step, identical mock data so the same failure pattern surfaces differently in each view.

- **The List** — Linear-style table, row per product, expand inline for query detail. Scans fast, scales to 500 products.
- **The Cards** — generous cards in a 2-column grid, each with segment-bar progress per section. Product-as-subject thinking.
- **The Grid** — 5×16 heatmap. Vertical bands reveal systemic per-query failures; horizontal bands reveal per-product failures. The diagnostic killer view.

**Insight:** the Cotton Tee Purchase-failure case shows up *most diagnostically* in the Grid (you see the systemic vs. per-product split), *most actionably* in The List (the failing query names are right there in the expanded row), and *most emotionally* in The Cards (the entire Purchase bar goes solid red).

### Phase 5 — Picked Cards, layered the right details

Cards won as v1. Two additions:

- **Distribution Strip** at the catalogue altitude above the cards — KPIs, overall pass/partial/fail bar, three section breakdowns. The bridge between Brand altitude (top header) and Product altitude (cards).
- **Scoped diagnostic deep-dive** in the right sidebar — finding + suggested actions + a scoped probe input. *Not* a generic Claude chat sidebar (that's a 2024 trope and a trap).

The deep-dive's report card pattern: each diagnostic is a *frozen finding object* with all queries, responses, eval data, and Shopify product snapshot. The probe at the bottom is strictly bounded to that finding's context. The chat literally can't drift into hallucination because it doesn't have data outside the report card.

**Insight:** the deep-dive went through one final stripping pass. We removed the "Evidence" and "Likely cause" middle sections. They were the dashboard explaining itself — patronizing and redundant. The merchant doesn't need to read the evidence to trust the diagnostic; they need to act on it. If they want to verify, the probe surfaces evidence on demand. Finding → action → ask if you need more.

## The diagnostic taxonomy is the moat

5–7 named diagnostic types, each with a detection rule, a report card schema, a conversational scope, and a suggested-action template:

- Coverage gap (near-zero awareness)
- Hallucination cluster (false claims across products)
- Purchase blocker (customer-journey fails)
- Competitive displacement (competitor cited instead)
- Regression (was healthy, dropped recently)

This taxonomy is structurally identical to what Shelf already does for its red-room failure modes. Encoded expertise. Compounds with iteration. The competitor's table looks the same as ours; their cells lie and ours don't.

## The order to build

The canonical update gate is mandatory before any building:

1. Open `marketing/canonical/MARKETING-TRUTH.md` and try to write the new positioning sharp in a half-day.
2. If it lands clean, the pivot is real. If not, the pivot was reactive.
3. Then: diagnostic taxonomy → report card schemas → Cards UI + Distribution Strip → scoped probe → Shopify Admin API write loop.

Each prior step is a *cheap test* of whether the next one is worth doing. Skipping the canonical gate is how you build the wrong thing for two months.

---

Three mocks, one brief, one calibrated thesis. Mocks live in `mocks/` next to this post.
