# Idea Brief: Backcountry Decision-Support Tool

> A working brief from a strategic conversation on building an MCP-server-backed
> AI tool for avalanche-terrain decision support — for personal use first, with
> a possible physical-companion retail wrap.
> Saved 2026-05-22 for later reference.

---

## 1. Executive Summary

**The product:** A personal-infrastructure tool that ingests a planned ski-touring route (GPX) and synthesizes hourly conditions × terrain × avalanche bulletin × the user's own historical observations into a structured morning brief, plus a templated in-field stop-pattern reassessment that runs at planned waypoints.

**The framing that survived skepticism:** *Decision support, never decision making.* The product is a structured-observation discipline tool with an AI synthesis layer. It does not output "go/no-go." It outputs situational awareness so the user can decide.

**The architecture:** Three AI roles (morning brief / stop-pattern / evening synthesis), four MCP servers (weather / avy / terrain / pattern library), Claude Desktop or `claude` CLI as the chat UI. No app build for v1.

**The build scope:** 3–5 weekends to working state. *Not* a year. Personal use first; commercial framing is optional and explicitly downstream.

**The commercial wrap (if pursued):** A waterproof field book + zone cards + bundled software access, retailed on Shopify. Physical companion is the natural Shopify product; software is the bundled add-on, not the main SKU.

**The moat (if there is one):** A seasonal pattern library — the user's own structured observations logged against the forecasts that preceded them, accumulating into "in this zone, with this forecast signature, this terrain has produced this outcome." Compounds over winters. Nobody else has the user's data.

---

## 2. Product Hypothesis

### 2.1 The unmet need

Existing tools serve adjacent needs:
- **Avalanche bulletins** (Avy Canada, NWAC, CAIC, EAWS) — regional, daily, calibrated for the general public
- **Weather forecasts** (Open-Meteo, MET Norway, SpotWx) — hourly, generic to terrain
- **3D mountain visualization** (FATMAP — shuttered Oct 2024; Gaia, OnX, CalTopo) — terrain visualization for route planning

What no consumer tool does well: **cross-reference all three against a specific planned route on a specific day, hour by hour, accounting for slope/aspect/solar/temperature evolution.**

Pros do this synthesis in their heads using AIARE/CAA training plus experience in their zone. The product compresses that into a structured brief plus a forced-verbalization observation template.

### 2.2 What the chat UI is for

The chat UI is *not* an oracle that answers "should I ski this?" It is a thinking partner that:
- Pre-loads the day's context (forecast, bulletin, route, sun timing)
- Asks structured questions at field waypoints ("what's the aspect, angle, surface, recent loading, signs of instability you're seeing right now?")
- Synthesizes the user's observations against the morning brief and flags divergence
- Saves the day's record to the pattern library for future briefs

The product's value is **forcing structured verbalization** of what the user is seeing in the field. Pros teach this with their ski partners; the tool codifies it.

### 2.3 What the product is not

- It is not an avalanche detection device
- It is not safety equipment
- It does not output a go/no-go decision
- It does not replace AIARE/CAA training
- It is not a replacement for a competent ski partner
- It does not claim to keep anyone alive

These "is nots" are not marketing copy — they are the liability boundary. Cross any of them and the product becomes Avatech (see §8).

---

## 3. Architecture

### 3.1 Three agent roles

**Morning Brief Agent** — runs at home or trailhead, full connectivity.

- *Inputs:* planned route (GPX), planned waypoint timings, all MCPs available, user's pattern library
- *Crosses:* hourly weather × terrain aspect/angle × computed solar irradiance × bulletin problem types × prior observations from this zone matching this forecast pattern
- *Output:* hour-by-hour situational brief per waypoint
- *Example:* "0900 col 2100m: N aspects loaded 30cm overnight wind SW; FL holds 1800m through 1300; cornice failure risk lee aspects after 1400; your obs from 2024-02-11 with similar pattern showed surface instability on this aspect."
- *Model:* Claude Sonnet, full context, all tools

**Stop-Pattern Agent** — runs at waypoints, connectivity optional.

- *Inputs:* cached morning brief + structured observation form filled at the stop + new data if connected
- *The form is the product.* Aspect / slope angle / surface / recent loading / visible crowns / signs of instability are the cognitive scaffold. Forced verbalization is the value.
- *Reasoning:* where does observation diverge from morning assumptions? What changed?
- *Output:* short reassessment, designed to fit 160 characters (satellite-text compatible) — "FL forecast 1800; you reported wet at 2050; FL climbing faster than forecast; pull south-aspect retreat 90min earlier."
- *Model:* local 4–8B on phone offline, or Claude Haiku via satellite text when connected

**Evening Synthesis Agent** — runs at home, full connectivity.

