# Backcountry Ski Decision-Support Data Sources

Reference catalog for an MCP-server-backed AI tool covering (1) morning route brief generation and (2) in-field waypoint reassessment. Focus: Western North America (BC, AB, WA, MT, ID, WY, UT, CO, CA). Europe = stretch.

Compiled: 2026-05. Verify endpoints before building — public weather/avy APIs drift.

---

## TL;DR — Minimum Viable Backbone (5–7 sources)

Build the v0 against these. Everything else is enrichment.

1. **avalanche.org National Avalanche Center API** — single GeoJSON endpoint that covers ~20 US centers (NWAC, CAIC, BTAC, GNFAC, SAC, FAC, SNFAC, ESAC, COA, MWAC, AAIC, etc.) with danger ratings. One integration, broad coverage. Full forecast prose still requires per-center fetch.
2. **Avalanche Canada Products API** (`avcan-services-api.prod.avalanche.ca`) — forecasts + SPAWs + MIN observations + weather stations + areas/regions. JSON + GeoJSON. Covers all of BC + AB.
3. **Open-Meteo** — free, no-key, hourly forecasts, multi-model ensemble including HRRR / HRDPS / ECMWF / GFS, elevation-aware. Single dependency, replaces several model-specific scrapes for v0.
4. **NRCS AWDB REST API** (SNOTEL) — official REST + Swagger, hourly SWE / snow depth / temp for US mountain west. Free, no key, government-stable.
5. **Synoptic Data API** (MesoWest successor) — 170k+ mesonet stations including the avy-center-operated remote weather sites. Free open-access tier, paid for high volume. MesoWest itself sunsets 2026-12-31, so build against Synoptic from day one.
6. **USGS 3DEP Elevation Point Query Service** + Mapbox Terrain-RGB (or self-hosted DEM) — for slope/aspect/elevation at any waypoint. Free tier sufficient for route-scale queries.
7. **MET Norway Locationforecast** (Europe stretch) OR **Garmin inReach IPC Outbound** (field-side hardware ingest) — pick based on whether stretch goals matter more than field ingest.

If you have to pick five: drop MET Norway and Garmin. The first five cover ~95% of the morning-brief use case for the target geography.

---

## Sources to AVOID or De-prioritize

| Source | Why |
|---|---|
| **CalTopo layers as data source** | Layer licensing ended in 2020. Only accessible inside the CalTopo app. Do not scrape — explicitly disallowed. Use CalTopo for human map work, not as a data feed. |
| **FATMAP API / routes** | App shuttered 2024-10-01. Routes nominally migrated to Strava but not surfaced. No API. Dead. |
| **Strava Global Heatmap (external tiles)** | Mid-2025 Strava removed external high-res tile access. Now requires signed authenticated tokens; ToS hostile to programmatic use. Treat as off-limits. |
| **Mountain Project / Powder Project Data API** | Adventure Projects deprecated the public Data API in late 2020. No replacement. |
| **mountain-forecast.com** | No public API. Scrape-only. Cloudflare-protected. Hostile to programmatic ingest. |
| **Apple satellite messaging API** | Rumored for late 2026 / 2027 iPhone cycle; not shipping now. Don't design around it. |
| **MesoWest direct API** | Sunset 2026-12-31. Use Synoptic Data PBC successor instead. |
| **INFOEX (Canadian Avalanche Association pro records)** | Closed system, paid pro subscription, contractual restrictions on redistribution. Useful only if you become a pro org member; not a public data source. |
| **NWAC undocumented API** | Sharing restricted to "approved researchers and professional partners." You can ask (forecasters@nwac.us) but don't build a product assuming access. Use the avalanche.org map-layer API for NWAC danger ratings instead. |

---

## 1. Avalanche Bulletins (Forecasts)

### North America

