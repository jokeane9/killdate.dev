# AI Visibility Dashboard — Ideation

> Process notes, mocks, and the competitive thesis for an AI-search visibility product layered on top of Shelf's existing competitive-intelligence crawl pipeline.

Captured 2026-05-30 during a single working session that ran from "what does Lovable actually do" through to "ship a working B&W prototype with a scoped diagnostic deep-dive in the right sidebar."

---

## What we're building

A dashboard that tells a Shopify DTC merchant **how their products show up in ChatGPT.** Product by product. Per query. Scored on multiple dimensions per query. Tied to actionable suggestions that write back to Shopify metafields when the merchant approves.

The category most people are circling: "AI SEO" / "AEO" (answer engine optimization) / "GEO" (generative engine optimization). The early players (Profound, Otterly, AthenaHQ, Peec) are mostly tracking brand-level share-of-voice in AI search. We think the differentiation isn't at the brand altitude — it's product-by-product specificity that nobody else can produce cheaply.

---

## The competitive thesis — better product, cheaper

Three structural reasons, in order of importance:

### 1. Data advantage from Shelf

Most AI SEO tools have to build a competitor-discovery pipeline from scratch. We already have one. Shelf has been crawling Shopify DTC competitor products through a five-layer validation pipeline (Layer 0 crawl → Layer 1 validation → Layer 2 guards → Layer 3 signal prep → Layer 4 Claude) for months. That pipeline produces structured data on the merchant's own products *and* their competitors' products. Every product. Every price. Every variant. Continuously updated.

For an AI visibility product, this data is the unfair starting point. We don't need to ask the merchant "who are your competitors?" — we already know. We don't need to scrape competitor product pages — we already have them. Our marginal cost per merchant is the LLM polling cost; everyone else is also paying for the data pipeline.

That means at the same price point, our gross margin is dramatically better. Which means we can be **cheaper** without sacrificing margin — or charge the same and reinvest the difference in eval quality.

### 2. Eval discipline as the moat

A vibe-coded version of this product would generate one omnibus prompt per product ("does ChatGPT know about [product]?") and call it done. It would pass its own evals and fail in the wild.

Our approach: 16 queries per product, grouped into 3 sections (Awareness, Correct Info, Ability to Purchase), each query scored on 2–4 atomic dimensions (Surface, Brand attribution, Merchant URL cited, Hallucination flag, Competitor displacement, etc.). That's 40–60 atomic data points per product per run.

The discipline of decomposing "AI visibility" into 16 specific, testable queries — and then aggregating cleanly back up to per-section health, per-product health, catalogue health, brand health — is the actual moat. It's hard to do well. It compounds with iteration. The competitor's table looks the same as ours; their cells lie and ours don't.

This is structurally identical to Shelf's existing red-room failure taxonomy and golden-fixture validation regime. Same discipline, new domain.

### 3. UI that doesn't try to impress you

Every AI SEO tool we've looked at has the same problem: cluttered, "look how much we measure" dashboards. Decoration that competes with the data.

Our visual register: B&W shadcn restraint. Monochrome with single low-saturation accents reserved for status (green/amber/red at threshold). Generous whitespace. No charts that don't earn their place. The aesthetic IS positioning — it signals "this is a serious tool for serious work."

Same register as Linear, Vercel, Plain, Cal.com, Resend — the category most likely to age well over a 5-year horizon. Restraint reads as confidence; clutter reads as compensation.

---

## Product-by-product specificity — the differentiator most tools skip

Current AI SEO tools mostly report at the brand level: *"Wilder & Co. is mentioned in 14% of category queries."* That's interesting once. It's not actionable.

Product-by-product changes the product entirely:

- *"Organic Cotton Tee is failing all 5 Purchase queries — ChatGPT can't tell buyers how to reach us. Likely cause: missing `schema.org Product/offers/price`. Here's the metafield write that fixes it."*

That's a specific, actionable, defensible finding tied to a specific SKU. It's also the kind of work that requires the data infrastructure we already have — competitor product data, merchant product data, and the eval engine that can decompose "visibility" into testable queries.

The brand-level players can't go this granular without rebuilding the data layer from scratch. We start there.

---

## How we structure the evals

### Queries per product (16 total)

| Section | Count | What we test |
|---|---|---|
| **Awareness** | 5 | Does ChatGPT know the product exists? Surfaces it for category queries? Knows it's part of the brand? |
| **Correct Info** | 6 | Price accuracy, feature accuracy, materials, variants, comparative accuracy, manufacturing origin |
| **Ability to Purchase** | 5 | Does ChatGPT enable the customer journey? Surfaces the merchant's store, knows pricing, helps users buy direct |

### Scoring dimensions per query

Each query response gets scored on 2–4 atomic dimensions, not just pass/fail:

- **Surface** — did the product appear at all? (binary)
- **Name accuracy** — referred to by correct name? (binary)
- **Brand attribution** — correctly attributed to the merchant? (binary)
- **Fact accuracy** — what % of claims matched ground truth? (graded)
- **Merchant URL/store cited** — was the merchant's purchase path mentioned? (binary)
- **Competitor displacement** — did a competitor get cited instead? (binary, negative signal)
- **Hallucination flag** — demonstrably false claim? (binary, negative signal)

