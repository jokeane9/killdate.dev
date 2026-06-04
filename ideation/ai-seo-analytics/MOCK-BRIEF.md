# AiSEO Analytics — Mock Design Brief

> ChatGPT is the only data source across all screens. No multi-platform comparison. No Perplexity, no Google AIO. Every metric comes from ChatGPT API calls only. This is both the testing constraint and the v1 product scope.

**Canonical authority:** existing `mocks/approach-b-cards.html` is Screen #2 — frozen, do not re-mock.
**Visual register:** B&W shadcn restraint. Inter font. Monochrome with green/amber/red reserved for status thresholds only. No decorative charts. No legends.
**Mock format:** self-contained HTML, Tailwind via CDN, Inter via Google Fonts, inline SVG icons. No build step. Open in any browser.
**Stack reference:** Remix + Tailwind + shadcn + Tremor. Mocks define the visual authority the stack must match.

**Design space exploration scope:** the three approaches per screen explore HOW the existing features look — layout, hierarchy, visual weight. They do NOT introduce new features. Same data, same functionality, different presentation. Picking an approach is a layout decision, not a product decision.

---

## Executive Summary — Why These Decisions

**ChatGPT only.** This is the testing environment we have. It is also the right V1 scope — one platform, verifiable, defensible. Multi-platform adds complexity before we know what works.

**Brand level not SKU level for Screen #3.** Research confirmed ChatGPT returns the same product list less than 1% of the time across runs. SKU-level tracking requires 50–100 prompt repetitions per query to be reliable — cost and noise make it indefensible as a product surface. Brand-level signal holds across repetitions and matches what merchants can manually verify in 30 seconds. No existing competitor (Profound, Otterly, AthenaHQ) tracks at SKU level for this reason.

**Three metrics only for Screen #1, nothing modelled.** Revenue attribution via ChatGPT is dark funnel — ChatGPT doesn't send clean referral sessions to GA4. Dropped entirely. The three remaining metrics (Visibility Rate, Share of Voice, Avg Position) all come directly from counting API response data. Every number is auditable.

**Two tabs on Screen #3.** Category search (general) and brand-anchored queries are two genuinely different questions a merchant asks. Category search = "who wins in my space." Brand tab = "what does ChatGPT know about me specifically." Same table format, different prompt sets. This distinction comes directly from the probe's brand-anchoring ladder — the most load-bearing finding from the V1 run.

**Screen #2 as-is.** The existing `approach-b-cards.html` is a complete, frozen prototype. Label change only (`Awareness / Correct Info / Purchase` → `Findability / Accuracy / Conversion`) to match ecommerce language. Rebuilding it would introduce drift with no gain.

**Citations Builder kept as Screen #4.** The most actionable screen. Three sections (platform setup, product content, citation sources) map to the three levers a merchant can actually pull. Inline `Write for me` closes the loop — detect gap, generate fix, push to store. This is the feature that separates the product from a monitoring dashboard.

---

## Screen #1 — Brand Health

**What it is:** the landing screen. Three real numbers from ChatGPT. Merchant's 10-second read on their AI health.

**Three metrics — all from ChatGPT API calls, nothing modelled:**

| Metric | Definition | Source |
|---|---|---|
| **Visibility Rate** | % of category prompts where your brand is mentioned | Run N prompts through ChatGPT, count brand appearances |
| **Share of Voice** | Your mentions ÷ all brand mentions across same prompts | Same prompts, count all competitor mentions |
| **Avg Position** | Average rank when mentioned in a list response | Parse position (1st, 2nd, 3rd) when brand appears |

**What's not on this screen:** no platform breakdown, no revenue attribution, no alerts, no product drill-down.

**Mock data:** mid-market skincare brand. Visibility Rate 38% +4pts. Share of Voice 22% -2pts. Avg Position 3.1 +0.3. Losing to CeraVe and La Roche-Posay across most prompts. One win: "gel cleanser for sensitive skin under $30."

---

### Approach A — Metrics First
Three stat cards prominent at top, full width. Below: prompt-level table full width. Classic top-down hierarchy — numbers land first, detail below. Easy to scan, familiar dashboard shape.

```
┌─────────────────────────────────────────────────┐
│  Visibility Rate   Share of Voice   Avg Position │
│      38%  ↑4           22%  ↓2         3.1  ↑   │
│      ▁▂▃▄▅▆▇           ▇▆▅▄▃           ▂▄▆▃▅    │
├─────────────────────────────────────────────────┤
│ Prompt                    Mentioned  Pos  Winner │
│ best moisturizer dry skin    ✗        —   CeraVe │
│ gel cleanser sensitive skin  ✓        2   Yours  │
│ affordable tinted moisturizer ✗       —   Cetaphil│
│ best lip treatment           ✗        —   Laneige │
│ cleanser for oily skin       ✓        4   CeraVe │
└─────────────────────────────────────────────────┘
```

