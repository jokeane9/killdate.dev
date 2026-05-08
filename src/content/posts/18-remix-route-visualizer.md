---
title: "Visualizing a Remix app"
description: "Why your app architecture is harder to hold in your head than it should be, and what we built to fix it — a route tree, an outlet chain view, and a cross-layer ecosystem map."
part: 4
post: 18
draft: false
tags: ["tooling", "remix", "visualization", "open-source"]
---

*8 minute read*

## The problem nobody talks about

Six months into building Shelf, I realised I was holding a mental model of the app that was partially wrong. Not catastrophically wrong — the app was working — but wrong in the way a hand-drawn map is wrong. Good enough to navigate. Not accurate enough to trust for anything precise.

The Remix router is file-based. Routes live in `app/routes/`, named with a dot-notation convention that encodes parent-child relationships directly in the filename. `_app.dashboard.tsx` is the `dashboard` route inside the `_app` layout wrapper. `_app.dashboard._index.tsx` is the index for that route. The convention is elegant. The cognitive overhead of holding forty files in that naming convention is real.

Add to that: each route can have a `loader` (server-side data fetch), an `action` (mutation handler), and a default export (the React component). The same file is doing three jobs. When something breaks, you need to know which job broke — and which other routes share the same loader data.

Then add: nested layouts. Routes nest inside each other through Remix's `<Outlet />` mechanism. The component tree at any given URL is a stack of nested layouts, each rendering an outlet into which the next one slots. You can't see this from the file tree alone.

I couldn't find a tool that showed me this clearly. So we built one.

---

## Three iterations

### v1: Route tree with badges

The first prototype was a static HTML file with Shelf's routes hardcoded. Left panel: a file-based tree with colour-coded badges marking which routes had loaders (L), actions (A), and React components (UI). Right panel: the outlet chain for a selected route — a stacked diagram showing which layout wrappers were active at that URL, from root down to the leaf.

Useful immediately. The loader sequence panel in particular: looking at which loaders fire for a given page made it obvious we were loading more data than the component needed on several routes.

Three things the v1 couldn't show: URL patterns, auth gates, and the relationship between nested routes.

### v2: URL-first with nested containment

The second prototype reorganised around URLs rather than filenames. The left panel became a URL tree; clicking a URL showed the containment view — nested boxes, one per layout in the outlet chain, from outermost wrapper to leaf component. Auth gates got a lock marker. A search bar filtered by URL pattern.

The containment view was the breakthrough. Seeing `_app` wrapping `dashboard` wrapping `_index` as literal nested boxes made the layout architecture immediately readable. What the file naming only implies, the containment diagram makes explicit.

### v3: Ecosystem map

The third prototype added a cross-layer view: four columns representing routes, database tables, the AI layer, and external APIs. Edges between them, colour-coded by type: reads (blue), writes (orange), AI calls (green), external calls (grey). Hovering a node dims everything unconnected to it and shows a detail panel with schema, loaders, endpoints.

This is where it got genuinely interesting. The ecosystem map answered questions the route tree couldn't: which routes trigger AI calls? Which tables are written by actions vs. populated by the crawl pipeline? Which external APIs are called server-side vs. client-side?

The answer for Shelf: the AI layer is almost entirely decoupled from the Remix app. Claude runs inside ECS tasks, not inside route loaders. The Remix app reads the output. The ecosystem map made that architecture visible in a way that no amount of code reading had.

---

## How the parsing works

The route tree (~170 lines of JavaScript) is simpler than it looks.

Remix's file-based routing encodes the entire hierarchy in filenames. A GitHub API call to the repo tree endpoint returns every file path. Filter for `app/routes/`, sort, and you have the route list. Parse the dot-notation to infer parent-child relationships. Check each file's contents for the strings `export async function loader`, `export async function action`, and `export default` to badge the route.

That's the automated part, and it works across any Remix app with standard naming conventions.

The ecosystem map is different. Route-to-database edges require knowing which database tables each route reads. Route-to-AI edges require knowing which routes trigger AI calls. None of that is inferrable from filenames alone — it requires reading the code. For the prototype, we mapped it manually from Shelf's actual source. For a general tool, you'd need either static analysis (grep for import names, SQL calls, fetch calls) or a config file where the developer declares the connections.

The static analysis route is tractable but imperfect. Grep for `db.query` or `supabase.from` or `prisma.model` and you get most of the database edges. Grep for `anthropic` or `openai` or your API client and you get the AI calls. The false negative rate is low enough to be useful; the false positive rate requires a quick manual review.

---

## Where this goes

The tool as built is a static HTML artifact — useful for understanding your own app, not yet useful for dropping in any repo. The path to a general tool:

1. GitHub URL input → GitHub API tree fetch → file-based route parsing → route tree rendered automatically
2. Optional config file for the ecosystem edges (the part that can't be auto-detected reliably)
3. Deploy as a static web app — no backend needed, everything runs in the browser against the GitHub API

The interesting design question is what you do with the tool once the map is generated. Right now it's read-only. The more powerful version is writable — click a route and add a note, flag a loader as suspicious, mark an edge as deprecated. The map becomes a collaborative annotation layer over the codebase.

We're planning to open-source the v3 prototype as a starting point. The core insight — that Remix's file-based conventions make the route tree almost entirely automatable — generalises to any file-based router: Next.js App Router, SvelteKit, Nuxt. The ecosystem layer doesn't generalise as cleanly, but the route layer does.

If you want to hold your Remix app in your head more accurately than you do right now, the HTML prototype is a start. Run it against your own route list and see what you'd previously missed.