- *Inputs:* day's observations + forecast deltas + close calls
- *Output:* structured pattern library entry — what the forecast said vs. what actually happened, what surprised the user, what to watch for next time
- *This is where the moat compounds.* Year 2 onwards, the morning brief queries this library and references prior similar-pattern days.

### 3.2 Four MCP servers

**`weather-mcp`**
- `get_hourly_forecast(lat, lon, elevation, hours)` → Open-Meteo (HRRR / HRDPS / ECMWF in one elevation-aware call, no API key)
- `get_snotel_station(station_id, days)` → NRCS AWDB (PST tz — normalize)
- `get_mesonet_nearby(lat, lon, radius_km, hours)` → Synoptic Data

**`avy-mcp`**
- `get_bulletin(region_id)` → NAC API for US (NWAC / CAIC / UAC / BTAC / etc. in one GeoJSON) or Avalanche Canada Products API for BC / AB
- `get_observations(bbox, days)` → MIN reports + NWAC obs (public tier only)
- `get_region_for_point(lat, lon)` → resolve coordinates to forecast region
- *Deliberately excluded:* INFOEX, NWAC pro feed, all gated pro feeds (liability + reciprocity + calibration mismatch — see §7.4)

**`terrain-mcp`**
- `get_terrain(lat, lon)` → DEM (USGS 3DEP US / NRCan CDEM Canada / Mapbox Terrain-RGB global)
- `get_solar_on_slope(lat, lon, datetime, aspect_deg, angle_deg)` → pvlib computed, no upstream API
- `sample_route(gpx_path, interval_m)` → resamples GPX into waypoints with terrain attached

**`patternlib-mcp`** — local SQLite, the moat
- `log_observation(date, location, conditions_json)`
- `query_similar(forecast_signature, zone)` → returns prior days with similar pattern in same zone and what actually happened
- `get_zone_history(zone, days)`

**Optional Phase 4 addition: `inreach-mcp`**
- `send_text(message)` / `poll_inbox()` via Garmin IPC Outbound
- 160-character bandwidth constraint
- Build only after the core four are validated

### 3.3 No app for v1

Claude Desktop, `claude` CLI, or any MCP-compatible client is the UI. No frontend work. The MCPs serve any client that speaks the protocol.

---

## 4. Data Sources

Full catalog with API status, auth, rate limits, gotchas, and a coverage matrix is in `backcountry-data-sources.md` (sibling file, 258 lines).

**The MVP backbone is five sources, not the long tail:**

1. **NAC API** (avalanche.org) — one GeoJSON endpoint covering ~20 US avy centers (NWAC, CAIC, UAC, BTAC, FAC, GNFAC, etc.)
2. **Avalanche Canada Products API** — BC/AB forecasts + MIN observations + weather stations in one place
3. **Open-Meteo** — elevation-aware hourly multi-model (HRRR / HRDPS / ECMWF), no API key
4. **NRCS AWDB REST** — SNOTEL automated snow stations (US West)
5. **Synoptic Data** — 170k+ mesonet stations including the avy-center mesonets

Plus **Garmin inReach IPC Outbound** for field text ingest if Phase 4 happens.

**Several "obvious" sources are dead or hostile — do not design around them:**

- FATMAP — shuttered Oct 2024
- Strava global heatmap external tiles — closed mid-2025
- CalTopo layer licensing — ended 2020 (human use only, no API)
- Mountain Project Data API — deprecated 2020
- MesoWest — sunsets Dec 2026 (migrate to Synoptic)
- mountain-forecast.com — Cloudflare-walled

**Europe is cleaner than expected:** EAWS standardized on CAAML v6 JSON. SLF (Swiss), ALBINA (Tyrol/SoTyrol/Trentino), and Varsom (NO via Regobs) all have well-documented public APIs under CC BY 4.0. `pyAvaCore` library abstracts most of them. If geographic expansion ever matters, Europe is one library, not 30 integrations.

**Watch-outs from the catalog:** NRCS AWDB returns everything in PST; NAC has an explicit "don't change forecast intent" clause; NWAC pro API is researcher-gated; MET Norway and NWS require identifying User-Agents.

---

## 5. Phased Build

### Phase 1 — Morning brief CLI (2 weekends)

One Python script. No MCPs yet. No app. Just enough to validate the brief is useful.

1. Input: GPX file + waypoint timing offsets
2. Open-Meteo call per waypoint, hourly through trip duration
3. NAC or AvCan call for the region
4. pvlib computes solar irradiance per waypoint × aspect × time
5. One Claude API call: structured prompt with all the above, output markdown brief
6. Print to stdout

**Validation gate:** use it for 5–10 real ski days. Does the brief read as useful, or generic and wrong?

### Phase 2 — Stop-pattern observation template (1 weekend)

Markdown observation form. Fill on phone or paper. End of day, pipe back into a Claude call for synthesis. Append the day's structured record to a local SQLite.

