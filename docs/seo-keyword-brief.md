# SEO Keyword Brief — killdate.dev

Updated: 2026-05-20

---

## Is this the right focus? Honest take first.

**Partly.** Google organic is a long game for a domain this young. Even perfect titles take 6–12 months to produce meaningful traffic. The site's AI-crawlability setup (llms.txt, llms-full.txt, CORE_QUESTIONS) is actually ahead of most and likely pays off sooner — AI assistants cite specific sources when asked about practical developer workflows, and this site is set up to be cited.

The real lever on Google right now is the **MCP server cluster** (posts 23–25). That topic is actively searched, the domain has three posts on it signalling depth, and it's specific enough that a new domain can actually compete. Everything else is medium-to-long-term.

**What's missing from the current focus:**

- **Backlinks trump titles.** The killdate-kit GitHub repo is your best backlink source. Its README should link to specific posts by name (not just the homepage). A repo with meaningful stars pointing at your domain matters more than any meta description.
- **No post dates anywhere.** Frontmatter has no `date` field, and the Article schema (which you have — good) has no `datePublished`. Google can't tell if this content is from 2023 or 2026. Adding dates signals freshness and helps ranking for time-sensitive queries.
- **Internal linking is probably sparse.** The posts cross-reference each other narratively but likely don't use descriptive anchor text in a way crawlers can parse. "See the [CLAUDE.md post](/posts/02-claude-md-is-your-os)" is worth more than "see [this post](/posts/02-claude-md-is-your-os)".
- **No description date signal.** Descriptions don't affect ranking — they affect CTR. The goal is to make the snippet in Google results compelling enough to click, not to stuff keywords. The site's current voice is good for this; don't over-keyword descriptions.

---

## What crawlers can already see (you're fine on these)

| Signal | Status | Note |
|--------|--------|------|
| `<title>` tag | ✓ | From frontmatter `title` via Base.astro |
| `<meta description>` | ✓ | From frontmatter `description` |
| H1 | ✓ | Post.astro renders `<h1>{title}</h1>` — always in sync with title tag |
| Description as visible text | ✓ | Rendered as `<p class="description">` — Google sees it as body content too |
| Article schema markup | ✓ | `@type: Article`, headline, description, author, publisher |
| Sitemap | ✓ | `@astrojs/sitemap` is wired |
| Canonical URLs | ✓ | Set in Base.astro |

**Gap in schema:** `datePublished` and `dateModified` are missing from the Article schema in Post.astro. Add a `date` field to frontmatter and surface it there.

---

## Title and description changes

**Rule for retaining thematic voice:** put the keyword first, then the punchy thesis after a colon or dash. The site's voice lives in the second half. Don't touch posts where the title already has a specific keyword.

Only the posts where the current title has no searchable signal are listed here. Everything else is fine.

---

### Change: necessary (no keyword in current title)

**`01-stack` — "Technical Knowledge Floor"**
No one searches "knowledge floor." The content is a prereqs and tool stack list.

| | |
|--|--|
| **Before title** | Technical Knowledge Floor |
| **After title** | What you need to know before building with Claude Code |
| **Before desc** | Tools and technologies in active use. The working knowledge base for everything in this series. |
| **After desc** | Prerequisites and active tooling for this series. The baseline knowledge that makes everything else in the playbook make sense. |
| **Target query** | "what do I need to know to use Claude Code" / "Claude Code prerequisites" |

---

**`01-the-tools` — "The broader toolset"**
"Broader" and "toolset" are filler. The actual tools (Claude Code, Cursor) are named in the tags but not the title.

| | |
|--|--|
| **Before title** | The broader toolset |
| **After title** | Claude Code, Cursor, and the AI coding tools in active use |
| **Before desc** | Adjacent tooling for orchestration. What each tool is actually for, where to learn, and what to avoid using wrong. |
| **After desc** | What each tool in the stack is actually for — Claude Code for orchestration, Cursor for implementation — and what to avoid using wrong. |
| **Target query** | "Claude Code vs Cursor which to use" / "AI coding tools for SaaS" |

