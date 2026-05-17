# AI Infrastructure & Tooling Landscape — May 2026

The picks-and-shovels layer. NOT the major model providers (OpenAI, Anthropic, Google, Meta) and NOT legacy enterprise vendors bolting AI onto existing products (Salesforce, Microsoft, Adobe). The companies in between.

---

## Quick Reference Tables

### MCP / Tool Connectivity
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Apify** | 30,000+ scrapers as a single MCP server | Largest ready-made tool library for agents. Pivoted ICP from "growth marketers" to "AI agents needing live data" |
| **Composio** | 850+ SaaS actions (GitHub, HubSpot, Linear) pre-authenticated for agents | Solved OAuth/auth at platform level so agents don't have to. $29M Series A (Lightspeed) |
| **Firecrawl** | Any URL → clean structured markdown for LLMs | The canonical "give agent a URL, get usable data" primitive. 350K users, 43K GitHub stars |
| **Browserbase** | Managed cloud browser fleet for agents | 50M+ sessions, powers Perplexity and Vercel. Built Stagehand (open-source AI-native Playwright). $40M Series B |
| **Exa** | Search API built for agents, not humans | Neural search returns content by meaning not SEO rank. "Google for agents." $85M Series B (Benchmark) |
| **Tavily** | Real-time web search for RAG pipelines, <400ms | Acquired by Nebius for $400M — 18 months founding to exit. Default search in LangChain |

### Agentic Orchestration
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **LangChain / LangGraph** | Graph-based stateful multi-agent orchestration | De facto standard, 60%+ of orgs building agents. $125M Series B |
| **CrewAI** | Multi-agent "crews" with role-based coordination | 2B+ agentic executions. Cheapest per-query ($0.12). $18M Series A |
| **Mastra** | TypeScript-first agent framework with built-in memory, RAG, tools | 1.77M monthly NPM downloads. Fills the Python-free gap. $13M seed (YC, Paul Graham, Guillermo Rauch) |
| **Temporal** | Durable execution for long-running agents that survive crashes | $5B valuation, $300M Series D (a16z). Solves "what if it fails at hour 3" |
| **Inngest** | Event-driven durable workflows for TypeScript | Lighter-weight Temporal alternative for serverless + agent architectures |
| **Trigger.dev** | Open-source background jobs for TypeScript agents | "Just works in my Next.js app" entry point for durable execution. YC-backed |
| **Dify** | Visual workflow builder for LLM apps, open-source LLMOps | 114K GitHub stars. Dominant open-source platform in enterprise Asia. "Kubernetes of agent deployment" |
| **n8n** | No-code workflow automation with native AI nodes | 40K+ GitHub stars. Bridge between "I don't code" and "I need an agent." Zapier alternative |

### RAG / Vector / Data
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Qdrant** | Vector search engine built in Rust | Best price/performance in category. Winning against Pinecone on cost. $50M Series B |
| **Weaviate** | Hybrid search — vector + keyword + metadata filtering | Best for RAG that needs filtering alongside similarity. $50M Series B (Index, Battery) |
| **Pinecone** | Fully managed serverless vector database | Still default for speed-to-production. But 3–5x more expensive at scale. Exploring a sale — commoditization signal |
| **LlamaIndex** | Data ingestion, indexing, and RAG pipeline framework | Go-to for "data in, agent out" pattern. LlamaParse handles tables/images/PDFs. $19M Series A |
| **deepset / Haystack** | Open-source NLP + RAG pipeline framework, enterprise cloud layer | Most mature production RAG framework. Strong in European enterprise. $30M Series B (Balderton) |
| **Vectara** | Managed RAG with built-in audit trails and citation | Wedge in regulated industries needing provenance. $25M Series A |
| **Milvus / Zilliz** | Open-source vector DB (Milvus) + managed cloud (Zilliz) | Most scalable OSS vector DB. Powers Salesforce, PayPal, Shopify at scale. $60M Series B |
| **Scale AI** | Data labeling and RLHF — the training data foundry | $29B valuation. Meta acquired 49% stake for $14.3B. Every frontier model runs through Scale's pipeline |