| Source | URL | Access | Auth / Limits | Coverage | Update | Format | Gotcha |
|---|---|---|---|---|---|---|---|
| **National Avalanche Center (avalanche.org) API** | `https://api.avalanche.org/v2/public/products/map-layer` and `…/{center_id}` | Official public, undocumented beyond a README | No auth documented; rate limits not published — be polite | All US centers via NAC's Avalanche Forecast Platform (AFP): NWAC, CAIC, BTAC, GNFAC, SAC, FAC, SNFAC (Sawtooth), ESAC, COA, MWAC, AAIC (Alaska), CNFAIC (Chugach), Mt Shasta, Sierra, Wallowa, Payette, etc. (~20 centers) | Daily by ~07:00 local (centers vary; check 06:00–10:00 MT) | GeoJSON FeatureCollection (polygons + danger ratings 1–5) | Map-layer endpoint gives **danger only**, not the full bulletin prose. Bottom-line text + problems require per-center page fetch or a different AFP endpoint. Docs explicitly warn: "3rd party use must not inadvertently change intent." Repo: `github.com/NationalAvalancheCenter/Avalanche.org-Public-API-Docs`. |
| **Utah Avalanche Center forecast JSON** | `utahavalanchecenter.org/docs/api/forecast` | Official documented JSON | Returned HTTP 403 to direct fetch — possibly geo/rate-gated. Reachable from browser. | UAC zones (Wasatch, Skyline, Logan, Moab, Abajos, Uintas) | Daily AM | JSON | One of the few centers with explicit per-center docs predating AFP consolidation. May overlap/duplicate AFP data. |
| **Avalanche Canada Products API** | `https://avcan-services-api.prod.avalanche.ca` (docs at `docs.avalanche.ca`, public at `avalanche.ca/api-docs`) | Official public | No auth required for read; check `docs.avalanche.ca` for ToS | All Avalanche Canada regions (BC, AB, Yukon — ~20 forecast areas) + SPAW (Special Public Avalanche Warning) | Daily by ~16:00 PT for next day | Products as JSON, areas as GeoJSON | Three endpoints work together: Areas (polygons), Metadata (danger color/alt-text), Products (full forecast). Don't render danger without rendering the date/expiry — bulletins go stale fast. |
| **CAIC (Colorado)** | `avalanche.state.co.us` | New data API exists internally (powers their map/table views); no public docs found | Unclear public availability | Colorado | Forecast 16:30 daily; weather forecast 06:00 + 12:00 for 21 points | Likely JSON via undocumented endpoints | CAIC is in AFP, so prefer the avalanche.org route for danger ratings. Field-report API is undocumented — scrape with caution and respect privacy (CAIC fuzzes obs locations). |
| **Alaska Avalanche centers (AAIC, CNFAIC Chugach, Hatcher Pass, Haines)** | `alaskasnow.org`, `cnfaic.org`, `hpavalanche.org` | Mostly via NAC's AFP now → use avalanche.org API | Same as NAC | South-central + SE Alaska | Daily in-season | GeoJSON via NAC | Alaska centers have idiosyncratic seasons and zones; some only forecast during ranger-staffed periods. |

### Europe (stretch)

| Source | URL | Access | Auth / Limits | Coverage | Format | Gotcha |
|---|---|---|---|---|---|---|
| **ALBINA / avalanche.report (EUREGIO)** | `https://api.avalanche.report/albina/api/bulletins` | Official open data | CC BY 4.0; attribution required | Tyrol (AT), South Tyrol (IT), Trentino (IT) — trinational | CAAML v6 (XML + JSON), GeoJSON | Reference implementation for EAWS CAAML standard. Multilingual (DE/IT/EN). Open Data page: `avalanche.report/more/open-data`. |
| **SLF (Switzerland)** | `https://aws.slf.ch/api/bulletin/caaml` (bulletin), `https://aws.slf.ch/api/warningregion/` (zones), `https://aws.slf.ch/api/bulletin/document/full/en` (printable) | Official open data | CC BY 4.0 | Switzerland | CAAML v6 (XML/JSON), GeoJSON/KML for regions | Cleanest EU avy API. Pairs with IMIS station data (see Stations section). |
| **EAWS umbrella (other countries: FR/ANENA, NO/Varsom, SK, IT regional, ES/AEMET, etc.)** | `eaws.org` member-list + per-country sites | Per-country: most expose CAAML v6 JSON/XML; some don't | Varies by warning service | Continental Europe + UK (SAIS) | CAAML preferred | Use the `pyAvaCore` library or `simon04/eaws-bulletin-map` repo as a guide — it already abstracts ~all EAWS members. |

---

## 2. Avalanche Observations (MIN / field reports)