---

### Approach B — Table First
Slim stat strip at top (metrics as single row, compact). Full-width table dominates. Prompt data is the primary surface — metrics are context, not headline. For merchants who think operationally, not in aggregate scores.

```
┌─────────────────────────────────────────────────┐
│ Visibility 38% ↑4  ·  SoV 22% ↓2  ·  Pos 3.1 ↑ │
├─────────────────────────────────────────────────┤
│ Prompt                    Mentioned  Pos  Winner │
│ best moisturizer dry skin    ✗        —   CeraVe │
│ gel cleanser sensitive skin  ✓        2   Yours  │
│ affordable tinted moisturizer ✗       —   Cetaphil│
│ best lip treatment           ✗        —   Laneige │
│ cleanser for oily skin       ✓        4   CeraVe │
│ ...                                              │
│                          Show all 20 prompts →  │
└─────────────────────────────────────────────────┘
```

---

### Approach C — Single Dominant Metric
Visibility Rate dominates — large, centred, with a ring or arc indicator. Share of Voice and Avg Position are secondary, smaller, below. Prompt table is a collapsible drawer. Hero number draws the eye immediately. Cleanest first impression, least data density.

```
┌─────────────────────────────────────────────────┐
│                                                  │
│              Visibility Rate                     │
│                   38%                            │
│              ↑ 4pts vs last week                 │
│                                                  │
│    Share of Voice  22% ↓2    Avg Position  3.1 ↑ │
├─────────────────────────────────────────────────┤
│  ▸ Prompt breakdown  (5 prompts, 2 wins)         │
└─────────────────────────────────────────────────┘
```

---

## Screen #2 — Product Level

**As is.** `mocks/approach-b-cards.html` is the visual authority. Do not rebuild. No design exploration needed — this is already the chosen approach.

Label change only: `Awareness / Correct Info / Purchase` → `Findability / Accuracy / Conversion`.

Data source: ChatGPT API only.

---

## Screen #3 — Category Rank

**What it is:** who shows up in ChatGPT for general category searches and for your brand specifically. Brand level only — not SKU level. Every row is a real API result.

**V1 scope:** general mid-market category searches (Moisturizer, Lip, Cleanser, Foundation) + brand-anchored queries. Brand appearances only. No competitor product names, no SKU tracking.

**Two tabs:** `Category Search` — who wins in your category. `Your Brand` — what ChatGPT knows about you specifically.

**What's not on this screen:** no SKU tracking, no price comparison, no platform breakdown, no charts.

**Mock data:** Moisturizer category, 20 prompts. CeraVe 18/20 position 1.4. La Roche-Posay 14/20 position 2.1. Merchant 6/20 position 4.8 ↑2. Brand tab: strong on cleanser queries, thin on moisturizer and lip.

---

### Approach A — Clean Ranked Table
Standard ranked table, full width. Rank number as first column. Your brand row has a left border accent and subtle background. Category selector is a tab row above the table. Looks like a leaderboard. Familiar, scannable, no visual noise.

```
┌─────────────────────────────────────────────────┐
│ Category Search        Your Brand                │
├─────────────────────────────────────────────────┤
│ [Moisturizer ▾]                                  │
│                                                  │
│ #   Brand              Appearances   Pos   Trend │
│ 1   CeraVe             18 / 20       1.4    —    │
│ 2   La Roche-Posay     14 / 20       2.1   ↓1    │
│ 3   Neutrogena         8 / 20        3.2    —    │
│ ▶ 4  Your Brand        6 / 20        4.8   ↑2    │
│ 5   Cetaphil           4 / 20        5.1    —    │
└─────────────────────────────────────────────────┘
```

---

### Approach B — Split Panel
Category selector on the left as a vertical list. Table on the right. Category is always visible — merchant can switch without scrolling. More spatial, clearer separation of navigation vs data. Works well for merchants who browse across categories.

```
┌──────────────┬──────────────────────────────────┐
│ Moisturizer  │ Category Search   Your Brand      │
│ Lip          ├──────────────────────────────────┤
│ Cleanser     │ Brand         Appearances   Pos   │
│ Foundation   │ CeraVe        18 / 20       1.4   │
│              │ La Roche-Posay 14 / 20      2.1   │
│              │ ▶ Your Brand   6 / 20       4.8   │
│              │ Neutrogena     8 / 20       3.2   │
└──────────────┴──────────────────────────────────┘
```