### Observability & Eval
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Langfuse** | LLM tracing, evals, prompt management, cost tracking | Acquired by ClickHouse (Jan 2026). 20K+ GitHub stars, 26M SDK installs/month. Still open-source |
| **Arize AI / Phoenix** | AI observability and eval platform, OSS tracing library | Deepest roots in pre-LLM ML monitoring. $70M Series C |
| **Braintrust** | Eval platform — prompt versioning, human + auto evals, tracing | $800M valuation for an eval company. Signals how hard "did the agent get better" is. $80M Series B (ICONIQ) |
| **Galileo AI** | Agentic evaluation — every step of the chain, not just output | First mover on multi-step agent eval. 834% revenue growth 2024. $45M Series B |
| **Weights & Biases** | Experiment tracking, model registry, artifact management | Acquired by CoreWeave for $1.7B. 400K+ users across every major AI lab |
| **Confident AI / DeepEval** | Open-source LLM eval framework + hosted platform | "pytest of LLM evaluation." Fastest path from zero to running evals. YC W23 |
| **Humanloop** | Prompt management, eval, fine-tuning — collaborative platform | Purpose-built for product/AI team collaboration on prompt iteration. 400+ enterprise customers |

### Agent Infrastructure (Memory, Sandboxes, Compute)
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Mem0** | Universal memory layer for agents across sessions | 47.8K GitHub stars, 21 framework integrations. $24M Series A |
| **Letta** (formerly MemGPT) | Memory-first agent framework — core, archival, recall memory | Cleanest architectural model for long-term agent memory. UC Berkeley research origins |
| **Zep / Graphiti** | Temporally-aware knowledge graph — tracks how facts change over time | Agents that reason about "this was true last month, this is true now." 94.8% on DMR benchmark |
| **E2B** | Secure Firecracker microVM sandboxes for agent code execution | "What if the agent's code destroys something" solved at infra level. 88% of Fortune 100 signed up. $21M Series A |
| **Modal** | Serverless GPU compute, sub-second cold starts, no DevOps | Unicorn in 23 months. $50M ARR. $87M Series B (Lux Capital) |
| **Baseten** | Model serving as production auto-scaling APIs | Powers Cursor, Notion, Abridge. 100x inference volume growth 2025. $150M Series D at $2.15B |
| **Together AI** | Private inference for open-source models (Llama, DeepSeek, Mixtral) | The enterprise exit ramp from OpenAI dependency. ~$1B ARR. $305M Series B at $3.3B |
| **Replicate** | API access to 50,000+ open-source ML models | Acquired by Cloudflare — 50K models now on global edge network |
| **Deepgram** | Speech AI API — real-time transcription, voice agent infrastructure | Voice is fastest-growing agent interface modality. Nova-2 has lowest WER of any production ASR API |

### LLM Gateway / Control Plane
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Portkey** | AI gateway — unified API across model providers, with observability, caching, routing | Acquired by Palo Alto Networks (April 2026). LLM control plane is now a security surface |
| **Cohere** | Enterprise embedding, reranking, command models + "North" agentic platform | Only major model company built for data sovereignty from day one. $600M raised, $7B valuation, $150M ARR |
| **LiteLLM** | Unified Python API across 100+ LLM providers, with fallbacks and load balancing | Most widely used LLM abstraction in production agent code. When LangChain calls "any model," it often goes through LiteLLM |

### Vertical Agents (Infrastructure-like)
| Company | What they do | Why they matter |
|---------|-------------|-----------------|
| **Harvey** | Legal research, contract review, agent builder for law firms | $11B valuation, $190M ARR. The template for vertical-agent companies done right |
| **Legora** | Contract intelligence — AI-native contract lifecycle management | $5.6B valuation, $550M Series D (Accel). Largest legal AI funding round in history |
| **Glean** | Enterprise search + agents across all internal tools | 100M+ agent actions/year. $7.2B valuation. Owns both "find it" and "do something about it" |
| **Cognition (Devin)** | Autonomous software engineering agent | $10.2B valuation, in talks for $25B. Goldman Sachs, Citi, Ramp as customers |
| **Cursor / Anysphere** | AI-native code editor deeply integrated with LLM assistance | Fastest AI company to $500M ARR in history. Shapes all coding agent infrastructure |
| **Perplexity** | AI answer engine with agent-ready search API | $100M ARR. Cited, synthesized answers for agent grounding — not raw URLs |
| **Labelbox** | Data labeling and AI training data platform | Scale AI alternative not controlled by Meta. $189M raised. Walmart, P&G, Genentech |

