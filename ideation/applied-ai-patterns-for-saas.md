---
title: "Stop bolting chat onto your SaaS"
description: "The matrix of where AI actually lives in software — six cells, each with its own trust contract. A builder's map for operator SaaS, not abstraction-building tools."
part: 5
post: 19
draft: false
tags: ["applied-ai", "operator-software", "recommendation-dense-ui", "grounded-chat", "eval-pipeline", "patterns"]
---

*~40 minute read*

## The chatbox is a cop-out

Most SaaS teams shipping AI in 2026 are shipping a chat sidebar. They wire up an LLM, stick a textbox on the right edge of the screen, give it access to "your data," and call it AI. They write a launch post. They put it in the pricing tier. They ship nothing real.

The chatbox is what you build when you don't know what to build. It's the move-fast version of *applied AI* that defers every interesting product question to the user. Where should the model help? Up to you, type a question. What should it do here? Whatever you ask. When should it act? When you tell it to. The user is doing the entire job of figuring out where AI belongs in their workflow, and the product is taking credit for it.

This works fine for **abstraction-building tools** (software whose primary job is helping the user produce an artifact — code, prose, a design, a research synthesis). Claude.ai, Cursor, Perplexity. There the user genuinely is composing — they have an open-ended task and the model is the medium of exploration. Chat is the right primary surface because the user's job *is* exploration.

It does not work for **operator software** (software whose primary job is helping the user run an ongoing operation — a business, a queue, a portfolio, a store). Linear, Ramp, Triple Whale, Mercury, Shelf. Here the user has a job. They want to know what to do next. They want recommendations they can scan, accept, reject, refine. Chat as the primary surface forces them to *compose a query* for information they should have been *handed*.

This essay is about that distinction and what to build instead. It's a map of where AI actually lives in operator software — six cells, each with its own discipline. It's opinionated. It's specific. It's the doc I wish someone had handed me before I shipped my first three half-baked AI features.

**What this departs from.** This essay opposes four prevailing narratives:

1. **The A16Z/Sequoia "AI is the next platform shift" frame.** Mostly true, mostly unhelpful. "Platform shift" tells you something is happening; it doesn't tell you where the model belongs in your product. The interesting work is per-feature, not per-platform.
2. **The chat-everywhere reflex.** Every SaaS company is shipping a chat sidebar in 2026. Most of them shouldn't. The reflex confuses *the existence of LLMs* with *chat being the right UI*.
3. **The "your product needs an AI copilot" assumption.** Copilot is one of six legitimate shapes AI can take inside software. Not the default.
4. **The conflation of agentic coding tools with operator-software AI.** Cursor, Devin, Claude Code, Codex — these are abstraction-building tools for a specialist audience. The lessons from building them are useful but not transferable wholesale. Operator software has different cognitive constraints, different trust contracts, different willingness-to-pay shapes.

*[Author's read]*

---

## Operator software vs abstraction-building software

The load-bearing distinction in this whole essay is between two categories of software, and most "applied AI" writing fails to distinguish them.

**Abstraction-building software** is software where the user's job is to build, explore, or compose something. The output is the artifact. Examples: Claude.ai (you're producing thinking), Cursor (you're producing code), Figma (you're producing design), Notion (you're producing documents), Perplexity (you're producing research synthesis), Roam (you're producing knowledge structure). The user shows up with an open-ended task. They want a medium of exploration. They are *willing to compose* because composing is the work. Chat-as-primary is well-suited here because the user is already in a recall-and-formulate cognitive mode.

**Operator software** is software where the user is running an ongoing operation and using the tool to make decisions inside that operation. The output is a decision and usually an action taken elsewhere. Examples: Linear (you're running a product team), Ramp (you're managing company spend), Mercury (you're running company finances), Triple Whale (you're running DTC marketing), Klaviyo (you're running email + SMS), Gorgias (you're running customer support), Shelf (you're running a Shopify store's competitive surface). The user shows up with a defined job-to-be-done. They want to know what to do. They are *unwilling to compose queries* because composing isn't the work — running the operation is the work.

The two categories have different cognitive modes, different UIs, different willingness-to-pay, different failure modes, different defensibility shapes. Almost everything written about applied AI in 2024–2026 is implicitly about the first category — because the first category is where AI looks coolest and where the loudest builders are. Treating that writing as universal is how you end up shipping a chat sidebar onto a Shopify app whose user has thirty seconds to scan a dashboard between customer calls.

Operator software has a different default: AI should compose first. Hand the user the conclusion. Let them dive into the reasoning if they want it. Let them refine if they disagree. The user's cognitive budget is allocated to running the operation, not to formulating prompts.

**Footnote — the middle category.** Tools like Hebbia and Glean look like operator software on the surface (analysts use them at work, on an ongoing basis, to make decisions). But the analyst's actual output is *the synthesis itself* — they're producing a memo, a brief, a report. The artifact is the deliverable. So these tools are closer to abstraction-building than they appear. The middle category exists, and is worth naming, but doesn't break the binary — most products fall clearly on one side and the choice of where AI lives flows from that. *[Author's read]*

---

## Recognition vs recall — the cognitive argument

Why does chat-as-primary fail in operator software? Cognitive economics.

When a user uses a chat-as-primary interface, they're doing four cognitive tasks in sequence:
1. **Hold the model** of what's possible in their head (what can the AI even do here?)
2. **Formulate a query** that matches that model (what should I type?)
3. **Evaluate the response** for correctness (is this right? complete? what's missing?)
4. **Decide what to do** with it (act, refine, discard)

This is **recall mode** — the user is generating the input from memory and intent. It's effortful. It's the same mode you're in when you're trying to remember someone's name.

When a user uses a recommendation-dense interface, they're doing one cognitive task:
1. **Recognize** whether the thing in front of them is what they want.

This is **recognition mode** — the user is reacting to something already composed. It's nearly effortless. It's the same mode you're in when you scan a restaurant menu and your eyes go to the dish you want.

The Nielsen Norman Group has been writing about recognition-over-recall as a usability principle for thirty years. The research is unambiguous: recognition is faster, less effortful, and more accurate than recall for almost every operational task a user does in software. *[Established]*

LLMs make recognition mode *more* viable, not less. Pre-LLM, the only way to get a recommendation in front of a user was to hand-code a heuristic ("if discount applied to top 10% of products, surface 'discount alert'"). Heuristics are brittle. They under-fire on edge cases and over-fire on common ones. LLMs let you compose recommendations with context-awareness that heuristics can't match — which means you can populate a recognition-mode UI with material that's *worth recognizing*. The new technology unlocks the old UI pattern.

The reflex to ship chat is, in this frame, a category error: a recognition-mode product getting a recall-mode UI bolted on. The user goes from "scan, decide, act" to "remember, formulate, evaluate, decide, act." You've made the product harder to use in exchange for marketing copy that says "now with AI."

The single sentence to take from this section: **in operator software, every minute the user spends composing a query is a minute they're not running their operation.** That's the test. If your AI feature increases composition time without removing more decision time, it's a regression. Even if it shipped on time.

---

## The 2-axis matrix: where AI actually lives in software

### Why these two axes

There are many ways to slice the AI-in-software design space. User skill level. Autonomy gradient. Output modality. Latency budget. Domain specificity. Each could be an axis.

The two that compress the most decision power, in my read, are:

- **Who initiates** (user vs AI)
- **Where it lives** (separate surface / embedded in the host UI / background)

Together they produce a 2×3 matrix of six cells, and almost every concrete AI product I can think of falls cleanly into one or two of those cells. More importantly: **the cell determines the discipline.** Trust contract, latency budget, UX vocabulary, monetization shape, failure mode — all of these vary systematically by cell, and they vary together. Pick the cell and you've picked the constraints you have to honor.

I tested this against the obvious alternatives and stayed with these two:

- **User-skill axis** (novice vs expert) — useful but a meta-axis. Skill changes how you tune the UI within a cell; it doesn't move the cell.
- **AI-autonomy axis** (suggest / pre-stage / execute) — this is *one component* of the trust contract that varies inside cells, especially Cell 6. Folding it into the matrix would over-collapse.
- **Output-type axis** (text / decision / action) — closer, but again a component, not the axis. Recommendation-dense surfaces produce a mix of all three.

The 2-axis matrix is the right level of compression for product decisions. Once you've picked the cell, you know which trust contract applies, which latency budget is binding, and which UX vocabulary your users are pattern-matching against. *[Author's read]*