---

### Approach C — Compact Scoreboard
No rank column — position implied by row order. Appearance count shown as a progress bar within the cell (20 prompts as the full bar). Your brand row highlighted with a pill badge. More visual than a plain table — scan speed is higher, information density is lower. Best for executives or merchants who want the vibe, not the detail.

```
┌─────────────────────────────────────────────────┐
│ Category Search        Your Brand                │
│ [Moisturizer ▾]                                  │
├─────────────────────────────────────────────────┤
│ CeraVe          ████████████████████  1.4 avg   │
│ La Roche-Posay  ██████████████        2.1 avg   │
│ Neutrogena      ████████              3.2 avg   │
│ Your Brand  ●   ██████                4.8 avg   │
│ Cetaphil        ████                  5.1 avg   │
└─────────────────────────────────────────────────┘
```

---

## Screen #4 — Citations Builder

**What it is:** ranked action list. What to fix to improve ChatGPT citation score. Execution built in — not a dashboard, a to-do list.

**Three sections:** Platform setup (one-time, highest impact) / Product content (AI writes and pushes) / Citation sources (where to get listed).

**What's not on this screen:** no blog publishing, no GEO content strategy, no agency features, no modelled revenue estimates.

**Mock data:** 12 improvements, +23pts estimated lift. Top: Bing Merchant Center not connected (+8pts). Second: 4 thin descriptions (+6pts). Third: missing schema on 6 pages (+5pts).

---

### Approach A — Flat Priority List
Single flat list, numbered by priority. Sections as plain text dividers (not cards). Each row: number + title + impact badge + one-line description + status chip + action button. Linear, task-manager feel. Closest to a runbook. Maximum information density.

```
┌─────────────────────────────────────────────────┐
│ 12 improvements available  · +23pts estimated   │
├─────────────────────────────────────────────────┤
│ PLATFORM SETUP                                   │
│ 1  Bing Merchant Center    +8pts  [Fix now →]   │
│    Not connected — invisible in ChatGPT Shopping │  To do
│ 2  schema.org markup       +5pts  [Fix now →]   │
│    Missing on 6 product pages                    │  To do
│                                                  │
│ PRODUCT CONTENT                                  │
│ 3  4 thin descriptions     +6pts  [Write for me] │  To do
│    Under 80 words — ChatGPT skips these          │
│ 4  FAQ missing             +4pts  [Write for me] │  To do
│    6 products have no Q&A section                │
└─────────────────────────────────────────────────┘
```

---

### Approach B — Grouped Cards
Each section is a card with a count badge and collapsed summary. Tap/click to expand and see individual items. Higher visual grouping, lower initial density. Merchant sees "3 platform fixes available" before drilling in. Good for merchants who want to work section by section.

```
┌─────────────────────────────────────────────────┐
│ 12 improvements · +23pts estimated              │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Platform Setup          3 items · +16pts  ▾ │ │
│ │  1 Bing Merchant Center  +8pts  [Fix now →] │ │
│ │  2 schema.org markup     +5pts  [Fix now →] │ │
│ │  3 Merchant feed         +3pts  [Fix now →] │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Product Content         5 items · +14pts  ▸ │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Citation Sources        4 items · +7pts   ▸ │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

### Approach C — Progress View
Overall citation score shown at top as a score + progress bar toward a target. Improvements listed below as a checklist. Completed items strike through and score bar fills. Completion-oriented — merchant sees the score moving as they work through the list. Most motivating, least information-dense.

```
┌─────────────────────────────────────────────────┐
│ Citation Score                                   │
│ 38pts  ████████░░░░░░░░░░░░  target 61pts       │
│        Complete 12 improvements to reach target  │
├─────────────────────────────────────────────────┤
│ ○  Bing Merchant Center not connected    +8pts   │
│ ○  4 thin product descriptions           +6pts   │
│ ○  schema.org missing on 6 pages         +5pts   │
│ ○  FAQ missing on 6 products             +4pts   │
│ ○  Google Merchant Center feed outdated  +3pts   │
│ ✓  ~~Product titles under 60 chars~~     done    │
└─────────────────────────────────────────────────┘
```

---

## Index page

Update `mocks/index.html` — four screens listed with one-line descriptions and links to all three approach files per new screen. Screen #2 links to existing `approach-b-cards.html` only.

---

## What success looks like

Open all approaches across Screens #1, #3, #4. Pick one approach per screen. Freeze those three files as visual authority alongside the existing Screen #2 mock. Every number on every screen came from a real ChatGPT API call or is clearly labelled as estimated. No screen needs explanation. No chart needs a legend.
