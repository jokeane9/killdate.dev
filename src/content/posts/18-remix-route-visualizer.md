---
title: "Visualizing a Remix app"
description: "Why your app architecture is harder to hold in your head than it should be, and what we built to fix it — a route tree, an outlet chain view, and a cross-layer ecosystem map."
part: 4
post: 18
draft: false
tags: ["tooling", "remix", "visualization", "open-source"]
---

*8 minute read*

## The problem

Deep into building Shelf, I realised I was holding a mental model of the app that was partially wrong. Not catastrophically wrong — the app was working — but wrong in the way a hand-drawn map is wrong. Good enough to navigate. Not accurate enough to trust for anything precise.

I couldn't find a tool that showed me the app clearly. So we built one.

---

## Why it compounds

Remix's file-based router encodes hierarchy in filenames. `_app.dashboard.tsx` is the `dashboard` route inside the `_app` layout wrapper. `_app.dashboard._index.tsx` is the index for that route. The convention is elegant. The cognitive overhead of holding forty files in that naming convention is real.

Layer two: each route file does three jobs. A `loader` for server-side data fetching, an `action` for mutations, and a default export for the React component. When something breaks, you need to know which job broke — and which other routes share the same loader data.

Layer three: nested layouts. Routes nest inside each other through Remix's `<Outlet />` mechanism. The component tree at any given URL is a stack of nested layouts, each rendering an outlet into which the next one slots. None of that is visible from the file tree.

Those three layers compound. But there's a fourth one that doesn't get discussed: **AI-assisted builds add their own incomplete map on top of yours.** Claude Code and Cursor work from the context you give them. If your mental model of the route hierarchy is partially wrong, the briefs you write will be partially wrong, and the code that comes back will reflect that. We caught several of these only after the fact — a loader dependency assumed, an outlet chain misread, a data fetch that should have been in a parent route landing in a child instead.

The map problem isn't just cognitive overhead. It's a drift multiplier.

---

## What we built

Three iterations, each one answering a question the previous one couldn't.

**v1: Route tree with badges.** A static HTML file with Shelf's routes hardcoded. Left panel: a file-based tree with colour-coded badges marking which routes had loaders (L), actions (A), and React components (UI). Right panel: the outlet chain for a selected route — a stacked diagram showing which layout wrappers were active at that URL, from root down to the leaf.

Useful immediately. Looking at which loaders fire for a given page made it obvious we were fetching more data than several components needed.

Three things v1 couldn't show: URL patterns, auth gates, and nested route relationships.

**v2: URL-first with nested containment.** The left panel became a URL tree. Clicking a URL showed the containment view — nested boxes, one per layout in the outlet chain, from outermost wrapper to leaf component. Auth gates got a lock marker.

The containment view was the breakthrough. Seeing `_app` wrapping `dashboard` wrapping `_index` as literal nested boxes made the layout architecture immediately readable. What the file naming implies, the diagram makes explicit.

**v3: Ecosystem map.** A cross-layer view: four columns — routes, database tables, the AI layer, external APIs. Edges colour-coded by type: reads (blue), writes (orange), AI calls (green), external calls (grey). Hover a node and everything unconnected dims; a detail panel shows schema, loaders, endpoints.

This is where it got interesting. The ecosystem map answered questions the route tree couldn't: which routes trigger AI calls? Which tables are written by actions vs. populated by the crawl pipeline? Which external APIs are called server-side vs. client-side?

The answer for Shelf: the AI layer is almost entirely decoupled from the Remix app. Claude runs inside ECS tasks, not inside route loaders. The Remix app reads the output. The ecosystem map made that visible in a way that no amount of code reading had.

[![Shelf ecosystem cross-layer dependency map — routes, database, AI layer, external APIs](/images/ecosystem-viz-preview.png)](/tools/ecosystem-viz.html)

[Open the interactive map →](/tools/ecosystem-viz.html)

---

## How the parsing works

The route tree is simpler than it looks.

Remix's file-based routing encodes the entire hierarchy in filenames. A GitHub API call to the repo tree endpoint returns every file path. Filter for `app/routes/`, sort, and you have the route list. Parse the dot-notation to infer parent-child relationships. Check each file's contents for `export async function loader`, `export async function action`, and `export default` to badge the route. That part is fully automatable across any Remix app with standard naming conventions.

The ecosystem map is different. Route-to-database edges require knowing which tables each route reads. None of that is inferrable from filenames alone — it requires reading the code. For the prototype, we mapped it manually from Shelf's source. For a general tool, you'd need static analysis (grep for `db.query`, `supabase.from`, `prisma.model`, your API client) or a config file where the developer declares the connections. The false negative rate on grep is low enough to be useful; the false positive rate requires a quick pass.

---

## What a small-team solution actually looks like

The tool as built is a static HTML file — 170 lines of JavaScript, no build step, no backend, no framework. Open it in a browser. It works.

That's intentional. Two people with a live product don't need a developer tooling platform. They need to answer a question this afternoon and get back to building. A static artifact that answers the question is strictly better than a generalised tool that doesn't exist yet.

The small-team version of this problem has different constraints than the enterprise version. You can hard-code your own app's routes. You know your own data model. The manual mapping step that would be unacceptable at scale is fifteen minutes at your size, and it's more accurate than any static analysis because you actually know what the code does.

The discipline this taught us: don't wait for the tool that would work for anyone. Build the tool that works for you, now. If it generalises, open-source it later. If it doesn't, you still solved the problem.

---

## vizstack

We shipped it as [vizstack](https://github.com/jokeane9/vizstack) — an open-source CLI that runs against any Remix or Next.js App Router codebase and produces a single self-contained HTML file.

```bash
node parse.js ./your-app viz.html
open viz.html
```

No install, no server, no dependencies. The output works on Epic Stack (23 routes, 3 tables), Inbox Zero (253 routes, 49 tables, 4 AI providers), or anything in between. The trigger detection — webhooks, scheduled crons, polling endpoints — works zero-config from URL patterns.

The one known limitation: Prisma gives you full table schemas with field types and relations. Raw SQL drivers (pg, mysql2) collapse to a single DB node. If your app uses Prisma, the database column is detailed. If it doesn't, it's a box.

The core insight generalises to any file-based router. The route tree is almost entirely automatable from filename conventions alone. The ecosystem edges — which routes call which tables, which call AI — require either Prisma's schema or a static analysis pass. That's the part we'd build next.