---

## Full Company Profiles

### 1. Apify
- **Category:** MCP / Tool Connectivity
- **What they do:** A 30,000+ scraper and automation library exposed as a single MCP server — agents call any Actor (social scraping, maps, e-commerce, search) without building their own data pipelines.
- **Stage:** Series B (undisclosed), Czech company, bootstrapped-to-scale origin
- **Why they matter:** The largest ready-made tool library for agents right now. When Claude or GPT needs real-world web data, Apify is the fastest path. Already pivoted ICP from "growth marketers running scrapers" to "AI agents needing live data." MCP compatibility means any agent can call 30K+ scrapers with zero integration work.

### 2. Composio
- **Category:** MCP / Tool Connectivity
- **What they do:** Hosted integration platform giving agents pre-authenticated access to 850+ SaaS actions (GitHub, Linear, HubSpot, Salesforce, etc.) via MCP or direct API — handles OAuth so agents don't have to.
- **Stage:** Series A — $29M led by Lightspeed (July 2025); backed by Elevation Capital, Guillermo Rauch, Dharmesh Shah
- **Why they matter:** Auth is the hardest part of agent-to-SaaS connections. Composio solved it once at platform level. 100K+ developers, 200+ paying customers including Glean and YC companies.

### 3. Firecrawl
- **Category:** MCP / Tool Connectivity
- **What they do:** Turn any URL into clean, structured markdown for LLMs — scraping-as-a-service with MCP integration, used when agents need deep page extraction (not just search snippets).
- **Stage:** Series A — $14.5M led by Nexus Venture Partners (August 2025); backed by YC, Shopify CEO Tobias Lütke
- **Why they matter:** 350K users, 43K GitHub stars. The canonical "give an agent a URL, get usable data" primitive. Faster and higher success rate than roll-your-own Playwright scraping.

### 4. Browserbase
- **Category:** MCP / Tool Connectivity
- **What they do:** Managed cloud browser infrastructure for agents — Playwright/Puppeteer sessions in the cloud at scale, so agents can navigate real web pages, fill forms, and click without running their own Chrome fleet.
- **Stage:** Series B — $40M at $300M valuation (June 2025); total $67.5M
- **Why they matter:** 50M+ browser sessions processed, 1,000+ enterprise customers including Perplexity and Vercel. Built Stagehand — the open-source AI-native Playwright abstraction (3 primitives: act, extract, observe) that's become the standard SDK for browser agents.

### 5. Exa (formerly Metaphor)
- **Category:** MCP / Tool Connectivity
- **What they do:** Search API purpose-built for AI agents — returns semantically-relevant, clean results optimized for LLM consumption, not human click-through. The "Google for agents."
- **Stage:** Series B — $85M at $700M valuation (2025); led by Benchmark; backed by Lightspeed, YC, NVIDIA Ventures
- **Why they matter:** Standard keyword search returns SEO-gamed results that confuse LLMs. Exa's neural search returns content by meaning. Fastest-growing search API in the agentic stack.

### 6. Tavily
- **Category:** MCP / Tool Connectivity
- **What they do:** Real-time web search API designed for RAG pipelines and agent tool-calling — fast, structured results under 400ms, focused on agentic query patterns.
- **Stage:** Acquired by Nebius for $400M in 2026 after raising $25M total (Series A led by Insight Partners, August 2025)
- **Why they matter:** Went from founding to $400M exit in roughly 18 months. Default search tool in LangChain. The acquisition signals search grounding is now core infra, not a nice-to-have.

### 7. LangChain / LangGraph
- **Category:** Agentic Orchestration
- **What they do:** Most widely adopted framework for building LLM-powered agents and chains; LangGraph handles stateful, graph-based multi-agent workflows with cycles and conditionals.
- **Stage:** Series B — $125M; backed by Sequoia, Benchmark, KV
- **Why they matter:** De facto standard for agent builders. LangSmith (observability) and LangGraph Cloud (hosted orchestration) are turning open-source traction into a commercial platform. Used by 60%+ of orgs building agents.