### Query generation strategy

This is where Shelf's data does work nobody else can match:

- **Templated from product attributes** — the system generates queries from product schema (`{name}`, `{brand}`, `{category}`, `{competitor}`) using fixed templates. Scales to any catalogue size.
- **Comparative queries auto-populate per merchant** — "how does [product] compare to [competitor's actual product]?" writes itself because we already know who the competitors are. That single query is hard for our competitors to reproduce.

### Aggregation philosophy

Atomic dimensions → query pass/partial/fail → section health → product health → catalogue health → brand health. Weighted aggregation at each level, with section weights tunable per merchant. The headline number aggregates everything; the diagnostic surface lets you walk back down to the atomic level when you need to.

---

## The UI thesis

### Five sections in the dashboard

```
Home / Overview        ← Brand altitude (default landing)
Catalogue              ← Catalogue altitude (one click in)
Products               ← Product altitude (the main daily-use surface)
Competitors            ← Competitor lens
Diagnostics            ← Cross-cutting + always-on slim sidebar
```

### The Products view — three approaches explored

We built three genuinely different prototypes varying along three dimensions: **information density × visual unit × drill-down depth.**

| Approach | Mental model | Visual primitive | Sweet spot |
|---|---|---|---|
| **A — The List** | Spreadsheet | Row per product | 10–500 products, daily ops |
| **B — The Cards** | Portfolio | Card per product | 5–30 products, stakeholder share |
| **C — The Grid** | Heatmap | Cell at products × queries intersection | 5–50 products, pattern recognition |

All three are in `mocks/`. We landed on **Cards as v1**, with the Grid as a one-click power-user toggle. Cards reads as product-as-subject; Grid reads as power-user diagnostic.

### The catalogue altitude — Distribution Strip

Above the product cards, a single horizontal strip showing:
- Catalogue Health number + delta + 8-week sparkline
- Pass Rate (47 of 76 queries)
- Stacked distribution bar (62% pass / 28% partial / 10% fail)
- Three section breakdowns (Awareness 75% / Correct Info 70% / Purchase 40%)

This is the bridge between Brand altitude (top bar) and Product altitude (cards). It surfaces *which section is the bottleneck* at a glance — in our mock, Purchase is the red flag, which is exactly what the diagnostic surface flags.

### The diagnostic deep-dive — the elegant move

Right sidebar, always-on. Shows 3–5 current diagnostic findings. Click one → the rest collapse into a compact list and the selected finding opens into a scoped deep-dive panel.

The deep-dive is **not a Claude chat sidebar.** That's a 2024 trope and a trap. The deep-dive is a **scoped probe against a frozen finding report card.** The structure:

- **Finding header** — what's broken, how badly, severity tier
- **Suggested actions** — drafts that write to Shopify Admin API on merchant approval
- **Scoped probe** — input field at the bottom, conversation strictly bounded to this finding's evidence

The merchant doesn't see the evidence and likely-cause sections we initially included. They were the dashboard explaining itself — patronizing, redundant. The probe can surface evidence on demand if the merchant asks. The default view is finding → action. Three steps, each earning its place.

### The diagnostic taxonomy as the actual moat