|                  | User-initiated                            | AI-initiated                                |
|------------------|-------------------------------------------|---------------------------------------------|
| **Separate surface**  | **Cell 1 — Chat-primary**                | **Cell 2 — Recommendation-dense**           |
| **Embedded in host UI** | **Cell 3 — Inline assist**               | **Cell 4 — Notification agents**            |
| **Background**      | **Cell 5 — Configured automation**        | **Cell 6 — Autonomous agents**              |

The next six sub-sections walk one cell each.

### Cell 1: Chat-primary (separate surface, user-initiated)

Claude.ai, ChatGPT, Perplexity, Cursor's chat panel, Notion AI's full chat surface. The user opens a dedicated space, composes, the AI responds. This is the frontier of **abstraction-building software** (software where the artifact the user produces *is* the output).

The cell's trust contract is the most forgiving in the matrix: the user knows they're talking to a model, they're in recall mode by choice, and they're willing to verify because verification is part of the job. Hallucinations are bad but recoverable — the user catches them in the same loop they'd catch their own bad ideas.

This is the most copied and most misapplied cell. Because the canonical AI products of 2023–2025 live here, every product team has a Claude.ai-shaped reference in their head when someone says "let's add AI." They build a chat sidebar in their operator SaaS. The chat sidebar inherits Cell 1's cognitive mode (recall) and Cell 1's trust contract (you'll verify, right?) — but the user is a Shopify merchant with two minutes between a customer chat and a fulfillment exception. The mode mismatch shows up as low usage, then as feature-removed.

Build in Cell 1 when your user's job is *to explore or compose*. Don't build in Cell 1 because the chatbot is the easy thing to ship.

### Cell 2: Recommendation-dense (separate surface, AI-initiated)

Triple Whale's main dashboard, Linear's AI issue briefings, Granola's post-meeting recommendations, Reflex AI's competitor briefings, Shelf's daily briefing surface. The product has a dedicated surface — a dashboard, a card stream, a feed — and **AI composes the content** that fills it. The user shows up, scans, decides. Recognition mode.

This is **the home of operator SaaS**. It's the cell most operator products should occupy as their primary surface, and where the most defensibility lives over a 3–5 year horizon. The trust contract here is: AI is right enough often enough that scanning beats querying. If the recommendations are good, the user adopts the scan loop and stays in it. If the recommendations are noise, the user develops a "skip the AI cards" reflex inside two weeks and the surface dies.

The discipline that matters here is **signal-weighted composition**: only the recommendations worth a user's attention go in. Density without selectivity becomes Twitter-feed noise. The thing the user is buying is *judgment about what's worth surfacing*, not raw recommendation throughput.

The next-most-important Cell 2 discipline is the why-path affordance (covered in §6.3) — every card needs a one-click path to its reasoning, or the cards become magic and trust corrodes.

### Cell 3: Inline assist (embedded, user-initiated)

GitHub Copilot, Cursor tab completion (the tab, not the chat panel), Notion AI's slash command, Coda AI blocks, Sublime's intelligent autocomplete, Grammarly. The host UI is the existing one — code editor, document, spreadsheet. The AI inserts itself at the cursor, the user invokes it, the AI completes.

The defining discipline of Cell 3 is **latency budget** — usually sub-100ms for tab completion, sub-300ms for slash-command-style invocation. *[Practitioner consensus]* Below that threshold the feature is "magic." Above it, it's "annoying." Cursor's tab completion, at around 50–80ms, is the canonical "this changed how I write code" experience. Copilot in 2022–2023, at 300–800ms, was widely considered worse than nothing for routine completions — users turned it off because the suggestion arrived after they'd already typed past it.

Cell 3's trust contract is *tight cycle* — the user evaluates suggestions in milliseconds and accepts or rejects them inline. No deep verification. Which means the model has to be *almost always right*, not "right often enough." A 70% Cell 3 accuracy rate is a disaster. A 70% Cell 2 accuracy rate is fine if the why-path is good.

Cell 3 is the only cell where latency is the dominant constraint. Everywhere else, latency is a hygiene factor; here it's the load-bearing wall.

### Cell 4: Notification agents (embedded, AI-initiated)

Reflex AI's slack alerts, Triple Whale's anomaly notifications, Linear's auto-triage, churn-intelligence tools' inline flags, security monitoring platforms (Wiz, Snyk), Shopify Sidekick's contextual prompts inside the merchant admin. AI pushes a finding into the user's existing surface — slack, email, the host product's notification rail. The user wasn't asking; the AI decided it was worth interrupting.

This is the **attention allocation** frontier. The trust contract is the most fragile in the matrix: every false-positive erodes trust on a one-way ratchet. Once users have ignored two Cell 4 notifications in a row, they ignore the third by default. *[Practitioner consensus]*

The discipline is **temporal posture** (the urgency-weighted classification of every notification): is this *act today*, *matters this week*, *background context*? Cell 4 features that don't classify their own outputs by temporal posture turn into alert fatigue inside a quarter. The successful Cell 4 products under-fire deliberately and present each fire with a clear posture: red is rare, yellow is contextual, green is for the digest.

Cell 4 is the cell most likely to ship with the wrong default: "let's alert on every anomaly." The right default is "let's alert on the 5% of anomalies that genuinely require action and demote the rest to the daily digest."

### Cell 5: Configured automation (background, user-initiated)

Zapier AI Actions, Make.com AI nodes, n8n's AI blocks, Airtable automations with LLM steps. The user configures triggers and pipelines; the AI runs in the background as a step in the pipeline. The user initiated by *building the rule*, not by issuing the request each time.

This is the **honest "not really AI"** cell — it belongs on the map because it's where most "AI" inside enterprise workflow tools actually lives, but the LLM is doing a deterministic transformation inside a deterministic pipeline. There's not much cognitive contract with the user at all once the rule is built. The risk profile is: the LLM step silently breaks (input drift, output format change, model behavior shift) and the pipeline keeps running with garbage output until somebody downstream notices.

Discipline for Cell 5 is **state ownership** and **silent-failure detection**: who owns the inputs/outputs that pass through the LLM step, and how do you know if the LLM step degrades over time? Most Cell 5 implementations have no answer to the second question. The fix is the schema-validation-as-drift-signal pattern from [post 13](https://killdate.dev/posts/13-drift-detection).

### Cell 6: Autonomous agents (background, AI-initiated)

Devin, OpenAI Operator, MultiOn, browser-use agents, AutoGPT and its descendants, the agentic coding workflows of 2025–2026 that run for an hour and report back. The AI plans, the AI executes, and the user receives a result (or a question, or a failure) at the end.

This is the **most contested** cell. Trust is hardest here because the user has handed over both the *what* and the *how* — they're trusting the model to decide what actions to take and execute them. When the model makes a mistake, the mistake has already happened by the time the user sees it. The cancel affordance — *the user's ability to stop the agent mid-execution* — is the single most important UX primitive in this cell.

Devin's first six months in 2024 are the canonical case. Highly autonomous, low cancel-affordance — users had to wait for the agent to "finish" before they could intervene, and "finish" sometimes meant "delete the repo." *[Author's read]* The lesson the industry has slowly absorbed: autonomy must be ratcheted up, with each step's reversibility verified, before you let the agent act on production state.

The discipline in Cell 6 is **leash-loosening**: start with propose-only, move to pre-stage-with-approve, move to execute-with-cancel-window, move to fully-autonomous-with-rollback. Skip steps and you're shipping Cell 6 on hard mode.

### The disciplines that vary per cell

The same three disciplines change shape across all six cells. The matrix is most useful when you read these tables top-to-bottom: pick your cell, pick the row that corresponds to it, that's the contract you owe your user.

**Trust contract — what the user is trusting the AI to do, and what they expect when it's wrong:**

| Cell | Trust contract | Failure recovery |
|------|----------------|------------------|
| 1 — Chat-primary | "Be useful, I'll verify" | User catches errors in conversation |
| 2 — Recommendation-dense | "Be right enough that scanning is worth it" | User skips or rejects with reason |
| 3 — Inline assist | "Be almost always right at sub-100ms" | User declines suggestion silently |
| 4 — Notification agents | "Only interrupt me when it matters" | User mutes channel / disables |
| 5 — Configured automation | "Do what I told you, every time" | Silent breakage → downstream incident |
| 6 — Autonomous agents | "Don't break my world while I'm not watching" | Cancel mid-run, rollback after |

**Latency budget — what the user expects in terms of response time:**

| Cell | Latency budget | Why |
|------|----------------|-----|
| 1 | 1–5s OK, streaming preferred | User is composing, willing to wait |
| 2 | Pre-computed (cached) | User expects the surface to be ready when they arrive |
| 3 | <100ms tab, <300ms slash | Inline = no patience |
| 4 | Real-time at trigger | Interruption requires immediacy |
| 5 | Pipeline-bound | User isn't watching |
| 6 | Minutes to hours acceptable | User isn't watching, but cancel must be <1s |

**UX vocabulary — what affordances the user pattern-matches against:**

| Cell | Native UX patterns |
|------|---------------------|
| 1 | Chat thread, conversation history, regenerate |
| 2 | Cards, dashboards, accept/reject, why-path |
| 3 | Ghost text, accept-with-tab, completion popup |
| 4 | Toast, slack message, badge, digest |
| 5 | Flow builder, trigger config, log inspector |
| 6 | Job queue, cancel button, audit log, rollback |

**Why this matters.** When you occupy two cells with one feature, you're inheriting *both* disciplines. A Cell 2 surface that also exposes Cell 1 chat (recommendation dashboard with a chat refinement panel — Triple Whale's main pattern, Shelf's roadmap) has to honor both the cached/pre-composed latency budget of Cell 2 *and* the streaming/conversation-history UX of Cell 1. Inheriting two disciplines is not "twice the work" — it's an integration design problem you have to think through.

### Hybrid and sequenced multi-cell patterns

The cleanest products occupy one cell. The most powerful occupy two or three. There are two ways to do this.

**Simultaneous multi-cell** — the product occupies two cells at the same time, presenting both surfaces to the user concurrently. Triple Whale's dashboard (Cell 2) with their Sidekick chat (Cell 1, integrated) is a simultaneous multi-cell. Linear's auto-triage (Cell 4) plus AI issue briefings (Cell 2) is another. The discipline question is: do the two cells serve different user jobs (good — recognition and refine) or compete for the same job (bad — confused product)?

**Sequenced multi-cell** — the product walks the user through different cells across the arc of a use case. Granola is the cleanest example: during a meeting it operates in Cell 6 (background autonomous note-taking), immediately after the meeting it presents Cell 2 (recommendations, action items, summary cards), then optionally users move into a Cell 1-ish chat to refine specific bits. *[Author's read]* The user experience is one coherent flow but it spans three cells; each cell honors its own discipline as the flow moves through it.

I'll coin **sequenced multi-cell** as a pattern explicitly because I haven't seen it named elsewhere and it's worth a label. *[Author's read]* The pattern is: identify the temporal arc of your user's job (before / during / after), and put each phase in the cell whose discipline best fits that phase. Don't try to make Cell 1 carry the whole job. Don't try to make Cell 6 carry it either.

### The matrix as a forcing function

Use the grid as a product decision tool. Whenever someone proposes an "AI feature," the first question is: **which cell is this in?** If they can't answer, they haven't thought it through. If they answer "all of them," they're shipping a chat sidebar and calling it omnichannel.

When teams skip this question, the failure mode is consistent: they ship "AI features" that violate their own cell's contract. Half-baked Cell 1 chat next to half-baked Cell 2 recommendations, neither trusted because neither honored its own discipline. Cell 4 notifications without Cell 4's temporal posture, becoming alert fatigue. Cell 6 agents without Cell 6's cancel affordance, becoming risk theatre. The matrix doesn't tell you what to build — it tells you what discipline your build has to honor once you've chosen.

**On Shelf:** Shelf's primary surface is Cell 2 — a daily briefing of competitor and category signals composed by the LLM into recommendation cards (price moves, promo launches, inventory velocity, new SKUs). When the Shopify Sidekick MCP integration (Model Context Protocol — Anthropic's standard for letting LLMs call external tools as functions) ships, Shelf adds Cell 4: Sidekick can pull Shelf's data and post embedded findings into the merchant admin. Two cells, simultaneous multi-cell, two disciplines honored. The recommendation surface keeps its cached-card latency and why-path affordances; the MCP exposure keeps Cell 4's temporal-posture filter so Shelf never becomes the app the merchant mutes.