### 8. CrewAI
- **Category:** Agentic Orchestration
- **What they do:** Python framework for orchestrating multi-agent "crews" where specialized agents collaborate on tasks — role-based, with a director agent coordinating workers.
- **Stage:** Series A — $18M total; led by Insight Partners; backed by boldstart, Andrew Ng
- **Why they matter:** Powers ~2 billion agentic executions. Used by 60%+ of Fortune 500 (claimed). Lowest cost per query among major frameworks ($0.12–0.15). Has a no-code Enterprise Cloud layer.

### 9. Mastra
- **Category:** Agentic Orchestration
- **What they do:** TypeScript-first agent framework (built by the team behind Gatsby) with built-in memory, tool use, workflow orchestration, and RAG — designed for JS/TS teams who don't want to context-switch to Python.
- **Stage:** Seed — $13M; backed by YC, Paul Graham, Guillermo Rauch (Vercel CEO)
- **Why they matter:** 1.77M monthly NPM downloads since v1.0 (January 2026). Marsh McLennan deployed it to 75,000 employees. Fills the Python-free gap in the agent framework market.

### 10. Temporal
- **Category:** Agentic Orchestration
- **What they do:** Durable execution engine for long-running, stateful workflows — agents that need to survive crashes, retries, and wait days for external events without losing state.
- **Stage:** Series D — $300M at $5B valuation (February 2026); led by a16z; backed by Lightspeed, Sequoia, Sapphire, Index
- **Why they matter:** The hardest unsolved problem in agents is "what happens when it fails halfway through a 3-hour task?" Temporal is the answer. Valuation doubled in 4 months as the agentic use case crystallized.

### 11. Inngest
- **Category:** Agentic Orchestration
- **What they do:** Event-driven workflow and background job platform with agent-friendly primitives — durable steps, human-in-the-loop gates, and retries for TypeScript teams.
- **Why they matter:** The lighter-weight Temporal alternative for TypeScript teams. Natural fit for serverless + agent architectures.

### 12. Trigger.dev
- **Category:** Agentic Orchestration
- **What they do:** Open-source background jobs and workflow platform for TypeScript — deploy long-running agent tasks from within your existing codebase with zero new infrastructure.
- **Stage:** YC-backed seed/Series A
- **Why they matter:** Lowest-friction path for TypeScript teams to make agents durable. The "just works in my Next.js app" entry point.

### 13. Dify
- **Category:** Agentic Orchestration
- **What they do:** Open-source LLMOps platform with a visual workflow builder — combines orchestration, prompt management, evaluation, and deployment in one system.
- **Stage:** Series B; 114K+ GitHub stars
- **Why they matter:** The dominant open-source platform in China and growing globally. Visual builder lowers the floor for non-Python teams. Increasingly positioned as the Kubernetes of agent deployment.

### 14. Qdrant
- **Category:** RAG / Vector / Data
- **What they do:** Open-source vector search engine built in Rust — "composable vector search" with customizable indexing, scoring, filtering, and latency/precision trade-offs.
- **Stage:** Series B — $50M (March 2026); led by AVP; backed by Bosch Ventures, Spark Capital; total $87.5M
- **Why they matter:** Best price-performance in the vector DB category. Winning against Pinecone for teams that have outgrown Chroma and don't want Pinecone's cost structure.

### 15. Weaviate
- **Category:** RAG / Vector / Data
- **What they do:** Cloud-native vector database with hybrid search (vector + keyword + metadata filtering in a single query) — purpose-built for RAG applications that need more than raw vector storage.
- **Stage:** Series B — $50M at $200M valuation; led by Index Ventures, Battery Ventures
- **Why they matter:** Dominates the hybrid retrieval use case. If you're combining vector similarity with metadata filters in production RAG, Weaviate handles it natively better than any competitor.

### 16. Pinecone
- **Category:** RAG / Vector / Data
- **What they do:** Fully-managed serverless vector database — the easiest and fastest path to a production vector search backend, with multi-cloud support and real-time indexing.
- **Stage:** Series B — $100M (2023) at $750M; exploring a sale (2025)
- **Why they matter:** Despite being 3–5x more expensive at scale vs. self-hosted alternatives, still the default for teams prioritizing speed-to-production. Exploring a sale is a marker that pure-play vector databases face commoditization pressure.

