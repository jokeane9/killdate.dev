# Startup Brief: Code-Aware LLM Cost Optimization

> A consolidated report on the wedge developed through strategic conversation.
> Saved 2026-05-10 for later reference.

---

## 1. Executive Summary

**The Product:** An open-source, code-aware command-line and CI tool that analyzes LLM call sites in a codebase, runs evals comparing prompts and models, surfaces cost/quality trade-offs, forecasts spend, and generates shareable reports — built for the engineer who needs to defend LLM cost decisions to their founder or CFO.

**The Wedge:** "Helicone shows your LLM costs. We tell you what to change." Action-oriented, not observability. Code-aware, not runtime-only. Cross-vendor, not platform-locked. Open-source-first, not enterprise-shaped.

**The Customer:** Engineers and tech leads at 10-50 person AI-flavored startups, $2-50M ARR, where LLM spend is meaningful (>$2K/mo) and where the engineer is being pressed by a non-technical founder/CFO about cost economics.

**The Pricing:** OSS core (free, self-hostable); $25/seat Pro for individual teams; $49/seat Team tier with analytics + benchmarking; custom Enterprise.

**The Ship Window:** 6-10 weeks for v1, before the lane closes from incumbents (Helicone/Langfuse adding optimization features, vendors shipping native within-platform recommendations, IDE players adding cost awareness).

**The Strategic Frame:** This wedge is not just a product. It is a positioning bet — an information vantage point at the edge of agentic AI infrastructure that compounds personal practitioner capital over a 2-year horizon, regardless of commercial outcome.

---

## 2. Market Context — The Pain Is Verifiable and Accelerating

The thesis that "AI cost management is an evolving problem" is not speculative. Multiple independent sources confirm it as the single most acute and fastest-growing pain in 2026 SaaS.

### 2.1 Gross Margin Compression

- **ICONIQ 2026 State of AI:** AI product builders project ~52% gross margins in 2026 vs. traditional SaaS 70-80%
- **Bessemer State of AI 2025:** the fastest-growing AI startups ("Supernovas") operate at just **25% gross margins**
- **84% of companies report 6%+ gross margin erosion** directly attributed to AI infrastructure costs
- The SaaS CFO and Payhawk both ran 2026 features explicitly titled around "AI is destroying your gross margin"

### 2.2 FinOps for AI Explosion

- **98% of FinOps teams now manage AI spend, up from 31% two years ago** — the steepest adoption curve in FinOps Foundation history
- "Visibility into AI costs" is the #1 challenge cited; #2 is "allocating costs to business units"; #3 is "determining AI ROI"
- The top tooling request in the entire 2026 State of FinOps survey was granular AI spend monitoring (tokens, requests, GPU)
- The FinOps Foundation rebranded its mission in 2026 to explicitly include AI/SaaS/licensing — institutional endorsement that this is the discipline's future

### 2.3 CFO-Level Mandates

- Forrester 2026: "AI faces a reckoning" — fewer than 1/3 of decision-makers can tie AI value to financial growth
- CFO priorities for 2026: move AI costs into COGS, expose true gross margins, build per-feature contribution modeling, price for outcomes
- VC reporting requirements increasingly demand task-level AI ROI and per-customer unit economics
- Gartner forecast: AI services costs will be a leading competitive factor in software margins by end of 2026

### 2.4 Forecasting Volatility

- LLM API prices dropped **~80% between early 2025 and early 2026**
- GPT-4o input pricing fell from $5.00 to $2.50/M tokens
- Gemini 3.1 Flash dropped 99.7% in three years
- This is paradoxically a *tailwind*, not a headwind: pricing this volatile makes manual forecasting impossible, increasing demand for tooling

### 2.5 Field Evidence of Waste

- Industry audits suggest **40-60% of token budgets in production LLM applications are pure waste**
- Documented case study: a 200-user product cut bill from $847/mo to <$160/mo (81% reduction) with no quality degradation, in 6 weeks of optimization
- Output tokens cost 3-10× more than input tokens; most teams optimize against the wrong axis

### 2.6 Net Read

This is not "is this a thing." It is the most institutionally-validated pain point in 2026 software. The question is execution speed and positioning discipline, not market existence.

---

## 3. Target Customer

### 3.1 The ICP

- 10-50 person startups, $2-50M ARR
- Material LLM spend (>$2K/mo, scaling toward $50K/mo)
- AI is in their product, not just a side experiment
- Tech stack: Python or TypeScript primary; Anthropic + OpenAI + occasionally hosted open-source

### 3.2 The Persona — Critical Reframe

Not the founder. Not the CFO. **The engineer or tech lead who has to defend LLM cost decisions to their non-technical founder or CFO.**

This reframe matters because it changes everything:

| Variable | Old (founder dashboard) | New (engineer's workflow tool) |
|---|---|---|
| User | Founder logs in monthly | Engineer uses weekly in PRs |
| Audience | Founder | Founder/CFO (consumes engineer's reports) |
| Buyer | Founder | Company, via engineer-led adoption |
| Sales motion | Founder demo | Bottom-up, dev community, GitHub |
| Value moment | "Looking at margin" | "I have to answer this meeting" |
| Sticky use | Monthly review | Every PR with an LLM call site |

The "engineer being grilled by founder about AI bills" workflow is the actual product reason-to-exist. Everything else flows from it.

### 3.3 The Trigger Event

When does the engineer adopt? When the founder/CFO walks over and asks: "Why is our Anthropic bill $40K this month? Why did it jump 30%? Can we use cheaper models? What would that cost us in quality?"

The tool exists to give the engineer a credible, shareable, 30-second answer to that question.

---

## 4. The Product

### 4.1 Core Capability: Prompt Diff

The flagship feature. Compare two prompts on a held-out eval set across multiple models, output a shareable report:

```
$ llmcost prompt diff prod_prompt.md draft_prompt.md \
    --eval-set ./tests/quality.json --share

Running 200 evals across 4 models...

                  PROD          DRAFT         DELTA
  Avg cost/call   $0.0418       $0.0124       -70%
  Quality score   87.3%         84.1%         -3.2pts
  P90 latency     2.1s          0.9s          -57%
  Monthly spend   $51,832       $15,376       -$36,456

  Quality breakdown:
    Simple Q&A           +0.4pts
    Multi-step reasoning -8.4pts  WARN
    Ambiguous input      -5.1pts  WARN

  Customer impact (top 10 by volume):
    ACME:    $4,231 -> $1,254  (margin 47% -> 78%)
    Globex:  $2,890 -> $861    (margin 52% -> 81%)

  Shareable report: https://llmcost.io/r/x7k2j
```

The `--share` flag generates a clean HTML report the engineer can drop in Slack to the founder. That single feature is the killer app — the workflow it enables ("send to boss, get back to coding") is the entire reason the product exists.

### 4.2 Prompt Strategy Library

Quantified cost premiums for common patterns:

- Few-shot prompting (N examples)
- Chain-of-thought
- ReAct loops
- RAG with N context chunks
- Function calling
- Extended thinking / reasoning mode

### 4.3 Forecasting & Sensitivity Analysis

- Forward projections of spend at current growth
- Scenario modeling: "what if 2x users? what if prompt change ships? what if Anthropic raises 20%?"
- Sensitivity: confidence intervals based on volatility (essential given the 80%/yr price collapse)

### 4.4 GitHub PR Bot

Comments on PRs that add/modify LLM call sites:

> LLM cost impact on this PR: +$480/mo estimated
> - `src/billing.py:24` — cache parseInvoice (save ~$280/mo)
> - `src/help.py:67` — Haiku passes eval at 96% — save ~$140/mo

### 4.5 A/B Rollout Monitor

When a new prompt is canaried to N% of users, the tool tracks:

- Actual cost vs. predicted (catches model drift)
- Per-customer impact (eval set doesn't always match production)
- Quality regression alerts

### 4.6 Unit Economics

Connects to Stripe (revenue) and identifies per-customer LLM cost. Surfaces gross margin per customer, per feature, per workflow.

### 4.7 v1 Scope Discipline

| In v1 | Out of v1 |
|---|---|
| Python + TypeScript SDK | Ruby, Go, Rust |
| Anthropic + OpenAI | Gemini, Cohere, hosted Llama (v2) |
| CLI + GitHub PR bot | IDE plugin |
| Shareable HTML report | PDF export |
| Eval against user's existing test set | Built-in eval generator |
| Cost forecast (linear + seasonality) | Multi-scenario sensitivity engine |
| Per-customer cost from Stripe | Full unit economics dashboard |
| Open-source benchmark dataset | Proprietary benchmark layer |

---

## 5. Competitive Landscape

### 5.1 The Map

| Player | What they do | Where they don't go | Threat level |
|---|---|---|---|
| **Helicone** | LLM trace + cost dashboard, $20-50/mo individual | No code awareness, no optimization actions, no PR integration | High — adjacent, well-funded |
| **Langfuse** | Tracing + evals + cost, OSS core, $59/mo Pro | Observability-shaped, not action-shaped | High — directly adjacent |
| **Portkey** | LLM gateway with caching, well-positioned in request path | Gateway-first, no codebase analysis | High — best-positioned direct competitor |
| **Datadog LLM Obs** | Enterprise APM | Not for engineers, not for SMB price | Medium |
| **Promptlayer** | Prompt versioning + tracking | Prompt mgmt, not cost optimization | Low |
| **Galileo** | LLM eval + observability | Eval-shaped, not cost-shaped | Medium |
| **Anthropic/OpenAI dashboards** | Native vendor cost views | Single vendor, no cross-vendor recommendations | Medium |
| **AWS Bedrock cost optimization** | Native Bedrock optimization | Single-vendor, AWS-specific | Medium within AWS |
| **DX / LinearB / Jellyfish** | Engineering productivity + AI usage | Enterprise-priced, license-tracking not cost-tracking | Low |
| **Vantage / CloudZero / Finout** | FinOps + AI cost views | Enterprise-priced, finance-team-targeted | Low |

### 5.2 The Empty Box

**Code-aware LLM cost optimization with PR-bot UX and cross-vendor recommendations, OSS-first, $25-50/seat.**

No player in the landscape occupies this position. Each adjacent player is structurally constrained from filling it.

### 5.3 Time Window

Realistic estimate: **12 months before this lane crowds.**

The win condition is *speed* and *positioning purity*, not market discovery.

---

## 6. Differentiation & Moat

### 6.1 Structural Defenses (Day-One)

1. **OSS-first.** Enterprise observability and platform companies do not go open-source.
2. **Cross-vendor agnosticism.** Anthropic will never recommend switching to Gemini. The tool that recommends across vendors is structurally protected from vendor-built competitors.
3. **Code-AST integration.** Building real code awareness across Python/TS/Ruby/Go is engineering work nobody wants to do.

### 6.2 Compounding Defenses (Years 2-3)

4. **Eval engine.** Building a reusable LLM eval engine is the year-2 engineering moat.
5. **Benchmark dataset.** Once 500 customers have run your evals, proprietary "Model X is N% as good as Model Y on real production prompts of class Z" data compounds with adoption.
6. **Dev workflow stickiness.** PR-bot and IDE-plugin integrations are sticky.

### 6.3 What's NOT a Moat

- Cost dashboards, vendor APIs, within-vendor model swap recommendations, token counting, generic forecasting.

---

## 7. Business Model & Pricing

| Tier | Price | Audience |
|---|---|---|
| **OSS Core** | Free, self-hostable, Apache 2.0 | Hackers, evaluators, security-conscious teams |
| **Cloud Free** | Free up to 3 devs / $1K tracked spend per month | Solo founders, very early startups |
| **Pro** | $25/seat/month | Real teams, 5-30 engineers |
| **Team** | $49/seat/month | Adds team analytics, benchmarking, PR bot, shareable reports |
| **Enterprise** | Custom ($5-50K/yr) | SOC 2, SSO, on-prem option, dedicated support |

Path to $5M ARR: ~1,000 paying teams averaging $5K/yr. Realistic in 24-30 months with strong OSS adoption.

**Pricing discipline:** stay at $25-50/seat for first 12 months. First enterprise inquiry will offer $5K/mo with SOC 2 demands. Taking it kills the SMB motion.

---

## 8. Go-to-Market — OSS-First Distribution

### 8.1 Channel Strategy

| Channel | Mechanism | Realistic impact |
|---|---|---|
| Show HN | Front-page post, deep comment engagement | 500-2,000 stars in 48h |
| Twitter dev thread | Hero GIF, founder narrative | 100-300 stars per viral thread |
| Reddit (r/programming, r/MachineLearning, r/LocalLLaMA) | Authentic "I built this because" posts | 100-400 stars per hit |
| TLDR AI / Pragmatic Engineer / Latent Space newsletters | Editorial pickups | 200-800 stars per mention |
| Conference talks (PyData, AI Engineer, MLOps World) | Speaking from data | 50-200 stars + credibility |
| Adjacent OSS integrations (Vercel AI SDK, LangChain, LlamaIndex, instructor, BAML) | Cross-community pickup | Compounds |
| Steady-state organic | Search + word-of-mouth | 10-50 stars/week after launch |

### 8.2 14-Day Launch Plan

| Day | Action |
|---|---|
| 1 | Repo public. README with hero GIF. License. CONTRIBUTING.md. |
| 2 | Soft share: 5 trusted friends, README feedback. |
| 3-4 | Iterate README. Make 30-second demo video. |
| 5 | Discord set up. Twitter handle live. |
| 6 | Soft launch: post in 3 existing communities. Aim for 20-50 stars. |
| 7 | Tuesday morning: Show HN. |
| 7-8 | Engage every comment for 6+ hours. Twitter thread. r/programming. |
| 9 | r/MachineLearning, r/LocalLLaMA. Submit TLDR AI. |
| 10-12 | Engage every starrer/issue. Ship feedback-driven features daily. |
| 13 | "What I learned launching" post. Cross-post dev.to. |
| 14 | First release notes post. Set weekly cadence. |

---

## 9. Risks & Threats

### 9.1 Competitive Risks

| Risk | Likelihood | Timeline | Mitigation |
|---|---|---|---|
| Helicone/Langfuse add optimization | Very high | 6-12 months | Ship code-aware + PR-bot first |
| Cursor / IDE players add cost awareness | High | 6-12 months | Cross-vendor + cross-IDE positioning |
| Anthropic / OpenAI ship native optimization | Very high | 12-18 months | Cross-vendor is structurally protected |
| Portkey adds optimization | Very high | Ongoing | Code-AST awareness harder to retrofit on gateway |
| Datadog moves down-market | Medium | 12-24 months | They cannot operate at $25-50/seat |
| AWS Bedrock optimization | High within AWS | 12 months | Cross-cloud positioning |

### 9.2 Structural Risks

1. **LLM price collapse outpaces pain.** Mitigation: volatility itself is the product.
2. **Forecast accuracy is hard.** Mitigation: ship scenarios + sensitivity, not single-number predictions.
3. **Dev-tool monetization is hard.** Mitigation: nail the team tier ($49/seat) before chasing enterprise.
4. **Eval engine complexity could blow scope.** Mitigation: v1 uses user's existing test sets.
5. **Custom integration treadmill.** Mitigation: treat integrations as marketing channels.

### 9.3 Founder Risks

1. **Learning instead of shipping.** Mitigation: customers and shipping deadlines non-negotiable.
2. **Energy mismatch despite stated preference.** Mitigation: weekend prototype is the validation gate.
3. **Enterprise pull.** Mitigation: explicit discipline to stay at $25-50/seat for first 12 months.

---

## 10. The Position Thesis — Why This Wedge, This Founder

### 10.1 The Bet Structure

This wedge is chosen as a **2-year personal investment in becoming a deep practitioner at the edge of agentic AI infrastructure.**

The reasoning:

- Agentic AI is in a once-per-15-years platform-shift moment (compute ~1995, mobile ~2008, cloud ~2010, ML ~2015, agentic ~2024-2026)
- Each prior shift rewarded the practitioners who built during the messy middle
- A focused 2-year operator effort at the LLM-cost-intelligence layer puts the founder in privileged information position: visibility into many teams' agent designs, failure modes, vendor dynamics, scaling patterns
- This position compounds independently of commercial outcome — even a modest exit leaves the founder with deep practitioner skills, public artifacts, community, network, and a thesis-driven point of view

### 10.2 The Vantage Point

Operating this product, the founder would be uniquely positioned to know — with hard, real-time data:

- Real model substitution patterns across domains
- Caching effectiveness across strategies and workloads
- Agentic complexity wall — where multi-step agents break expensively
- Provider switching dynamics in real time
- Long-context economics in production
- Reasoning-model cost/quality frontier
- Open-source model viability in real workloads

### 10.3 Asymmetric Downside

| Outcome | Result |
|---|---|
| Big commercial win | $20-50M ARR business, optional venture path |
| Modest commercial win | $5-10M ARR sustainable bootstrap |
| Commercial failure | Public GitHub artifact, community standing, speaking opportunities, DevRel/founder reputation, easier next launch, possible acquihire |

The dev-tools space rewards builders even when their companies fail commercially because the *artifact is portable* — repo, community, brand.

### 10.4 Founder-Product Fit Signals

Multiple independent signals converged toward this wedge as the right one:

- Explicit statement: "my heart is in dev tooling"
- Vocabulary patterns: engineer-vernacular when discussing this wedge ("fork it," "throw to a dev"), strategy-vernacular for others
- Investment behavior: spontaneously adding features to dev-tool sketches, asking diligence questions of finance sketches
- Self-recognition: "I would [pay] for interest... and probably for use" — only said about this wedge
- Spontaneous OSS framing: "if it fails, open source it and you're someone in community"
- Articulated thesis: "if I bang out 90-hour weeks for two years I'm on cutting edge of agentic stuff"

---

## 11. Validated Trifecta

The wedge has passed three independent validation tests:

1. **Market validation** — FinOps-for-AI is the #1 forward-looking trend in 2026; +3× adoption growth in two years; gross margin compression is a board-level concern.
2. **Energy match** — multiple orthogonal signals converging on dev-tool positioning; thesis-driven 2-year commitment articulated.
3. **Founder personal use** — founder would build this for themselves and would pay to use it.

This is rare. Most wedges pass one or two of these tests, not three. The convergence is the green light.

---

## 12. Execution Plan

### 12.1 Pre-Commitment Validation (1 week)

1. **Weekend prototype.** Smallest possible CLI: take two prompts + JSON eval set → run both against Claude/OpenAI APIs → print cost/quality comparison. ~300 lines. If it works in a weekend and feels useful — green light.
2. **Three engineer conversations.** Ask: "If a CLI surfaced your top-3 most expensive LLM calls and suggested cheaper models with eval-backed quality scores, would you use it? Would you pay $25/seat?" If 2/3 say yes — green light.
3. **Domain + GitHub org claim.** Tiny but makes it real.

### 12.2 V1 Build (6-10 weeks)

- Week 1-2: AST parser for Python and TypeScript LLM call sites
- Week 2-3: Anthropic + OpenAI SDK wrappers; cost computation engine
- Week 3-4: Eval runner; prompt diff core loop
- Week 4-5: Shareable HTML report generator
- Week 5-6: GitHub PR bot
- Week 6-7: Forecasting + scenarios
- Week 7-8: Cloud onboarding, billing, dashboards
- Week 8-10: Launch prep — README, demo, content

### 12.3 Launch (Week 10-12)

- Day 1: Show HN
- Days 2-7: Twitter, Reddit, newsletters
- Days 8-14: Engage every starrer, ship feedback-driven fixes daily
- Week 12: First release notes / blog post / cadence established

### 12.4 First 6 Months Post-Launch

- Goal: 1,000 GitHub stars, 30 paying teams ($75K ARR run-rate)
- Sustained content: bi-weekly blog posts, monthly benchmark publications
- Adjacent OSS integrations: 3-5 framework adapters
- Community: active Discord, public roadmap, fast issue triage

### 12.5 12-24 Month Horizon

- Goal: 5,000-15,000 GitHub stars, 300-1,000 paying teams ($1-5M ARR)
- Optional small raise ($500K-1.5M angel/pre-seed) for engineering depth
- Establish benchmark dataset as industry reference
- Expand integration coverage to all major LLM vendors and frameworks
- Position the founder as a known voice in the agentic-AI ecosystem (talks, podcasts, writing)

### 12.6 Discipline Markers

- Month 3: if no paying customers and gap-rate on eval recommendations is high → diagnose product/judgment-layer issue
- Month 6: if growing stars but no paying conversion → pricing or positioning issue
- Month 12: if revenue plateaus below $200K ARR → wedge may be too narrow, plan adjacency
- Anytime: if "I'm learning so it doesn't matter if I ship" energy appears → re-anchor in customer commitments

---

## 13. Closing Summary

**The wedge:** code-aware, cross-vendor, OSS-first LLM cost optimization for engineers defending LLM cost decisions to their non-technical leadership.

**The thesis:** this wedge is simultaneously a commercially viable SMB dev-tool product (with $5-20M ARR ceiling in 24-36 months) and a strategic personal investment in becoming a deep practitioner at the edge of agentic-AI infrastructure during the platform-shift window. The fallback outcomes are unusually strong relative to comparable wedges. The founder-product fit signals are convergent and orthogonal.

**The window:** ~12 months before incumbent adjacent players (Helicone, Langfuse, Portkey, vendor-native dashboards) close the lane. Win condition is speed and positioning purity.

**The next step:** weekend prototype + three engineer conversations. If both validate, ship v1 in 6-10 weeks. Don't raise capital before paying customers exist. Don't take enterprise inquiries that distort the SMB motion.

**The honest expectation:** this is a 2-year, 90-hour-week commitment that will mostly involve grinding through unglamorous engineering, customer feedback loops, and content production. The position pays off only if the work ships. The strategy is sound; execution is the entire game from here.

---

## Appendix A — Naming The Space

The discipline is called **FinOps**, originally for cloud cost management (~2018-2019 as a formalized practice, FinOps Foundation founded 2019, joined Linux Foundation 2020).

The AI/LLM-specific subfield has multiple competing names as of 2026:

- **"FinOps for AI"** — dominant, endorsed by FinOps Foundation, has its own working group
- **"AI FinOps"** — common variant
- **"LLM FinOps"** — less common
- **"TokenOps"** — emerging term, specifically for token-level optimization
- **"AI Cost Management"** — generic enterprise term
- **"GenAI Cost Optimization"** — vendor marketing term

The space is still actively naming itself. A product launching now has a genuine opportunity to influence terminology.

---

## Appendix B — Reference Resources

Market validation sources:

- The SaaS CFO: "Your AI Feature Is Quietly Destroying Your Gross Margin"
- Payhawk: "5 CFO mandates for 2026"
- FinOps Foundation: State of FinOps 2026 report
- FinOps Foundation: FinOps for AI Overview
- Finout: Best FinOps Tools for Managing AI Costs in 2026
- High Alpha: Mastering the SaaS Tightrope Between Growth, Efficiency, and AI Costs
- SoftwareSeni: Outcomes-Based Pricing and AI-First SaaS Gross Margin Economics
- AI Magicx: The LLM Pricing Collapse of 2026
- Development Corporate: The AI Bubble Is Going to Pop
- Mostly Classics: a16z's Alex Immerman on How AI Is Redefining the Modern CFO

Cost optimization references:

- Quaxel: The CFO's Playbook for AI Unit Economics
- Drivetrain: Unit Economics for AI SaaS — CFO Guide
- Company of Agents: AI Agent Unit Economics — Scaling Your Agentic Fleet in 2026
- dasroot.net: Cost Modeling for LLM Systems in Startups
- Stanford Digital Economy Lab: Enterprise AI Playbook (Pereira, Graylin, Brynjolfsson)

---

## Appendix C — The Pain Landscape

### C.1 The 20 jobs-to-be-done in the engineer → PM → CFO dance

| # | Customer pain (job-to-be-done) | Who feels it | How acute |
|---|---|---|---|
| 1 | "What did we just spend on LLMs this month?" | CFO, founder | High |
| 2 | "Why did spend jump 30% week-over-week?" | Engineer, ops | Very high |
| 3 | "Which customer is costing us the most?" | PM, finance | High |
| 4 | "Which feature is costing us the most?" | PM, product | High |
| 5 | "What's our gross margin per customer?" | CFO, founder | Very high |
| 6 | "If we ship V2 of this agent, what will it cost?" | Engineer → CFO | Very high |
| 7 | "If we switch from Opus to Haiku, will quality drop?" | Engineer, PM | Very high |
| 8 | "If we switch vendors entirely (Anthropic → OpenAI), what happens?" | CTO, engineer | High |
| 9 | "Should we use the new model that just shipped?" | Engineer | Constant, weekly |
| 10 | "Where are we wasting tokens?" | Engineer | High |
| 11 | "What will our spend be next quarter?" | CFO, finance | Very high |
| 12 | "Are we paying too much vs. what we should?" | CFO, procurement | High |
| 13 | "Are our prompts caching effectively?" | Engineer | Medium |
| 14 | "Is this customer profitable to serve?" | PM, finance | High |
| 15 | "How do we price our AI feature to be profitable?" | Founder, CFO | Very high |
| 16 | "What's a fair annual commit to negotiate with Anthropic?" | Procurement, CFO | High (annually) |
| 17 | "Our agent broke / went into a loop / blew up cost — what happened?" | Engineer, ops | Critical when it occurs |
| 18 | "How do we explain AI economics to the board?" | Founder, CFO | High (quarterly) |
| 19 | "Which prompts should we optimize first?" | Engineer | Medium |
| 20 | "How is our AI gross margin trending?" | Founder, CFO | Very high |

### C.2 Pain × tool coverage matrix

| Pain | Helicone | Langfuse | Datadog LLM | Vendor consoles | FinOps tools | Promptfoo / Braintrust | Internal spreadsheet | Status |
|---|---|---|---|---|---|---|---|---|
| 1. What did we spend? | YES | YES | YES | YES (single vendor) | YES | — | YES | **Closed** |
| 2. Why did spend jump? | partial | partial | partial | partial | — | — | painful | **Mostly open** |
| 3. Customer attribution | YES (tags) | YES (user IDs) | YES | — | partial | — | painful | **Partially closed** |
| 4. Feature attribution | partial | partial | YES | — | — | — | painful | **Mostly open** |
| 5. Gross margin per customer | — | — | — | — | enterprise only | — | manual | **Wide open at SMB** |
| 6. V2 cost prediction | — | partial (experiments) | — | — | — | partial (prompts only) | spreadsheet | **Wide open** |
| 7. Model swap quality test | — | partial | — | — | — | YES | manual | **Partially closed** |
| 8. Whole-vendor migration | — | — | — | — | — | — | consulting | **Wide open** |
| 9. New model evaluation | — | partial | — | — | — | partial | manual | **Mostly open** |
| 10. Token waste detection | — | — | — | — | — | — | manual audits | **Wide open** |
| 11. Spend forecast (next quarter) | basic | basic | — | basic | enterprise FinOps | — | spreadsheet | **Mostly open** |
| 12. "Are we overpaying?" | — | — | — | — | partial | — | gut + shopping | **Wide open** |
| 13. Cache effectiveness | partial | partial | — | partial | — | — | — | **Mostly open** |
| 14. Per-customer profitability | — | — | — | — | partial | — | manual | **Wide open at SMB** |
| 15. AI pricing strategy | — | — | — | — | partial | — | consulting | **Wide open** |
| 16. Vendor negotiation prep | — | — | — | — | — | — | spreadsheet | **Wide open** |
| 17. Cost incident response | partial | partial | YES | — | — | — | post-mortem | **Partially closed** |
| 18. Board AI economics | — | — | — | — | partial | — | manual | **Wide open** |
| 19. Optimization prioritization | — | — | — | — | partial | — | engineer judgment | **Wide open** |
| 20. Margin trend reporting | partial | — | partial | — | enterprise | — | manual | **Mostly open** |

### C.3 The structural pattern

| Bucket | Pains in this bucket | Status |
|---|---|---|
| **Capture and display** (what happened) | 1, 2 (partial), 3, 17 | **Closed** — Helicone/Langfuse own this |
| **Prompt-level experiments** | 7, 9 (partial) | **Partially closed** — Promptfoo/Braintrust/Langfuse |
| **System-level prediction** (what would happen) | 6, 8, 9, 11, 16, 17, 19 | **Wide open** |
| **Business-economics rollup** | 5, 14, 15, 18, 20 | **Wide open at SMB** |
| **Operational diagnostics** | 2, 4, 10, 12, 13 | **Mostly open** |
| **Decision-support deliverables** | 6, 8, 16, 18 | **Wide open** |

Three full buckets are open: **system-level prediction**, **business-economics rollup**, and **decision-support deliverables**. That's where the structural gap lives.

### C.4 Why the asymmetry exists

| Easy buckets (closed) | Hard buckets (open) |
|---|---|
| Capture API calls | Replay traffic against alternative configs |
| Display dashboards | Predict cost under proposed changes |
| Tag by user/customer | Compute per-customer profitability with revenue join |
| Trace multi-step | Model whole-system migrations |
| Compute totals | Generate decision-support reports |

Closed buckets are the SaaS dashboard playbook. Open buckets are the engineering simulation playbook. Different muscle, different category.

### C.5 Persona view

**Engineer / Tech Lead** acute pains: 2, 6, 7, 9, 10, 13, 17, 19. Have Helicone/Langfuse (partial), Promptfoo (partial), own scripts. Missing: predictive tooling, optimization recommendations, incident root-cause.

**Product Manager** acute pains: 3, 4, 7, 14, 19. Have ad hoc reports from engineers. Missing: anything self-serve. PMs essentially un-served.

**Founder / CTO** acute pains: 5, 6, 8, 11, 15, 18, 20. Have spreadsheets and engineering reports they don't fully trust. Missing: nearly everything productized.

**CFO / Finance** acute pains: 1, 5, 11, 12, 14, 15, 16, 18, 20. Have FinOps tools at enterprise (Vantage, CloudZero). Missing: SMB-tier tools — FinOps for AI under $1K/mo doesn't exist.

### C.6 Vendor-side view

| Vendor | Cost intelligence they ship |
|---|---|
| Anthropic Console | Per-team usage, basic spend graphs, billing alerts. Single-vendor. No predictions. |
| OpenAI Dashboard | Usage by API key/model/project, basic forecasting. Single-vendor. |
| Google AI Studio / Gemini | Basic usage view. |
| AWS Bedrock | Cost Explorer integration. AWS-locked. |
| Azure OpenAI | Azure Cost Management integration. Azure-locked. |

Pattern: every vendor builds for their own platform. **None will ever show you "you should switch to a competitor."** Cross-vendor recommendations are structurally impossible from vendor-built tools. Permanent gap.

### C.7 Category fragmentation problem

| Category | What it does | Doesn't talk to |
|---|---|---|
| **LLM observability** (Helicone, Langfuse) | Capture, trace, dashboard | Eval, FinOps, revenue |
| **LLM eval** (Promptfoo, Braintrust, Inspect) | Quality testing | Cost, traffic, revenue |
| **FinOps** (Vantage, CloudZero, Finout) | Cloud + AI cost reporting | Eval, traffic, code |
| **Engineering productivity** (DX, LinearB) | Dev tool usage | Product LLM cost, customers |

Customer stitches all four themselves. The integrator wins because the customer is sick of stitching.

### C.8 Acute pain ranking

The loudest pains customers feel weekly, ranked:

1. **"Why did spend jump?"** (#2) — engineer pain, almost daily, no good answer
2. **"What will V2 cost?"** (#6) — engineer/CFO pain, monthly, no good answer
3. **"Gross margin per customer?"** (#5) — founder/CFO pain, monthly, no good answer
4. **"Should we use the new model?"** (#9) — engineer pain, every release, no good answer
5. **"Will quality drop if we change?"** (#7) — engineer pain, every change, partially answered
6. **"What will spend be next quarter?"** (#11) — CFO pain, quarterly, no good answer
7. **"How do we explain AI economics to the board?"** (#18) — founder pain, quarterly, no good answer

Pains 1, 2, 3, 4, 6 are all in the "wide open" zone and the loudest. Structural opportunity.

---

## Appendix D — The Agentic Startup Stack (2026)

### D.1 Full stack, top to bottom

```
1.  Foundation models           Anthropic, OpenAI, Google, Meta, DeepSeek
2.  Model access layer          Portkey, OpenRouter, LiteLLM, raw SDKs
3.  Agent / orchestration       LangChain, LlamaIndex, Vercel AI SDK, BAML, CrewAI, AutoGen, raw SDK
4.  Prompt / output mgmt        Instructor, Outlines, BAML, PromptLayer, Pezzo
5.  RAG / vector DB             Pinecone, Weaviate, Chroma, Qdrant, pgvector, Turbopuffer
6.  Observability / tracing     Langfuse, LangSmith, Helicone, Arize Phoenix, OpenLLMetry, Datadog, Galileo
7.  Evals                       Promptfoo, Braintrust, Inspect, Patronus, OpenAI Evals
8.  Deployment / infra          Vercel, Modal, Replicate, Together, AWS Bedrock, Fly.io
9.  Application / UI            Next.js, FastAPI, Streamlit, Chainlit
10. Business plumbing           Stripe, Postgres (Supabase/Neon), Clerk, Resend, PostHog
```

### D.2 Layer-by-layer dominant tools

**Layer 1 — Foundation models.** Anthropic Claude is the default for agentic systems in 2026 (quality, long context, structured output). OpenAI GPT is still dominant in volume and broadest ecosystem. Google Gemini is cheapest credible models with massive context. DeepSeek is open-weights, very cheap. Llama for self-hosting / fine-tuning.

**Layer 2 — Model access.** Most startups use the raw SDK (`anthropic`, `openai` packages) initially. Add gateway (Portkey or LiteLLM) when multi-vendor routing or caching becomes important. OpenRouter for quick prototyping across many models. AWS Bedrock / Azure OpenAI / Vertex AI for enterprise/regulated.

**Layer 3 — Agent / orchestration framework.**
- LangChain: still common, declining mindshare (over-abstraction complaints)
- LlamaIndex: strong for RAG-heavy apps
- Vercel AI SDK: dominant for TypeScript / Next.js stacks
- BAML: fast-growing for type-safe prompts
- Pydantic AI: growing in Python ecosystem
- CrewAI / AutoGen: multi-agent experiments
- Raw SDK + custom code: increasingly common for serious teams

**Layer 4 — Prompt / output management.** Instructor (Python, Pydantic-based structured outputs) and BAML are the popular picks. PromptLayer/Pezzo for prompts-as-versioned-artifacts.

**Layer 5 — RAG / vector database.** pgvector on Postgres has eaten huge chunk of "I already have Postgres" usage. Pinecone at scale. Chroma for prototyping. Qdrant growing fast.

**Layer 6 — Observability / tracing.** Helicone for fastest setup (proxy-based, change base URL). Langfuse for serious agent work (SDK-based, richer traces, eval features). LangSmith if committed to LangChain. Arize Phoenix and OpenLLMetry for OTel-native standards-based approaches. Datadog LLM Obs for enterprise/existing-Datadog shops.

**Layer 7 — Evaluation.** Promptfoo for engineer-led dev workflows (OSS CLI). Braintrust for teams wanting a real platform. Inspect (UK AISI) gaining traction broadly. Patronus for hosted guardrails.

**Layer 8 — Deployment.** Vercel dominates Next.js startup default. Modal dominates Python AI workloads. Hyperscaler-hosted models for regulated industries. Together/Fireworks/Anyscale for hosted open-source model inference.

**Layer 9 — Application / UI.** Next.js + Vercel AI SDK is the dominant frontend stack for AI startups in 2026.

**Layer 10 — Business plumbing.** Stripe (billing), Supabase or Neon (Postgres + auth), Clerk (auth), Resend (email), PostHog (analytics).

### D.3 Typical YC 2026 AI startup stack (the median)

| Layer | Most likely choice |
|---|---|
| LLM | Anthropic Claude (primary), OpenAI (fallback) |
| Access | Raw `anthropic` SDK directly |
| Framework | Vercel AI SDK (if TS) or raw SDK (if Python) |
| Prompt mgmt | Inline strings → eventually Instructor or BAML |
| RAG | pgvector on Supabase Postgres |
| Observability | Helicone (early) → Langfuse (later) |
| Evals | Promptfoo (CLI) for dev; nothing in CI yet |
| Deployment | Vercel (TS) or Modal (Python) |
| App | Next.js + React |
| Business | Stripe + Supabase + Clerk |

Build for this stack first; it covers most of the addressable market.

### D.4 Integration surface for the AI Economics product

| Layer | Integration | Why |
|---|---|---|
| 3 (framework) | LangChain callbacks, Vercel AI SDK middleware, raw SDK wrappers | Where the LLM call happens |
| 6 (observability) | Read from Helicone/Langfuse/OpenLLMetry | Consume telemetry, don't compete |
| 7 (eval) | Wrap Promptfoo or roll own | Quality side of cost/quality tradeoff |
| 10 (business) | Stripe API for revenue join | The unique angle nobody else has |

The product doesn't replace any layer. It sits *across* them — pulling telemetry from layer 6, traffic from layer 3, revenue from layer 10, eval data from layer 7 — and producing decision-support output the existing stack can't.

The moat is integration breadth + analytical layer on top, not any individual component.

---

## Appendix E — What Helicone Actually Captures (Reference)

Helicone is **proxy-based LLM observability**. Change SDK base URL, every call gets logged.

### E.1 Per-request data

| Field | Description |
|---|---|
| Request ID + timestamp | When the call happened |
| Provider | Anthropic, OpenAI, Gemini, etc. |
| Model | e.g. `claude-opus-4-7`, `gpt-4o` |
| Input tokens / Output tokens | Token counts |
| Cost | Computed from tokens × pricing table |
| Latency | Time-to-first-token, total duration |
| Status | Success / error / rate-limited |
| Request / response body | With optional redaction |
| Cache status | Hit/miss if using Helicone cache |
| User ID | From `Helicone-User-Id` header |
| Custom properties | From `Helicone-Property-*` headers |
| Session ID | Multi-turn conversation grouping |

### E.2 Dashboard aggregations

By time, model, provider, user (if tagged), custom property (if tagged), session, latency percentiles, errors, cache hit rate.

### E.3 The tagging constraint

**Helicone only breaks out by dimensions you manually tagged at call time.** If you tag `feature=checkout-bot`, you get cost-per-feature. If you don't, it goes in the "untagged" bucket. No inference, no automatic attribution.

### E.4 What Helicone does NOT do

| Capability | Status |
|---|---|
| Revenue join (Stripe / billing) | **No** |
| Gross margin per customer | **No** (would need revenue) |
| Predicted cost under proposed change | **No** (retrospective only) |
| Quality / eval scoring | **No** (no eval engine) |
| Model swap recommendations | **No** |
| Cross-vendor migration analysis | **No** |
| Code-level attribution (source file, function) | **No** (only what you tag) |
| Per-PR cost impact | **No** (no code awareness) |
| Forecasting beyond simple trend | **Basic** (linear projection) |
| Caching opportunity detection | **No** (offers cache product, doesn't tell you where caching would help) |
| Optimization recommendations | **No** |
| Traffic replay against alternatives | **No** |

### E.5 Summary

Helicone is a good "what did we spend, sliced by tags I remembered to set" tool. It's a logger and dashboard — not analysis, prediction, recommendation, eval, or unit-economics. It owns the bottom of the stack. The layers above are open.

---

## Appendix F — Solved vs Open: Honest Assessment

### F.1 The capability map, calibrated

| Capability | Status | Confidence |
|---|---|---|
| Cost tracking / telemetry capture | Closed | Very high |
| Pure dashboard products | Closed | Very high |
| Cross-vendor cost aggregation | Mostly closed | High |
| Multi-step agent tracing | Closed | High |
| Prompt-vs-prompt comparison with cost | Partially open (Promptfoo, Braintrust, Langfuse partial) | Medium |
| Whole-system migration analysis (productized) | **Open** | High |
| Traffic-replay simulation against real production logs | **Open** | High |
| Customer-level forward unit economics | **Open** | High |
| CFO-facing decision-support reports | **Open** | Very high |
| Code-aware optimization | **Open** | High |
| Cross-vendor recommendations with eval evidence | **Open** | High |

### F.2 The honest framing

The dashboard layer is fully closed. The simulation-and-decision-support layer is partially covered by eval tools (Promptfoo et al) but missing as an integrated product specifically positioned for the engineer-CFO conversation.

Don't build the 8th cost dashboard — losing race. Don't pretend modeling is empty — some is covered. **Do build the integrated decision-support product for major agent changes**, positioned around the migration meeting and the CFO-facing deliverable.

### F.3 The verification test

The 1-2 hour due diligence test before committing:

1. Pick a small LLM agent built recently
2. Try to answer: "If I migrated this from Opus to Sonnet, what would happen to monthly cost given my real traffic? What would happen to quality? What's the per-customer impact?"
3. Use existing tools — Helicone, Langfuse, Promptfoo, Braintrust, vendor consoles — to try
4. If clean answer in under 1 hour → wedge is solved, abandon
5. If stitched together 4 tools, wrote Python, still no confident answer → wedge is real

This test resolves the uncertainty cheaply.

---

## Appendix G — The Articulated Product (Founder Framing)

### G.1 What the founder described, plainly

> "I'm building features. I have per-customer unit economics. I want to know which model is cheapest for the job, with some eval coverage. I want to see switching costs between models. I want this to integrate with the framework I'm using (LangChain etc.) and pull my revenue from Stripe."

### G.2 The seven capabilities decomposed

| Capability | What it means in practice |
|---|---|
| Per-feature unit economics | "Feature X costs $N per call. Y costs $M. Z is 40% of total spend." |
| Per-customer unit economics | "ACME costs $X/mo, pays $Y/mo, margin Z%. Globex 78%. Beta unprofitable." |
| Model cost recommendation | "For this prompt, Haiku is N% cheaper. For this one, Sonnet. For this one, you need Opus." |
| Light eval coverage | "Here's the quality data backing that recommendation. Not full eval framework — enough to swap with confidence." |
| Switching cost view | "Switch this prompt from Opus to Haiku — here's cost change AND quality change." |
| Framework integration | "Works inside LangChain (or Vercel AI SDK, or whatever) — no manual instrumentation." |
| Stripe revenue pull | "Revenue side automatic. You see margin, not just cost." |

### G.3 Coverage check

Of the seven capabilities:
- **2 partially solved**: per-feature cost (Helicone/Langfuse via tagging), per-customer cost without revenue (same)
- **5 not solved**: per-customer margin (no Stripe join), model recommendations, eval-backed switching, switching cost view, deep framework-native integration

That's not a saturated space.

### G.4 What teams do today instead

| Pain | Today's reality |
|---|---|
| Per-customer margin | Engineer pulls Helicone CSV, pulls Stripe CSV, joins in spreadsheet, sends to CFO quarterly |
| Model cost recommendation | Engineer reads Twitter, makes gut call |
| Eval backing recommendation | Engineer writes ad-hoc Python with 20 test cases, eyeballs |
| Switching cost view | Manual analysis, Notion doc |
| Stripe revenue join | Engineer writes ETL, maintains it |
| Framework integration | Reads docs, wires callbacks, debugs |

Not "solved by existing tools" — "solved by engineering hours and spreadsheets." That's the gap a product fills.

### G.5 Why it hasn't been built

1. **Each capability alone isn't a product, but together they are.** Helicone wins pure dashboards; Promptfoo wins pure evals; Stripe-joining alone is trivial. Integration is the product.
2. **Integration is unglamorous engineering.** 6+ surfaces (LangChain, Vercel AI SDK, Stripe, Helicone, Promptfoo, vendor pricing tables) each tedious to maintain. Defensible because tedious.
3. **Framing is recent.** "Per-customer LLM gross margin" wasn't a question in 2023. Board-level in 2025. Universal in 2026. Existing tools were built for earlier framing.
4. **Category names are confused.** Doesn't fit cleanly into observability, FinOps, eval, or engineering productivity. VCs underweight it; that's good for a bootstrap.
5. **Incumbents have wrong DNA.** Helicone/Langfuse are observability-shaped. Pivoting to predictive simulation is a different company.

### G.6 The right name

**"AI economics layer for product engineering teams."**

- AI economics — cost AND revenue AND quality, not just cost
- Layer — sits on top of frameworks and observability, doesn't replace
- Product engineering teams — engineer building features as primary user, CFO/founder downstream consumer

Tagline candidates:
- "Per-customer gross margin for AI features."
- "Know what every feature costs, every customer earns, every model swap saves."
- "AI unit economics, in your codebase, against your real revenue."

### G.7 The real differentiator (revisited)

It's not "AI cost dashboard" (solved). It's:

> **AI economics layer that joins per-feature cost, per-customer revenue, model recommendations, and switching analysis, built into the frameworks engineers actually use.**

That product doesn't exist. The pieces exist separately. The integrated thing doesn't. Building it requires powering through integration tedium most teams bounce off — which is precisely why it's defensible once built.

### G.8 Velocity-of-change reframe

The deeper pain isn't "AI is expensive." It's:

> **"The optimal answer to my product was different yesterday than today, will be different tomorrow, and I have no systematic way to keep up."**

Every two weeks something new ships — new model, new pricing, new pattern, new framework — and every change is a "should we re-architect?" question. Right now those decisions are made on gut and coffee-shop spreadsheets. The systematic way to make them well doesn't exist as a product.

This wedge is structurally good because volatility is the distribution channel. Stable problems get solved by incumbents; rapidly-evolving problems stay open because rate of change defeats rate of feature shipping. Whoever sits in the "rapid migration analysis" lane benefits from every new model release.