| Source | URL | Access | Auth | Coverage | Format | Gotcha |
|---|---|---|---|---|---|---|
| **Avalanche Canada MIN** | `avalanche.ca/mountain-information-network/submissions`; data via AvCan Products API | Public — unmoderated posts go live immediately | Same as AvCan API | Canada-wide | JSON | Unmoderated → noisy + occasionally wrong. Treat as signal, not truth. Quick / Avalanche / Snowpack / Weather / Incident report types each have different schemas. |
| **NAC AFP Observations** (per-center: NWAC obs, CAIC field reports, BTAC obs, etc.) | Per-center; backend is shared AFP | Centers vary on whether feeds are public; CAIC, NWAC, UAC all expose web-viewable obs | Generally no auth for read; ToS varies | US centers using AFP | HTML + JSON-LD usually | CAIC randomizes published observation locations for privacy — full precision only visible internally. Plan around fuzzed coords. |
| **SnowObs** | `snowobs.com` | Pro platform built by Snowbound Solutions | Operator subscription required | NA operations using it | JSON internal | Aggregates pro-team observations across orgs. Useful if your users are pros; not consumer-facing. |
| **Regobs (Norway)** | `api.regobs.no` (read+write via `api.nve.no`) | Official public API, read and write | Token for write, open for read | Norway | JSON | Public DB; integrates with Varsom + xGeo. Among the best citizen-obs schemas in the world — worth studying as a model. |

---

## 3. Weather Forecast Models

| Source | URL | Access | Auth / Limits | Coverage | Models | Format | Gotcha |
|---|---|---|---|---|---|---|---|
| **Open-Meteo** | `api.open-meteo.com/v1/forecast` | Official, free | No key for non-commercial; commercial = paid; permissive RPS | Global; 1–2 km resolution in Europe + North America | ECMWF, GFS, ICON, HRRR, HRDPS, GDPS, NAM, MET Norway, JMA + others | JSON | Single best API for v0. Built-in elevation correction. Commercial use = paid tier; read terms before monetizing. |
| **MET Norway Locationforecast** | `api.met.no/weatherapi/locationforecast/2.0` | Official, free, CC BY 4.0 | Required: identifying User-Agent (email or app contact). No key. Rate-limited but generous. | Global, best in Nordics | MET's own ensemble | JSON / XML / GeoJSON | Built-in topo model is coarse — pass `altitude` in meters explicitly. Don't use for wind >10m above ground. |
| **NWS API (weather.gov)** | `api.weather.gov/points/{lat},{lon}` → forecast URL | Official, free | No key; identifying User-Agent expected; ~5 RPS soft limit | US (CONUS + AK + HI + PR) | NWS-blended (NDFD) | GeoJSON | Two-step lookup (points → gridpoints). Hourly forecast at `.../gridpoints/{wfo}/{x},{y}/forecast/hourly`. Often slow; cache aggressively. |
| **MSC GeoMet (Environment Canada)** | `api.weather.gc.ca`, `geo.weather.gc.ca/geomet` | Official, free, anonymous | No key; standard OGC rate-limits | Canada | HRDPS (2.5km), RDPS (10km), GDPS (15km), GEPS, RDPA precip analysis | OGC WMS / WMTS / WCS / OGC-API-Features; netCDF/GeoTIFF/PNG | Comprehensive raw model access. WCS = raw raster grids. Steeper learning curve than Open-Meteo; use for precision in BC/AB. |
| **SpotWx** | `https://spotwx.io/api.php` | Paid API key required (sister to spotwx.com web UI) | Per-key; CSV-first | NA + Europe | HRDPS, GDPS, RDPS, HRRR, RAP, NAM, GFS, GEPS, ECMWF | CSV (parse by header) | "DIY, roll-your-own" — no SDKs. UI is widely used by Canadian pros; API less so. Free web scraping = fragile, prefer official key. |
| **NOAA NOMADS** | `nomads.ncep.noaa.gov` | Official, free | No key; bandwidth fair-use | Global | GFS, HRRR, NAM, RAP, GEFS raw grids | GRIB2, netCDF | Source-of-truth for US models. Heavy. For a point query, prefer Open-Meteo or NWS API; only go to NOMADS if you need raw fields. |
| **OpenWeatherMap** | `api.openweathermap.org` | Free + paid tiers | 1k calls/day free, 60 RPM | Global | Their blend | JSON | Lower fidelity in complex terrain than dedicated mountain models. Acceptable fallback, not primary. |
| **Windy.com API** | `api.windy.com` | Paid (webcams have free tier with restrictions) | Token-based; webcam free tier disallows paid-app gating | Global | ECMWF, GFS, ICON, NEMS, HRRR | JSON (point forecast); image tiles | Useful as a webcam directory (free webcams API token = 10 min validity, pro = 24h). Forecast API priced. |
| **mountain-forecast.com** | — | Scrape only, hostile | N/A | Global summits | HTML | Avoid. No API, ToS hostile. |