### 17. LlamaIndex
- **Category:** RAG / Vector / Data
- **What they do:** Data framework for connecting LLMs to external data sources — ingestion, indexing, and querying pipelines for RAG applications and knowledge agents.
- **Stage:** Series A — $19M led by Norwest; backed by Databricks Ventures, KPMG Ventures
- **Why they matter:** The go-to framework for the "data in, agent out" pattern. LlamaCloud is the managed layer. LlamaParse handles complex document extraction (tables, images, PDFs) that naive chunking gets wrong.

### 18. deepset / Haystack
- **Category:** RAG / Vector / Data
- **What they do:** Open-source NLP and RAG framework (Haystack) plus enterprise cloud (deepset Cloud) for production-ready LLM pipelines with composable components.
- **Stage:** Series B — $30M led by Balderton Capital; total ~$45.6M; Berlin-based
- **Why they matter:** Most mature production-grade RAG pipeline framework. Strong in European enterprises. Partnerships with Meta Llama Stack, MongoDB, AWS, NVIDIA, PwC.

### 19. Vectara
- **Category:** RAG / Vector / Data
- **What they do:** Managed RAG platform with a built-in anti-hallucination layer — grounded, governed, auditable retrieval for enterprise agents that need provenance and audit trails.
- **Stage:** Series A — $25M; total $73.5M; led by FPV Ventures, Race Capital; founded by ex-Google/Cloudera execs
- **Why they matter:** "RAG with guardrails." The governance angle (every answer citable, auditable) is a real wedge in regulated industries.

### 20. Scale AI
- **Category:** RAG / Vector / Data
- **What they do:** Data labeling and RLHF platform that produces training and evaluation datasets — the foundry for model quality.
- **Stage:** $29B valuation; Meta acquired 49% non-voting stake for $14.3B (June 2025); $2B ARR
- **Why they matter:** Every frontier model improvement runs through Scale's annotation pipeline. The Meta deal has triggered enterprise churn — Google and OpenAI teams unwilling to share data with a Meta-controlled vendor.

### 21. Langfuse
- **Category:** Observability & Eval
- **What they do:** Open-source LLM observability — tracing, evals, prompt management, and cost tracking for production LLM applications.
- **Stage:** Acquired by ClickHouse (January 2026) as part of ClickHouse's $400M Series D at $15B valuation
- **Why they matter:** Most widely adopted open-source observability layer. ClickHouse buying them signals "analytics database + observability" is a natural bundle. Still open-source and actively developed post-acquisition.

### 22. Arize AI / Phoenix
- **Category:** Observability & Eval
- **What they do:** AI observability and evaluation platform — traces LLM calls, monitors production model performance, runs evals; Phoenix is their open-source tracing/eval library.
- **Stage:** Series C — $70M (February 2025); backed by Scale Venture Partners, Premji Invest, Databricks Ventures
- **Why they matter:** The deepest roots in ML monitoring pre-LLM, now the most complete observability stack for the LLM era.

### 23. Braintrust
- **Category:** Observability & Eval
- **What they do:** Eval platform for LLM applications — run experiments, compare prompt versions, measure quality with human + automatic evals, and trace production.
- **Stage:** Series B — $80M led by ICONIQ (2025); $800M valuation; backed by a16z, Greylock, Elad Gil
- **Why they matter:** $800M valuation for an eval company. Signals that "how do you know your agent got better" is a hard, expensive, unsolvable-by-bundling problem.

### 24. Galileo AI
- **Category:** Observability & Eval
- **What they do:** Evaluation intelligence platform — research-backed eval metrics across the full GenAI stack, with agentic evaluation for multi-step agent workflows.
- **Stage:** Series B — $45M led by Scale Venture Partners (October 2024); total $68M; backed by Databricks Ventures, ServiceNow Ventures; 834% revenue growth in 2024
- **Why they matter:** First mover on "agentic evaluations" — evaluating not just the final output but every step of an agent's reasoning chain.

### 25. Weights & Biases
- **Category:** Observability & Eval
- **What they do:** ML experiment tracking, model registry, and artifact management — the standard tool for ML teams to track training runs, compare models, manage the model lifecycle.
- **Stage:** Acquired by CoreWeave for $1.7B (March 2025, closed May 2025)
- **Why they matter:** CoreWeave buying W&B for $1.7B is a thesis: GPU cloud + experiment tracking is the vertically integrated developer platform for serious ML teams. 400K+ users across every major AI lab.