---

## Three postures over one data substrate

Inside Cell 2 — the recommendation-dense cell where most operator SaaS lives — there's a sub-pattern worth naming. The same underlying data layer can be exposed to the user in three different postures depending on what they're trying to do.

**Compressed observation** — the data layer is summarized into scannable artifacts. Cards, briefings, badges, alerts. The user is *recognizing*. The cognitive task is: "scan, decide what to look at, move on." Information density is high; cognitive effort per item is low. This is what most users want most of the time. It's also the lowest willingness-to-pay posture — observation feels like *information utility*, which historically commands $0–30/month subscriptions before users push back on price. (Bloomberg terminals are the exception, not the rule; most users compare observation tools to free or near-free alternatives.) *[Author's read]*

**Tool-exposed reasoning** — the data layer is made available to a live agent through MCP-style tools (callable functions the LLM uses to query the substrate during a conversation). The user is *exploring*. They have a question, they want the model to dig into the data with them, they want to see the model's reasoning as it queries different cuts. This is the chat-with-grounding shape. Willingness-to-pay here is hard to monetize directly — it tends to be a feature that increases retention on a product whose monetization is anchored to observation or action.

**Action drafting** — the data layer is the input to a model that *composes objects* — a discount draft, a campaign brief, a vendor outreach email, a PR draft, a tagging rule. The user reviews the draft, edits, approves, and the system commits the action. The user is *doing*. This is the highest willingness-to-pay posture: a draft that saves the user 30 minutes of work is worth $50–500/month depending on the labor it replaces. Most of the defensible monetization in operator AI lives here. *[Practitioner consensus]*