---

## 4. Automated Snow + Weather Stations

| Source | URL | Access | Auth | Coverage | Update | Format | Gotcha |
|---|---|---|---|---|---|---|---|
| **NRCS AWDB (SNOTEL)** | `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/` (Swagger: `…/swagger-ui/index.html`) | Official REST | No key, free | US (~900 SNOTEL + snow courses + reservoirs + streamflow), mostly mountain west | Hourly (SNOLite: every 4–6h) | JSON | All timestamps PST regardless of station location — derived "daily" values span PST midnight-to-midnight. Endpoints: `data`, `forecast`, `reference-data`, `metadata`. R package: `kbvernon/awdb`. |
| **Synoptic Data PBC (MesoWest successor)** | `api.synopticdata.com/v2/` | Free open-access tier; paid for restricted networks + high volume | API token required (free signup) | 170k+ stations, 320+ networks globally — includes RAWS, SNOTEL mirror, avy-center mesonets (NWAC, CAIC, BTAC), DOTs, ski areas, COOP | Sub-hourly to hourly | JSON | The single most valuable mesonet aggregator for backcountry use. MesoWest itself retires 2026-12-31 — use Synoptic. Python wrapper: `blaylockbk/SynopticPy`. |
| **BC Automated Snow Weather Stations (ASP)** | `catalogue.data.gov.bc.ca` (search "automated snow pillows"); current-year + archive datasets on `open.canada.ca` | Open Gov Portal CSV | None | British Columbia | Hourly, current water year | CSV | Operated by BC Ministry of Environment + partners (BC Hydro, Rio Tinto). Use R package `bcgov/bcsnowdata` for caching. SWE in mm, depth in cm. |
| **Avalanche Canada weather stations** | Via AvCan Products API; web at `avalanche.ca/weather/stations` | Official via AvCan API | None | BC + AB — 80+ remote stations | Hourly | JSON | Get station list from metadata endpoint; fetch obs by station ID with optional `fromDate` / `toDate` (default = last 7 days). |
| **SLF IMIS (Switzerland)** | `slf.ch/en/services-and-products/slf-data-service/`; warning regions at `aws.slf.ch/api/warningregion/` | Official, CC BY 4.0 | None for live | Swiss Alps + Jura | Every 30 min | JSON / GeoJSON | 191 stations (2025), mostly 2000–3000m. Pair with SLF avy bulletin for tight Swiss coverage. |
| **MeteoSwiss IDAweb** | `gate.meteoswiss.ch/idaweb/` | Free for research, paid commercial | Account required | Switzerland | Varies | CSV | Bulk-download focused, not real-time. For real-time Swiss data prefer IMIS via SLF. |
| **MET Norway xGeo / seNorge** | `xgeo.no` (web); data via `api.met.no` + `api.nve.no` | Official | None | Norway | Hourly+ | JSON / WMS | xGeo itself is the forecaster's web tool; data lives in MET + NVE APIs. |
| **Ambient Weather / Kestrel LiNK** | `ambientweather.docs.apiary.io` | Pro / personal | API key + app key required | Stations registered to ambientweather.net (incl. Kestrel meters that sync) | Real-time | JSON | Kestrel handheld → LiNK app → Ambient sync = poor man's field data ingest. Kestrel has no direct public BLE SDK — pair via the app, not the device. |

---

## 5. Terrain / DEM / Slope / Aspect