**Validation gate:** does the user actually fill the form in the field? If no, the cognitive scaffold premise is wrong and Phase 3 is moot.

### Phase 3 — MCP wrap + pattern library feedback (1–2 weekends)

Convert the Phase 1 calls into the four MCP servers. Wire up `patternlib-mcp` to feed the morning brief. Now the brief references prior similar-pattern days from the user's history.

**Validation gate:** by end of season 1, are the pattern-library callbacks actually informative or just noise?

### Phase 4 — Satellite text / local model on phone (optional, deferred)

`inreach-mcp` + local 4–8B model for offline field synthesis. Only worth building if Phase 2 validated stop-pattern use and the user wants connectivity past the trailhead.

### Phase 5 — Commercial wrap (optional, see §6)

Physical companion product + Shopify. Only after personal use validates the product over at least one full winter.

---

## 6. Commercial Framing (Optional)

This product can stay personal infrastructure indefinitely. The commercial path is *additive*, not required. The framing here is what would work if the user wanted to retail it.

### 6.1 Shopify shape

Pure software-on-Shopify works but is friction-heavy. Shopify is built for boxes. The natural product is a **physical companion** with the software as a bundled add-on.

### 6.2 Catalog (ranked by margin × brand fit × low liability)

**Anchors and high-fit:**

| SKU | Price | Notes |
|---|---|---|
| Field book | $30–40 | Spiral-bound, waterproof cover, structured observation template per page, code key on back cover. Anchor product. |
| Snowpack profile pad | $12–15 | 50 pre-printed snowpack diagram pages. Pros currently rip pages from spiral notebooks. |
| Zone card (per zone) | $15–20 | Waterproof laminated. Front: zone's recurring concerns. Back: observation template. Collectible system. |
| Slope angle / aspect reference card | $8–12 | Credit-card-sized. Pocket utility, gift attach. |
| Avalanche problem type poster set | $25–45 ea | Slab / loose / wet / wind / persistent. Gift-friendly. |

**Cart-builders (hit-free-shipping items):**

| SKU | Price |
|---|---|
| Sticker pack | $5–8 |
| Patches (per zone) | $8–12 |
| Cold-weather pencils + cap holder | $6–10 |
| Enamel pins | $10–15 |

**Bundles:**

| Bundle | Price |
|---|---|
| Starter kit (book + stickers + 1 card) | $59 |
| Full kit (book + 3 cards + pad + 1 season digital) | $129 |
| Pro kit (book + pencil set + all cards + patch + 1 season digital) | $189 |

**Considered, real upsides (Year 2+):**

- Beanies / buffs ($25–35) — only if brand is real
- Coffee partnership — "Morning Brief Blend" with a local roaster
- Curated book resells — Tremper, Daffern, AIARE materials

**Deliberately excluded:**

- Beacons, shovels, probes, airbags — commoditized PPE trade, lose
- Helmets, snow saws, crampons — regulated PPE
- T-shirts — saturated, no brand justification yet
- Anything electronic — Avatech graveyard
- Anything claiming detection / prevention / safety — liability cliff

### 6.3 The brand thread

Everything in the catalog is a **discipline tool**, not a **safety device**. The book makes you observe better. The card makes you measure slope. The poster teaches you to name what you see. The sticker is a tribe marker.

Nothing in the catalog promises to keep anyone alive — they make you the kind of person who is more likely to keep themselves alive. The day "stay safe with…" lands on a product page is the day the catalog becomes dangerous.

### 6.4 AOV math

- Anchor product $35 + sticker pack $6 + pen $7 + zone card $20 = **$68 AOV**
- Kit at $89 + extra card $20 + sticker $6 = **$115 AOV**

Healthy outdoor DTC numbers if conversion holds.

### 6.5 Where Shopify is the wrong answer

If the catalog reduces to "just the software subscription," use Gumroad or Lemon Squeezy. Shopify is the right answer only if at least one physical SKU is in the cart.

---

## 7. What Kills This

### 7.1 Liability

"The AI said it was fine" is existential if this ever ships commercially. Even personal use deserves the *decision support, never decision* framing internalized in copy and UX. Study how Avy Canada talks about specific slopes — they never rate one.

For personal use the liability frame is smaller (the user is advising themselves) but the cognitive trap is the same: trusting an AI synthesis over your own observation is the failure mode that gets pros killed.

### 7.2 Geographic specificity

South Coast BC ≠ Wasatch ≠ Tetons ≠ Alps. Snowpack history, problem types, terrain character, even forecast language differ. Pick one zone for the first 18 months. The morning brief that works for one zone will read as generic and wrong in another until the pattern library has a season of data in the new zone.

### 7.3 Cold-start on the pattern library