### 26. Mem0
- **Category:** Agent Infrastructure
- **What they do:** Universal memory layer for AI agents — extracts, stores, and retrieves memories across sessions so agents can personalize and maintain long-term coherence.
- **Stage:** Series A — $24M led by Basis Set Ventures (October 2025); YC-backed; 47.8K GitHub stars
- **Why they matter:** Most popular dedicated memory platform in the ecosystem. 21 official framework integrations. Ships the most widely-adopted multi-signal retrieval algorithm (semantic + BM25 + entity).

### 27. Letta (formerly MemGPT)
- **Category:** Agent Infrastructure
- **What they do:** Memory-first agent framework — core memory (always in-context), archival memory (vector store), and recall memory (conversation history), with a hosted cloud layer.
- **Stage:** Seed (YC-backed); UC Berkeley research origins
- **Why they matter:** The academic rigor behind MemGPT produced the cleanest architectural model for agent memory. The MemGPT OS-memory analogy is still the best mental model for why agent memory is hard.

### 28. Zep / Graphiti
- **Category:** Agent Infrastructure
- **What they do:** Context engineering and agent memory platform built on Graphiti — a temporally-aware knowledge graph that tracks how facts change over time, not just current state.
- **Why they matter:** Graphiti's temporal awareness (94.8% on DMR benchmark) is genuinely differentiated. Agents that reason about "this was true last month, this is true now" need Zep's architecture, not a flat vector store.

### 29. E2B
- **Category:** Agent Infrastructure
- **What they do:** Secure cloud sandboxes for AI agents to execute code — Firecracker microVM-based isolated environments that spin up in milliseconds to run arbitrary code safely.
- **Stage:** Series A — $21M led by Insight Partners; total $32M; backed by Decibel, Sunflower Capital
- **Why they matter:** Code execution is the most dangerous capability you give an agent. E2B solves "what if the agent's code destroys something" at infrastructure level. 88% of Fortune 100 signed up.

### 30. Modal
- **Category:** Agent Infrastructure
- **What they do:** Serverless GPU compute for AI workloads — sub-second cold starts, automatic scaling, no DevOps overhead; purpose-built for inference jobs, batch processing, and agent sandboxes.
- **Stage:** Series B — $87M at $1.1B valuation (September 2025); led by Lux Capital; $50M ARR (February 2026)
- **Why they matter:** Unicorn in 23 months. Cleanest DX in serverless GPU compute — you write Python, Modal handles the GPU fleet. Default for teams running agent inference without dedicated infra.

### 31. Baseten
- **Category:** Agent Infrastructure
- **What they do:** Inference platform for deploying custom AI models as production APIs — converts models via the open-source Truss framework into auto-scaling, GPU-managed endpoints.
- **Stage:** Series D — $150M at $2.15B valuation (September 2025); led by BOND/CapitalG; total ~$585M
- **Why they matter:** 100x inference volume growth in 2025. Powers Cursor, Notion, Abridge, Clay. The model-serving complement to Modal's compute-primitive approach.

### 32. Together AI
- **Category:** Agent Infrastructure
- **What they do:** AI Acceleration Cloud — managed inference for open-source models (Llama, DeepSeek, Mixtral) at production scale, the private-infrastructure alternative to proprietary model APIs.
- **Stage:** Series B — $305M at $3.3B valuation; targeting $1B raise at $7.5B; ~$1B ARR; backed by General Catalyst, NVIDIA, Kleiner Perkins
- **Why they matter:** The enterprise exit ramp from OpenAI dependency. If you need Llama inference at 100M+ tokens/day on private infrastructure, Together AI is the default.

### 33. Replicate
- **Category:** Agent Infrastructure
- **What they do:** API access to 50,000+ open-source ML models — run any community model without managing a GPU cluster.
- **Stage:** Acquired by Cloudflare (November 2025)
- **Why they matter:** The acquisition plugged 50,000 production-ready models into Cloudflare's global edge network. Edge computing + AI inference now unified in one platform.

### 34. Deepgram
- **Category:** Agent Infrastructure
- **What they do:** Speech AI API — real-time transcription, speech-to-text, and voice agents infrastructure; purpose-built for low-latency streaming audio.
- **Stage:** Series B — $47M (total $86M); backed by YC, NVIDIA, Tiger Global, Madrona
- **Why they matter:** Voice is the fastest-growing agent interface modality. Nova-2 has the lowest word error rate and highest speed of any production ASR API.

