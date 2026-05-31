# Frontend Build Playbook

> A reusable methodology for moving from a design ideation folder to working production frontend code, with zero drift between design and implementation. Compounds across products — every new frontend surface you ship gets this for free.

---

## What this is

A repeatable, opinionated process for **going from "we designed it" to "we shipped it"** on any frontend product surface (standalone SaaS, internal tool, customer dashboard — anything that isn't an embedded Shopify app or marketing site).

The methodology combines four discrete pieces:

1. A **design ideation folder** with a frozen HTML prototype as the visual authority
2. A **locked stack** (Remix + Tailwind + shadcn + Tremor + zod) chosen so Claude Code knows every layer cold
3. The **killdate-kit feature-lock + runbook discipline** applied per phase
4. **Cursor as the executor**, scoped to one task at a time with a 5-block runbook structure

The result: design intent survives the translation to code intact, every Cursor task is independently reviewable and recoverable, and the same playbook applies to the next product surface with near-zero adaptation cost.

---

## Why this is 10x leverage

Most "we have a design, let's build it" projects bleed value at four predictable points:

| Failure mode | What it costs | How the playbook prevents it |
|---|---|---|
| **Design → code drift** | After 2–3 weeks the implementation diverges from the design and nobody remembers why | The HTML mock is the visual authority. Every Cursor task's VALIDATE block compares against it. Drift is caught at task time, not three weeks later. |
| **Big-bang task risk** | A multi-day task fails halfway, leaving the codebase in a broken state | The 5-block runbook scopes each Cursor task tight enough that failure is a 1-day rollback, not a week of recovery |
| **Stack indecision mid-build** | Time wasted re-evaluating tools as the codebase grows | The stack lock is settled before any code. Every layer is named, with rationale, with one explicit alternative ruled out. |
| **No quality gate before next phase** | A broken Phase 2 lands and Phase 3 builds on top of it, compounding | Each phase has a concrete quality gate. Phase N+1 doesn't start until Phase N's gate passes. |

The leverage isn't from any single piece — it's from the discipline of having all four pieces lock together at the same time. Each piece is moderately valuable alone. Combined, they eliminate the categories of failure that consume most of a frontend build's calendar time.

**The compounding angle:** because the playbook is the same for every new product surface, you internalize it once and amortize it forever. The first product takes the full cost of learning. Every subsequent product takes a fraction.

**Concrete baseline:** a frontend SaaS dashboard built without this discipline typically takes 8–12 weeks from "we have a design" to "merchants are signing up." Built with this discipline, the same surface ships in 5–7 weeks with materially less rework. The 10x framing isn't pure wall-clock time — it's wall-clock time × probability of shipping × probability of the result matching the original design intent.

---

## When to use this playbook

**Use it for:**
- Standalone B2B SaaS dashboards
- Customer-facing portals (non-embedded)
- Internal tools that need real UI craft
- Marketing-adjacent product surfaces (e.g. pricing pages, customer education, onboarding flows)
- Anything where the unit of work is "a frontend surface with multi-tenant data backing it"

**Don't use it for:**
- Embedded Shopify app work (use Shelf's existing methodology — Polaris stack, different conventions)
- Marketing sites (Astro lives in its own world)
- Backend / API-only work (different playbook, doesn't exist yet)
- Hot-fix work on existing surfaces (overhead doesn't earn its keep)

**Prerequisites:**

Before opening this playbook for a specific product, verify:

- [ ] Design ideation folder exists at `killdate.dev/ideation/[product-name]/`
- [ ] `README.md` captures the competitive thesis, eval/data structure (if relevant), and chronological process
- [ ] `mocks/` folder contains at least one approach explored to a feature-complete state
- [ ] One specific approach has been picked as v1
- [ ] The picked mock is the visual diff target — final, locked, ready to bind every Cursor task to

If the mock isn't locked, back up. Lock the mock first; the rest of the playbook depends on it.

---

## The first-gate decisions

Two decisions have to be locked before any code. Get either wrong and you spend the next year unwinding it.

### Decision 1: Where does this code live?

Two paths, with strong default:

**Path A — New standalone repo.**
Use when: the new surface diverges materially from any existing app (different stack, different deployment target, different auth, different customer lifecycle).

**Path B — Inside an existing repo.**
Use when: the new surface IS the existing app (a new section/route in something you already maintain) and shares stack, auth, and deployment.

**The strong default is Path A** for new product surfaces. Sharing repos sounds appealing for code reuse but punishes you with two competing convention sets, two design languages, two deploy targets, and Claude Code confusion about which patterns apply where. The cost of two repos is small (an extra Vercel deploy, an extra Postgres). The cost of one polluted repo is paid in every future change.

If choosing Path A, sub-decisions to settle:
- DNS strategy (subdomain on existing TLD vs. new TLD — subdomain is correct)
- Database isolation (new instance vs. shared — new is correct)
- Monorepo (Turborepo / similar) vs. separate repos (separate for now; migrate to monorepo when there are 3+ packages with real shared code)

### Decision 2: Stack lock

Locked. Don't re-evaluate.

| Layer | Tool | Locked because |
|---|---|---|
| Framework | **Remix** | Standard web APIs, file-based nested routes map to dashboard structures, Vercel deploys natively, Claude Code fluency is high |
| Styling | **Tailwind CSS** | Required substrate for shadcn; utility-first eliminates CSS naming overhead; Claude Code generates classes with no abstraction layer in the way |
| Component catalog | **shadcn/ui** | Copy-paste model means you own the code; built on Radix primitives for accessibility; most ubiquitous library in 2026 training data |
| Charts / dashboard primitives | **Tremor** | Built on shadcn + Tailwind, purpose-built for analytical surfaces, drops to Recharts when needed |
| Icons | **lucide-react** | Default pairing with shadcn — 1500+ icons, consistent stroke weight |
| Schema validation | **zod** | TypeScript-native, infers types automatically, pairs with react-hook-form, mirrors Python Pydantic discipline |
| Billing | **Stripe hosted UI** (Checkout + Customer Portal) | Stripe handles the iceberg under the waterline; your code is ~250 lines of webhook handlers |
| Auth | **lucia** (or Clerk if you want managed) | lucia: $0, full code ownership. Clerk: $25+/mo, faster setup, less owned code. Default to lucia for v0. |
| Database | **Postgres + raw SQL via `pg`** | Matches Shelf's permanent decision (no ORM); Claude Code knows the patterns; data integrity stays in code |
| Job queue | **pg-boss** | Reuses Postgres; no new infra to operate |
| Python eval / worker (when relevant) | **Modal** | Pay-per-call, auto-scaling, Python-first, lighter than Fargate for spiky workloads |

What's explicitly NOT in this stack:

| Tool | Why it's ruled out |
|---|---|
| Lovable / Bolt / v0 / Base44 | Generate on Next.js + Supabase (Lovable), platform-locked (Base44), or limited backend (v0). Maintaining a second stack forever costs more than the scaffold time you save. |
| Next.js | You already use Remix; introducing a second framework family is unnecessary cost |
| Supabase | Adds a second database; Postgres covers the need |
| Prisma (or any ORM) | Adds an abstraction Claude Code has to navigate; raw SQL is sharper |
| Tailwind UI (paid) | shadcn covers it; licensing model isn't worth it |
| Mantine, Chakra, HeroUI | shadcn is the standard; switching libraries fragments the convention |

The stack lock should hold for 12 months minimum. Adding a major dependency mid-build is a canonical-level decision — open the canonical, document the reasoning, then add. Don't sneak dependencies in.

**Why this stack and not alternatives:** because Claude Code knows every layer cold, the code is ownable not locked, and there are zero configuration battles between layers. The stack itself is the leverage — Claude Code composes against Remix + Tailwind + shadcn + Tremor + zod the same way Lovable's LLM composes against React + Next.js + Supabase, but on a stack you fully own and that fits your existing methodology.

---

## The HTML mock as visual authority

The HTML prototype in the ideation folder's `mocks/` directory is the visual authority for the entire build. This is the technique that made the Shelf billing page ship cleanly (see `posts/11-building-ui-with-ai.md`).

### The principle

**The mock is frozen before any runbook is written.** It does not change during build. If it needs to change, you stop the build, update the mock under the same sign-off discipline, then resume — never silently re-mock and continue building.

The mock is the contract between design and implementation. Every Cursor task that touches the UI references the specific mock file. The VALIDATE block in each runbook includes: *"Open `mocks/[chosen-approach].html` in a browser, screenshot the relevant region, compare side-by-side with the implementation. Note any meaningful differences."*

### Why HTML over Figma

- HTML is openable in any browser without an export step
- HTML lives in version control alongside the code
- HTML uses the same Tailwind classes the implementation will use — no translation step
- Cursor can literally open the file and reference it directly
- Drift is detectable visually with a manual screenshot comparison

The translation from Figma to code is where most design-to-implementation drift happens. Mock-first eliminates that translation step entirely.

### The visual diff technique (no special tooling required)

1. Open the mock HTML in a Chrome window at desktop width (1440px is the standard design target)
2. Open the implementation (running on `localhost:3000`) in a second Chrome window at the same width
3. Screenshot both — entire viewport or specific component region
4. Paste into Preview, Pixelmator, or any image-comparison surface
5. Note any spacing, color, alignment, typography differences
6. Decide for each: code bug (fix in implementation) or design improvement (stop, update the mock, document why)

Manual screenshot comparison is sufficient and faster than visual regression tooling at v1. Bring in Percy / Chromatic when you have many surfaces and need CI-enforced regression catch — not before.

### When the mock and reality diverge

Real data has shape the mock didn't anticipate. Real auth introduces UI states the mock didn't include. Handle by treating each divergence as a **mock update** under the same sign-off discipline:

1. Discover the divergence during development
2. Stop the in-flight task
3. Update the HTML mock to include the new state (empty, loading, error, longer text, missing fields)
4. Re-validate that the new state still fits the design language
5. Resume the implementation task with the updated mock as the new authority

This prevents the failure mode where the implementation grows new states organically and the mock becomes stale.

### When Claude Design enters the loop

Claude Design (Anthropic's design tool, `claude.ai/design`) is useful for **post-initial-build refinement**, not pre-build design.

- Pre-build: the design is locked in the existing HTML mock. Using Claude Design here would generate variants you'd have to reject.
- Post-Phase-2: the real codebase exists. Claude Design can read it and produce iteration variants that fit your real components — useful for exploring new screens, refining existing surfaces, prototyping diagnostic detail views.
- Workflow: Claude Design produces variant → export → place in `mocks/` as a new file → if approved, that becomes its own feature-lock + runbook cycle → if rejected, deleted.

---

## The phased build template

Five phases, scoped tight. Each phase has its own `PRE-BUILD-LOCK.md`. Tasks within a phase are sequenced; phases are not parallelizable.

| Phase | Purpose | Typical task count | Output |
|---|---|---|---|
| **0 — Foundation** | New repo scaffold, stack install, deploy pipeline | 1 task | Working repo, Tailwind + shadcn + Tremor + zod installed, CLAUDE.md + project-management/ + feature-builds/ + canonical/, deploys to Vercel |
| **1 — Layout shell** | Dashboard chrome from the mock | 2 tasks | Root layout (nav + main + sidebar slots), top-level routes |
| **2 — Primary content** | The main interaction surfaces (cards, tables, charts) | 2–3 tasks | Components rendering against mock data |
| **3 — Interaction surfaces** | Detail views, drawers, modals, deep-dives | 2–3 tasks | UI for the secondary interactions (still mock data) |
| **4 — Mock data layer** | zod schemas, mock fixtures, stub API routes | 2 tasks | Type-safe mock data via zod, all UI consuming via loaders |
| **5 — Auth + billing** | lucia auth + Stripe hosted | 2 tasks | Real auth, real Stripe, webhook updates user/subscription state |

**Phases 6+ deferred** to their own canonical-gated briefs. Real-data integration, eval engines, external API write-backs, complex business logic — each of these touches architecture and deserves its own discipline cycle.

The five-phase shape works because each phase is concrete enough to fit a feature-lock and discrete enough to gate cleanly. Phases 0–4 produce a working UI with mock data; Phase 5 makes it real. The split is intentional — you can demo, iterate, and gather feedback on Phases 0–4 without committing to billing/auth architecture.

---

## The Cursor runbook 5-block anatomy

Every Cursor task uses the same 5-block runbook structure. This is identical to the Shelf billing case study and to existing killdate-kit `feature-builds/_playbook/BUILD-RULES.md`.

### FILES
Exact paths Cursor is allowed to touch. Nothing else. If the task needs a file outside this list, stop and revise the runbook — don't let Cursor expand scope mid-task.

### TYPES
Exact zod schemas and TypeScript types Cursor must use. Locked, not suggested. Cursor doesn't invent type signatures.

### SKELETON
JSX scaffold with `// IMPLEMENT:` comments where logic goes. Gives Cursor the shape; Cursor fills in. The skeleton lifts class names directly from the HTML mock where applicable.

### PROHIBITED
What Cursor reliably wants to add but shouldn't. Common examples:
- "Do not add a loading skeleton (deferred to Phase 4)"
- "Do not introduce a new dependency"
- "Do not write tests for this UI (90/10 rule applies)"
- "Do not refactor adjacent components even if they look improvable"

The PROHIBITED block is the highest-leverage one. It encodes the failure modes you've already learned. Updating it after each task is how the methodology improves.

### VALIDATE
Concrete check after Cursor finishes. Examples:
- "Open `mocks/[approach].html` in Chrome at 1440px width, screenshot region X, compare to localhost:3000 — note any drift"
- "Run `npm run typecheck` — zero errors"
- "Run `npm run dev` and verify the route renders without console errors"
- "Load each defined state (e.g. via mock data variants) and verify it matches the corresponding mock state"

---

## Tool boundaries

| Tool | Job in this loop |
|---|---|
| **This playbook** | The methodology |
| **Design brief** (in `ideation/[product]/README.md`) | What and why for the specific product |
| **HTML mock** | Visual authority — locked, doesn't change during build without explicit re-mock |
| **Product-specific BUILD-PLAN.md** | Applies this playbook to the specific product (named phases, named tasks, named open decisions) |
| **Claude Code** | Reads brief + mock + BUILD-PLAN, drafts feature-locks + per-task runbooks, reviews Cursor output for drift |
| **Cursor** | Executes one runbook at a time, scoped strictly to its FILES block |
| **Claude Design** | Post-Phase-2 refinement only; iterates against real codebase, output goes back into mocks/ |
| **You** | Approve mock, approve each feature-lock, review every task before the next one starts |

The tool boundary is the discipline. Letting Cursor plan, or letting Claude Code execute against an unbounded prompt, is where the methodology breaks.

---

## Quality gates per phase

Each phase has a concrete gate that must pass before Phase N+1 starts.

- **Phase 0 gate** — `npm run dev` works, app deploys to the target host (Vercel for the default stack), basic route renders successfully
- **Phase 1 gate** — layout shell renders at desktop width, matches mock's chrome (nav + main + sidebar slot, where applicable), no console errors
- **Phase 2 gate** — primary content components render with mock data, visual diff against the chosen mock approach within tolerance
- **Phase 3 gate** — interaction surfaces (drawers, modals, deep-dives) function as designed, transitions feel right
- **Phase 4 gate** — zod parse succeeds against all mock fixtures, stub API routes return valid shape, all UI consumes data via loaders (no hardcoded data in components)
- **Phase 5 gate** — user can sign up, create a Stripe subscription via hosted Checkout, manage subscription via Customer Portal, webhook handler correctly updates subscription state in the database

Gate failures are recoverable. Skipping a gate isn't. **Don't let "we'll catch it in Phase N+1" become the pattern** — every gate exists because skipping it costs more later.

---

## How to apply this playbook to a specific product

The playbook is the methodology. The application is product-specific. The translation steps:

### Step 1 — Verify prerequisites
Ensure the ideation folder is in shape — README, mocks, chosen approach. If anything's missing, back up.

### Step 2 — Settle the first-gate decisions
- Repo location (default: new standalone)
- Stack lock (default: as above)
- Settle any product-specific deviations (e.g., this product needs a vector DB, this product needs Stripe Connect not subscriptions)

### Step 3 — Write a product-specific BUILD-PLAN.md
Lives at `ideation/[product]/BUILD-PLAN.md`. Lifts the structure of this playbook and fills in:
- Specific repo name + location
- Specific phases (named, with task counts)
- Specific quality gates per phase
- Specific open decisions to settle before later phases

The product-specific BUILD-PLAN is shorter than this playbook because it doesn't restate the rationale — it just applies the decisions.

### Step 4 — Phase 0 kickoff
- Open the product-specific BUILD-PLAN
- Identify Phase 0 — the repo scaffold task
- Have Claude Code draft `feature-builds/00-foundation/PRE-BUILD-LOCK.md`
- Once locked, have Claude Code draft the Phase 0 task runbook
- Hand to Cursor for execution
- Validate against Phase 0 gate
- Proceed to Phase 1

### Step 5 — Repeat for each phase
Each phase: lock → runbook(s) → execute → review → gate → next.

The pattern is the same for every phase. The discipline is what compounds.

### Step 6 — When the build ships, update the playbook
After Phases 0–4 ship on a product, write what you learned back into this playbook's PROHIBITED examples, quality gates, or stack rationale. The playbook gets sharper with each application.

---

## What's reusable vs. product-specific

The boundary between "this playbook" and "the product-specific BUILD-PLAN" matters:

**This playbook holds:**
- The methodology (mock as visual authority, 5-block runbook, phased gates)
- The stack lock and rationale
- The tool boundary discipline
- The quality gate structure
- The translation steps for applying it

**Product-specific BUILD-PLAN.md holds:**
- The specific product context (what is this product, who's the customer)
- The specific phase names and task counts (some products have more phases, some fewer)
- The specific repo name and deploy target
- The open decisions that need product-level answers (which auth, which billing scope, which architecture for write-backs)

If you find yourself updating this playbook for one specific product, stop — that goes in the product-specific BUILD-PLAN. If you find yourself updating a product-specific BUILD-PLAN with something that would apply to every product, stop — that goes in this playbook.

The boundary keeps the playbook reusable. Pollute it with product specifics and it stops being a 10x leverage tool and becomes a one-off document with extra steps.

---

## First worked instance

This playbook was extracted from the AI visibility dashboard build, which is the first concrete application:

- Design ideation: `ideation/ai-visibility-dashboard/README.md`
- Mocks: `ideation/ai-visibility-dashboard/mocks/`
- Product-specific BUILD-PLAN: `ideation/ai-visibility-dashboard/BUILD-PLAN.md`

That product-specific BUILD-PLAN is the canonical example of how the methodology applies. New products copy its shape, swap product specifics, and inherit the playbook by reference.

---

## Why this is "our new approach"

Before this playbook, going from design to code was a series of judgment calls made in real-time, with drift accumulating one task at a time. The methodology existed implicitly in muscle memory — the canonical → lock → mock → runbook discipline from killdate-kit, the HTML-mock-as-authority technique from the Shelf billing case study, the stack preferences earned through trial.

This document makes it explicit, transferable, and reusable. The compounding effect is real:

- Every new product surface saves the cost of re-inventing the methodology
- The PROHIBITED block accumulates real-world lessons, getting sharper each cycle
- The stack lock means tool choice stops being a decision and starts being a default
- The quality gates mean phase failures are caught at the gate, not at integration time

For solo or small-team builders shipping on AI-augmented stacks, this is the kind of artifact that compounds practitioner capital. It's not the killer feature; it's the operating system.
