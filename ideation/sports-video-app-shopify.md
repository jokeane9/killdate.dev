---
title: "Sports AI video for Shopify merchants — the vertical nobody built"
description: "Market research and product concept for a vertical-specific AI video generation app targeting sports merchants on Shopify. The race window is open, the infrastructure exists, and there is no direct competitor."
part: 0
draft: true
tags: ["shopify", "ai-video", "sports", "vertical-saas", "product-concept"]
---

*Research date: 2026-05-24. Race window estimate: 12–18 months.*

---

## The gap in one sentence

Every AI video and image generation app on the Shopify App Store targets fashion or is generic. There is no vertical-specific tool for sports merchants. The race window is open.

---

## Market context

The Shopify AI image/video app market is a mid-stage gold rush. The App Store grew 52% YoY (11,600 → 17,600 apps), AI tools as the primary driver. New entrants in the video category: ~2–4 per month through 2025.

The commodity layer — background removal, generic lifestyle staging, basic model swap — is crowded and being undercut by Shopify Magic (free, native). The race that still has open field:

1. **Video for non-fashion verticals** — nearly every AI video app targets fashion/apparel. Home goods, beauty, food, pets, sports = almost no purpose-built competition.
2. **Generate → catalog → published automation** — nobody closes the loop cleanly. Merchants still download and manually re-upload.
3. **Catalog-level consistency** — same AI model, same lighting, across 500 SKUs. Every on-model app gets the same complaint: inconsistent quality at scale.

### What these apps are actually running

Nobody builds their own models. The stack in use:

| Model | Role | Cost |
|---|---|---|
| **Kling (Kuaishou)** | Dominant — cheapest viable quality, best image-to-video for product turns and material motion | ~$0.07/sec |
| **Veo 3 (Google)** | Premium — native 4K, synchronized audio, best prompt adherence | ~$0.10-0.15/sec |
| **Runway Gen-4** | Best character consistency, expensive, skews enterprise | ~$0.15+/sec |
| **Seedance (ByteDance)** | Best multi-shot sequences, preserves logos/text across frames | ~$0.04-0.08/sec |

Infrastructure layer: **fal.ai** (985 model endpoints) or **Replicate** as aggregators. 30–40% cost reduction vs. hitting APIs directly. Standard stack for any new builder.

OpenAI Sora: dead. Launched Sept 2025, deprecated Sept 2026. $15M/day operating costs vs $2.1M lifetime revenue. Not a viable backend.

### Feature claims — what the existing apps compete on

Current apps race on **generation formats** (image-to-video, UGC, runway walk, faceless video) and **distribution channels** (TikTok ready, shoppable video). Nobody competes on:

- Output reliability at catalog scale
- Vertical-specific shot architecture
- Compliance-aware generation
- Generate → publish automation (the actual workflow moat)

---

## Why sports specifically

### The differentiation is structural, not aesthetic

Sports product video requires a fundamentally different shot architecture than fashion or generic tools:

**Required shot types:**
- **Hero/reveal** — product isolated, dramatic angle or lighting
- **In-motion action** — product being used during athletic activity (running, lifting, cycling). The product must be shown under stress.
- **Material detail** — moisture-wicking fabric texture, grip surface, mesh weave — communicating performance properties
- **Environmental stress** — waterproofing, sweat resistance, all-weather durability. Water, sweat, and environmental context visualization.
- **Lifestyle** — athlete in environment, social identity signal

**The key structural requirement that doesn't exist in fashion:** the product must be shown *functioning*. A cycling shoe must be shown in a pedal stroke. A resistance band must be shown under tension. A supplement must be associated with peak exertion. The camera's subject is not the product sitting still — it is the product functioning.

Generic tools produce product-sitting-still. Sports merchants need product-under-load.

### Prompt engineering gets most of the way there

Unlike beauty (where skin-tone accuracy requires model fine-tuning, not just prompts), sports differentiation is largely achievable through prompt engineering:

- Athletic context, motion blur style, environmental stress conditions — current models follow compositional instructions well
- Physically plausible material deformation (fabric stretching correctly under a moving body) still benefits from domain-specific fine-tuning but prompt engineering gets 70-80% there

This means: a well-built sports template library + prompt architecture ships fast and validates before significant model investment.

### Compliance is simple (for equipment/apparel)

Equipment and apparel: essentially no compliance constraints on video content.

Supplements: FTC/FDA performance claims, athlete endorsement disclosure. Real constraints but well-documented. If starting with equipment or apparel, compliance is not a day-one blocker.

### The merchant bottleneck

Sports brands don't have professional action footage. Hiring a videographer with athletes costs thousands per shoot. UGC from customers is gritty-authentic but inconsistent. The merchant's workflow problem is: generate credible action contexts from product images without a studio shoot.