### 35. Portkey
- **Category:** LLM Gateway / Control Plane
- **What they do:** AI gateway and LLM routing proxy — unified API across all model providers with observability, caching, load balancing, rate limit management, and fallback routing.
- **Stage:** Acquired by Palo Alto Networks (announced April 30, 2026; becomes AI Gateway for Prisma AIRS)
- **Why they matter:** The acquisition signals the LLM control plane is now a security surface, not just a DX convenience. Five major LLM gateway/observability companies acquired in 16 months — category consolidating into larger platforms.

### 36. Cohere
- **Category:** LLM Gateway / Control Plane
- **What they do:** Enterprise-grade embedding, reranking, and command models — plus "North," an agentic AI platform — for organizations needing private, on-premises, or sovereign AI deployment.
- **Stage:** $600M total raised; $7B valuation; $150M ARR (October 2025); backed by NVIDIA, AMD, Salesforce Ventures
- **Why they matter:** Only major model company built from day one for enterprise data sovereignty. Can deploy on any cloud, on-prem, or as sovereign infrastructure — the requirement that rules out OpenAI and Anthropic for regulated industries.

### 37. Harvey
- **Category:** Vertical Agents
- **What they do:** AI agents for legal work — research, document analysis, contract review, legal writing, and (since March 2026) a no-code Agent Builder for building task-specific legal agents.
- **Stage:** $200M raised at $11B valuation (March 2026); $190M ARR (January 2026); led by GIC and Sequoia
- **Why they matter:** The template for vertical-agent companies done right. Deep workflow integration at the firm level, not a bolt-on chatbot. Goldman Sachs, Citi, Dell, Cisco as customers.

### 38. Legora
- **Category:** Vertical Agents
- **What they do:** Contract intelligence platform — AI-native contract lifecycle management with workflow-native agents for drafting, reviewing, and tracking contracts.
- **Stage:** Series D — $550M at $5.55B valuation (March 2026); led by Accel; backed by Benchmark, Bessemer, General Catalyst, ICONIQ, Redpoint, YC
- **Why they matter:** Largest legal AI funding round in history. Tripled valuation in 5 months. Shows the legal vertical is large enough to support multiple category leaders.

### 39. Glean
- **Category:** Vertical Agents
- **What they do:** Enterprise AI search and agents — connects to all internal tools (Slack, Google Drive, Jira, Salesforce) and provides unified search + agentic layer over the full enterprise knowledge graph.
- **Stage:** Series F — $150M at $7.2B valuation (June 2025); $100M+ ARR; backed by Wellington, Khosla, Altimeter, Kleiner, Sequoia, General Catalyst, Lightspeed
- **Why they matter:** 100M+ agent actions per year. Owns both "where is that thing" and "now do something about it." $7.2B for an enterprise search company reflects the agentic expansion of the TAM.

### 40. Cognition AI (Devin)
- **Category:** Vertical Agents
- **What they do:** Autonomous software engineering agent (Devin) that can write, test, and deploy code from a natural language spec.
- **Stage:** $400M at $10.2B valuation (September 2025); in talks for new round at $25B valuation (April 2026); backed by Founders Fund, 8VC; $73M ARR as of June 2025
- **Why they matter:** Demonstrated the first credible "AI teammate who can do a sprint ticket end to end." Goldman Sachs, Citi, Dell, Cisco, Ramp as customers.

### 41. Cursor / Anysphere
- **Category:** Vertical Agents
- **What they do:** AI-native code editor that deeply integrates LLM assistance into the full coding workflow — not a plugin, a purpose-built IDE.
- **Stage:** Raised $2.3B (2025/2026); fastest AI company to $500M ARR
- **Why they matter:** Fastest-growing developer tool in history by ARR. Defines the benchmark all coding agent infrastructure gets measured against. SpaceX running it at scale.

### 42. Perplexity AI
- **Category:** Vertical Agents
- **What they do:** AI answer engine with an API for agent grounding — fast search results, structured reasoning outputs, real-time web access with cited, factual answers.
- **Stage:** $100M ARR (March 2025); latest round at $9B+; backed by NVIDIA, SoftBank, IVP, NEA
- **Why they matter:** Crossed $100M ARR faster than almost any prior software company. The Perplexity Search API is the second search option alongside Exa/Tavily in many agent stacks.