The user picks the posture *they're in*, not the app. They scan when they have 30 seconds; they explore when they have 5 minutes; they draft-and-approve when they have 15 minutes and a real decision to make. Good operator AI gives the user fluid movement across all three over the same data — observation links to exploration links to drafting, no context loss between them.

Each posture has different failure modes: observation fails by surfacing noise, exploration fails by hallucinating against ungrounded queries, action drafting fails by committing actions the user didn't actually approve. Each requires different test discipline: observation needs golden-card-set evals, exploration needs conversation-arc evals, action drafting needs *human-in-the-loop verification at commit time* and a reversibility test on every action class.

**On Shelf:** Shelf has all three postures in flight at different stages. Compressed observation is live — daily briefing cards with discount, inventory, and category signals. Tool-exposed reasoning is in QA — a Sidekick-grounded MCP that exposes `get_market_snapshot`, `get_promotional_history`, `get_competitive_landscape`. Action drafting is on the V4 roadmap — drafted discount responses ("competitor X dropped to $39, draft a 24-hour 15%-off counter for SKU Y?") with merchant approval before commit. Same data substrate, three exposure modes; different evals, different cards, different monetization shape per posture.

---

## Per-feature intelligence, grounded chat underneath

This is the load-bearing architectural section. The shape I'm arguing for, against the chat-everywhere reflex.

### The architectural shape

Three layers, not one:

1. **The data substrate** — the facts your product captures. The crawls, the API integrations, the structured database, the historical time series. The thing that compounds with every day the product runs. This is built once, refined continuously, and lives independently of any specific AI feature.
2. **Per-feature intelligence surfaces** — discrete features that expose AI-composed output at the right point in the user's workflow. A briefing card on the dashboard. A draft button next to a discount field. A badge on a product row. Each feature picks one of the three postures from §5 and honors that posture's discipline. Each feature has its own eval, its own latency budget, its own failure mode.
3. **Grounded chat** — a single chat surface that sees the same data substrate and has access to the same composition primitives the per-feature intelligence uses. Chat is *underneath* the features, not parallel to them. It exists for refinement and reference (defined below). It does not exist to be the front door.

The architectural commitment is this: the data substrate is built once and treated as the durable asset. Per-feature intelligence surfaces are exposures of that substrate, designed per surface, tested per surface, monetized per surface. Grounded chat is the connective tissue, not the product.

The opposite shape — the one most teams default to — is: build a chat surface, hook it up to the data, ship it as "AI." That collapses all three layers into one. The data substrate becomes implicit. The per-feature intelligence is replaced by "ask the chat." The chat is the entire product. And the user is back in recall mode for every interaction.

### Per-feature intelligence: picking the right exposure per feature

Each feature in your product is a different user job at a different surface. Each one picks one of the three postures (observation / exploration / action) and exposes AI accordingly. Not every feature needs the same intelligence type, and not every surface needs intelligence at all.

The decision logic is: **what's the user's job at this surface?**

- If the user is *scanning* and needs to know what's important — ship compressed observation. Linear's issue summary at the top of a long thread is observation. Shelf's daily briefing cards are observation. The user wants the summary; the AI's job is to compose it well.
- If the user is *acting* and needs help composing an artifact — ship action drafting. Linear's duplicate detection that *proposes the merge* is action drafting. Notion's "draft an email about X" is action drafting. The user wants a starting point; the AI's job is to produce one that's 80% right.
- If the user is *typing* and the next few characters are predictable — ship inline assist (Cell 3). Notion's autocomplete is inline assist. The user wants the cursor to move forward without manual typing.
- If the user is *deciding* and needs more context than a card can carry — *that's* where grounded chat comes in. The user has a specific question; the chat surface lets them ask it without leaving the context. Refine and reference, not compose-from-scratch.

The discipline is feature-by-feature. Don't try to make one AI feature do everything. Don't ship a chat sidebar to cover for not having thought through which surface needs which posture.

### The grounded chat layer: refine and reference, the only two jobs

Chat has two legitimate jobs in operator SaaS. Anything else and chat is doing the wrong work.

**Refine** — the user got a recommendation from a card or a draft from an action surface, and they want to tune it. "Make the discount narrower." "Only target customers who bought in the last 30 days." "Tone down the email." The user starts from the AI's output and adjusts. Chat is the tuning interface for AI that already composed.

**Reference** — the user wants to ask a question about something on screen. "Why did you flag this competitor?" "What's the historical price range for this SKU?" "Who else in my category ran this promo last quarter?" The chat sees what's on screen, can address entities by ID, can pull from the same substrate the UI does, and answers grounded in the data the user is already looking at.

Both jobs assume **the chat is grounded**. Grounded means: the chat session has explicit context about what surface it was opened from, what entities are on screen, what filters are active, what the user just did. It has access to the substrate (not just to a vector store of marketing copy). It can address objects by ID and propose mutations to them, not just describe them in text.

A chat that doesn't have these properties is a chat that imitates Cell 1 inside an operator product. It compounds the cognitive cost without adding the value, because the user can't ask anything that *actually references their data*.

### The why-path affordance

Every AI-composed recommendation must have a clickable path to its reasoning. Source data, model inputs, what the model said, what would change the recommendation if the inputs changed. Linear's "why is this a duplicate" expansion is the canonical example — a one-click drill-down from the AI's claim to the evidence. Without the why-path, every recommendation is a black box. The user has to *trust the AI on faith* rather than *verify the AI on demand*.

The why-path is what converts "AI says yes" into "AI says yes because of A, B, and C — and here's the threshold that would flip the answer." That's the difference between a recommendation users come to rely on and a recommendation users come to ignore.

