---
title: "Kill dates, N-1, and shipping without breaking what's live"
description: "Strangler Fig, Parallel Change, and why every version you ship needs a written sunset condition. The patterns that keep a live product alive through continuous change."
part: 2
post: 7
draft: true
tags: ["shipping", "versioning", "strangler-fig", "parallel-change", "feature-flags"]
---

You're shipping upgrades to a product that's live. Merchants are using it. Every deploy is test-in-prod. Rollback must be available in seconds, not after a 15-minute redeploy cycle.

Three patterns solve this. They're not invented — they're well-documented industry practice, formalized by Martin Fowler's team. Shelf uses all three, and they're documented in `SHELF-AGILE-FALLBACK-PLAYBOOK.md` with the rationale for each one.

## Strangler Fig

The biology is literal and worth understanding. In tropical forests, strangler fig trees (*Ficus*, various species) start as seeds deposited by birds on a host tree branch — high in the canopy. The seed germinates, sends aerial roots down the host's trunk toward the ground. Over years, those roots thicken and fuse, forming a lattice around the host. The fig reaches the ground and starts extracting nutrients the host once received. Eventually the host — starved, structurally encased — dies and rots away. What's left is a hollow cylinder of fig roots standing as a tree in its own right.

The fig didn't replace the host in one move. It grew around it, shared resources for a long time, and only took full possession when the host was completely superseded.

**The software pattern is the same shape:**

1. Put a facade in front of the legacy code. All traffic routes through the facade.
2. Write the new implementation alongside the legacy code — one small piece at a time.
3. Redirect the facade to route that piece to the new code. Reversible with a flag flip.
4. Repeat piece by piece. Measure traffic to the legacy code as you go.
5. When legacy traffic reaches zero for a sustained window, delete it.

On Shelf: `merchants.prompt_version` is the facade. The V1 prompt (`system_prompt.py`) is the standing dead host — receiving zero Claude traffic for months, but the code still exists on disk. The V2→V3 migration is a new strangle in progress. The playbook ensures it finishes with sunset discipline rather than becoming another unfinished strangle.

## Parallel Change (Expand–Migrate–Contract)

Strangler Fig is the strategy for legacy replacement. **Parallel Change** is the tactical pattern for any non-trivial change:

1. **Expand** — introduce the new interface alongside the existing one. Nothing breaks because nothing is removed.
2. **Migrate** — move callers over to the new interface one at a time. The old interface keeps working throughout.
3. **Contract** — delete the old interface once nothing uses it.

At every moment during the migration, the system is in a valid state. There is no big-bang moment of risk. Rollback is always possible because the old path exists until the Contract step deletes it.

The V1→V2 prompt migration on Shelf was Parallel Change. The V2→V3 migration is Parallel Change. The Opportunities→Briefing UI migration is Parallel Change. It's the default for any non-trivial change.

## The N-1 fallback rule

**At any time, production runs version N. Version N-1 stays bootable behind a flag as rollback. Version N-2 and earlier get deleted.**

Every new version ships with two artifacts written before it ships:

- **Sunset criterion** — the measurable condition under which the previous version gets deleted. Example: "Delete prompt v2 once 100% of merchants have been on prompt v3 for ≥14 days with zero schema validation warnings logged."
- **Kill-date estimate** — when the sunset criterion is expected to be met. Example: "Target kill-date for prompt v2: 2026-06-15."

Without the kill-date, fallbacks accumulate. This is not theoretical. Shelf currently has three Layer 4 prompts on disk — v1, v2, v3 — because no kill-date was written when v2 replaced v1. The v1 code is dead weight. It'll stay dead weight until someone explicitly cleans it up.

Kill-date discipline is cheap to write before shipping and expensive to skip.

## Feature flags as rollback mechanism

The practical implementation is `merchants.prompt_version` — a per-merchant flag in the database. NULL or `"2.0.0"` routes to prompt v2. `"3.0.1"` routes to prompt v3.

When V3 shipped on Shelf, it was deployed to production but flagged to zero merchants initially. The first flip was to one merchant — `shelf-dev-3`. Re-crawl triggered. Layer 4 fired with the new prompt. Pydantic validated. Cache row written. Dashboard rendered. Everything held.

The flag is what made this safe. When UI drift was discovered after the initial V3 ship, the fix was a single SQL statement: flip the one flagged merchant back to v2. Total exposure: one merchant, zero production incidents. Total rollback time: about five seconds.

Without the flag, rollback would have required a redeploy. With the flag, rollback is a database update.

## The prompt migration naming problem

Three axes. Three distinct notations. Non-negotiable:

- **Product version**: capital V + integer. `Shelf V1`, `Shelf V2`, `Shelf V3`.
- **Prompt version**: lowercase v + three-digit semver. `prompt v2.0.0`, `prompt v3.0.1`.
- **Storage**: bare table name, no version. `layer4_cache`, `dashboard_intelligence_cache`.

"V3 runs on V3" means nothing. "Shelf V3 runs prompt v3.0.2, data flows through `dashboard_intelligence_cache`" is unambiguous. The nameology discipline prevents arguments about what broke which version of what.

During the V2→V3 migration, both `dashboard_intelligence_cache` (the V2 cache table) and `layer4_cache` (the V3 cache table) existed simultaneously. Without strict nameology, every log line, every SQL query, every discussion about which cache had which data would require a clarification step. With it, the notation itself disambiguates.

## The worked example

When V3 shipped on Shelf:

- **N** = Shelf V2, prompt v2.x.x, production default, all merchants
- **N+1** = Shelf V3, prompt v3.0.2, feature-flagged to zero merchants at ship
- **Surgical change**: `OpportunitiesSection` replaced by `BriefingSection` in the card stack. One slot. One component type.
- **Invariants**: Settings, onboarding, billing, banners — all unchanged. Written explicitly in the lock.
- **Sunset criterion for prompt v2**: 100% of merchants on v3 for ≥14 days, zero schema warnings, zero bug reports.
- **Kill-date**: 30 days post-global flip. Logged in the PR description.

Every one of those items was written before the code was touched.

---

**Action:** Look at your current production version. Does N-1 exist and stay bootable as rollback? Does the previous version have a written sunset criterion and kill-date? If not, write them now — before your next deploy. The playbook structure is in the Shelf repo. [github.com/jokeane9/shelf](https://github.com/jokeane9/shelf)
