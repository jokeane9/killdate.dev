# Backcountry Ski Day-Trip AI Tool — Initial Research Brief

**Focus:** BC backcountry, day-trip planning, AI-native interface  
**Date:** May 2026  
**Status:** Ideation / pre-build research

---

## The Problem

A BC backcountry day trip decision is a multi-source synthesis problem. The data exists — avalanche forecasts, snowpack readings, weather, terrain ratings — but it lives in five different government portals in five different formats, none of which talk to each other. The typical skier opens four browser tabs, reads three different PDFs, checks two different weather sites, and still misses the MIN observation from Tuesday that would have changed their read.

An AI-native tool can do the synthesis work. The data infrastructure is largely already there — it just needs to be wired up.

---

## Data Landscape

### 1. Avalanche Forecasts — Avalanche Canada

**The anchor data source. Has a real, documented, no-auth public API.**

Avalanche Canada operates the primary forecast service for BC backcountry terrain. Their API is publicly documented at [docs.avalanche.ca](https://docs.avalanche.ca/) with a Swagger UI at [avalanche.ca/api-docs](https://avalanche.ca/api-docs).

Base URL: `https://avcan-services-api.prod.avalanche.ca`

Key endpoints:

| Endpoint | What it returns |
|---|---|
| `GET /forecasts/{lang}/products/point?lat=&long=` | Full forecast for a lat/lon — no need to pre-know the region ID |
| `GET /forecasts/{lang}/areas` | All forecast area polygons as GeoJSON |
| `GET /forecasts/{lang}/products` | All current forecast products |
| `GET /weather/stations/{stationId}/measurements` | Alpine weather station readings (last 7 days default) |

The forecast product JSON includes: danger ratings by elevation band (alpine/treeline/below-treeline), avalanche problems (type, likelihood, size, aspects, elevations), weather synopsis, snowpack summary, travel advice, and validity window. This is the core payload — everything else in the tool supports or contextualizes it.

Station measurement fields: `snowHeight`, `airTempAvg`, `airTempMax`, `airTempMin`, `windSpeedAvg`, `windDirCompass`, `windSpeedGust`, `relativeHumidity`. Updated hourly.

Forecast area boundaries as static GeoJSON/KML/Shapefile: [github.com/avalanche-canada/forecast-polygons](https://github.com/avalanche-canada/forecast-polygons)

**No API key required. Intended for public consumption.**

---

### 2. Mountain Information Network (MIN)

**The gap in the API picture. No documented public endpoint.**

The MIN ([avalanche.ca/mountain-information-network](https://avalanche.ca/mountain-information-network)) is AvCan's crowdsourced field observation platform. It collects snowpack observations, weather reports, avalanche sightings, and incident reports from guides, practitioners, and recreationists.

This is often the most operationally relevant data — a guide's MIN report from two days ago showing a propagating extended column test is more actionable than any automated reading. But there is no documented public REST API. The old open-source `ac-web` repo ([github.com/tesera/ac-web](https://github.com/tesera/ac-web)) shows the MIN was backed by AWS DynamoDB, but no public endpoint is currently published.

**Path forward:** Reverse-engineer network calls from the avalanche.ca web app, or contact Avalanche Canada directly (it@avalanche.ca). MIN is unmoderated user data — any tool consuming it needs a freshness and credibility layer.

---

### 3. Weather — Open-Meteo (primary) + MSC GeoMet (secondary)

**Two complementary free APIs with no authentication.**

**Open-Meteo** ([open-meteo.com/en/docs](https://open-meteo.com/en/docs)) is the cleanest option for point forecasts in complex terrain. Supports an explicit `elevation` parameter that adjusts temperature via lapse rate for any coordinate — critical for mountain forecasting. Also provides pressure-level wind data (850hPa, 700hPa) for upper-mountain wind assessment, and hourly new snowfall accumulation.

```
GET https://api.open-meteo.com/v1/forecast?
  latitude=50.1&longitude=-117.8
  &hourly=temperature_2m,snowfall,windspeed_10m,windgusts_10m,precipitation,weathercode
  &elevation=1800
  &forecast_days=7
```

Elevation API for spot queries: `https://api.open-meteo.com/v1/elevation?latitude=50.1&longitude=-117.8` (uses Copernicus DEM GLO-90 at 90m resolution).

Free for non-commercial, CC BY 4.0 for commercial. Up to 10,000 calls/day without auth.

**MSC GeoMet** ([api.weather.gc.ca](https://api.weather.gc.ca/)) is the Meteorological Service of Canada's OGC-standard API. The `swob-realtime` collection returns real-time surface weather observations from Environment Canada stations. Useful for confirmed current conditions at trailheads and valley approaches. Station coverage at elevation is thin — most stations are at airports. Open Government Licence, no auth.

```
https://api.weather.gc.ca/collections/swob-realtime/items?
  properties=date_tm-value,air_temp,stn_pres,rel_hum,wnd_spd,wnd_dir&f=json
```

**Secondary: Windy Point Forecast API** ([api.windy.com](https://api.windy.com/point-forecast/docs)) — if budget allows. POST-based, returns multi-model pressure-level data (GFS, ECMWF, ICON). Best for ridge-line wind forecasts. Requires API key; free trial tier returns randomized data.

---

### 4. Snowpack — BC Automated Snow Weather Stations (ASWS)

**Real data, no API — but stable CSV files from predictable gov URLs.**

The BC River Forecast Centre operates ~200 ASWS stations at 700–2200m elevations, satellite-reporting hourly. Data is published as flat CSV files updated throughout the day.

Current-season CSV endpoints:
- Snow Water Equivalent: `https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/SW.csv`
- Snow Depth: `https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/SD.csv`
- Air Temperature: `https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/TA.csv`
- Cumulative Precipitation: `https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/PC.csv`

Open data catalogue entries: [open.canada.ca](https://open.canada.ca/data/en/dataset/3a34bdd1-61b2-4687-8b55-c5db5e13ff50)  
Station locations: [open.canada.ca](https://open.canada.ca/data/en/dataset/ebe546aa-ac34-491c-a828-fdc87fb70610)  
R package for structured access: [github.com/bcgov/bcsnowdata](https://github.com/bcgov/bcsnowdata)

The nearest ASWE station to a trip objective is a proxy for recent snowpack loading — SWE trend over the past 7 days, temperature swings, precipitation events. Not a substitute for field observation but a useful quantitative anchor.

---

### 5. Terrain — ATES Ratings + Elevation

**BC's ATES data is GIS-queryable via open WFS. Elevation point lookup is one GET request.**

**ATES (Avalanche Terrain Exposure Scale)** rates terrain as Simple, Challenging, or Complex. BC's managed snowmobile areas and many BC Parks areas are rated. The dataset lives in the BC Data Catalogue and is queryable via the BC Geographic Warehouse WFS at `https://openmaps.gov.bc.ca/geo/pub/wfs`.

- BC Data Catalogue dataset: [catalogue.data.gov.bc.ca](https://catalogue.data.gov.bc.ca/dataset/ates-avalanche-terrain-exposure-scale-recreation-boundaries/resource/29118735-4d05-4f74-9923-67e4f3411c69)
- ArcGIS Hub: [arcgis.com/home/item.html?id=6fb927d2b4ba4d1ea67c7002dbf70c73](https://www.arcgis.com/home/item.html?id=6fb927d2b4ba4d1ea67c7002dbf70c73)
- Python wrapper: [github.com/smnorris/bcdata](https://github.com/smnorris/bcdata)
- Academic automated ATES mapping (2024): [nhess.copernicus.org/articles/24/947/2024/](https://nhess.copernicus.org/articles/24/947/2024/)

**NRCan Elevation Point API:**
```
GET http://geogratis.gc.ca/services/elevation/cdem/altitude?lat=50.1&lon=-117.8
→ {"altitude": 1842.0, "vertex": true}
```
Simple, no auth, returns JSON. Uses the CDEM (1:50,000 scale); HRDEM tiles offer higher resolution but require batch download rather than a point API.

**Note on FATMAP:** Shut down October 1, 2024 after Strava acquisition. No replacement API exists. Community alternatives: OutMap ([outmap.pro](https://outmap.pro)), CalTopo, Gaia GPS. None have public developer APIs.

---

### 6. US Comparables (Reference)

For cross-border awareness or architecture parity:

- **avalanche.org API** (National Avalanche Center): [github.com/NationalAvalancheCenter/Avalanche.org-Public-API-Docs](https://github.com/NationalAvalancheCenter/Avalanche.org-Public-API-Docs) — returns GeoJSON danger levels for all US centers
- **Utah Avalanche Center**: `GET https://utahavalanchecenter.org/forecast/{region}/json` — full bulletin JSON, unofficial but real
- **NWAC (Washington/Oregon)**: No public API; CSV portal at [nwac.us/data-portal/](https://nwac.us/data-portal/), partner access only
- **NRCS SNOTEL**: Documented AWDB web service for US snowpack; [user guide](https://www.nrcs.usda.gov/sites/default/files/2023-03/AWDB%20Web%20Service%20User%20Guide.pdf)
- **Open Avalanche Project**: Historical ML dataset, NWAC-focused, 2015–2021; [github.com/scottcha/OpenAvalancheProject](https://github.com/scottcha/OpenAvalancheProject)

---

## Proposed MCP Architecture

An MCP server architecture groups tools by domain. The Avalanche Canada and Open-Meteo APIs are immediately wrappable; the ASWE data requires CSV parsing middleware; MIN requires a workaround until an API is available.

### Group A — Avalanche Context

| Tool | Source | API status |
|---|---|---|
| `get_avalanche_forecast(lat, lon)` | AvCan `/products/point` | Clean REST |
| `list_avalanche_problems(lat, lon)` | Parsed from forecast product | Clean REST |
| `get_forecast_region(lat, lon)` | AvCan forecast polygons GeoJSON | Static file + point-in-polygon |
| `get_ates_rating(lat, lon)` | BC DataBC WFS | OGC WFS query |
| `get_min_observations(region, days)` | MIN / avalanche.ca | No API — scrape or manual |

### Group B — Weather

| Tool | Source | API status |
|---|---|---|
| `get_mountain_forecast(lat, lon, elevation)` | Open-Meteo | Clean REST, no key |
| `get_spot_obs(lat, lon)` | MSC GeoMet swob-realtime | OGC API, no key |
| `get_avcan_station_obs(station_id)` | AvCan weather stations | Clean REST |
| `get_aswe_station_data(station_id)` | BC RFC ASWE CSVs | CSV fetch + parse |

### Group C — Terrain

| Tool | Source | API status |
|---|---|---|
| `get_elevation(lat, lon)` | NRCan CDEM point API | Clean REST |
| `get_ates_for_bbox(bbox)` | BC DataBC WFS | OGC WFS query |
| `get_forecast_area_polygon(region_id)` | AvCan forecast polygons | Static GeoJSON |

### Existing open-source MCP servers (don't rebuild these)

- Open-Meteo MCP: [github.com/cmer81/open-meteo-mcp](https://github.com/cmer81/open-meteo-mcp)
- Generic weather MCP: [github.com/jpan8866/mcp-weather](https://github.com/jpan8866/mcp-weather)

No MCP servers exist yet for Avalanche Canada, BC ASWE snowpack, or MSC GeoMet — these are the build targets.

---

## Minimum Viable Feature Set — Day Trip Planning

### What the tool needs to answer for a day trip decision

1. **Avalanche forecast for my zone** — danger level by elevation band, what problems exist, what aspects/elevations to avoid
2. **Weather for the trip day** — temperature range at objective elevation, wind at ridge, new snow in the past 48h
3. **Snowpack trend for the past week** — SWE and snow depth from nearest ASWE station
4. **What other people have seen recently** — MIN observations in the region for the past 3–7 days
5. **What terrain I'm going into** — ATES rating, elevation range, aspect exposure

### V1 interaction model

The user describes their objective in plain language: *"Planning to ski the northwest face of Mount X in the Kootenays this Saturday with two others, moderate backcountry experience."*

The AI:
1. Resolves the objective to lat/lon (and checks ATES if available)
2. Calls the AvCan API for the forecast — checks danger, identifies which avalanche problems apply to that aspect/elevation
3. Pulls Open-Meteo for Saturday's forecast at objective elevation
4. Fetches nearest ASWE station for snowpack trend
5. Synthesizes into a plain-language go/no-go assessment with specific rationale (e.g. "Persistent Slab problem on NW aspects at alpine — your line sits in the primary concern zone. Danger is rated Considerable at alpine. Saturday has significant wind forecast at 700hPa — this will reload the NW faces.")
6. Surfaces what it cannot tell the user (MIN gaps, terrain it hasn't seen, local knowledge it lacks)

### What the AI layer adds that raw data cannot

- Cross-referencing avalanche problem aspects/elevations against the specific planned terrain
- Synthesizing 3+ data sources into a single coherent read
- Flagging combinations that are more dangerous than any individual signal (moderate danger + rapid warming + wind loading on planned aspect = escalating risk)
- Asking good clarifying questions (party size, experience, bail options, time constraints)
- Being explicit about uncertainty and what field checks to do

### V2 additions (after core works)

- Day-of route tracking against the forecast (what did the forecast say vs. what you saw)
- Trip logging that feeds back into your own history
- Guide-mode for practitioners: raw data access, MIN submission assist
- Multi-day trip planning (snowpack stability over time)

---

## Build Priorities

**Build first (clean APIs, high value):**
1. AvCan forecast MCP server — point-based forecast retrieval, this is the core
2. Open-Meteo weather MCP — elevation-aware forecast + new snow
3. BC ASWE snowpack CSV parser — simple but fills a real gap

**Build second (requires more work):**
4. BC DataBC WFS client for ATES polygon lookup
5. AvCan station weather MCP (extend the AvCan server)
6. MIN observation scraper (or partnership with AvCan for data access)

**Dependencies to resolve early:**
- MIN data access (contact AvCan before building around it)
- ATES coverage gaps (not all BC backcountry terrain is rated — need a fallback)

---

## Data Source Summary

| Source | URL | Auth | Update freq | License |
|---|---|---|---|---|
| Avalanche Canada API | [docs.avalanche.ca](https://docs.avalanche.ca/) | None | Daily / Hourly | Public use |
| AvCan forecast polygons | [github.com/avalanche-canada/forecast-polygons](https://github.com/avalanche-canada/forecast-polygons) | None | Static | Public |
| MIN observations | [avalanche.ca/mountain-information-network](https://avalanche.ca/mountain-information-network) | No API | Real-time | Public |
| MSC GeoMet (Env Canada) | [api.weather.gc.ca](https://api.weather.gc.ca/) | None | Real-time | Open Govt Licence |
| Open-Meteo | [open-meteo.com/en/docs](https://open-meteo.com/en/docs) | None | Hourly | CC BY 4.0 |
| Windy Point Forecast | [api.windy.com](https://api.windy.com/point-forecast/docs) | API key | Hourly | Commercial |
| NRCan Elevation API | [geogratis.gc.ca](http://geogratis.gc.ca/services/elevation/cdem/altitude) | None | Static DEM | Open Govt |
| BC ASWE snowpack | [env.gov.bc.ca](https://www.env.gov.bc.ca/wsd/data_searches/snow/asws/data/) | None | Hourly | BC Open |
| BC DataBC WFS (ATES) | [openmaps.gov.bc.ca/geo/pub/wfs](https://openmaps.gov.bc.ca/geo/pub/wfs) | None | Static/annual | BC Open |
| NAC avalanche.org (US) | [github.com/NationalAvalancheCenter](https://github.com/NationalAvalancheCenter/Avalanche.org-Public-API-Docs) | None | Daily | Public |
| Utah Avalanche Center | [utahavalanchecenter.org/docs/api/forecast](https://utahavalanchecenter.org/docs/api/forecast) | None | Daily | Unofficial |
| NRCS SNOTEL (US) | [nrcs.usda.gov](https://www.nrcs.usda.gov/sites/default/files/2023-03/AWDB%20Web%20Service%20User%20Guide.pdf) | None | Hourly | Public |
| Open Avalanche Project | [github.com/scottcha/OpenAvalancheProject](https://github.com/scottcha/OpenAvalancheProject) | None | Historical | Open source |

---

## Key Risks

1. **MIN data gap** — the most contextually valuable field observations have no API. The tool is weaker without them.
2. **ATES coverage** — terrain ratings don't cover all BC backcountry. Many popular zones are unrated. Need graceful degradation when ATES data is absent.
3. **FATMAP is gone** — the best 3D terrain visualization tool shut down in late 2024. No equivalent API-accessible replacement exists yet.
4. **AI liability** — any AI-generated go/no-go recommendation in avalanche terrain carries real safety implications. The tool needs clear disclaimers, strong uncertainty communication, and a design philosophy that augments rather than replaces field judgment.
5. **Forecast coverage gaps** — AvCan doesn't cover all BC terrain. Parks Canada, Avalanche Quebec, and some non-forecast zones exist. The tool needs to surface these boundaries.