This is the single value proposition. Everything else is delivery mechanism.

### The market gap

- **No dedicated Shopify app** — not one app with significant installs that targets sports merchants specifically
- **Presti is the proof of concept** — YC-backed, $3.5M ARR in 18 months, targeting furniture (another ignored vertical). Vertical-specific AI photo tools work.
- **Sports on Shopify** — equipment, activewear, supplements, sport-specific gear. High AOV, high-consideration purchase, video converts.

---

## Product architecture

### The split

```
Offsite (your servers)           Shopify Admin (embedded app)
─────────────────────            ─────────────────────────────
fal.ai / Kling / Veo 3           Product picker (ResourcePicker)
Video processing / transcode     Job status + video library
Storage (S3)                     Credit management
Job queue                        App Block (storefront player)
Sports template library
```

Merchant never leaves Shopify Admin for the core workflow. The backend does the heavy lifting invisibly. The offsite creative workspace (separate URL) is for deeper editing, media management, and generation outside of Admin.

### The workflow moat

```
1. Pick product from Shopify catalog  ← ResourcePicker, 1 click
2. Wizard: 3-4 sport-specific questions (sport, shot type, context)
3. Generate via Kling/Veo 3 on fal.ai
4. Preview
5. [Download]  or  [Push to Shopify Product]
```

**"Push to Shopify Product"** is the moat. The staged upload flow (3-step GraphQL API) lives in the backend. Merchant sees one button. None of the current apps do this cleanly — they all end at download.

### The generate → Shopify loop

Pulling product images FROM Shopify: Shopify's native ResourcePicker component lets the merchant browse their catalog and select products. API returns all product images as URLs, ready to pass straight to fal.ai. Zero upload friction — one click.

Pushing generated video BACK to Shopify: staged upload flow (request pre-signed URL → upload → associate with product). The complexity is backend-only. Merchant experience is one button.

This is the workflow gap that every existing app leaves open. It's the actual differentiator over Tolstoy, Shhots, VideoPoint.

### Model stack recommendation

- **Kling via fal.ai** — cost-efficient image-to-video and product action shots. Default generation model.
- **Veo 3 via fal.ai** — premium quality, native audio. Offer as premium output tier.
- **Seedance** — multi-shot sequences, brand consistency across frames.

No proprietary model needed for v1. The moat is the sports template library, the shot architecture, and the Shopify workflow — not the generation model.

---

## Infrastructure leverage from Shelf

This app is not greenfield. Shelf (existing Shopify app) has already built and battle-tested:

| Already built | Reuse status |
|---|---|
| Shopify OAuth + session handling | Direct reuse |
| Product catalog pull (images, titles, variants) | Direct reuse — exactly the input the video wizard needs |
| Async job pattern (ECS + pg-boss) | Direct reuse — submit → process → notify maps perfectly to video generation |
| Shopify billing API | Direct reuse, new tiers |
| Deploy pipeline (AWS, GitHub Actions, canary) | Direct reuse |

Net-new work: fal.ai integration, sports template library, video storage (S3), staged upload back to Shopify, offsite UI.

The Shopify integration that would cost 2–3 months from zero is already done. Most competitors started from zero on this. This is the structural head start.

---

## The race window

12–18 months before WeShop-scale operators (1M+ user bases) fully port their quality into Shopify-specific vertical workflows.

Apps that launched in the last 8 months have under 50 reviews each. First-mover advantage in sports is still acquirable. The window is open because:

1. Sports requires domain knowledge to get the shot architecture right — generic builders don't have it
2. The compliance-free entry point (equipment/apparel) removes the legal complexity barrier
3. The generate → Shopify publish loop is technical work that takes time — a head start here compounds

---

## Open questions before building

1. **Which sub-vertical first?** Equipment/hard goods (kettlebells, bikes, rackets), activewear/performance apparel, or sport-specific gear (surf, climb, ski, run, cycle)? Determines the first template library and the first merchant conversation.
2. **What's the product name?** Separate brand from Shelf. Sports-specific or sports-generic positioning?
3. **Validate generation quality before building the wrapper** — test Kling/Veo 3 against real sports product images, across 2–3 shot types, before investing in the UI. Quality is the product. The wizard is the delivery mechanism.

---

## Why this specifically

Domain expertise in the target vertical is the actual moat when the generation model is commoditised. The shot vocabulary, the merchant problems, the compliance edge cases — these are intuitive when the vertical is your world. They take months to learn from outside.

Presti's $3.5M ARR in 18 months was built on 75,000 furniture-specific training images and a team that understood furniture photography. The sports equivalent hasn't been built yet.
