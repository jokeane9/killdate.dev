# BUILD-PLAN — AI Visibility Dashboard

> **First worked instance applying the [Frontend Build Playbook](../../process/frontend-build/PLAYBOOK.md).**
> Methodology lives in the playbook; this document fills in product-specific blanks (repo name, phase tasks, open decisions). When the playbook changes, this document inherits by reference. When the playbook says "default to X," this document confirms or deviates with reasoning.
>
> The bridge between design ideation and working code. Takes the design brief + chosen prototype and turns it into a phased Cursor-executable plan with feature-locks, runbooks, and quality gates per phase.

---

## Executive summary

This brief operationalizes the AI visibility dashboard design work (captured in `README.md`, `BLOG-POST.md`, and the four prototypes in `mocks/`) into a disciplined build plan that Cursor can execute task-by-task with no drift from the locked design.

**The key decisions captured here:**

- **New standalone repo (`shelf-observability`)** — not inside Shelf — because the stack diverges fundamentally (Polaris vs. shadcn cannot share components; embedded Shopify iframe vs. standalone Vercel deploy are different deployment shapes; auth and customer lifecycles may diverge over time)
- **Stack lock**: Remix + Tailwind + shadcn + Tremor + zod + lucide-react + Stripe hosted + lucia + Postgres + raw SQL + pg-boss + Modal for Python eval workers. Chosen because Claude Code knows every piece intimately, the code is ownable not platform-locked, and there are zero configuration battles between layers.
- **The HTML prototype (`mocks/approach-b-cards.html`) is the visual authority** — frozen at brief-time, referenced by every Cursor task's VALIDATE block, never silently re-mocked during build. Same discipline as the Shelf billing page case study (`posts/11-building-ui-with-ai.md`).
- **Five build phases**, ~12 Cursor tasks total, scoped tightly so each task is independently reviewable and recoverable. Phases 0–4 cover scaffold through UI + mock data layer; Phase 5 covers auth + Stripe billing. Real-data integration (Shelf API + Modal eval workers + Shopify Admin API write-back) is deferred to its own canonical-gated brief.

**What success looks like at the end of this brief's scope:** a working Remix app deployed to `observability.[domain]`, all five mock product cards rendering against zod-validated mock data, scoped diagnostic deep-dive functional in the right sidebar, auth + Stripe billing live and merchants able to sign up.

**Expected timeline if focused:** Phases 0–4 in ~2 weeks. Phase 5 in ~1 week. Real-data Phases 6+ in ~3–6 weeks under their own brief. Total: 6–8 weeks from kickoff to first paying-customer-ready dev-site deploy.

**The discipline this brief enforces:** the feature-lock + runbook structure killdate-kit already uses for Shelf, applied to a new product surface from day one. Every phase produces its own `PRE-BUILD-LOCK.md`. Every task produces its own 5-block Cursor runbook (FILES / TYPES / SKELETON / PROHIBITED / VALIDATE). Drift between mock and implementation is caught at the VALIDATE gate of each task, not three weeks later when the dashboard no longer looks like what we designed.

---

## 1. Purpose & when to use this brief

### What this brief is for

This brief exists to prevent a specific failure mode: the silent gap between "we have a design and a prototype" and "we have a working production codebase." That gap is where most "we already designed it" projects die — the team starts building, drift accumulates one task at a time, and after three weeks the implementation looks meaningfully different from the design and nobody can remember why.

The brief's job is to close that gap by sequencing the work into phases that are individually scope-locked, individually validated against the frozen mock, and individually reviewable. It is the **cookbook**. Cursor is the **cook**. You are the **kitchen owner** who tastes every dish before it goes out.

### When to use this

- **After**: design ideation is done — three approaches explored, one chosen, the HTML prototype finalized and frozen, the design brief (README.md) written.
- **Before**: any production code is written, any repo is created, any feature-lock is filled in.

If you don't yet have a frozen mock, you're not ready for this brief — back up and finish the ideation work.

### What this brief is NOT for

- **Real-data integration** — Shelf API, Modal eval workers, Shopify Admin API write-back all get their own canonical-gated briefs in Phase 6+. Each of those is an architectural decision that deserves its own discipline cycle.
- **Backend / API design** — different brief, different canonical concerns.
- **Marketing site work** — that's Astro territory, already covered in your existing process.
- **Embedded Shopify app work** — that lives in Shelf's existing repo and follows Shelf's existing methodology, not this one.

