# O'Reilly *AI Engineering* — Learning Map

> A departure point for the re-read. Which chapters matter most given what I've actually built, where to pinpoint each, and how the book maps onto Shelf, the AI analytics product, and the backcountry ski app.
>
> Book: Chip Huyen, *AI Engineering: Building Applications with Foundation Models* (O'Reilly, 2025). Chapter list verified against the author's repo (`github.com/chiphuyen/aie-book`), 2026-06-07.

---

## Executive summary — how the book maps to my problems

The book is organized almost exactly around my five pillars, and its center of gravity is *evals* (two full chapters, 3 and 4) — which is also where I've staked my moat. That's the headline: **the book agrees with me about where the defensibility is, and it goes deeper on that exact thing than anywhere else I've read.**

The most useful lens for the re-read is to notice that **my three projects sit at three different points on the agentic spectrum**, so different chapters light up for each:

| Project | What kind of "agentic system" it is | Where it lives in the book |
|---|---|---|
| **Shelf** | **Pipeline / workflow** — a fixed Python DAG (Layer 0 crawl → 4 Claude) with *one* LLM reasoning step producing structured cards. Not an autonomous agent. | Eval (3, 4), Prompt Engineering (5), Architecture (10) |
| **AI analytics** (shelf-observability) | **Eval-as-product** — the whole product *is* an eval pipeline. It polls an external model (ChatGPT) and scores its answers across 16 queries × atomic dimensions. LLM-as-judge pointed at a competitor's model. | Eval Methodology (3) is the *entire* product spec; Evaluate AI Systems (4) is the aggregation design |
| **Backcountry MCP** | **Tool-using agent** — Claude + 13 MCP tools + RAG + memory, running a real observe→plan→act loop. The closest thing I have to a true agent. | RAG and Agents (6) is the whole architecture; Memory (6), Architecture + Feedback (10) |

So the re-read isn't one pass — it's three overlapping passes, one per project, and the chapters that matter shift each time. Chapter 6 barely touches Shelf but *is* the backcountry app. Chapter 3 barely touches backcountry's tooling but *is* the AI analytics product.

The chapters I can mostly skip (2, 7, 9) are the ones about the layer I've deliberately architected around — model internals, finetuning, inference optimization. "The model is Anthropic's problem" is exactly the boundary the book draws between AI engineering and ML engineering, so my instinct to skip them is the book's own logic, not laziness.

---

## Chapter priority tiers

**Tier 1 — deep read, this is the core craft (do these first)**
- **Ch 3 — Evaluation Methodology** — AI-as-a-Judge, Exact Evaluation, Comparative Evaluation
- **Ch 4 — Evaluate AI Systems** — Evaluation Criteria, Model Selection, Design Your Evaluation Pipeline
- **Ch 6 — RAG and Agents** — RAG, Agents, Memory

**Tier 2 — high value, read properly**
- **Ch 5 — Prompt Engineering** — Best Practices, Defensive Prompt Engineering
- **Ch 10 — AI Engineering Architecture and User Feedback**

**Tier 3 — selective, read the named sections only**
- **Ch 8 — Dataset Engineering** — Data Curation + Data Processing sections (for eval-set and corpus work)
- **Ch 1 — Introduction** — skim; it's the reframe I already arrived at, good for vocabulary

**Tier 4 — skim or skip (the layer I architect around)**
- **Ch 2 — Understanding Foundation Models** — skim the *Sampling* section only (why structured outputs behave as they do); skip training/modeling
- **Ch 7 — Finetuning** — read only *When to Finetune* to confirm the RAG-instead-of-finetune call; skip the rest
- **Ch 9 — Inference Optimization** — skim the caching/cost parts; skip quantization/GPU serving

---

## The mapping matrix — chapter × project

Where each project's real code/docs gives you something concrete to scan the chapter against.

| Chapter | Shelf | AI analytics | Backcountry |
|---|---|---|---|
| **3 — Eval Methodology** | 47 red-room cases; Claude-as-judge 13-dim rubric (`feature-builds/_red-room/`, `devops/validation/`) | **The whole product**: 16 queries × Surface/Brand-attribution/Hallucination/Competitor-displacement scoring | Golden set of 20 scenarios; `must_mention`/`must_not_say` exact checks (`tests/evals/scenarios.py`) |
| **4 — Evaluate AI Systems** | CI gating on prompt changes; model-swap confidence | Aggregation hierarchy (atomic → query → section → product → catalogue → brand) | 3-layer test pyramid; pass-rate target >85%; RAG ground-truth similarity thresholds |
| **5 — Prompt Engineering** | Structured prompt + ontology (`price_drop`, `sitewide_discount`); Layer 4 prompt | Query templating from product schema (`{name}`,`{brand}`,`{competitor}`) | System-prompt-as-product (`04-system-prompt.md`); defensive prompting for safety-critical hedging |
| **6 — RAG and Agents** | (light) Layer 4 + Sidekick MCP tools | (light) | **The whole architecture**: pgvector RAG (600 chunks, HNSW, 1536-dim), 13 MCP tools, working + long-term memory |
| **8 — Dataset Engineering** | Red-room curation; rejection→negative-example loop | Synthesizing comparative queries per merchant | Corpus chunking (Tremper + AvCan); synthesizing more eval scenarios |
| **10 — Architecture + Feedback** | Substrate → composition → cards; schema-validation-as-drift-signal (post 13) | Rejection capture → Shopify write-back → re-measure loop | Feedback loops (explicit/implicit/eval); post-session memory summariser |

---

## Pinpoint guide — Tier 1 & 2 chapters

For each, the section to focus on, the project + code to scan it against, and one artifact to produce (this is Scan 1 + Scan 2 from the methodology — force a code change, not a note).

### Ch 3 — Evaluation Methodology
- **Focus:** *AI as a Judge* and *Exact Evaluation*. These are the two eval modes I already use without having named them — Claude-as-judge (Shelf's 13-dim rubric) is the former; backcountry's `must_mention`/`must_not_say` string assertions are the latter.
- **Scan against:** Shelf's judge rubric + backcountry's `scenarios.py`.
- **Artifact:** rewrite one of my judge rubrics using the book's criteria-decomposition framing; check whether my 13 Shelf dimensions are actually independent or secretly correlated (a known judge failure mode). Add or merge dimensions based on what I find.
- **The question to hold:** the book will have opinions on judge reliability (position bias, self-preference, score clustering). Which of those is silently corrupting my Shelf scores right now?

### Ch 4 — Evaluate AI Systems
- **Focus:** *Design Your Evaluation Pipeline* and *Model Selection*. This is the chapter that closes my stated gap — "Langflow prototype doesn't translate to a clean production pipeline" (post 20).
- **Scan against:** the AI analytics aggregation design (atomic → brand) and Shelf's CI-gating.
- **Artifact:** write down my actual eval pipeline for one project as the book lays it out, and find the step I'm skipping. (Candidate: I gate on pass-rate but don't track per-dimension regression over time.)
- **The question:** my whole moat thesis is "evals let me swap models without the product getting worse." Does my pipeline actually let me *score* a model swap, or do I just have tests? Those are different.

### Ch 6 — RAG and Agents
- **Focus:** all three sections — *RAG*, *Agents*, *Memory* — but read it **as the backcountry spec it basically is.**
- **Scan against:** the backcountry MCP docs (`01`–`06`) and `search_knowledge`.
- **Artifacts:**
  - **RAG:** my retrieval is naive cosine top-k over 600 chunks. The book will cover hybrid search, reranking, chunking strategy. Pick one upgrade (reranking is the likely highest-leverage) and prototype it against the existing RAG ground-truth tests — I already have the eval harness to measure if it helps.
  - **Agents:** compare the book's agent definition to my "no intelligence in tools, Claude reasons" decision. Is the backcountry app a true agent or a constrained tool-caller, and is that the right call for a safety-critical domain?
  - **Memory:** map the book's memory taxonomy onto my working/long-term split and the post-session summariser. Cross-reference Mem0/Letta from my own infra landscape doc — am I rebuilding something I should adopt?
- **The question:** this is the chapter I gestured at when I said "agentic pipelines + RAG." It's where the most new code will come from. Timebox it or it eats the whole re-read.

### Ch 5 — Prompt Engineering
- **Focus:** *Defensive Prompt Engineering*. The backcountry app is safety-critical — over-hedging and under-hedging are both eval failures I already track. Defensive prompting is the named discipline for that.
- **Scan against:** `04-system-prompt.md` and the Shelf Layer 4 structured prompt.
- **Artifact:** audit the backcountry system prompt against the book's defensive checklist; add any missing guardrail as a new red-room/golden-set case *first*, then fix the prompt to pass it.

### Ch 10 — Architecture and User Feedback
- **Focus:** *User Feedback*. This is my rejection-capture pattern (the `applied-ai-patterns` essay §6.4) seen from the book's side.
- **Scan against:** the rejection_events design and the backcountry feedback loops.
- **Artifact:** check my rejection taxonomy against the book's feedback-collection patterns; confirm I'm capturing the full recommendation payload at rejection time (the thing that makes rejections trainable rather than just countable).

---

## Suggested reading order

Not chapter order — **value order, interleaved with the project that lights it up:**

1. **Ch 3 + 4 back-to-back** (the eval core) → scan against Shelf + AI analytics. This is the moat; do it while fresh.
2. **Ch 6** → scan against backcountry. The biggest source of new code; the most fun.
3. **Ch 5** → scan against backcountry system prompt + Shelf Layer 4.
4. **Ch 10** → scan against rejection capture across all three.
5. **Ch 8** (curation + processing only) → if eval-set or corpus work needs depth.
6. **Ch 1** skim, **Ch 2/7/9** skim-or-skip as noted.

Per the methodology: one chapter, both scans while hot, **one artifact (a code change), then move on.** Kill date per chapter or this becomes a way to not ship.

---

*Captured 2026-06-07. Chapter structure from `github.com/chiphuyen/aie-book/ToC.md`. Update with gap-audit findings as the re-read progresses.*
