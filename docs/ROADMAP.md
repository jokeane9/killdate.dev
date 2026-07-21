# killdate.dev — Roadmap

Last reviewed 2026-07-20, after the three-section reorganization shipped.

## Posts in draft

- `posts/38-systems-thinking.md` (post 38, essays) — **placeholder, not written.**
  Held back deliberately when 32–37 published. It is meant to be the one long
  essay above the Shorts, absorbing and going further than post 36 (systems
  thinking as agent orchestration) and post 37 (Orrery / outsourcing the
  abstraction). Open questions carried over from the file's own notes: are the
  six domains the right six, what does "mechanical" supervision honestly
  require, and does the Orrery material belong inside the essay or stay a Short.
  Delete the placeholder comment block before publishing.
- `posts/26-agentviz.md` (post 12, workshop) — long-standing draft.

Drafts no longer build a page in production, so neither of these has a public
URL. Run `docs/publish-checklist.md` before flipping either.

## Open questions from the Shorts series

Both were notes-to-self stripped out of the posts at publish time, and neither
has been answered. The posts are live, so answering them means a follow-up edit.

- **Shellware (post 32)** — confirm the Vizidex engine detail is not more than
  you want public: the architecture review, the "deterministic skeleton with
  bounded agentic limbs" verdict, and the one-true-agent conclusion.
- **Systems Thinking Part 1 (post 36)** — verify the six-domain list is actually
  your six.

## Drafted shorts — awaiting your review

Cleaned up from a voice note, not on the site. If it holds up, it slots into the
Shorts group in essays. Read it, cut what's overwritten, and it's ready to number.

### Hiring by the Session *(working title)*

The constraint I actually hit isn't the AI's — it's mine. I can hold a session: a
bounded stretch of work with a beginning, a middle, and an end. Inside that window
I can drive an agent hard. But the window is finite. Concentration runs out,
context fills up, and the session has to close. That's not a failure — a session
that ends clean is the point. The problem is I only get so many of them in a day.

That reframes what hiring is for. You don't hire to add AI capacity; the AI is the
cheap, parallel part. You hire to add *session-holders*.

Each person you bring on is another human who can own a context session — hold the
goal in their head, feed the agent, judge what comes back, and decide when it's
done. The chat spins up agents downstream, and those agents spin up more; the chain
does the work. But the chain still bottoms out at one human controlling the session
it runs inside. You can't remove that human. You can only add more of them, one at a
time, and only when there's enough coherent work to keep each new person's sessions
full.

So the hiring signal isn't "we're busy." It's narrower: *there's a bounded stream
of sessions going unowned.* Enough real, self-contained work that a new person could
walk in, take a session end to end, and close it without me holding their hand
through it. Short of that, another hire doesn't add throughput — it adds a second
thing competing for my attention, which is the exact resource that was scarce to
begin with.

That's the current read, anyway. It's why we've grown slowly and deliberately:
headcount here is a count of concurrent, well-fed session-holders, not a count of
seats.

---

## Post ideas / backlog

- **The ecosystem viz** — how a hand-rolled HTML dependency map (nodes + SVG
  edges + hover info panel) replaced mental overhead when context-switching
  across a multi-layer SaaS stack. Why bespoke beats D3/Mermaid for a
  single-project living reference doc you control completely.

## Tools / site

- **CloudFront returns 200 for unknown paths.** Any nonexistent URL serves
  `/index.html` with a 200 instead of a 404 — verified against
  `/posts/definitely-not-real`. Pre-existing distribution config, unrelated to
  the reorg, but every broken link is a soft 404 and search engines penalise
  that. Fix by pointing the distribution's custom error response for 404 at a
  real 404 page with the correct status.

## Content / repo decisions

- **`ideation/` is public.** 35 files on `main` — product briefs, research
  summaries, UI mocks, the plugin-support viability report — are visible at
  `github.com/jokeane9/killdate.dev/tree/main/ideation`, plus
  `docs/vibe-coding-rescue-icp-research.md`. Reviewed 2026-07-20 and
  deliberately left in place. Revisit if any of it stops being something you
  want to publish openly.
- The unmerged research on `ideation/ai-seo-analytics-docs` (plugin-support GTM
  research, marketing automation, vertical RAG companion brief) was abandoned
  and the branch deleted. Tip was `91069f9` if GitHub support can still restore
  it; otherwise gone.

## Infrastructure

- **Local deploy escape hatch**: `npm run deploy` ([`scripts/deploy.sh`](../scripts/deploy.sh))
  runs the same build / S3 sync / CloudFront invalidation as CI, from local AWS
  credentials, guarded against publishing a non-`main` branch. Added because a
  GitHub Actions outage on 2026-07-19 left a merge queued indefinitely with
  production stale. CI remains the normal path.
- **Dev server is permanent**: a launchd agent owns `localhost:4322`
  (`~/Library/LaunchAgents/dev.killdate.devserver.plist`, `RunAtLoad` +
  `KeepAlive`). See `docs/ARCHITECTURE.md` for restart/stop/remove commands —
  note that `kill` does not stop it.
- Repo is down to a single branch (`main`); all merged and abandoned branches
  were deleted 2026-07-20.