What a good why-path includes:
- **The inputs the model saw** (data fields, time window, comparison set)
- **The fact pattern** (numeric: "competitor dropped 18%"; qualitative: "first promo in this category this quarter")
- **The reasoning step** (model's compressed argument, 1–3 sentences)
- **The sensitivity threshold** (what change in inputs would flip the answer)

The fourth one is the rarest and the most valuable. "If competitor inventory drops below 20 units, we'd flag this as low-stock-fast-mover instead of routine restock" tells the user not just *why* but *what they're now watching for*. That converts a one-time recommendation into a piece of ongoing operational knowledge.

The reason the why-path is worth the engineering effort is that **trust is the bottleneck on adoption** in Cell 2. Users don't accept recommendations because they're well-composed; they accept them because they can verify the composition is sound. The why-path is the audit primitive. Without it, the recommendation surface decays. With it, the substrate gets more valuable the longer the user uses the product.

### The rejection capture

When the user disagrees with a recommendation, that disagreement is the most valuable signal in the entire AI system. It tells you *exactly* where the model is wrong, on what kind of input, with what kind of reasoning. Capture it correctly and you have a training set. Capture it badly and you have nothing.

The UX pattern is: one click + reason chip + optional text. Three components, in this order:

1. **One click** to dismiss/reject. No modal. No 3-step flow. The user is in the middle of running their business; if rejection is a chore, they'll stop rejecting and just ignore.
2. **Reason chip** — a short list of taxonomized reasons. "Not relevant to my store." "Already handled." "Wrong category." "Bad timing." "Already considered, decided no." Five to seven reasons, picked by domain. The chip is *one click after the reject*, presented as a small popup.
3. **Optional text** — a short free-form field for the cases the taxonomy doesn't cover. Most users won't fill it in. The 10% who do are giving you golden data.

The data structure on the backend is a `rejection_events` table with these columns: `event_id`, `user_id`, `recommendation_id`, `surface`, `reason_chip`, `free_text`, `timestamp`, `recommendation_payload_json`. The payload JSON is the critical column — store the *entire recommendation* including the model's reasoning and inputs at the time of rejection. You need the model's claim and its supporting evidence to debug the rejection later.

This feeds the eval pipeline (§8) in two ways:
- **As negative examples** — each rejection-with-reason becomes a test case the system has to *not* generate the same recommendation against the next time inputs match.
- **As taxonomy of failure modes** — aggregate by reason chip and you see where the model is systematically wrong. "70% of rejections this quarter are 'wrong category.' We have a category-classification problem upstream of the recommendation." That's an actionable diagnostic.

Most teams capture rejection as an anonymous thumbs-down. No reason, no context, no payload. That's noise — you can count it but you can't act on it. The reason chip and the captured payload are what convert disagreement into engineering input.

### Deep-link plumbing

This is the section builders should screenshot. The wiring contract between per-feature intelligence and grounded chat is what most teams botch — and what most "we added an AI chat" launches fail to honor.

Four invariants. All four matter. Drop any one and the architecture leaks.

**1. Chat knows what's on screen.** When the user opens chat from a card, a draft, or a screen, the chat session is initialized with the *context* of the surface: which entity, which view, which filters, which time range. The user shouldn't have to retype "the discount campaign on SKU 12345 from yesterday" — the chat already has that context.

```ts
// At chat session open, on the surface side:
const session = chat.open({
  surface: "discount_draft",
  entity_refs: [{ type: "discount", id: "disc_8a3b" }],
  context: {
    related_entities: [{ type: "product", id: "prod_12345" }],
    active_filters: { time_range: "last_7d", category: "skincare" },
    last_recommendation_id: "rec_9c2d"
  }
});
```

**2. Chat addresses entities by ID, not by pasted text.** When the chat refers to "the discount" or "competitor X" in its response, it's holding a reference to the entity in the substrate. Outputs that reference entities should carry IDs so the UI can render them as live links. The UI then knows when an entity is being talked about and can highlight, navigate, or update it in place.

```ts
// Chat response carries entity references:
{
  text: "I'd narrow the audience on [discount:disc_8a3b] — only [segment:seg_42] has shown intent in [category:skincare].",
  entity_refs: [
    { token_pos: 22, type: "discount", id: "disc_8a3b" },
    { token_pos: 48, type: "segment", id: "seg_42" },
    { token_pos: 64, type: "category", value: "skincare" }
  ]
}
```

**3. UI receives chat's output as state changes, not just rendered text.** When the chat proposes "narrow the discount to skincare buyers," the UI gets a structured mutation — a *proposed change* to the discount object — that the user can preview and accept. Not just a string the user has to manually re-enter into a form. Chat is composing the action; the UI is committing it.

```ts
// Chat proposes a mutation, UI receives:
{
  type: "proposed_mutation",
  target: { type: "discount", id: "disc_8a3b" },
  changes: { audience_segment: "seg_42" },
  rationale: "Narrows to category-intent buyers; expected revenue lift 12%",
  reversible: true
}
// UI renders a "Preview and accept" affordance.
```

**4. Chat retains memory across the UI session.** When the user clicks from chat to a card to a different card and back to chat, the chat session retains the *history of what's been discussed* — including which entities have been referenced and which mutations have been proposed. Stateless-per-page chat is unusable in operator software because the user's workflow spans pages.

These four together are the chat-grounding contract. Build them; the chat layer adds compounding value. Skip them; the chat is a sidebar with a textbox.

### State passing across the UI ↔ chat boundary

When the user clicks a deep link from chat (chat said "look at [discount:disc_8a3b]" and the user clicked it), three patterns are valid. Pick one per surface; don't mix.

- **Continue-with-context** — the chat session stays open, history is preserved, the new entity is added to the active context. Best for refinement workflows where the user is iterating on a single decision. The user is asking follow-up questions about the entity they just navigated to.
- **Branch** — a new chat thread starts, with the parent chat preserved as a sibling. Best when the user is exploring a tangent and might want to come back. The UI shows breadcrumbs across threads.
- **Reset** — the chat closes (or clears) when the user navigates. Best for low-stakes navigation where the chat was just a momentary reference, not an ongoing collaboration.

Race conditions to expect:

- **Entity updates while chat references it.** The user is chatting about discount X. Another tab (or the underlying data refresh) updates discount X. The chat's references are now stale. Pattern: the chat fetches entity state on every reference resolution; cache only within a single response.
- **Stale context after page navigation.** The user moves from the dashboard to a settings page. The chat's "active context" was the dashboard. Pattern: clear active filters from chat context on navigation; preserve entity refs but not view-specific filters.
- **Optimistic mutation race.** The chat proposes a mutation; the user accepts. The UI commits optimistically. The backend rejects (permissions, state conflict). Pattern: the UI rolls back with a clear surface message; the chat surfaces the rejection in-thread so the user sees both the proposal and the result.

### Anti-patterns: what most teams get wrong

Each of these is a real pattern I've seen ship. Each has a concrete fix.

- **Chat that doesn't see the screen.** Chat opens with no context; user has to retype what they're looking at. *Fix: pass entity refs and active filters at session open. Make session-open the only path to chat.*
- **Recommendations without why-paths.** The card says "we recommend X." No drill-down. No source data. *Fix: every recommendation has an expandable detail with inputs, reasoning, and sensitivity threshold. Engineering effort is real; trust without it is impossible.*
- **Rejection captured as anonymous thumbs-down.** A single up/down with no reason and no payload. *Fix: reason chip + captured recommendation payload. The reason chip taxonomy is product work, not engineering work — domain people draft it.*
- **Deep links that paste text instead of mutating state.** Chat says "here's a draft email," and clicking the deep link drops a string into the email field — but no entity reference, no proposed-mutation structure, no preview. *Fix: structured proposed mutations with reversibility metadata. UI renders the preview and the accept affordance.*
- **Chat memory that resets per page.** User navigates between cards; chat history disappears. *Fix: chat session ID lives in the user's UI session, not per-page. History persists across navigation.*

### A structural example

Putting it together — what the actual data flow looks like, schema-sketch style.

```
   Data substrate (Postgres / time series)
         │
         ▼
  ┌───────────────────────────┐
  │ Per-feature composition   │  (LLM, with structured outputs,
  │  (Layer 4 — the prompt    │   schema-validated, rejected if drift)
  │   that produces cards,    │
  │   drafts, badges)         │
  └─────────┬─────────────────┘
            │
            ▼
   recommendation_events  ◄────── why-path JSON, inputs JSON
            │
            ▼
   ┌────────┴─────────┐
   │   UI surface      │   (cards, drafts, badges)
   │                   │   ◄── reject_button → rejection_events
   └────────┬──────────┘                       │
            │                                  ▼
            │ click → chat.open(context)   eval pipeline
            ▼                                  ▲
     ┌──────────────────┐                      │
     │ Grounded chat    │── proposed_mutation ─┤
     │   (entity refs,  │── why_path_lookup ───┤
     │    history)      │                      │
     └──────────────────┘                      │
                                               │
                              (negative examples + per-reason aggregation)
```

The substrate is the durable asset. The composition layer is where prompts live, drifts get caught, and evals are scored. The recommendation events table is what feeds rejection capture and eval input. Chat is plumbed *across* surfaces with entity refs and proposed mutations as the structured outputs, not as free text.

**On Shelf:** Shelf's architectural shape follows this exactly. The substrate is the crawler output (Layer 0 raw HTML, Layer 1 structured products + discounts, Layer 2 cross-merchant signals, Layer 3 enriched competitor profiles). The composition layer is the Layer 4 prompt that produces briefing cards (Pydantic-validated structured output — Pydantic is the Python data-validation library used to enforce typed schemas on LLM responses). The cards are the per-feature intelligence (compressed observation). The grounded chat layer is the Sidekick MCP integration in QA — chat sees the substrate via tool calls like `get_market_snapshot`. V4 adds action drafting (discount drafts with merchant approval). Each surface has its own eval rubric; the substrate compounds; chat is the connective tissue, not the front door.

---

## Recommendation density has a ceiling

If every surface in your product is a recommendation, none of them feels important.

This is the under-appreciated failure mode of the recommendation-dense paradigm. Once you've gotten good at composing cards from the substrate, the temptation is to compose more of them — fill every empty rail, surface every signal, populate every section. The dashboard becomes a wall of AI cards. The user opens it, scans, sees twenty things, scans again, sees twenty different things tomorrow. The signal-to-noise ratio is fine in isolation. The *signal-to-attention* ratio is broken.

The discipline is **temporal posture**: every card gets a classification — *act today*, *matters in the next two weeks*, *background context*. Surfaces respect that classification. A `act today` card gets high visual weight, top of the surface, possibly a notification. A `background context` card gets a single line in a digest section. The dashboard's *visual weight* must track the card's *signal weight* or the user develops the skip-the-AI-cards reflex inside two weeks and the surface dies.

Concrete examples of who got this right and who got it wrong:

- **Linear got it right.** Linear ships AI features selectively — issue summarization, duplicate detection, auto-triage. They are *not* on every surface. Issues without history don't get summaries. Issues without near-duplicates don't get duplicate warnings. The features fire when they have signal and stay quiet when they don't.
- **Many B2B SaaS got it wrong.** Half the major B2B SaaS products shipped an "AI Insights" tab in 2024–2025 that nobody opens. The tab tries to surface "insights" against every entity in the data. Most of the insights are obvious, irrelevant, or duplicative of what the user already knows. Users open the tab once, scan, never come back.
- **Mercury and Ramp deliberately under-recommend.** Banking-adjacent products have strict trust contracts — a wrong recommendation about company spending or a wire transfer is materially worse than a missing recommendation. So they ship *fewer* AI features, with higher confidence thresholds, with more conservative posture. *[Practitioner consensus]* This is the right design call even if it feels like under-shipping from a product-marketing perspective.

The general principle: **operator software's surface real estate is a budgeted resource.** Each card spends budget. Cards that don't earn their visual weight are net negative — they spend attention you'll need for something more important next week. Selectivity in composition is the discipline. Don't ship a card just because the substrate has data for one. Ship a card when the substrate has *signal*.

**On Shelf:** Shelf's briefing surface uses a three-tier posture (`act_today`, `this_week`, `background`). Each card carries an explicit posture in its Pydantic schema. The dashboard renders the act-today tier as full cards, this-week as a condensed strip, background as a "more" expansion. The Layer 4 prompt is instructed to *prefer silence over noise* — empty briefing days happen and that's fine. The visible signal that the surface is selective is what makes the days with signal worth scanning.

---

## The eval pipeline is the moat, not the model

The defensible asset in applied AI for operator software is not the model. It's the eval pipeline (the system that grades AI output against rubrics, golden datasets, and rejection signals).

The reasoning has three steps. *[Author's read]*

**Step one — models commoditize.** GPT, Claude, Gemini, Llama, smaller open-weight models — they leapfrog each other every six months. The frontier model in 2026 is not the same as the frontier model in 2024. If your defensibility is "we use Claude," your defensibility is on a 12-month decay schedule.

**Step two — the per-category eval set doesn't commoditize.** The thing that compounds is *your domain-specific golden dataset of how the AI should and shouldn't behave on your data*. Red-room cases (adversarial inputs designed to trigger known failure modes). Conversation arcs (multi-turn exchanges the model has to navigate correctly). Per-feature rubrics (the 10–20 dimensions a card or draft is scored against). Production rejection logs (the user-disagreement data feeding back into the test set). Competitors can hire your engineers. They can copy your UI. They cannot recreate two years of category-specific evals built from your users' rejections.

**Step three — evals let you swap models without your product getting worse.** If you can score model A against your evals at 87% and model B at 91%, you can swap with confidence. If you can't score, you can't swap — and every model upgrade becomes a vibes-based regression risk. Teams without evals are stuck on whatever model they happened to ship on, because they can't tell whether changing it would degrade their product. Teams with evals can ride the commoditization wave instead of fighting it. **Model commoditization helps you instead of killing you, but only if you have the evals to take advantage of it.**

What an eval pipeline contains, concretely:

- **Golden dataset** — a curated set of inputs with known-correct outputs (or output ranges). Versioned alongside the prompt. Updated when the spec changes.
- **Red-room cases** — adversarial inputs the model has historically failed on. Each case has a known failure mode label.
- **Conversation arcs** — for chat-grounded surfaces, multi-turn test cases that simulate a user refining or drilling into a recommendation. Tests that context is preserved, that entity refs resolve correctly, that proposed mutations are accurate.
- **LLM-as-judge scoring** — a separate model (often the same family, different prompt) grades each output against a rubric. The rubric has 5–20 dimensions per feature; each dimension is a 1–5 scale; the per-output score is the dimension-weighted average.
- **Schema validation as drift signal** — every output passes through strict schema validation; rejections are logged with field-level detail. See [post 13](https://killdate.dev/posts/13-drift-detection).
- **Rejection feedback loop** — production rejections (with reason chips and payloads, per §6.4) flow back into the golden dataset as negative examples or new test cases.
- **CI gating** — prompt changes can't ship unless the eval suite passes a minimum score. Major model swaps run the full suite before any user-facing rollout.

Building the pipeline is unglamorous. It takes longer than you think. There's no demo. There's no launch post. The compounding value shows up two years in, when the substrate of evals lets you swap from Claude Opus 4 to whatever-comes-next without your users noticing — except that the product got faster and cheaper to run.

**On Shelf:** Shelf's eval stack lives in `feature-builds/_red-room/` and `devops/validation/`. There are 47 red-room cases as of this writing — adversarial inputs that historically tripped the Layer 4 prompt (spurious discount detection on shipping promos; confused merchant identity when a competitor sells the same SKU; verbosity drift on long product histories). Conversation-arc tests cover the Sidekick MCP integration (does the chat resolve entity refs correctly across three turns? does context persist when the user navigates between cards?). Claude-as-judge rubric scores cards on 13 dimensions including signal strength, novelty, actionability, calibration of certainty, and freshness annotation. Schema validation runs at strict mode on every Layer 4 output. Rejection events feed back through a weekly batch into the negative-example set. The pipeline is more code than the prompt is. That's the point.

---

## Failure modes per cell

One predictable failure mode per cell. A builder uses this section to predict their own failure *before* shipping — if the failure description matches your roadmap, slow down.

**Cell 1 — Chat-primary applied to operator work.** The dominant failure is cognitive-mode mismatch. The user shows up wanting to scan, the product hands them a textbox, the user composes one query, the response is OK, the user does the math on whether composing query #2 is worth it, decides no, leaves. Many casualties; almost every B2B SaaS that shipped a chat sidebar in 2024 is here. The diagnostic signal: low session count per user, low queries per session, high time-since-last-use. The fix: replace the chat with composed cards. Keep the chat as a refinement layer underneath. *[Practitioner consensus]*

**Cell 2 — Recommendation-dense without rejection capture.** The recommendations are fine for the first month. They drift in the second month — the model's interpretation shifts as input distribution evolves. There's no rejection capture, so the team can't tell where the drift is. The team can't fix it because the team can't measure it. Users develop the skip-the-AI-cards reflex. Surface dies quietly. Diagnostic signal: high impression count, low click/expand rate, no rejection telemetry to investigate with. The fix: §6.4 — capture rejections with reason chips and full payloads, route to eval pipeline.

**Cell 3 — Inline assist without latency budget.** The model is right when it answers, but it answers too slowly. The user has already typed past the suggestion by the time it arrives. The user disables the suggestion stream. Copilot pre-2024 lived here and lost market share to Cursor in 2024–2025 specifically on this dimension. Diagnostic signal: high reject rate, high time-to-suggestion, low acceptance even on correct suggestions. The fix: smaller model on the hot path; better prefix caching; suggestion debounce tuning. Latency is the entire game. *[Practitioner consensus]*

**Cell 4 — Notification agents without temporal posture.** Every signal becomes a notification. Users mute the channel inside two weeks. Once muted, they don't unmute. The single most damaging Cell 4 failure mode because it's a one-way ratchet. Diagnostic signal: per-user notification volume on a 7-day window, mute rate, time-to-mute. The fix: classify every notification by temporal posture before firing; under-fire by default; demote anything that's not *act today* into a daily digest.

**Cell 5 — Configured automation without state ownership.** The pipeline was set up six months ago. Inputs have shifted, but the LLM step doesn't fail loudly — it produces plausible-looking output that's silently wrong. Downstream systems consume the wrong output for weeks before a human notices. Diagnostic signal: there is none, by design — that's the whole problem. The fix: schema validation on every LLM step output; nightly drift check against the golden fixture; alarms on schema-rejection-rate increases. See [post 13](https://killdate.dev/posts/13-drift-detection).

**Cell 6 — Background autonomous without cancel affordance.** The agent runs for an hour. The user notices in the first ten minutes that the plan is wrong, but the agent has no way to be interrupted mid-run, and "stopping" requires waiting for the next safe checkpoint that's twenty minutes away. By then the agent has already done irreversible things. Devin's first six months were here. Diagnostic signal: high "cancel attempted" rate, low successful-cancel rate, support tickets describing "had to wait for it to finish." The fix: every action class gets a reversibility classification; the leash starts at propose-only and loosens one notch at a time; the cancel button always returns to a known-good state in under one second. *[Author's read]*

The general principle: **each cell has one dominant failure mode, and shipping in that cell without honoring its discipline gets you that specific failure on a predictable timeline.** Most "AI feature failed" postmortems map cleanly to one of these six.

---

## Evolving across cells without breaking per-cell discipline

Products move between cells as they mature. The trap is moving without bringing the discipline of the new cell with you.

**Pattern: operator surface → embedded extension.** A Cell 2 product on a platform (Shopify, Salesforce, Zendesk) gains the ability to expose itself as Cell 4 inside the platform's native chat or notification surface. Shelf going from its own dashboard (Cell 2) to a Sidekick MCP tool (Cell 4 inside Shopify's native UI) is this pattern. The Cell 2 discipline (composed cards, why-path, rejection capture) stays. The Cell 4 discipline (temporal posture, under-fire-by-default, mute resistance) is added on top. Failing to add Cell 4's discipline turns your product into one of the apps Shopify merchants mute first.

**Pattern: recommendation-dense → background autonomous via slow leash-loosening.** The product starts in Cell 2 — proposing actions, user reviews, user commits. Over time, the product's actions earn enough trust that a subset of them can be pre-staged (Cell 2.5) — the system prepares the mutation, the user has a cancel window, after the cancel window the system commits automatically. Then a further subset becomes fully autonomous (Cell 6) — the system commits, the user reviews after the fact, the system rolls back on user dispute. Each step requires the previous step's data to demonstrate confidence at the rejection rate the new step will need.

The discipline question at every step: **does this action's reversibility justify this much autonomy?** A reversible action (drafting an email saved to drafts; tagging a product; pre-staging a discount as inactive) can move up the leash faster. An irreversible action (sending an email; updating a price live; cancelling an order) needs to stay on the propose-and-confirm leash much longer.

**Pattern: vertical operator → orchestrator-across-tools.** The long-horizon adjacency for operator AI: a vertical operator product (Shelf is a Shopify operator product) that eventually orchestrates *across* the user's tools (Shopify + Klaviyo + Gorgias + ShipBob + Triple Whale). The substrate gets richer because it's pulling from multiple sources. The composition gets richer because it can compose across surfaces. The leash question (which orchestrated actions commit autonomously?) gets harder because actions in one tool can have consequences in another. *[Speculation]*

This is the natural endpoint for a lot of operator AI in 2026–2028: the vertical product becomes the orchestrator of the user's stack inside that vertical. Whether the platform (Shopify, Salesforce, etc.) lets the orchestrator do this, or competes with it, or absorbs it via first-party AI, is one of the live questions of the next eighteen months. *[Speculation]*

**Granola as a worked example of sequenced multi-cell.** Granola occupies three cells across the arc of a single meeting. During the meeting it's in Cell 6 (background autonomous transcription and note-composition, no user attention required). Immediately after the meeting it's in Cell 2 (composed cards: action items, summary, decisions, follow-up suggestions). Optionally, the user opens a chat to refine the summary or ask follow-up questions — Cell 1-ish, but grounded in the meeting's substrate. Each cell honors its own discipline. The Cell 6 component never asks the user for input mid-meeting. The Cell 2 component composes cards in a way that respects the user's post-meeting cognitive load (scan and act fast). The chat refinement is offered, not required. *[Author's read]*

The trap most products fall into is occupying two cells *without* honoring each cell's contract — the chat sidebar that doesn't see the screen, the dashboard that gets noisy because every Cell 4 notification also pollutes Cell 2. Mature products evolve cells one at a time, with the new cell's discipline fully built before users see it.

---

## The Shopify case: what Sidekick changes for app builders

Shopify Sidekick (Shopify's native AI assistant inside the merchant admin) is the cleanest live case study for the multi-cell evolution this essay has been describing. Worth a grounded section.

Sidekick is, for the merchant, a Cell 1 surface inside the Shopify admin. The merchant types questions, Sidekick answers, Sidekick can take actions on the merchant's behalf. From the merchant's perspective it's chat-primary, but with the trust contract calibrated to Shopify's data (the merchant's products, orders, customers).

For app builders, Sidekick changes the game in one specific way: third-party apps can now expose themselves as tools that Sidekick calls, via the `admin.app.tools.data` extension type (Shopify's developer preview MCP-style extension that lets apps register tool definitions Sidekick can invoke during a conversation). When the merchant asks Sidekick a question that the app can answer, Sidekick calls the app's tools, gets the data, integrates it into the response. The app is now reachable from inside Shopify's native chat — Cell 4 in the matrix, embedded and AI-initiated.

Every operator app on Shopify now potentially lives in two cells:

- **Its own dashboard** (Cell 2 — recommendation-dense, separate surface inside the embedded app)
- **Sidekick's tool layer** (Cell 4 — embedded findings inside the merchant admin's native chat)

The discipline question becomes: **which jobs stay in your UI, and which become tools Sidekick calls?** Three rules of thumb. *[Author's read]*

- **Compose surfaces stay in your UI.** Anything that requires scanning multiple recommendations, comparing options, or seeing a dense composed view — the daily briefing, the dashboard, the historical view — belongs in your own Cell 2 surface. Sidekick doesn't have the surface real estate for it and doesn't try to.
- **Specific, on-demand answers go to Sidekick.** "What's my biggest competitor's discount right now?" "How did our category perform last week?" "Is anything urgent in my competitive landscape today?" These are point queries the merchant has when they're in Shopify's admin doing something else. Exposing them as Sidekick tools means the merchant doesn't have to leave the workflow they're in.
- **Action drafts can go either way, but require care.** A draft discount or a draft email that Sidekick proposes on behalf of an app needs the same approval and reversibility affordances as the in-app version. The risk is that Sidekick's chat-first surface skips the why-path that the in-app surface includes — the merchant accepts an action without seeing the inputs that drove it. Apps exposing action-drafting tools to Sidekick need to ensure the why-path travels with the tool result.

The live worked example is Triple Whale's Sidekick partnership — Triple Whale's recommendation engine exposed as Sidekick tools, the merchant getting Triple Whale's marketing intelligence inside the Shopify admin's native chat instead of having to open Triple Whale's separate dashboard. The Triple Whale dashboard is still there (Cell 2, primary surface). Sidekick is the *additional* exposure point (Cell 4). Two cells, two disciplines, one underlying substrate.

Shelf is approaching this transition now. The MCP server exposes four tools to Sidekick: `get_market_snapshot`, `get_promotional_history`, `get_competitive_landscape`, and `get_critical_signals`. The Cell 2 daily briefing stays as the primary surface; Sidekick gets point queries via tools. The merchant gets to choose the posture they're in — scan the briefing when they have time, or ask Sidekick when they're inside the admin handling something else and have a specific question.

The general lesson for operator apps on platforms with native AI: **your dashboard is not going away, but it stops being the only place you live.** The platform's native chat becomes one of your distribution surfaces. Designing for both — without compromising either cell's discipline — is the multi-cell discipline of the next 18 months. *[Speculation]*

---

## What I'd tell you if you were building this tomorrow

The closing posture. The opinionated TL;DR a builder can paste into a doc.

**1. Pick your cell.** Not "build AI." Not "add a copilot." Pick one of the six cells the feature actually lives in. Write it down. If you can't pick — if the feature is "kind of chat, kind of recommendations, kind of automated" — you haven't designed it, you've described a wishlist. Pick the cell and the discipline follows.

**2. Build for recognition, not recall.** Operator users have a job. Their job is not formulating queries for your AI. Compose first. Let the user scan, decide, act. Reserve the recall-mode surface (chat) for the two jobs it's actually good at: refine and reference.

**3. Ship per-feature intelligence with grounded chat underneath.** Each feature picks a posture (observation / exploration / action) and honors that posture's discipline. Chat exists across features as the connective tissue, not as the front door. The data substrate is the durable asset; the features are exposures.

**4. Treat evals as the moat.** Models commoditize on a 12-month schedule. Your category-specific eval pipeline doesn't. Build the rejection capture, build the red-room cases, build the Claude-as-judge rubric. Two years in, the eval substrate is what lets you swap models without your product getting worse. That's the compounding asset.

**5. Evolve cells one at a time.** When you add a new cell (a Sidekick MCP, a Cell 6 autonomous action, a Cell 4 notification stream), build that cell's discipline first. Don't ship the feature into the new cell while still figuring out the discipline. The half-built second cell drags the first cell down with it.

**6. Don't bolt chat onto a SaaS that doesn't need it.** The chatbox is what you ship when you don't know what to build. Knowing what to build — knowing which cell, which posture, which discipline — is the work. The chatbox is the artifact of skipping the work.

The user is running a business. Their attention is the budget. Compose for them. Let them recognize. Let them refine when they need to. Let them reject and learn from the rejection. Let the substrate compound. Let the eval pipeline be the moat.

**Stop bolting chat onto your SaaS. Start building the AI the user's actual job calls for.**