The moat does not exist in Year 1. The product is mildly useful Year 1, becomes interesting Year 2, defensible Year 3. Plan for low-yield Year 1 from a personal-utility standpoint, and *do not* try to ship commercial before the pattern library has proven itself in personal use.

### 7.4 Why pro feeds stay walled off

Even if access were possible, gated pro feeds (INFOEX, NWAC pro tier) should stay out of this product. Reasons:

1. **Liability** — raw pro observations are working notes for trained colleagues, not vetted public statements
2. **Trust network** — pro exchanges only work because they are closed; opening them collapses the data quality immediately
3. **Funding** — INFOEX membership funds the CAA; free public access guts the model
4. **Calibration** — R-size, D-size, ECT/PST codes get catastrophically misread by recreationists
5. **Reciprocity** — patrollers contribute to colleagues, not to a third-party AI product

The product's edge is *better synthesis of public data + the user's own historical record* — not better raw data than pros.

### 7.5 Market math (if commercial)

Backcountry skiers globally: roughly 1–2M serious users. Cheap (used to free OSM/Avy Canada tools). High churn out of backcountry as users age. Gaia is $40/yr, OnX is $35/yr — pricing ceiling around $50–100/yr.

Reasonable side-business outcome: 5–10k paying users at $50/yr × 3 years = $250k–500k ARR. Not a startup. A lifestyle business at best. FATMAP's death under Strava ownership confirms the unit economics are hard even with strong distribution.

This is fine — but pencil it honestly, do not project unicorn outcomes.

---

## 8. The Avatech Cautionary Tale

~2013–2018. MIT spinout. Raised ~$20M+. Built the SP1 and SP2 — digital snow probes that produced real-time snowpack hardness/temp profiles in 30 seconds vs. 10 minutes of digging. Smart product, real engineering, well-funded, beloved by early adopters.

They died.

**Why this matters here:** Avatech is the closest historical analogue to a hardware-assisted avy decision product. The failure modes apply directly:

- Pros didn't adopt — they're trained on ECT/CT/hand hardness and don't trust a probe trace as a stability surrogate
- Recreationists wouldn't pay $2K for a probe
- Avalanche Canada / AAA never endorsed it because it gave data, not a decision
- The data the device produced didn't actually replace the test it was competing against

**Reading for this product:** stay on the *paper and software* side of the line. Field books, zone cards, observation templates, software synthesis — fine. Anything electronic that ships in the box and claims to assess the snowpack is the Avatech trap.

---

## 9. Personal Infrastructure vs. Company

The conversation kept oscillating between framings. Resolution: **start personal, stay personal, expand only if validated.**

**Personal use removes most of the failure modes:**

- No liability (advising self)
- No pro-feed friction (use whatever access you have legitimately)
- No moat question (no competitors to defend against)
- No market-size constraint (n=1 is fine)
- No need for an app (Claude Desktop is the UI)
- No fulfillment, no returns, no inventory

The discipline value alone (forced structured observation) is worth the 3–5 weekend build, regardless of any commercial outcome.

**Commercial wrap is downstream of personal validation.** Do not attempt to ship retail until at least one full winter of personal use has confirmed the morning brief is actually useful and the stop-pattern form is actually filled in the field. If either fails in personal use, the commercial product cannot rescue them.

---

## 10. Open Questions / Decisions Deferred

These are unresolved, deliberately:

1. **Which zone first?** Coast BC implied by user signal but not confirmed. Choice has knock-on effects on which forecast region API endpoints to wire first and which pattern library seeds.
2. **Local model on phone?** Plausible (4–8B can do the synthesis offline) but adds significant complexity. Defer until Phase 4.
3. **GPX source?** What planning tool will the user export from — Gaia / OnX / CalTopo / manual? Influences whether route ingest needs more than GPX parsing (e.g., waypoint metadata, planned timings).
4. **Multi-user from day 1?** Touring partner sees the brief too? Implies shared route + role-based observation. If yes, this changes the data model. If no, stays single-user trivially.
5. **Pattern library seed?** Year 1 has no historical data. Seed with avy bulletin archive replays + public MIN reports geocoded into the zone? Or just accept cold-start?
6. **Brand name?** Not the priority, but worth not coding around a working title forever. The "morning brief" frame is strong and could anchor naming.

---

## 11. Next Concrete Action

When ready to move:

- Start a new repo (not in `killdate-kit`, not in `killdate.dev`)
- Phase 1 CLI: GPX in → markdown brief out, using Open-Meteo + NAC/AvCan + pvlib + one Claude call
- Validate on 5+ real ski days before building any MCP scaffolding
- If the brief is useful, proceed to Phase 2 observation template
- If the brief is generic/wrong, the product premise needs revisiting

The catalog of data sources is in the sibling file `backcountry-data-sources.md` and is the working reference for any build step.
