# Reach plan — killdate.dev

Written 2026-07-19, after reviewing the wp-diagnostic keyword method
(`docs/marketing/blog-keyword-map.md`), the Langmerge content plan, and this
repo's own `seo-keyword-brief.md` (2026-05-20, now partly stale) and
`ideation/ai-seo-analytics/`.

---

## The finding that shapes everything

**The wp-diagnostic keyword method doesn't transfer to this blog.** That method
starts from error strings a user types mid-crisis ("place order button not
working"), verifies each against the incumbent authority's docs, and scores it
on volume × competition × crisis heat. It works because WooCommerce store owners
search for symptoms in a panic.

Nobody searches for "shellware." Nobody searches for "primary surface" or
"recommendations and finished work." These are coined and conceptual — the
search volume is approximately zero and will stay there. Running SERP
verification on them would be theatre.

So killdate.dev's reach does not come from Google keyword targeting. It comes
from three other places, in this order:

1. **AI retrieval** — being the citable source when someone asks an LLM about
   agentic product design. This is the asset we already have and underuse.
2. **Direct distribution** — HN, LinkedIn, the rooms where the audience is.
3. **Google, narrowly** — only on the handful of posts with real query demand
   (the MCP cluster, the how-to material in the playbook).

Keep those separate. Judging an essay by Google traffic will produce the wrong
edits.

---

## What killdate.dev is for (settle this first)

Three documents currently give three different answers: a credibility engine for
inbound work (Langmerge plan), an organic-traffic target (SEO brief), and a link
source pointing at another product (wp-diagnostic §7f). That contradiction is
why there's no coherent measurement.

**The ruling this plan assumes:** killdate.dev is the credibility engine.
Audience is engineers, eng leaders, and peers. Success is being read and cited
by people who might hire or collaborate — not sessions. Products get proven
here; they don't get sold here.

If that's wrong, stop and change it, because everything below follows from it.

---

## The plan — five moves

### 1. Fix the retrieval basics (highest leverage, one afternoon)

Our own research in `ideation/ai-seo-analytics/` found the deciding factor isn't
brand strength, it's whether a page can be read and turned into a confident
recommendation. A well-known brand with unreadable pages lost to an unknown one
with clean pages.

- Add `date` to frontmatter and `datePublished` / `dateModified` to the Article
  schema. Right now nothing tells a crawler whether this is 2023 or 2026 — for a
  blog whose whole claim is *current* practice, that's the worst possible gap.
- `CORE_QUESTIONS` for every new essay, written by reading the post. This is
  already the rule in CLAUDE.md; it just has to actually happen before each ship.
- Add the new vocabulary (shellware, primary surface) to Key Concepts in
  `llms.txt.ts` so the terms are defined where a model will find them.

### 2. Own the vocabulary deliberately

Coined terms are a bet: no existing demand, but no competition either. If
"shellware" catches on at all, we are the definition. That only works if the
definition is unambiguous, in one place, and repeated consistently — the essay,
Key Concepts, and every later mention using the same words.

Track it with one query, monthly: ask a few models "what is shellware?" and see
whether the answer is ours. That's the whole measurement.

### 3. Ship the credibility loop that's already half-built

Three items sit unfinished across two docs, and they're the cheapest reach
available for a dev blog:

- **GitHub profile → blog.** Bio, pinned repos, real repo descriptions (blank
  descriptions read as abandonware), author `Person` JSON-LD with `sameAs`.
- **killdate-kit README → specific posts.** Not a homepage link — deep links to
  the posts that explain each part of the kit. It's the best backlink we control.
- **One HN submission**, on the strongest technical post — the MCP deep-dive
  while that ecosystem is still moving, or Shellware if the essay lands well.

### 4. Two motions, kept separate (from the Langmerge plan)

- **Broadcasting** — the essays and Shorts here; the LinkedIn version of the
  same material pitched at a different altitude. Same raw material, different
  depth. Write once.
- **Engaging** — answering the actual HN thread where someone asked, with value
  and no pitch. Reputation in the room, not traffic.

Hard rules stay: drafts only, a human publishes, no drive-by link drops.

### 5. Google, only where demand exists

Don't retrofit keywords onto essays. Do apply the title rule from the SEO brief
— keyword first, thesis after the colon — to the **playbook** posts, which are
how-tos people genuinely search for. The MCP cluster (posts 9–11) is the one
place where the wp-diagnostic method applies as written: real queries, winnable
SERP, three posts of depth.

---

## Measurement — one number, one review

wp-diagnostic's discipline was a single named number at month 3. The equivalent
here, given the credibility-engine ruling:

**Primary:** do the essays get cited — by an LLM answering a question in this
space, or by a human linking to them? Check monthly. Zero after three months of
shipping means the writing isn't landing, and more posts won't fix it.

**Secondary (thin, but should exist):** GSC is not currently set up. Set it up,
if only to see whether the playbook posts move on their own terms.

Not a metric: homepage sessions.

---

## What this plan deliberately doesn't do

- No keyword map for the essays. There's nothing to map.
- No cadence commitment. The Langmerge plan is right that build documentation is
  "a cheap byproduct of work already being done" — it should follow the work, not
  a calendar.
- No product marketing here. That stays on the product sites.
