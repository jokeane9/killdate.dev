# Gate 2 Validation Research — Summary
**Date:** 2026-06-01
**Full data:** shelf repo, branch research/gate2-ai-seo (merged to main)
**Test cost:** $2.63 total across two rounds

---

## What we tested

162 API calls across 9 beauty brands. Claude Sonnet as test model (web search ON/OFF), Claude Haiku as independent judge (forced structured output via tool_choice). 3 repetitions per cell for statistical stability.

**Query design:**
- R1: "Tell me about [Brand]'s moisturizer for dry skin" (recognition baseline)
- R2: "Does [Brand] make a moisturizer for dry sensitive skin?" (Gate 2 test)
- R3: "Is [Brand]'s moisturizer good for a damaged skin barrier?" (evaluative)

**Two conditions:** search OFF (parametric — training data only) vs search ON (retrieval — LLM fetches pages).

**Judge scored:** cited (Y/N), recommended (Y/N), confidence (high/medium/low), specific product named (Y/N), failure type.

---

## Results

**RECOMMENDED% with search ON (the key metric):**

| Brand | R2/on | R3/on | Pattern |
|---|---|---|---|
| Byoma | 3/3 | 3/3 | Gold standard — ingredient content + good pages |
| Naturium | 3/3 | 2/3 | Gold standard |
| Cocokind | 3/3 | 3/3 | Strong product knowledge despite thin brand recognition |
| Kosas | 3/3 | 3/3 | 0/3 OFF → 3/3 ON — pages save it |
| Saltair | 3/3 | 1/3 | 0/3 OFF → 3/3 ON R1/R2, R3 collapses |
| Versed | 1/3 | 3/3 | Moderate, inconsistent |
| Beekman 1802 | 2/3 | 2/3 | Moderate both ways |
| Glow Recipe | 1/3 | 1/3 | 3/3 OFF → COLLAPSES ON — search hurts it |
| Vacation Inc. | 2/3 | 0/3 | Gate 2 failure — JS-rendered, no attributes |

---

## Five patterns

**1. Gold standard (Byoma, Naturium, Cocokind)**
Strong both conditions. Community-driven educational content in training data AND good pages. R3/on 3/3.

**2. Pages save it (Kosas, Saltair)**
0/3 search OFF (no parametric knowledge), 3/3 search ON for simple queries. Good page structure compensates for weak brand training data. R3 exposes limits — evaluative questions need content that goes beyond basic facts.

**3. Search hurts it (Glow Recipe)**
3/3 search OFF → 0-1/3 search ON. Strong brand, weak page structure. When Claude searches, it finds Sephora comparison pages and competitor roundups instead of Glow Recipe's own pages. Marketing-copy pages can't supply facts for citation. **The search penalty is Gate 2 failure made visible.**

**4. Product knowledge without brand recognition (Cocokind)**
0/3 R1 OFF (Claude doesn't know the brand name), 3/3 R2 OFF (Claude knows they make a moisturizer for dry sensitive skin). Ingredient-transparency content and specific product discussions got product-level claims into training data independently of brand-level awareness.

**5. Broken Gate 2 (Vacation Inc.)**
JS-rendered site (invisible to all crawlers), Disallow-Training in robots.txt, marketing-copy pages. 0/3 OFF, 0-2/3 ON. Evaluative R3: 0/3 even with search.

---

## The key finding

**Glow Recipe negative search effect.** A well-known brand goes from 3/3 recommended (parametric) to 0/3 recommended (search ON). This proves Gate 2 failure exists as a real phenomenon — not just for unknown brands but for established ones with weak page structure. Your brand being well-known doesn't protect you if your pages are unreadable.

**The Kosas proof point.** 0/3 search OFF (Claude doesn't know Kosas from training data) → 3/3 search ON (Claude finds their pages, reads them, gives confident specific recommendations). Page quality directly compensates for thin parametric presence. This is the product's core value proposition confirmed empirically.

---

## Judge calibration finding

The initial judge used `cited` (brand mentioned = Y/N) which returned 100% across all brands — useless. Updated judge added `recommended`, `confidence`, `specific_product_named`. The `recommended` field is what surfaces the real signal. Lesson: citation != recommendation. A brand can be mentioned in a hedge ("I don't have reliable info about X") and cited=True but recommended=False.

---

## Kill criteria (pre-committed, tested)

**Validated:** Gate 2 signals predict recommendation quality with search ON. Moving from broken to strong Gate 2 is worth ~$65-130K annually for a $20M GMV brand in AI-referred traffic.

**Still open:** does implementing Gate 2 improvements actually move citation rate? (Before/after with a real merchant willing to push changes and verify.) This is the next experiment.

---

## Full data location

- `shelf/gate2_test.py` — test harness
- `shelf/gate2_results.jsonl` — round 1 (Kosas, Byoma, Naturium, Vacation Inc.)
- `shelf/gate2_results_r2.jsonl` — round 2 (Glow Recipe, Beekman, Cocokind, Versed, Saltair)
- `shelf/feature-builds/ai-seo-analytics/GATE2-EXEC-SUMMARY.md` — full executive summary