| Source | URL | Access | Auth | Coverage | Resolution | Format | Gotcha |
|---|---|---|---|---|---|---|---|
| **USGS 3DEP Elevation Point Query Service** | `nationalmap.gov/epqs/` | Official, free | None | US + parts of AK | 1/3 arc-sec (~10m) standard; 1m LIDAR where available | JSON | Single-point query. For slope/aspect at a waypoint, query 3×3 grid and compute. |
| **USGS 3DEP raster (ImageServer)** | `elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer` | Official, free | None | US | Up to 1m (LIDAR), 1/9 arc-sec | ArcGIS REST: PNG, GeoTIFF, raw | Dynamic Hillshade / Aspect / Slope / Contour functions built in. Best free option for raster terrain work in US. |
| **OpenTopography** | `opentopography.org/developers` | Mix of free and paid | API key (free signup); pro tiers | Global selectively + USGS 3DEP mosaic | Varies | GeoTIFF (COG via AWS) | Best abstraction over global DEMs. Free API has quotas. |
| **NRCan CDEM (Canadian Digital Elevation Model)** | `geo.weather.gc.ca` and `open.canada.ca` | Official, free | None | Canada | 0.75–3 arc-sec | WMS / WCS / GeoTIFF | Canadian counterpart to 3DEP. Lower resolution than US 3DEP in most areas. Some HRDEM products at 1–2m in selected regions. |
| **Mapbox Terrain-RGB v1** | `api.mapbox.com/v4/mapbox.terrain-rgb/...` | Free tier + paid | Token required | Global | ~30m (Mapbox-processed SRTM/ALOS/etc.) | PNG tiles, RGB-encoded heights (0.1m increments) | Best for raster terrain tiles in client UI. Decode: `height = -10000 + ((R*256*256 + G*256 + B) * 0.1)`. Free tier: 50k tile requests/month per product. |
| **OpenStreetMap pistes (via Overpass API)** | `overpass-api.de/api/interpreter` | Free, public | None; be polite | Global | Vector | XML / JSON | Query `piste:type=*` + `piste:grooming=backcountry` for ski-touring lines. Coverage in NA is patchy; Alps/Scandinavia much better. Note: "backcountry" in OSM piste-tagging means "ungroomed within a resort," NOT ski touring. |
| **CalTopo** | — | Closed since 2020 | — | NA + intl | — | — | Do not scrape. Use as human map tool only. |

---

## 6. Solar Position / Slope Irradiance (libraries, not APIs)

These are calculation libraries — embed locally, no external dependency.

| Source | URL | What | Format |
|---|---|---|---|
| **NOAA SOLPOS** | `gml.noaa.gov/grad/solcalc/` | Sun position table generator + algorithm | C source / spreadsheet |
| **NREL SPA** | `midcdmz.nrel.gov/spa/` | High-precision Solar Position Algorithm (Reda & Andreas 2003); ±0.0003° | C source |
| **pvlib-python** | `pvlib-python.readthedocs.io` | Industry-standard. `spa_python()` wraps NREL SPA. Also: irradiance on tilted surfaces (`pvlib.irradiance`), atmospheric models, clearsky. | Python |
| **suncalc.js** | `github.com/mourner/suncalc` | Lightweight JS — sun position, sunrise/set, golden hour | JS |
| **pysolar** | `pysolar.org` | Pure-Python solar position; less accurate than pvlib but simpler | Python |
| **Astropy** | `astropy.org` | Overkill for solar; use only if already in stack | Python |

For "what time will this NE-facing 38° slope go in the sun at 09:30 in late February at this elevation?" — `pvlib.solarposition` + `pvlib.irradiance.get_total_irradiance` solves it. No network needed.

---

## 7. Satellite / Aerial Imagery (crown lines, debris, snow extent)

