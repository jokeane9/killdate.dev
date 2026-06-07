# AI Engineering — Personal Learning Journey

> A running capture of how I'm getting better at the actual development work I do — and a holding pen for blog posts that fall out of it.

Started 2026-06-07. This is the "weird little personal learning journey" doc. It lives in `ideation/` because it's exploratory and personal, and because most of it wants to become posts eventually.

---

## The reframe that started this

I'd been calling what I do "ML engineering" in my head and reaching for the AWS ML cert. Wrong shelf.

I'm not training models, doing feature engineering, tuning hyperparameters, or running SageMaker jobs. The model is Anthropic's problem. My craft is **everything wrapped around it** — that's **AI engineering**, a genuinely distinct discipline. Naming it correctly changes which resources fit.

What I actually do breaks into five pillars:

1. **Agentic pipelines** — focused Python pipelines + specific ontology + structured prompts (the post-20 thesis; Shelf's Layer 0→4)
2. **RAG / retrieval** — pgvector on RDS, 1536-dim embeddings, HNSW index, query-time embedding (backcountry MCP)
3. **Tool / agent plumbing** — MCP servers, the observe→plan→act→check loop
4. **Eval pipelines** — golden datasets, red-room cases, LLM-as-judge rubrics, rejection capture (the declared *moat*)
5. **The product layer** — where AI lives, recognition vs recall, trust contracts (the `applied-ai-patterns-for-saas` essay)

Resource choices should be driven by these five, not by a generic "learn ML" syllabus.

---

## The cert verdict

**AWS Certified ML Engineer – Associate (MLA-C01): skip it.** It's built around the traditional ML lifecycle — SageMaker, feature engineering, training, tuning, MLOps. Maybe 15–20% touches what I do; the other 80% is the layer I've deliberately architected *around*. A cert here makes me fluent in the thing I don't do.

- If I want AWS genAI fluency as a goal in itself → the lighter **AWS Certified AI Practitioner (AIF-C01)** is the better fit (Bedrock + genAI concepts, far less traditional-ML ballast). A weekend, not a campaign.
- If I want a credential to signal → certs do that regardless of fit.
- But if the goal is *"get better at the work"* → a cert is a slow, mistargeted vehicle. Put the hours into the reading below.

---

## The resource map (by pillar)

**The spine — read end-to-end**
- **Chip Huyen, *AI Engineering* (O'Reilly, 2025).** Organized almost exactly around my five pillars: evaluation, RAG, prompt engineering, inference optimization, agents. This is the one. (Companion: her *Designing Machine Learning Systems* for the pipeline/ops mindset.)
  - *Note: I've read this once already, before I had the context. Re-reading now — see methodology below.*

**Pillar 4 — evals (invest most here, it's the moat)**
- **Hamel Husain** — "Your AI Product Needs Evals," "Creating a LLM-as-a-Judge That Drives Business Results," and the **"AI Evals for Engineers & PMs"** course (Hamel Husain + Shreya Shankar). Deepest practical material on golden datasets, judge rubrics, rejection-driven test sets.
- **Confident AI / DeepEval** — the "pytest of evals." For wiring it into CI — my actual Langflow→production gap.

**Pillar 2 — RAG**
- **Anthropic, "Introducing Contextual Retrieval"** — directly upgrades the naive chunk-and-embed in the backcountry MCP. Highest-leverage single RAG read for me.
- **DeepLearning.AI short courses** (free, ~1–2 hrs): *Building and Evaluating Advanced RAG*, *Building Agentic RAG with LlamaIndex*.
- **pgvector + Supabase RAG docs** — operational reference, since I'm on Postgres not a dedicated vector DB.

**Pillars 1 & 3 — agentic pipelines & tooling**
- **Anthropic, "Building Effective Agents"** (Schluntz & Zhang) — canonical on "pipelines with agents in the pipeline"; draws the workflow-vs-agent line I arrived at independently in post 20.
- **"12-Factor Agents"** (Dex Horthy / HumanLayer, GitHub) — production-discipline patterns; pairs with the prototype→production struggle.
- **Anthropic cookbook + MCP docs** — tool-calling and prompt-caching mechanics.

**The AWS-flavored version of all the above**
- **"Generative AI on AWS"** (Fregly, Barth, Eigenbrode — O'Reilly). Matches my AWS deployment reality (Bedrock, RAG on AWS, agents) far better than the ML cert syllabus.

**Suggested sequence:** (1) *AI Engineering* cover-to-cover as the spine. (2) In parallel, go deep on the Hamel/Shreya evals material. (3) Apply Contextual Retrieval + agentic-patterns pieces directly to the backcountry app — that codebase is the lab. (4) Only if I still want the credential, knock out AIF-C01.

---

## The methodology — re-read + two scans

The core insight: a technical book read *before* you've hit the problems is just vocabulary acquisition. Read *after* building the stuff, the same pages land on pegs you already have. Value roughly triples on the second pass — you're no longer learning *what* the ideas are, you're judging *how well your version matches them*. Most engineers never re-read and leave that multiplier on the table.

So the loop is: **re-read → scan against my work → scan with a senior-engineer lens.** Two distinct scans doing two distinct jobs:

- **Scan 1 — gap audit (against my work):** chapter by chapter, "where does this map to what I built, and where did I diverge?" On every divergence, ask: *was that ignorance, or a real reason?* Sometimes I reinvented the pattern badly; sometimes I diverged for a legit constraint the book doesn't cover. Only checking tells me which.
- **Scan 2 — adversarial review (senior-engineer lens):** "given how I built X, what would someone who's shipped this ten times tear apart?" The red-room pass applied to myself — the same discipline I preach for prompts.

This is active recall + elaborative interrogation, the strongest form of consolidation there is.

**Two sharpenings so it doesn't evaporate:**

1. **Interleave per chapter, don't do three full sequential passes.** Read a chapter, run both scans while it's hot, move on. Three cover-to-cover passes stall around chapter 4; chapter-local loops finish.
2. **Force an artifact — ideally a code change, not a note.** A margin note evaporates in a week. *One new red-room case in Shelf*, a TODO in the backcountry repo, a paragraph in a post — that's load-bearing, so it sticks. The evals chapter should leave the eval suite *different*. That's the test of whether the pass worked.

**The trap (and I of all people should see it):** this method has no natural kill date. Infinite re-reading and "what would a senior engineer think" can become a way to *not ship*. Timebox each chapter-loop, force the artifact, move on even when it feels unfinished. My own blog already told me this.

**Shortcut on Scan 2:** I don't have to *imagine* the senior-engineer critic. Hand Claude a chapter's concepts plus the real code it touches (Layer 4 prompt, pgvector search, eval rubric) and get the scan grounded in actual code, not platitudes.

---

## Blog post seeds

Angles that fall out of this, for `src/content/posts/` later:

- **"I was studying for the wrong cert."** The ML-engineer vs AI-engineer reframe. Why most "learn AI" advice points operators at the training layer they've deliberately architected around. Strong opener; opinionated; matches the killdate voice.
- **"Read the book twice."** The re-read + two-scan methodology as a general technique for senior engineers consolidating a fast-moving field. The value-triples-on-second-pass argument + the force-an-artifact discipline + the no-kill-date trap.
- **"Use the model as your second reader."** Scan 2 grounded in your own codebase — turning an LLM into the adversarial senior reviewer for your own implementation, against a book's ideal. Concrete, demo-able.
- **"The eval pipeline is the curriculum."** Tie the learning path back to the `applied-ai-patterns` moat thesis — what you choose to study should follow where the defensibility is.

---

*Captured from a working session, 2026-06-07. Update as the re-read progresses — chapter gap-audit notes and code-change artifacts can land here or as their own files in this folder.*
