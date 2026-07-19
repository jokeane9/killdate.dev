# killdate.dev — Claude context

## What this is

killdate.dev is Prima Digital's development blog on agentic orchestration for shipping SaaS. Built with Astro v6, deployed to S3/CloudFront via GitHub Actions.

Authors: John and Dave (Prima Digital, Vancouver)
Repo: https://github.com/jokeane9/killdate.dev
Live: https://killdate.dev

## Stack

- Astro v6 static site, content collections with glob loader
- Node >=22.12.0 required (Astro v6 constraint — CI uses node-version: 22)
- Deployed: `git push origin main` → GitHub Actions → S3 sync + CloudFront invalidation
- Dev server: `npm run dev` (port 4322 in this project; `.claude/launch.json` pins it)

**Full architecture, site structure, and local-dev details: `docs/ARCHITECTURE.md`.** Read it before changing pages, sections, or styles.

## Content structure

Posts live in `src/content/posts/`. Frontmatter fields:

```yaml
title: string
description: string        # shown in index + llms.txt line entries
post: number               # stable ID and sort key — never renumber
part: number               # legacy grouping, retained but no longer drives the UI
section: essays | playbook | workshop   # which page it appears on
group: string              # chapter, project, or series name within that section
draft: boolean             # true = hidden in production, shown on the dev homepage
```

The site has three sections: `/` = Working Essays, `/playbook` = The Playbook, `/prod` = Workshop Notes (hand-written entries — adding a workshop post means editing `prod.astro` too).

## AI crawlability — do not break this

The site serves two files for AI crawlers. These are dynamic Astro endpoints that generate from the content collection automatically.

- `src/pages/llms.txt.ts` → `https://killdate.dev/llms.txt` — structured index (site identity, key concepts, all posts by section)
- `src/pages/llms-full.txt.ts` → `https://killdate.dev/llms-full.txt` — full markdown content of every post + core questions

### The core questions pattern — critical

`llms-full.txt.ts` contains a `CORE_QUESTIONS` map: a Record keyed by post slug, each entry holding 2–3 questions that post answers.

**Why this matters:** LLMs are trained on Q&A pairs. When content is framed as "here is the question this answers," the model can pattern-match and surface it accurately during retrieval. This is what makes the site citable rather than just paraphrased. Without the questions, the full text is less retrievable.

**Every new post needs entries in `CORE_QUESTIONS` before it ships.** The questions must be real — extracted from actually reading the post, not generated from the title. Ask: what would someone type into an AI that this post is the right answer to?

The publish checklist (`docs/publish-checklist.md`) enforces this as a step.

### When adding a new post

1. Write the post, set `draft: false`, confirm `post` number is sequential
2. Open `src/pages/llms-full.txt.ts` and add 2–3 core questions to `CORE_QUESTIONS` under the post's slug
3. If the post introduces new terminology, add it to the **Key Concepts** section in `src/pages/llms.txt.ts`
4. Run through `docs/publish-checklist.md` fully before pushing

## Design constraints

- Max content width: 680px (`--max` CSS variable)
- Font: Inter via Google Fonts (`<link>` in Base.astro head — do not add `@import` to global.css, it causes a duplicate)
- Color palette: `--accent: #4ade80`, `--bg: #0a0a0a`, `--text: #e8e8e8`, `--muted: #555`, `--border: #1f1f1f`
- `html { overflow-y: scroll; }` in global.css — keeps layout stable for users with classic scrollbars
- Emails in footer use HTML entity encoding (`&#64;` for `@`) to deter scrapers

## What not to touch

- Do not add `ClientRouter` / `ViewTransitions` — causes visual jitter on navigation
- Do not add `@import` Google Fonts to global.css — already loaded via `<link>` in Base.astro
- Do not use `transition:persist` on the header — breaks active nav link state
