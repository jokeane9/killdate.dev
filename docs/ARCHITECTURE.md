# killdate.dev — architecture

How the site is put together, how to run it locally, and where each kind of
content lives. Written 2026-07-19 alongside the three-section reorganization.

Companion docs: [`publish-checklist.md`](publish-checklist.md) (the steps before
a post ships), [`../CLAUDE.md`](../CLAUDE.md) (working agreements and
constraints).

---

## Running it locally

```sh
npm install          # Node >= 22.12.0 (Astro v6 constraint; CI uses 22)
npm run dev          # dev server — http://localhost:4322
npm run build        # production build into dist/
npm run preview      # serve dist/ exactly as production will
```

The port is pinned to **4322** in [`.claude/launch.json`](../.claude/launch.json)
so agent tooling can start the server the same way every time. Prefer starting
it through that config rather than a bare `npm run dev` in a terminal — it keeps
one server per project instead of several strays on random ports.

### Dev and production differ in one deliberate way

Draft posts (`draft: true`) are **excluded from every collection query in
production** but **rendered on the essays homepage in dev**, via
`import.meta.env.DEV` in [`src/pages/index.astro`](../src/pages/index.astro).
This exists so a whole unpublished series can be reviewed in context — in the
real layout, in reading order — before anything ships.

Consequences worth knowing:

- The dev homepage and the live homepage legitimately differ. That is not drift.
- Draft posts still build their own pages in both environments (Astro renders
  every file in the collection), so a draft URL is reachable if someone guesses
  it. Drafts are unlisted, not secret — don't put anything sensitive in one.
- To see exactly what production will show: `npm run build && npm run preview`.

### When a content edit doesn't show up

Astro caches the content collection in `.astro/`. Frontmatter-only edits —
changing `section`, `group`, `draft` — are **not always picked up by a running
dev server**, so the page keeps rendering the old grouping and you conclude your
edit failed. It didn't. Clear the cache and restart:

```sh
rm -rf .astro && npm run dev
```

Body edits hot-reload fine; it's the frontmatter that goes stale. If a change to
the *structure* of a page seems ignored, do this before debugging anything else.

---

## Stack

- **Astro v6**, static output, no client framework and no view transitions
  (`ClientRouter` causes visual jitter on navigation — see CLAUDE.md).
- **Content collections** with the glob loader, configured in
  [`src/content.config.ts`](../src/content.config.ts).
- **Deploy**: push to `main` → GitHub Actions → S3 sync → CloudFront
  invalidation. Pushing to `main` *is* the deploy; there is no separate release
  step. Work on a branch, merge deliberately.

---

## Layout of the repo

```
src/
  content/posts/*.md      every post, one file each
  content.config.ts       frontmatter schema (the contract)
  layouts/
    Base.astro            shell: head, header/nav, footer
    Post.astro            article chrome: meta line, title, body
  pages/
    index.astro           / — Working Essays (the homepage)
    playbook.astro        /playbook — The Playbook
    prod.astro            /prod — Workshop Notes (hand-written)
    about.astro           /about
    stack.astro           /stack
    posts/[slug].astro    /posts/* — one page per collection entry
    llms.txt.ts           /llms.txt — structured index for AI crawlers
    llms-full.txt.ts      /llms-full.txt — full text + core questions
public/
  styles/global.css       THE served stylesheet (see gotcha below)
```

---

## Content model

### Frontmatter

```yaml
title: string
description: string        # used in the index rows and llms.txt
part: number               # legacy grouping — retained, no longer drives the UI
post: number               # stable global ID and sort key
section: essays | playbook | workshop
group: string              # chapter, project, or series name
draft: boolean             # true = hidden in production
tags: string[]
```

`post` is the **stable identity** of a post and its sort key. It is not
renumbered when things move; sections and groups are what changed during the
reorg, deliberately, so no URLs broke. `part` is kept only for backward
compatibility and can be deleted once nothing reads it.

### The three sections

| section | page | organized by | what belongs there |
|---|---|---|---|
| `essays` | `/` | series, then standalone | working essays — current thinking, argued so it can be tested |
| `playbook` | `/playbook` | chapter, in reading order | the method: how we build, start to finish |
| `workshop` | `/prod` | project | build logs from products and open-source tools |

`group` values in use — essays: `The Next Software`, `Standalone` · playbook:
`Foundations`, `The Minimum Viable Build`, `Feature Development`, `Testing`,
`Prompts in Production`, `Tooling: MCP`, `Designing with AI` · workshop:
`Shelf`, `vizstack & agentviz`, `Orrery`.

Adding a chapter to the playbook means adding its name to the `chapters` array
in `playbook.astro` — the order of that array is the order on the page. The
homepage reads its series name from the `seriesName` constant in `index.astro`.

### One page is hand-written on purpose

`/prod` (Workshop Notes) does **not** iterate the collection. Its entries are
written by hand so each can carry a bespoke description, a live-product entry
with no post behind it (Shelf, vizstack), an embedded interactive preview, or a
pointer card to another section. Adding a workshop post means editing
`prod.astro` as well as writing the markdown. That duplication is the price of
the curation, and it's intentional.

---

## AI crawlability

Two generated endpoints, both built from the collection, both structured around
`section` and `group`:

- `/llms.txt` — site identity, key concepts, and every post as one line under
  its section and group heading.
- `/llms-full.txt` — the full markdown of every post, each preceded by the
  **core questions** it answers, from the `CORE_QUESTIONS` map keyed by slug.

**Every new post needs `CORE_QUESTIONS` entries before it ships**, written by
actually reading the post — what would someone type into an AI that this post is
the right answer to? This is what makes the site citable rather than
paraphrased, and it's a step in the publish checklist.

---

## Design constraints

Documented in CLAUDE.md and enforced by convention:

- Max content width 680px (`--max`).
- Inter, loaded once via `<link>` in `Base.astro`.
- `html { overflow-y: scroll; }` for layout stability with classic scrollbars.
- No `ClientRouter` / `ViewTransitions`; no `transition:persist` on the header
  (breaks active nav state).
- Footer emails use HTML entity encoding to deter scrapers.

### Stylesheet gotcha — read before touching styles

The stylesheet the site actually serves is **`public/styles/global.css`**,
referenced as `/styles/global.css` from `Base.astro`. There is also a
`src/styles/global.css` that **nothing imports** — it is dead, and its palette
has drifted from the live one. Verify which file you're editing by checking the
computed value in the browser, not by reading whichever file you opened first.

The live accent is `#7a9eb5` (steel blue). Documentation that says `#4ade80` is
stale.

---

## Adding a post

1. Create `src/content/posts/<n>-<slug>.md` with full frontmatter — including
   `section` and `group`, and `post` set to the next number.
2. Write it. Keep `draft: true` while it's in progress.
3. Add its `CORE_QUESTIONS` entries in `llms-full.txt.ts`.
4. New terminology → add it to Key Concepts in `llms.txt.ts`.
5. Workshop posts → add the entry to `prod.astro` by hand.
6. `npm run dev` and read it in place; drafts appear on the homepage here.
7. Run [`publish-checklist.md`](publish-checklist.md) end to end.
8. Flip `draft: false`, merge to `main` — that push deploys.

Filename prefixes have drifted from `post` numbers (`23-mcp-servers.md` is post
9). Frontmatter is the source of truth; the prefix is only a filename. Either
realign them once as a housekeeping commit or drop the prefixes entirely —
don't renumber posts to make them match.