---

**`04-pre-build-lock` — "Agile development in an AI environment"**
"Agile development" is dominated by Atlassian/Scrum content. No chance of ranking. The content is actually about the Claude Code + Cursor development loop on a live product — which is specific and searchable.

| | |
|--|--|
| **Before title** | Agile development in an AI environment |
| **After title** | The development loop: Claude Code, Cursor, and three environments on a live product |
| **Before desc** | The development loop, the tool boundary, the three environments. How you build features on a live product without breaking what's working. |
| **After desc** | How features move from planning to production with Claude Code and Cursor — the tool boundary, the environment split, and what breaks if you skip the sequence. |
| **Target query** | "Claude Code Cursor development workflow" / "AI development loop live product" |

---

**`09-contract-testing` — "When to test, when not to, and knowing your app"**
No keyword. "Knowing your app" is not searchable. Content covers contract testing and the 90/10 coverage philosophy.

| | |
|--|--|
| **Before title** | When to test, when not to, and knowing your app |
| **After title** | Test coverage strategy for AI-assisted development: the 90/10 rule |
| **Before desc** | Coverage targets are not the goal. Regression protection is. And neither replaces actually understanding what you built. |
| **After desc** | Coverage targets miss the point. This is what regression protection actually looks like in an AI-assisted build — the 90/10 rule, when to skip tests entirely, and what you need to understand about your own app. |
| **Target query** | "test coverage strategy AI development" / "when to write tests Claude Code" |

---

**`12-learning-resources` — "Learning resources"**
Completely generic. No chance against established LLM tutorial sites.

| | |
|--|--|
| **Before title** | Learning resources |
| **After title** | LLM and prompt engineering resources for developers building with Claude |
| **Before desc** | Useful references for getting more familiar with LLMs and prompt engineering. Understanding these transfers directly to stronger agentic work. |
| **After desc** | The references worth reading if you're building agentic systems with Claude Code. LLM fundamentals and prompt engineering — understanding these makes everything else in the playbook click. |
| **Target query** | "best LLM resources for developers" / "prompt engineering learning resources" |

---

**`16-taste-judgment-and-the-ai-partner` — "AI as Reliable Partners"**
Vague. No keyword. No search hook. Content is actually about what humans contribute — taste, judgment, technical intuition — that AI can't replicate.

| | |
|--|--|
| **Before title** | AI as Reliable Partners |
| **After title** | Taste and judgment in AI-assisted development |
| **Before desc** | What humans bring to AI systems — taste, judgment, and technical intuition. |
| **After desc** | What you bring to an AI-assisted build that the model can't: taste, judgment, and the intuition to know when output is technically correct but wrong. |
| **Target query** | "human judgment AI development" / "what humans contribute to AI coding" |

---

**`21-v2-to-v3-learnings` — "The V2 to V3 migration"**
Meaningless without context. V2/V3 of what? Crawlers and humans both skip it.