| Source | URL | Access | Auth | Coverage | Resolution | Format | Gotcha |
|---|---|---|---|---|---|---|---|
| **NASA GIBS / Worldview** | `nasa-gibs.github.io/gibs-api-docs/` | Official, free | None | Global, daily | MODIS/VIIRS: 250m–1km; some 30m Landsat | WMS / WMTS / KML | Best free option for snow-cover monitoring at synoptic scale. NDSI (Normalized Difference Snow Index) layer. MODIS retiring → use VIIRS-equivalent layers (continuity has been preserved). |
| **Sentinel Hub (Copernicus Data Space)** | `dataspace.copernicus.eu/analyse/apis/sentinel-hub` | Free trial 30d; ESA-sponsored free tier; paid | OAuth token | Global | Sentinel-2: 10m; Sentinel-1 SAR: 20m | JSON config + image responses | Best for crown/debris spotting. Sentinel-1 SAR sees through clouds — critical for winter when Sentinel-2 is cloud-blocked. Free Copernicus Data Space access has generous quota. |
| **Planet Labs (E&R Program)** | `planet.com/science/` | Free for accredited education/research (apply) | API token | Global | PlanetScope 3m daily; SkySat 50cm tasked | JSON + GeoTIFF | 3,000 km²/month cap on E&R. Commercial use = paid. SkySat 50cm is the only sub-meter daily option but requires tasking. |
| **USGS Earth Explorer / M2M API** | `m2m.cr.usgs.gov` | Official, free | Account required | Global | Varies (Landsat 30m, etc.) | Bulk download | Workflow-heavy; use for bulk historical archive, not real-time. |
| **Microsoft Planetary Computer** | `planetarycomputer.microsoft.com` | Free | None for STAC catalog | Global | Hosts Sentinel-1, -2, Landsat, 3DEP COGs | STAC + COG | Best place to *compute* on satellite data without downloading. Use for batch analysis. |

---

## 8. Lightning / Convective

| Source | URL | Access | Auth | Coverage | Format | Gotcha |
|---|---|---|---|---|---|---|
| **Blitzortung** | `blitzortung.org` | Community network; data via MQTT or HTTP | Membership required for full feed; some community proxies (e.g. Home Assistant integration via geohash MQTT) | Global | JSON over MQTT | ToS: "third-party apps must run their own server" — you can't redistribute raw data. For decision-support fine; for a public product, get written agreement. |
| **NOAA NWS Storm Reports / Mesoscale Discussion** | `api.weather.gov/alerts` + Storm Prediction Center products | Official, free | None | US | GeoJSON | Mostly summer-relevant. In winter useful for blizzard / wind warnings affecting access. |
| **GLM (GOES Lightning Mapper)** | NOAA via NOMADS / NESDIS | Official, free | None | Western Hemisphere | netCDF | Real-time satellite lightning. Overkill unless you're building convective storm tracking. |

Lightning is a marginal signal for winter backcountry skiing in BC/AK/CO — useful for spring corn season + thunderstorm windows only.

---

## 9. Webcams / Live Snow

| Source | URL | Access | Auth | Coverage | Format | Gotcha |
|---|---|---|---|---|---|---|
| **Windy Webcams API v3** | `api.windy.com/webcams/api/v3/docs` | Free + paid tiers | Token (free: 10 min validity; pro: 24h) | Global, ~50k webcams | JSON metadata + image URLs | Free tier disallows gating behind paid features of your app. Good directory for resort + trailhead cams. |
| **Avalanche center weather stations w/ cameras** (NWAC, CAIC, UAC) | Per-center | Mixed: some publish snapshots, some require human view | None usually | NA | JPEG | Patchy. Most useful are the NWAC Mt Baker / Snoqualmie / Stevens cams, CAIC Berthoud + Loveland, UAC LCC/BCC cams. Scrape with light hand. |
| **Resort webcams** | Per-resort | Mostly HTML | Varies | NA + Europe | JPEG | No aggregator standard. Some resorts allow embedding; some block hotlinking. Use only with explicit terms allowance. |
| **WeatherUnderground / PWS webcams** | Discontinued embed | — | — | — | — | Don't bother — WU has been deprecating community features for years. |

---

## 10. Historical Avalanche Incidents

| Source | URL | Access | Coverage | Format | Gotcha |
|---|---|---|---|---|---|
| **Avalanche Canada Fatal Avalanche Incidents DB** | `incidents.avalanche.ca` | Public web (search + map) | Canada, 1782–present, 559 events / 1,063 deaths | Web; no public API documented | New (launched Dec 2025). Worth contacting AvCan re: data export — they have the structured records from a Public Safety Canada SAR-NIF grant. |
| **American Avalanche Association (A3) accident reports** | `americanavalancheassociation.org`, `avalanche.org/avalanche-accidents/` | Public | US | HTML; per-incident PDFs | No API. Scrapeable but small N (≈25–35/year). Use for case-study retrieval, not analytics. |
| **CAA pro records (Canadian Avalanche Association)** | `avalancheassociation.ca` | Member-restricted | Canada pro ops | Closed | Pro-only. Not a public data source. |
| **SARAA (Snow + Avalanche Risk Awareness, Andes)** | `saraa.org` | Public | South America | HTML | Niche; useful only if expanding south. |
| **Historical regional databases** | (various, e.g. SLF, ANENA, NGI) | Per-country | EU | Varies | EU equivalents exist but scattered. SLF has the best digitized record. |