5–7 named diagnostic types, each with:
- A detection rule (when does this fire?)
- A report card schema (what evidence backs it?)
- A conversational scope (what questions are valid in the probe?)
- A suggested-action template (what's the typical fix?)

Sketch of the taxonomy:
- **Coverage gap** — near-zero awareness
- **Hallucination cluster** — false claims across products
- **Purchase blocker** — customer-journey fails on buy queries
- **Competitive displacement** — competitor cited instead of merchant's product
- **Regression** — was healthy, dropped recently

This taxonomy is structurally what Shelf already does for its red-room failure modes. Encoded expertise. Hard to copy without the discipline. Same shape, new domain.

---

## The Shopify write-back loop (longer roadmap)

The diagnostic surfaces a **suggested action** with a draft Shopify metafield write. The merchant clicks "apply" → the change goes to Shopify Admin API (`metafieldsSet`, `productUpdate`). Next eval run measures whether the fix moved the score.

This closes the loop: observability → diagnostic → suggested fix → write → re-measure. Most AI SEO tools stop at "telling you what's wrong." We could continue to "applying the fix and measuring the result," which is the most valuable possible UX shape because it proves its own worth.

**Architectural decision still open:** does Shelf compose the action (write-back), or does Shelf hand off to Sidekick for composition? Per Shelf's 2026-04-17 STACK.md decision ("Shelf decomposes, Sidekick composes"), the purist answer is Shelf surfaces the draft, Sidekick or the merchant composes the write. The pragmatic answer is one-click human approval *is* composition. This goes in the canonical update.

---

## Why "cheaper than everyone else" is structurally true

| Component | Competitor cost | Our cost |
|---|---|---|
| Competitor data pipeline | Build + maintain | Free (Shelf already has it) |
| Eval orchestration infra | Build + maintain | Modal/Lambda + Postgres (commodity) |
| LLM polling | Per-query cost | Per-query cost (same) |
| Dashboard stack | Build or pay platform | Owned (Remix + shadcn + Tailwind) |
| Auth, multi-tenancy | Clerk/Auth0 + RLS | lucia or Clerk |
| Billing | Stripe hosted | Stripe hosted (same) |

We have a structural cost advantage of roughly one full infrastructure layer (the competitor data pipeline). At the same revenue per merchant, our gross margin is dramatically better. That means we can be priced cheaper *and* maintain healthier margins. Or priced the same and reinvest the difference in eval quality, faster shipping, or better support.

This is the "better product, cheaper" wedge made structural rather than aspirational.

---

## The ideation process — chronological walkthrough

The design space exploration moved through five distinct phases in a single working session:

### Phase 1 — Stack interrogation
Started with the question "is Lovable the right tool for this?" and moved through Base44, Claude Design, the vibe-coder landscape, and what's actually buildable with each. Landed on the principle that **vibe-coders structurally can only build commoditized categories** because their primitive sets encode the median of training data. That meant any product we build needs to live in the un-commoditizable bucket by construction — which AI visibility with deep eval discipline does, especially when fed by Shelf's data layer.

### Phase 2 — Product framing
Sharpened from "AI SEO observability" to "AI visibility for Shopify DTC, with competitive benchmarking from existing crawl data." The framing matters: this isn't a category extension of Shelf — it's a product whose data layer is Shelf. The crawl pipeline doesn't change; the surface and the value proposition do.

This raised a real question about whether to reposition Shelf or treat this as a sibling product. Currently pending the canonical update gate per Shelf's own discipline.

### Phase 3 — Brief
Wrote a structured brief with:
- B&W shadcn aesthetic frame
- Tech stack (Remix + Tailwind + shadcn + Tremor + zod, no Lovable)
- Minimal data shape (5 products × 16 queries × 3 sections × ChatGPT)
- Three approaches varying along density × visual unit × drill-down
- Five sections in the dashboard structure (Home / Catalogue / Products / Competitors / Diagnostics)
- A cognitive-load reducer section that pivoted into a real altitude-of-analysis section after a misread

### Phase 4 — Three prototypes
Built three self-contained HTML prototypes (Tailwind via CDN, no build step, Inter font). Same mock data across all three so the same Organic Cotton Tee Purchase-failure pattern surfaces differently in each view:
- **The List** — see it as a row with red Purchase pill, expanded inline showing failing queries
- **The Cards** — see it as a highlighted card with the Purchase segment going solid red
- **The Grid** — see it as a horizontal red band across the Purchase column, with the vertical pattern of failure on query P2 revealing systemic catalogue-wide weakness

### Phase 5 — Picked Cards, layered in the right details
Cards won as the v1 surface. Two layered additions:
- **Distribution Strip** at the catalogue altitude above the cards
- **Scoped diagnostic deep-dive** replacing the simple Diagnostics sidebar with a Finding + Suggested Actions + Scoped Probe surface

Final stripping pass: removed the verbose "Evidence" and "Likely cause" middle layers from the deep-dive. They were the dashboard explaining itself. Finding → action → ask if you want more. Three steps, each earning its place.

---

## What's in this folder

```
ai-visibility-dashboard/
├── README.md                    ← you are here
├── BLOG-POST.md                 ← ~500-word public writeup of the process
└── mocks/
    ├── index.html               ← landing page comparing all three approaches
    ├── approach-a-list.html     ← The List (dense table, daily ops)
    ├── approach-b-cards.html    ← The Cards (chosen v1, with Distribution Strip + scoped deep-dive)
    └── approach-c-grid.html     ← The Grid (heatmap diagnostic, power-user toggle)
```

All four HTML files are self-contained — Tailwind via CDN, Inter from Google Fonts, inline SVG icons. Open in any browser. No build step.

---

## What's next

The canonical update is the gate before any build:

1. **Open Shelf's `marketing/canonical/MARKETING-TRUTH.md`** and try to write the new positioning sharp in a half-day. If it lands clean, the pivot is real.
2. **Then update `BEHAVIOR-SPEC.md`** with the new product behavior.
3. **Then bump the master spec** to v2.0 with the new architecture.
4. **Only then** start building: diagnostic taxonomy → report card schemas → Cards UI + Distribution Strip → scoped probe → Shopify write loop.

If the canonical doesn't write itself sharp in half a day, the pivot was reactive and we go back to Shelf's current Sidekick-plumbing direction. The discipline catches reactive pivots cheaply — that's its job.

---

## References

- Mocks live in `mocks/` — start with `mocks/index.html`
- Reference aesthetic: [ui.shadcn.com](https://ui.shadcn.com)
- Eval methodology connects directly to Shelf's existing Layer 4 / red-room discipline
- The cost wedge connects to the parked `ideation/llm-cost-wedge-brief.md` thesis (their own customer for LLM cost discipline)