### Prerequisites checklist

Before opening this brief and starting Phase 0, verify:

- [x] Design ideation folder exists at `killdate.dev/ideation/[product-name]/`
- [x] `README.md` captures the competitive thesis, eval structure, and chronological process
- [x] `BLOG-POST.md` draft exists (optional but valuable — writing the public version sharpens the private one)
- [x] `mocks/` folder contains the three approaches and an index
- [x] One specific approach has been picked as v1 (here: Cards)
- [x] The picked mock is feature-complete enough to be the visual diff target
- [ ] Canonical update has landed (or has explicitly been deferred with reasoning)

The last item is non-blocking but worth being honest about. We're proceeding with the build plan ahead of the Shelf-canonical update because the repo is standalone — drift between this product and Shelf's current Sidekick-plumbing direction doesn't damage Shelf. If the canonical eventually says "abandon AI visibility, double down on Sidekick plumbing," the standalone repo can be archived or pivoted without polluting Shelf.

### How this brief connects to killdate-kit's existing canonical → lock → mock → runbook flow

| killdate-kit stage | Where it lives in this build |
|---|---|
| **Canonical** | `ideation/ai-visibility-dashboard/README.md` (and, eventually, an updated `BEHAVIOR-SPEC.md` if the AI-visibility direction supersedes the current Shelf canonical) |
| **Lock** | `feature-builds/[phase-name]/PRE-BUILD-LOCK.md`, one per phase |
| **Mock** | `mocks/approach-b-cards.html`, frozen, version-controlled |
| **Runbook** | `feature-builds/[phase-name]/[task-name]-runbook.md`, one per Cursor task, 5-block structure |

This brief — BUILD-PLAN.md — sits between Mock and Runbook. It sequences the runbooks into phases, identifies dependencies between tasks, and locks the per-phase quality gates. It is the only meta-document in the flow.

### What this brief produces

Direct outputs:
- This document, `BUILD-PLAN.md`
- A new repo, `shelf-observability`, scaffolded in Phase 0
- A series of `feature-builds/[phase]/PRE-BUILD-LOCK.md` files (one per phase, ~5 total)
- A series of Cursor task docs (one per task, ~12 total)

What this brief does NOT produce:
- Code. Cursor produces the code, against the runbooks this brief sequences.

---

## 2. The first-gate decision — where this code lives

This is the decision that has to be locked before any code. Get it wrong and you spend the next year unwinding it. Get it right and the architecture stays clean for the long horizon.

### The case for inside Shelf

If this product lived inside Shelf's existing repo, you'd get:
- Shared auth — Shopify session is already wired
- Shared database — no new Postgres instance to operate
- Shared deployment pipeline — ECS Fargate already configured
- One repo, one mental model, one set of conventions
- Future ability to deep-link from Shelf's admin to observability surfaces

### The case against

But the technical reality breaks the shared-repo dream:
- **Shelf is Remix-embedded-in-Shopify-iframe with Polaris.** The observability product is standalone Remix-on-Vercel with shadcn. These cannot share UI components — Polaris and shadcn use different design tokens, different component APIs, different styling systems. You'd have two component libraries in one repo, two design languages, two visual identities, and Claude Code would be confused about which conventions apply where.
- **Tailwind + shadcn cannot be silently added to a Polaris-driven repo.** They configure the build system differently, introduce competing CSS layers, and break the existing Polaris CSS reset. You can technically make it work, but the cost is ongoing — every dependency upgrade is a hostage negotiation.
- **The deployment targets are different.** Shelf wants Fargate because it needs a long-running Remix server to handle Shopify session state. Observability wants Vercel because it benefits from edge functions, static-friendly routes, and zero-config deploy. Trying to deploy both from one repo means doubling the CI complexity.
- **The customer is potentially different.** Shelf customers and observability customers may not be the same set forever. Sharing auth from day one means coupling product lifecycles in a way that's hard to decouple later.

### The recommendation: new standalone repo