---

## 11. Field-Side Hardware Ingest

| Source | URL | Access | What | Gotcha |
|---|---|---|---|---|
| **Garmin inReach IPC Outbound** | `developer.garmin.com/inreach-portal/` | Pro/enterprise tier of inReach (Garmin Explore for Business) | Webhook push: each inbound SMS/preset message from inReach → your HTTPS endpoint, as JSON `Events[]` array keyed by IMEI | Requires the *Professional* or *Enterprise* inReach plan — not the consumer plans. Outbound URL configured in IPC settings. Retries on non-200 with exponential backoff. PDF: `developer.garmin.com/inReach/IPC_Outbound.pdf`. |
| **Garmin inReach IPC Inbound** | same | same | Send messages *to* an inReach from your service | Lets you push the AI's reassessment summary back to a partner's device. |
| **Apple satellite developer API** | — | Not yet public | Rumored late 2026/2027 | Don't plan around it. |
| **Kestrel LiNK (Bluetooth handheld)** | `kestrelmeters.com` | Vendor app sync, no public BLE SDK | Real-time wind/temp/RH/pressure from a 5500-series Kestrel | Pair Kestrel → LiNK app → Ambient Weather sync → AmbientWeather REST API for retrieval. Awkward, but works. |
| **Slate Avalanche Probe** | `slateavalancheprobe.com` | Vendor proprietary | Digital probe records depth + resistance profile | No public API at time of writing. Vendor integration would require partnership. Treat as future signal source. |
| **Mammut Avalanche Beacons / Barryvox** | — | None public | Beacon-to-app sync exists for trip logging | No public API. |

---

## 12. Trip Planning + Route Data

| Source | URL | Access | Format | Gotcha |
|---|---|---|---|---|
| **GPX / KML / GeoJSON standards** | Topografix / OGC | Open formats | XML / JSON | Use as ingest format from any planning tool (CalTopo export, Gaia export, etc.). Not a source per se but the lingua franca. |
| **OpenStreetMap (via Overpass)** | `overpass-api.de` | Free, public | XML / JSON | Mountain huts (`tourism=alpine_hut`), trailheads, summit nodes, glaciers, sac_scale. Coverage varies. |
| **FATMAP routes** | — | Discontinued 2024-10-01 | — | Dead. |
| **CalTopo shared maps** | — | Closed | — | Can import a user's public CalTopo map URL via their export (GPX/KML), but no programmatic API. |
| **Gaia GPS** | `gaiagps.com` | No public route API; user can export GPX | GPX | Treat as a user-import surface (paste a GPX), not a data source. |
| **Strava Routes API** | `developers.strava.com` | OAuth user-scoped | JSON | User must connect their Strava; you get their routes/activities. Heatmap is NOT included via API. |

---

## 13. Sources to Watch (Emerging / Notable)

- **pyAvaCore** — Python library that abstracts CAAML-format bulletins across EAWS members. Worth depending on for EU coverage rather than building per-country adapters.
- **MET Norway xGeo** — Reference design for forecaster-facing weather/snow integration. Their data model is mature; their API patterns are worth studying even if you only ingest a subset.
- **Microsoft Planetary Computer** — As STAC + COG matures, doing satellite analysis server-side becomes the default. Move snow-cover / NDSI computation there.
- **NOAA NWS API** — Watch for "fire weather" + "snow" gridpoint variables. They keep adding NDFD elements.
- **Apple iPhone NTN expansion (2026–2027)** — If the third-party satellite API ships and supports messaging payloads, this could replace inReach for many users.

---

## Coverage Matrix (Quick Reference)