### 43. n8n
- **Category:** Orchestration (No-Code)
- **What they do:** Open-source workflow automation platform with native AI node support — increasingly used as the no-code layer for non-developer agent orchestration.
- **Stage:** Series B ($60M+ raised); fair-code licensed; strong self-hosted base converting to cloud
- **Why they matter:** 40K+ GitHub stars. The bridge between "I don't write code" and "I need an agent." Integrates with LangChain, OpenAI, and every major SaaS.

### 44. Labelbox
- **Category:** RAG / Data
- **What they do:** Data labeling and AI training data platform — the Scale AI alternative not controlled by Meta.
- **Stage:** $189M raised; near-unicorn; customers include Walmart, P&G, Genentech, Adobe; 50M+ monthly annotations
- **Why they matter:** Scale AI's Meta acquisition is driving enterprise data teams to Labelbox as the non-conflicted alternative.

### 45. Milvus / Zilliz
- **Category:** RAG / Vector / Data
- **What they do:** Open-source vector database (Milvus) with a fully-managed cloud layer (Zilliz Cloud) — designed for billion-scale vector search.
- **Stage:** Series B — $60M led by Prosperity7; total $113M; backed by Lightspeed, Hillhouse
- **Why they matter:** Most scalable OSS vector database. Powers Salesforce, PayPal, Shopify at scale. Milvus is the embedded engine inside many other products.

### 46. Confident AI / DeepEval
- **Category:** Observability & Eval
- **What they do:** Open-source LLM evaluation framework (DeepEval, 9K+ GitHub stars) and hosted eval platform.
- **Stage:** Seed (YC W23)
- **Why they matter:** The fastest path from "I need to run evals" to working code. "The pytest of LLM evaluation."

### 47. Humanloop
- **Category:** Observability & Eval
- **What they do:** Prompt management, evaluation, and fine-tuning platform — collaborative environment for AI teams to iterate on prompts, run A/B evals, and manage model versions.
- **Stage:** Series A — $10.6M; backed by EQT Ventures, Concept Ventures; 400+ enterprise customers
- **Why they matter:** Purpose-built for the product/AI team collaboration problem on prompt iteration. Strong in European enterprises.

### 48. Letta (formerly MemGPT) — see #27

### 49. LiteLLM
- **Category:** LLM Gateway / Control Plane
- **What they do:** Open-source Python library providing a unified API across 100+ LLM providers — call any model with the same interface, with built-in fallbacks, load balancing, and cost tracking.
- **Why they matter:** Most widely used LLM abstraction layer in production agent code. When LangChain calls "any model," it often goes through LiteLLM underneath.

### 50. Flowise
- **Category:** Orchestration (No-Code)
- **What they do:** Open-source visual drag-and-drop builder for LLM workflows and agents — the lowest-floor path to building a functioning agent without writing code.
- **Stage:** Acquired by Workday
- **Why they matter:** Acquisition into Workday signals enterprise demand for no-code agent construction tools. ~22K GitHub stars before acquisition.

---

## Meta-Patterns

### What's consolidating (get absorbed into platforms)
- **Observability:** Langfuse → ClickHouse, W&B → CoreWeave, Portkey → Palo Alto Networks
- **Search:** Tavily → Nebius, Replicate → Cloudflare
- **No-code builders:** Flowise → Workday

### What's commoditising
- **Vector databases** — Pinecone exploring a sale, Qdrant winning on price, pgvector viable for most use cases
- **Basic LLM routing** — every platform is building it in
- **Simple RAG** — table stakes, not a moat

### What doesn't get absorbed or commoditised
- **Proprietary data** — the most defensible asset in any agentic stack
- **Judgment** — knowing which question to ask of a fully-wired system
- **Temporal data** — time-series competitive intelligence (Shelf's actual moat)
- **Human-validated ground truth** — merchant-confirmed product matches, labeled training data

### The architecture underneath every agentic system
```
Trigger → Agent wakes
Agent observes (MCP pulls live state)
Agent plans (LLM reasons over state)
Agent acts (tools execute)
Agent checks result
Loop or exit
```

MCP is what makes the "observe" step not suck. Without it, agents were flying blind between actions.

---

*Research compiled May 2026. Funding figures from public announcements. This landscape changes fast — treat valuations and stages as approximate.*