| | |
|--|--|
| **Before title** | The V2 to V3 migration |
| **After title** | Migrating a production LLM prompt: eval stack, adversarial payloads, Pydantic validation |
| **Before desc** | The real eval stack behind migrating a production LLM prompt on Shelf — a 32-check scoring rubric, a one-way runner, 54 adversarial payloads, Pydantic strict validation, and a hard rule about who can approve prompt edits. |
| **After desc** | *(keep as-is — it's specific and good)* |
| **Target query** | "migrating production LLM prompt" / "prompt eval stack Pydantic" |

---

### Change: recommended (keyword present but not front-loaded)

**`02-claude-md-is-your-os` — "CLAUDE.md / AGENTS.md: pre-build session discipline"**
CLAUDE.md is in the title (good) but "pre-build session discipline" doesn't help. The keyword is the file name itself.

| | |
|--|--|
| **Before title** | CLAUDE.md / AGENTS.md: pre-build session discipline |
| **After title** | CLAUDE.md: how to write the context layer that runs your AI agent |
| **Before desc** | CLAUDE.md isn't a readme. It's the persistent context layer that tells your AI agent who it is, what it's allowed to do, and how to behave across every session. |
| **After desc** | *(keep as-is — punchy, specific, voice is right)* |
| **Target query** | "how to write CLAUDE.md" / "CLAUDE.md best practices" |

---

**`12-prompt-versioning` — "Treat your prompts like code"**
Thesis-first, no keyword. No one searches for this phrase — they search for "prompt versioning" or "how to version prompts."

| | |
|--|--|
| **Before title** | Treat your prompts like code |
| **After title** | Prompt versioning with semver: MAJOR, MINOR, PATCH for production LLMs |
| **Before desc** | Prompts need semver. A wording fix is not the same as a schema change. The MAJOR/MINOR/PATCH/NO BUMP decision tree keeps your prompt history coherent and your migrations safe. |
| **After desc** | *(keep as-is — the decision tree framing is already keyword-rich and specific)* |
| **Target query** | "how to version prompts" / "prompt versioning semver production" |

---

**`23-mcp-servers` — "MCP servers for your build stack"**
"Your build stack" is informal and doesn't index. The high-value keyword is "Claude Code."

| | |
|--|--|
| **Before title** | MCP servers for your build stack |
| **After title** | MCP servers for Claude Code: the ones that help in a production SaaS build |
| **Before desc** | Which MCP servers actually help during a production SaaS build, and how to wire them into Claude Code in one file edit. |
| **After desc** | *(keep as-is — specific and action-oriented)* |
| **Target query** | "best MCP servers for Claude Code" / "which MCP servers to use Claude Code" |

---

### Leave as-is (already keyword-present or brand-specific)

`00-what-is-agentic-orchestration`, `01-the-kit`, `03-canonical-first`, `04-initial-build-scope`, `05-running-the-runbook`, `05-claude-code-vs-cursor`, `06-runbooks`, `07-kill-dates-and-shipping`, `08-testing-90-10`, `10-figma-and-claude`, `11-building-ui-with-ai`, `13-drift-detection`, `17-building-shelf`, `18-remix-route-visualizer`, `19-long-prompting`, `20-langflow-postgres`, `22-vizstack-2`, `24-building-an-mcp-server`, `25-mcp-server-technical-deep-dive`

---

## Cannibalization to manage (without removing posts)

**MCP trilogy (23, 24, 25):** Three posts competing for the same query. Differentiate by naming each one's unique angle explicitly — in the description, not just the title.

- Post 23 → "which ones to use and why" (decision guide)
- Post 24 → "how we built ours in a single session" (case study)
- Post 25 → "FastMCP + asyncpg, step by step" (technical how-to)

The titles already lean this way; make sure the first paragraph of each post also states its angle clearly, since that's what Google surfaces in the snippet.

**Scoping posts (5, 8):** Both about locking scope pre-build. Acceptable overlap since they're for different stages (greenfield MVB vs. live product feature). No change needed — but consider an internal link from post 8 to post 5 saying "for greenfield scope, see [Scoping the MVB](/posts/04-initial-build-scope)."

---

## Three non-title things worth doing

1. **Add `date` to frontmatter and `datePublished` to Post.astro schema.** Without it, Google treats the content as undated. One field in the frontmatter schema, one line in Post.astro's jsonLd object.

2. **Update the killdate-kit README to link specific posts.** The repo is your best backlink. "Learn how to write CLAUDE.md →" pointing at post 3 is worth more than any title change.

3. **Submit the MCP posts to Hacker News.** Post 25 (FastMCP + asyncpg technical walkthrough) is specific, practical, and timely. That's the profile HN technical posts that get traction. It's also the profile that generates backlinks. Do it before the MCP ecosystem matures and there are a dozen posts like it.