| Region | Primary avy bulletin | Primary obs | Primary stations | Primary forecast |
|---|---|---|---|---|
| BC | AvCan API | AvCan MIN | AvCan stations + BC ASP + Synoptic | HRDPS via GeoMet or Open-Meteo |
| AB | AvCan API | AvCan MIN | AvCan stations + Synoptic | HRDPS via GeoMet or Open-Meteo |
| WA | avalanche.org → NWAC | NWAC obs (or AFP) | Synoptic (NWAC mesonet) + SNOTEL | NWS API + Open-Meteo |
| OR | avalanche.org → COA/Wallowa | AFP | Synoptic + SNOTEL | NWS API + Open-Meteo |
| MT | avalanche.org → GNFAC/FAC | AFP | Synoptic + SNOTEL | NWS API + Open-Meteo |
| ID | avalanche.org → SNFAC (Sawtooth)/PAC | AFP | Synoptic + SNOTEL | NWS API + Open-Meteo |
| WY | avalanche.org → BTAC | AFP | Synoptic + SNOTEL | NWS API + Open-Meteo |
| UT | avalanche.org → UAC | UAC obs | Synoptic + SNOTEL | NWS API + Open-Meteo |
| CO | avalanche.org → CAIC | CAIC field reports | Synoptic + SNOTEL | NWS API + Open-Meteo |
| CA (Sierra) | avalanche.org → ESAC/SAC/Mt Shasta | AFP | Synoptic + SNOTEL + CDEC | NWS API + Open-Meteo |
| AK | avalanche.org → AAIC/CNFAIC/Hatcher | AFP | Synoptic (limited) | NWS API + Open-Meteo |
| Alps (CH) | SLF CAAML API | — | SLF IMIS | MeteoSwiss via Open-Meteo / MET Norway |
| Alps (AT/IT) | ALBINA (avalanche.report) | — | regional (AT: lawinen.report) | Open-Meteo |
| Norway | Varsom CAAML | Regobs | xGeo / seNorge | MET Norway Locationforecast |

---

## Practical Notes for MCP Server Design

- **Cache aggressively.** Avalanche bulletins update once/day. Forecasts update 1–4×/day. Station data update hourly. Don't hammer.
- **Respect User-Agent requirements.** MET Norway, NWS, and most government APIs require an identifying UA with contact info. Build it once, set globally.
- **Time zones are a trap.** NRCS AWDB is PST always. Avy bulletins use local. Synoptic is UTC. Normalize on ingest.
- **Geometry matters.** Avalanche zone polygons (GeoJSON from avalanche.org, AvCan, SLF) are the spatial primitive. Any waypoint should resolve to a zone first, then a bulletin.
- **Attribution is contractual.** CC BY 4.0 sources (MET Norway, SLF, ALBINA, EAWS) require visible attribution. NAC API has the explicit "don't change intent" clause. Bake an attribution layer into every output, not just the UI.
- **MCP server granularity:** one server per category, not one per source. Suggestion: `mcp-avalanche-bulletins` (wraps NAC + AvCan + SLF + ALBINA), `mcp-mountain-weather` (wraps Open-Meteo + NWS + GeoMet), `mcp-snow-stations` (wraps AWDB + Synoptic + AvCan + BC ASP), `mcp-terrain` (wraps 3DEP + CDEM + Mapbox + local solar libs), `mcp-field-ingest` (wraps Garmin IPC + form schema). Five servers, clean composition.

---

## Open Questions / Verify Before Building

1. **AvCan ToS** — `docs.avalanche.ca` documents endpoints but the precise commercial-use terms need confirmation. Email AvCan directly.
2. **NAC API rate limits** — undocumented. Start conservative (1 req/min/center), monitor for 429s.
3. **avalanche.org full-prose endpoint** — map-layer gives danger only. The full bulletin text endpoint exists in the AFP backend; not all of it is in the public docs README. Check the repo issues + the Snowbound Solutions Mountain Weather API docs.
4. **NWAC API access** — emailing forecasters@nwac.us is worth doing for the in-field reassessment phase (their pro mesonet data is the best in the PNW). Have a research/safety framing ready.
5. **CAIC structured field-report API** — undocumented. Inspect their map's network calls; if usable, prefer that over scraping HTML.
6. **Strava OAuth route ingest** — confirm current API agreement permits AI-tooling use. Strava updated their API agreement in 2024 to restrict AI training; safety/decision-support is usually OK but read the current terms.