**Create `shelf-observability` as a new git repository.** Deploy at `observability.[domain]` via CNAME from your existing DNS. New Postgres database. New auth via lucia (or Clerk). Standalone Vercel deployment.

### What you trade away

- **Shared auth** — you'll federate later (via OAuth or a shared identity claim like `merchant_shop`) when there's a real reason. v1 is two products, two logins, and that's fine.
- **Shared deployment infrastructure** — you'll maintain two pipelines. The cost is small because Vercel is essentially zero-config for this stack.
- **Theoretical shared codebase** — but realistically you weren't going to share much, given the stack divergence.

### What you gain

- **Architectural clarity** — Shelf stays embedded Shopify; observability is standalone. Each has one job, one stack, one mental model.
- **Independent product lifecycle** — ship observability changes without touching Shelf.
- **Independent customer acquisition** — sell observability to non-Shelf customers eventually if the wedge supports it.
- **Independent deployment risk** — a broken deploy on observability does not break Shelf, and vice versa.
- **Independent canonical** — observability can have its own product-truth document, decoupled from Shelf's Sidekick-plumbing direction.

### Sub-decisions

**Monorepo (Turborepo with Shelf + shelf-observability + shared packages) or separate repos?**
Separate for now. Monorepo benefits accrue when there are 3+ packages with real shared code. We have two products with little shared code. Migrate to monorepo when there's a third product or when shared code emerges organically. Forcing it now is premature optimization.

**DNS strategy.**
Subdomain on existing TLD (`observability.[domain]`) is correct. Reuses DNS infrastructure, preserves brand consistency, simplifies SSL via Vercel's automatic certificate handling. Don't introduce a new TLD without a brand reason.

**Database isolation.**
New Postgres instance on a new RDS (or Neon, or Supabase Postgres — choose based on operational preference). Do not share the Shelf database. The data models are different, the access patterns are different, and coupling them creates hidden risks around schema migrations.

### File structure of the new repo (preview)

```
shelf-observability/
├── CLAUDE.md                   ← operating contract, adapted from killdate-kit template
├── README.md
├── package.json
├── tailwind.config.ts
├── app/                        ← Remix routes + components
│   ├── components/
│   │   ├── ui/                 ← shadcn components live here (owned, version-controlled)
│   │   ├── dashboard/          ← product-specific composite components
│   │   └── charts/             ← Tremor wrappers + custom Recharts
│   ├── routes/
│   │   ├── _index.tsx
│   │   ├── dashboard.tsx
│   │   ├── dashboard.products.tsx
│   │   └── api.*.ts            ← stub API routes for mock data, swapped for real later
│   ├── lib/
│   │   ├── schemas/            ← zod schemas (the shared truth across UI + API)
│   │   ├── mock-data/          ← deterministic mock fixtures
│   │   └── db.server.ts
│   └── styles/
├── public/
├── project-management/
│   ├── ROADMAP.md
│   ├── STACK.md
│   ├── _log.md
│   └── KNOWN-ISSUES.md
├── feature-builds/             ← one folder per build, with PRE-BUILD-LOCK.md
│   ├── _playbook/              ← runbook templates copied from killdate-kit
│   └── [phase-name]/
├── canonical/                  ← single source of truth for product behavior
└── tests/
```

This structure mirrors Shelf's, which means muscle memory transfers and `CLAUDE.md` is mostly copy-paste with adaptations.

---

## 3. Stack lock — what we're using and why each thing earns its place

Tool choice has compounding consequences. Every component you install, every dependency you add, every convention you commit to gets harder to change as the codebase grows. The cost of choosing the wrong stack isn't paid at choose-time; it's paid every week for the next two years.

The principle: **choose tools that Claude Code knows cold, that produce ownable (not platform-locked) code, and that fit together without configuration battles.** Anything else is paying complexity cost for nothing.

### Remix as the framework

**Why Remix:**
- Uses standard web platform APIs (Request/Response, fetch, FormData) — Claude Code's training data is heavy on these, generation is fluent
- File-based routing with nested layouts maps cleanly to dashboard structures (left nav + main content + right sidebar appears as a parent layout with a content slot)
- Loaders and actions push data fetching to the server in a clear, ergonomic way — no React Query state-management mess for server data
- **Same framework as Shelf** — muscle memory transfers directly, conventions are already internalized, you don't context-switch between two framework dialects
- Vercel deploys Remix natively now via the Vercel adapter — mature, zero-config

**Why not Next.js:** heavier conventions (App Router, server components, the `'use cache'` directive, route handlers vs. server actions), more opinionated abstractions to fight, and you already use Remix in Shelf. No reason to introduce a second framework family into your operating headspace.

**Why not Astro for the dashboard:** Astro is excellent for static content (it's already the marketing site framework) but doesn't shine for interactive dashboards. The marketing site is Astro; the dashboard is Remix. Two tools, two jobs, no overlap.

### Tailwind CSS as the styling substrate

**Why Tailwind:**
- It IS the substrate that shadcn depends on. No Tailwind, no shadcn. The styling layer is decided the moment you choose shadcn.
- Utility-first means no CSS naming overhead, no specificity battles, no dead CSS files growing over time
- Claude Code generates Tailwind classes more fluently than any other styling approach because there's no abstraction layer to invent — the class names ARE the styles, visible in the JSX
- Customization happens in one file (`tailwind.config.ts`) — easy to find, easy to reason about
- Pairs naturally with shadcn's design tokens

**Why not CSS modules:** more boilerplate, harder to copy-paste between projects, naming overhead returns.
**Why not styled-components:** runtime cost, css-in-js fragmentation issues, AI generation is less fluent.
**Why not vanilla-extract:** smaller ecosystem, less Claude Code training-data coverage.

### shadcn/ui as the component catalog

**Why shadcn specifically:**
- **Copy-paste model**: components live in your repo at `app/components/ui/`. You own them. There is no `node_modules/shadcn` runtime — the components are TypeScript React files you can modify freely without forking.
- Built on **Radix UI primitives** — accessibility, keyboard navigation, focus management, ARIA attributes all handled correctly. You don't reinvent the dialog focus trap.
- **Tailwind-native** — pairs naturally with the styling layer, no impedance mismatch
- **Most ubiquitous in 2026** — Claude Code knows it intimately because shadcn appears in every modern React example in training data. Generation is fast and accurate.
- **Active community, frequent additions, no breaking changes for you** — because you own the code, upstream changes don't force migrations; you pick what to adopt

**Why not Mantine:** more opaque, more internal opinions, harder to surgically modify. Claude Code handles it but doesn't move as fluently.
**Why not Chakra UI:** heavier runtime, declining mindshare in 2026, not worth introducing.
**Why not HeroUI/NextUI:** smaller Remix ecosystem, historically tied to Next.js.
**Why not raw Radix primitives:** you'd be re-implementing shadcn yourself for no benefit.

### Tremor as the dashboard chart layer

**Why Tremor on top of shadcn:**
- Built on the same Tailwind + shadcn foundation, so they coexist cleanly with zero styling conflicts
- Purpose-built for analytical surfaces: KPI cards with deltas and sparklines, line/bar/area/donut charts, trackers, progress bars, callouts
- Free, MIT licensed, well-maintained
- Wraps Recharts internally so you can drop down to Recharts directly when you need fine-grained control

**When to use Tremor vs. shadcn vs. Recharts:**
- **Tremor**: dashboard primitives — KPI cards, charts in standard layouts, trackers, progress visualizations. Use when "this is the standard dashboard widget shape."
- **shadcn**: forms, dialogs, navigation, modals, layout primitives, data tables. Use when "this is interaction structure."
- **Recharts directly**: when Tremor's opinions get in the way of a specific custom visualization. Rare but real.
- They don't fight each other. Tremor's `Card` and shadcn's `Card` are different components serving different contexts — used in different parts of the dashboard.

**When to skip Tremor entirely:**
- Highly bespoke visualizations — use Recharts directly or Visx for D3-level control
- One-off simple sparklines — inline SVG is lighter and clearer

### zod as the schema validator

**Why zod:**
- **TypeScript-native** — schemas infer types automatically via `z.infer<typeof schema>`. One source of truth for runtime validation + compile-time types.
- **Runtime validation** at API boundaries protects against malformed data
- **Pairs with react-hook-form** for form validation (the shadcn `Form` component is built around this combo)
- **Same shape as Pydantic on the Python side** — cross-language schema contract enforcement, mirrors the discipline Shelf already does for its Layer 4 contract
- Maintains the "data integrity in code" principle from Shelf's STACK.md, which says: handle data integrity, ontology, and state in code; pass intelligence to the prompt

**Why not yup/joi/valibot:** smaller ecosystems, less Claude Code training-data coverage, weaker TypeScript inference. zod is the standard.

### lucide-react as the icon set

The assumed pairing with shadcn — every shadcn example uses lucide. 1500+ icons, consistent stroke weight, MIT licensed. No reason to introduce a different icon set; introducing one would just fight the shadcn examples Claude Code generates from.

### Stripe hosted UI for billing

**Why Stripe Checkout + Customer Portal:**
- **Stripe handles the entire payment UI** — checkout page, customer portal, dunning, subscription state transitions, plan-change prorations, failed-payment retries, dispute UI. All on Stripe's domain.
- **Your code is just webhook handlers + thin redirect glue** — approximately 250 lines total for production-grade subscription billing
- **PCI compliance is Stripe's problem**, not yours
- **You don't reinvent the subscription state machine** — which is genuinely full of edge cases that drain weeks of engineering time

**Why not roll your own billing UI:** subscription billing is a category of work where the iceberg is mostly underwater. Stripe handles the underwater part. Every hour spent building custom billing UI is an hour not spent on actual product differentiation.

### lucia or Clerk for auth

The choice depends on tolerance for ongoing cost vs. code ownership:

| | lucia | Clerk |
|---|---|---|
| Cost | $0/month, self-hosted | $25/mo + per-MAU at scale |
| Setup time | ~1 day | ~2 hours |
| Code ownership | Full — auth lives in your repo | Managed — auth lives at Clerk |
| Multi-tenant primitives | DIY | Built-in (organizations, invites) |
| Migrate later cost | Low if you stay with lucia | Higher — you've outsourced session management |

**For v0:** lucia is the lighter, more disciplined choice. Migrate to Clerk if user management becomes its own product surface and Clerk's session/multi-tenant/SSO features start saving real engineering hours.

### Postgres + raw SQL via `pg` + pg-boss for jobs

**Why this stack (mirroring Shelf):**
- **Postgres** is the database we already know
- **Raw SQL via `pg`** (no ORM) keeps you close to the data, avoids ORM gotchas, and matches Shelf's permanent decision to skip ORMs
- **pg-boss** reuses Postgres for job queueing — no new infrastructure to operate, no Redis/RabbitMQ/SQS to add to the surface area
- **Same conventions as Shelf** — Claude Code already knows them, query patterns are reusable, migrations follow the same style

### Modal for Python eval workers (when we get to Phase 6+)

Deferred to its own brief, but flagged here so the stack is complete:
- Purpose-built for "function that runs an LLM call, returns JSON, scales horizontally"
- Python-first, deep LLM ecosystem support
- Auto-scaling, pay-per-call (not pay-per-uptime) — cheaper than Fargate for spiky workloads
- Lighter than running your own Fargate cluster for occasional eval runs
- Keeps eval workers separate from the dashboard, which is correct architecturally

### What we explicitly chose NOT to use

| Tool | Why we ruled it out |
|---|---|
| Lovable | Generates on a different stack (Next.js + Supabase); introduces lock-in; you'd maintain two stacks forever |
| Supabase | Adds a second database; we have Postgres |
| Next.js | Adds a second framework; you already use Remix in Shelf |
| Prisma (or any ORM) | Adds an abstraction Claude Code has to navigate; raw SQL is sharper |
| Tailwind UI (paid) | shadcn covers the same ground; the paid version doesn't justify the licensing model |
| A second component library | Polaris stays in Shelf; shadcn stays here; no mixing |
| Clerk for v0 | Cost grows with usage; lucia is the cleaner starting point |

**The stack lock should hold for at least 12 months.** If you find yourself wanting to add a new major dependency, that's a canonical-level decision — open the canonical, document the reasoning, then add. Don't sneak dependencies in.

---

## 4. The HTML mock as visual authority

The HTML prototype at `mocks/approach-b-cards.html` is the visual authority for the entire build. This is the same technique that made the Shelf billing page ship cleanly (documented in `posts/11-building-ui-with-ai.md`) and it applies directly here.

### The principle: the mock is frozen before the runbook is written

The mock doesn't change during build. If it needs to change, you stop the build, update the mock, re-validate the canonical alignment, then resume — **never silently re-mock and continue building.** This is the same discipline as Shelf's mock sign-off gate. Drifting the mock mid-build is the most common way "we already designed it" projects collapse into vibes.

The mock is the **contract between design and implementation.** Every Cursor task that touches the dashboard UI references this file. The VALIDATE block in each runbook includes: *"Open `mocks/approach-b-cards.html` in a browser, screenshot the relevant region, compare side-by-side with the implementation at localhost:3000. Note any meaningful differences."*

### Why HTML over Figma for this purpose

- **HTML is openable in any browser** without an export step. Cursor can be told literally "open this file" and reference its rendering.
- **HTML is owned in version control** — no Figma file ID to track, no separate access permissions, no risk of someone editing the source of truth elsewhere
- **Exact CSS values, colors, spacing are in the file as data**, not as design tokens that need translation into Tailwind classes — the HTML mock ALREADY uses Tailwind classes, so the implementation can lift them directly
- **The mock will already work with the Tailwind + shadcn stack** because it was built in it. There's no "translate from Figma vector to Tailwind utility" step.

### The technique for visual diff (without sophisticated tooling)

You don't need Percy, Chromatic, or visual regression CI tools for v1. The manual technique is sufficient and faster:

1. Open the mock HTML in a Chrome window
2. Open the implementation (running on `localhost:3000`) in a second Chrome window
3. Resize both to the same width (1440px desktop is the design target)
4. Screenshot both regions of interest (entire viewport, or a specific component)
5. Paste into Preview / Pixelmator / any image-comparison tool — even side-by-side in Photos works
6. Note any meaningful differences: spacing, colors, alignment, typography, hover states
7. Decide for each: is the diff a code bug (fix in implementation) or an intentional improvement (stop, update the mock, document why)?

This is low-tech and it works. **Don't introduce visual regression tooling until you have a real reason** — at v1, manual screenshot comparison is sufficient, faster, and produces more accurate judgment because a human is in the loop. Visual regression tooling becomes valuable when you have many surfaces and need automated catch on every PR; not yet.

### What happens when reality diverges from the mock

Real data has shape the mock didn't anticipate:
- Product names that are longer than mock names (causing text truncation issues)
- ChatGPT responses with paragraph breaks the mock didn't include
- Missing fields the mock assumed would always be present
- Empty states the mock didn't address (zero diagnostics, zero failing queries, brand-new merchant with no eval runs yet)

Real auth introduces UI states the mock didn't have:
- Loading skeleton for the initial dashboard render
- Error state when an API call fails
- Unauthenticated state (redirect to login)
- Partial-permission state (subscriber tier doesn't include this feature)

**Handle this by treating each divergence as a mock update that goes through the same sign-off discipline:**

1. Discover the divergence (during development or via real-data testing)
2. Stop the in-flight task. Note the divergence in `feature-builds/[phase]/divergences.md`.
3. Update the HTML mock to include the new state — handle the empty state explicitly, design the loading skeleton, design the error state
4. Re-validate that the new state still fits the design language (B&W shadcn restraint, no decorative additions)
5. Then resume the implementation task with the updated mock as the new visual authority

This prevents the failure mode where the implementation grows new states organically and the mock becomes stale. The mock + implementation always stay in sync.

### Mock-first vs. design-first — why mock-first wins for AI-augmented builds

- **Mock-first** (what we're doing): the visual artifact is a rendered HTML file. Cursor can compare against it pixel-by-pixel, lift class names directly, and verify output literally matches.
- **Design-first** (Figma-style): the visual artifact is a static image or design file. Cursor has to interpret it — translate vector to code, infer Tailwind utilities from visual measurements, guess at hover states.

Mock-first wins for AI-augmented builds because the visual authority is in a format Cursor can directly read and reference. Design-first introduces a translation step that is a major source of drift. Every translation step compounds error.

### When Claude Design plays into this loop (and when it doesn't)

Claude Design (Anthropic's design product, accessible at `claude.ai/design`) is a generative design tool that can read codebase context and produce variants. Its role in this build:

- **Pre-Phase 2**: not used. The design is already locked in `mocks/approach-b-cards.html`. Using Claude Design at this point would generate variants we'd have to reject, costing tokens for no value.
- **Post-Phase 2**: useful for refinement. Once the real Remix + shadcn codebase exists, Claude Design can read it and produce iteration variants that fit your real components — e.g., adding a new screen, exploring an alternative dashboard altitude, prototyping a new diagnostic detail surface.
- **Post-Phase 2 workflow**: Claude Design produces variant → export back into `mocks/` as a new file (e.g., `mocks/competitor-view-v1.html`) → if approved, this becomes its own feature-lock + runbook cycle → if rejected, deleted.

The principle: Claude Design is post-Phase-2 refinement, not pre-Phase-2 design. The brief and mock should already be locked before Claude Design enters the loop.

### What if the mock has a bug?

If you discover during build that the mock itself has a design bug (e.g., the Distribution Strip layout breaks at narrower widths, or the diagnostic deep-dive doesn't scroll on mobile), treat it the same as a divergence:

1. Stop the in-flight task
2. Note the bug in `divergences.md`
3. Fix the mock
4. Resume

The mock is the source of truth, so it has to be fixable. Just fix it under the same discipline as any code change — with a note, not silently.

---

## 5. The phased build plan

Five phases, scoped tightly. Each phase has its own `PRE-BUILD-LOCK.md`. Tasks within a phase are sequenced; phases are not parallelizable.

| Phase | Title | Tasks | Output |
|---|---|---|---|
| **0 — Foundation** | Repo scaffold + stack install | 1 | New Remix repo, Tailwind + shadcn + Tremor + zod installed, CLAUDE.md + project-management/ + feature-builds/ + canonical/ set up, initial Vercel deploy |
| **1 — Layout shell** | Dashboard chrome from approach-b-cards.html | 2 | Root layout (left nav, top brand bar, right sidebar slot) + Products route with empty content area |
| **2 — Distribution Strip + Cards** | Products view body from approach-b-cards.html | 2 | Distribution Strip component, Product Card component, Cards grid rendering against mock data |
| **3 — Scoped diagnostic deep-dive** | Diagnostic sidebar + report card surface | 3 | Collapsed diagnostic list, Finding header, Suggested actions cards, Scoped probe input (UI only — chat backend deferred) |
| **4 — Mock data layer** | Zod schemas + mock fixtures + stub API routes | 2 | Type-safe mock data via zod, stub API routes returning valid shape, all UI consuming via loaders |
| **5 — Auth + billing** | lucia auth + Stripe hosted billing | 2 | Real auth, real Stripe Checkout + Customer Portal, webhook handler updating subscription state |

**Phases 6+ deferred** to their own canonical-gated briefs:
- Phase 6 — Shelf API integration (read real product/competitor data)
- Phase 7 — Modal eval workers (run real LLM polls, score results)
- Phase 8 — Shopify Admin API write-back loop (Suggested Actions actually apply)

Each of those touches architecture — the canonical decision about Shelf-decomposes-Sidekick-composes for Phase 8, the per-merchant cost ceiling for Phase 7, the API contract design for Phase 6.

---

## 6. The Cursor runbook template — 5-block anatomy

Every Cursor task in every phase uses the same 5-block runbook structure, identical to the Shelf billing-page case study.

- **FILES** — exact paths Cursor is allowed to touch. Nothing else. If the task needs a file outside this list, stop and revise the runbook.
- **TYPES** — exact zod schemas and TypeScript types Cursor must use. Locked, not suggested. Cursor doesn't invent type signatures.
- **SKELETON** — JSX scaffold with `// IMPLEMENT:` comments where logic goes. Gives Cursor the shape; Cursor fills in.
- **PROHIBITED** — what Cursor reliably wants to add but shouldn't. Examples: "do not add a loading skeleton (we'll add it in Phase 4)," "do not introduce a new dependency," "do not write tests for this UI (90/10 rule)."
- **VALIDATE** — concrete check after Cursor finishes. Examples: "open `mocks/approach-b-cards.html`, screenshot the Distribution Strip region, compare to localhost:3000 — note any spacing/color/typography diffs," "run `npm run typecheck` and confirm zero errors."

A worked example for Phase 2 Task 1 (Distribution Strip component) will live in `feature-builds/02-distribution-strip-and-cards/task-1-distribution-strip-runbook.md`.

---

## 7. Tool boundaries

| Tool | Job in this loop |
|---|---|
| **This brief (BUILD-PLAN.md)** | Sequences the work into phases, defines per-phase quality gates |
| **Design brief (README.md)** | What and why |
| **HTML mock (approach-b-cards.html)** | Visual authority — locked, doesn't change during build without explicit re-mock |
| **Claude Code** | Reads brief + mock, drafts feature-locks + per-task runbooks, reviews Cursor output for drift |
| **Cursor** | Executes one runbook at a time, scoped strictly to its FILES block |
| **Claude Design** | Post-Phase-2 refinement only; iterates against real codebase, output goes back into mocks/ |
| **You** | Approve mock, approve each feature-lock, review every task before the next one starts |

---

## 8. Quality gates per phase

- **Phase 0 gate** — `npm run dev` works locally, app deploys to Vercel, basic route renders "Hello world" at `observability.[domain]`
- **Phase 1 gate** — layout shell renders at desktop width, matches HTML mock's chrome (left nav, top bar, right sidebar slot, main content area), no console errors
- **Phase 2 gate** — Distribution Strip + all 5 product cards render with mock data, visual diff against `approach-b-cards.html` within tolerance (manual screenshot comparison; no spacing/color/typography drift)
- **Phase 3 gate** — clicking a diagnostic opens the deep-dive panel, suggested actions render, scoped probe input renders (not yet wired to a backend — UI only)
- **Phase 4 gate** — zod parse succeeds against all mock fixtures, stub API routes return valid shape, all UI consumes via loaders (no hardcoded data in components)
- **Phase 5 gate** — user can sign up, create a Stripe subscription via hosted Checkout, manage subscription via Customer Portal, webhook handler updates `subscriptions` table correctly

---

## 9. Feature-lock template

Each phase's `PRE-BUILD-LOCK.md` uses the killdate-kit PRE-BUILD-LOCK template, adapted for UI builds. The blocks:

- **IN list** — exact files/components/routes this phase produces
- **OUT list** — what's explicitly NOT in this phase (defers to a later phase or another brief)
- **Blast radius matrix** — every adjacent surface this phase touches, with cells marked "investigate" (not "assume clean") if unclear
- **Kill date** — for any temporary scaffold introduced (e.g., mock data layer in Phase 4 has a kill date when Phase 6 ships real data)
- **Canonical reference** — points to `ideation/ai-visibility-dashboard/README.md` for product truth

Template lives at `feature-builds/_playbook/PRE-BUILD-LOCK-TEMPLATE.md`, copied from killdate-kit's existing template at session start.

---

## 10. Open decisions to settle in the canonical update

These are flagged but not blocking this brief — they need to be answered before specific phases:

- **Auth: lucia vs. Clerk** — settle before Phase 5
- **Shopify write-back path** — Path A (Shelf hands off to Sidekick for composition) vs. Path B (one-click human approval = composition act). Settle before Phase 8.
- **Per-merchant LLM-poll cost ceiling** — the eval suite spends real money on LLM API calls; cost discipline starts at design-time. Settle before Phase 7.
- **Whether observability becomes a sibling product or replaces Shelf's current positioning** — the broader canonical question, settle whenever you write the new `MARKETING-TRUTH.md` per the discipline gate.

---

## 11. Reusability — what becomes a template after this build

After Phases 0–5 ship and we see what worked, the goal is to extract a reusable `BUILD-PLAN-TEMPLATE.md` at `ideation/_template/` so future ideation folders can lift it directly.

What will likely become reusable template:
- The phased structure (Foundation → Layout → Content → Interaction → Data Layer → Auth/Billing)
- The tool boundaries table
- The Cursor runbook 5-block anatomy
- The quality-gate-per-phase pattern

What will stay product-specific:
- Stack choices (driven by product type)
- Repo location decision (driven by product relationship to Shelf)
- Specific phases beyond 5 (driven by product architecture)

The template extraction is a separate session — not now. **Use the template once, then extract.** Otherwise you're abstracting from one data point and the template will be wrong in ways you can't predict.
