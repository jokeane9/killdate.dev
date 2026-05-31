# Backcountry MCP — Testing Strategy

## The Three Layers You're Testing

```
Layer 3: Does Claude respond correctly?         ← Eval tests (hard)
Layer 2: Do tools return the right data?        ← Integration tests
Layer 1: Does each function work in isolation?  ← Unit tests (easy)
```

You build bottom up. Get layer 1 solid before worrying about layer 3.

---

## Layer 1 — Unit Tests

Each tool function in isolation. Mock the external APIs so tests run fast and free.

```python
# tests/test_tools.py
import pytest
from unittest.mock import patch, AsyncMock
from server import get_danger_rating, get_snowpack_loading

# Test: output schema is always correct
@patch("server.httpx.get")
async def test_danger_rating_schema(mock_get):
    # fake AvCan response
    mock_get.return_value.json.return_value = {
        "areaName": "Kootenay Boundary",
        "dangerRatings": [
            {"elevation": {"value": "Alp"}, "dangerRating": {"value": "3:considerable"}},
            {"elevation": {"value": "Tln"}, "dangerRating": {"value": "2:moderate"}},
            {"elevation": {"value": "Btl"}, "dangerRating": {"value": "1:low"}},
        ]
    }

    result = await get_danger_rating(49.43, -117.15)

    # verify our pre-processing produces the right shape
    assert result["alpine"] == 3
    assert result["treeline"] == 2
    assert result["below_treeline"] == 1
    assert "region" in result


# Test: station too far away → confidence = low
@patch("server.fetch_nearest_station")
@patch("server.fetch_aswe_csv")
async def test_snowpack_low_confidence(mock_csv, mock_station):
    mock_station.return_value = {
        "id": "1A01P",
        "name": "Huckleberry",
        "elevation": 1200,
        "distance_km": 62.0   # far away
    }
    mock_csv.return_value = [...]

    result = await get_snowpack_loading(49.43, -117.15)

    assert result["confidence"] == "low"
    assert result["distance_km"] == 62.0


# Test: API down → graceful error, not crash
@patch("server.httpx.get", side_effect=Exception("timeout"))
async def test_avcan_api_down(mock_get):
    result = await get_danger_rating(49.43, -117.15)

    assert result["error"] == "forecast_unavailable"
    assert "danger" not in result   # don't return partial data
```

What you're checking at this layer:
- Output schema never changes even when upstream API response varies
- Confidence flags fire correctly on station distance / elevation delta
- API failures return explicit error shape, not a crash or empty dict
- Cache hit returns same shape as cache miss

---

## Layer 2 — Integration Tests

Real API calls. Real data. These cost a few cents and need internet.
Run them before every deploy, not on every commit.

```python
# tests/test_integration.py
import pytest

# These coordinates: Whitewater ski area, Nelson BC
WHITEWATER = {"lat": 49.43, "lon": -117.15, "elevation": 2100}

async def test_avcan_api_live():
    result = await get_danger_rating(**WHITEWATER)
    # we don't know what the danger will be, but we know the shape
    assert result["alpine"] in range(1, 6)
    assert result["treeline"] in range(1, 6)
    assert result["region"] != ""

async def test_open_meteo_live():
    result = await get_day_forecast(**WHITEWATER)
    # should have 12 hourly entries
    assert len(result["hourly"]) == 12
    assert "temp_c" in result["hourly"][0]
    assert "wind_gust_kmh" in result["hourly"][0]

async def test_aswe_station_found():
    result = await get_snowpack_loading(**WHITEWATER)
    # nearest station should be found
    assert result["station"] != ""
    # and should have 7 days of data
    assert len(result["swe_mm_7day"]) == 7

async def test_rag_search_returns_results():
    results = await search_knowledge("shooting cracks persistent slab")
    assert len(results) > 0
    assert results[0]["similarity"] > 0.70
    # top result should be from Tremper or AvCan, not noise
    assert results[0]["source"] in [
        "tremper_staying_alive",
        "tremper_essentials",
        "avcan_glossary",
        "avcan_webinar"
    ]

async def test_rag_semantic_not_keyword():
    # "sugary crystals" should find content about facets / depth hoar
    # even though those exact words aren't in the query
    results = await search_knowledge("sugary crystals below a crust in my pit")
    top_content = results[0]["content"].lower()
    # should surface facet / depth hoar content
    assert any(term in top_content for term in
               ["facet", "depth hoar", "weak layer", "melt-freeze"])
```

---

## Layer 3 — Eval Tests (The Real Work)

This is where you find out if the tool actually works. Not "does it return data" but "does it help someone make a better decision."

### The Golden Set

Build 20 scenario cards. Each one has:
- A specific location (lat/lon)
- A frozen forecast snapshot (real historical data)
- A frozen weather snapshot
- A frozen snowpack snapshot
- A user query
- An expected response (what a competent guide would say)

```python
# tests/evals/scenarios.py

SCENARIOS = [
    {
        "id": "considerable-persistent-slab-nw",
        "description": "Considerable danger, active PS on NW aspects, skier on NW face",
        "location": {"lat": 49.43, "lon": -117.15, "elevation": 2100},
        "aspect": "NW",
        "frozen_forecast": {
            "alpine": 3,
            "problems": [{"type": "Persistent Slab", "aspects": ["N","NW","W"],
                          "elevations": ["alpine","treeline"], "likelihood": "Likely"}]
        },
        "frozen_weather": {"new_snow_24hr_cm": 8, "temp_trend": "warming",
                           "wind_gust_kmh": 55},
        "user_query": "We're heading up the NW face of Ymir today, what's the story?",
        "expected": {
            "must_mention": ["Persistent Slab", "NW aspect", "Considerable"],
            "must_not_say": ["looks good", "safe to proceed"],
            "tone": "direct warning",
            "go_nogo": "no-go or strong caution"
        }
    },
    {
        "id": "shooting-cracks-on-slope",
        "description": "Skier reports shooting cracks, Considerable danger",
        "user_query": "I just skied across a slope and saw shooting cracks come off my skis",
        "expected": {
            "must_mention": ["stop", "propagating", "hard signal"],
            "must_not_say": ["might be okay", "use your judgment"],
            "go_nogo": "stop"
        }
    },
    {
        "id": "low-danger-good-day",
        "description": "Low danger, stable snowpack, good weather — should say so",
        "frozen_forecast": {"alpine": 1, "treeline": 1},
        "user_query": "Is it a good day to be out?",
        "expected": {
            "must_mention": ["Low danger"],
            "tone": "positive but not reckless",
            # should NOT hedge everything to death on a low danger day
            "must_not_say": ["cannot guarantee", "always risky"]
        }
    },
    {
        "id": "data-gap-no-station",
        "description": "Nearest ASWE station is 80km away — should flag uncertainty",
        "frozen_snowpack": {"station": "FarAway", "distance_km": 83, "confidence": "low"},
        "user_query": "What's the snowpack like?",
        "expected": {
            "must_mention": ["limited snowpack data", "nearest station"],
            "must_not_say": ["the snowpack is stable"]  # don't assert without data
        }
    }
]
```

### Running Evals

```python
# tests/evals/run_evals.py

async def run_eval(scenario):
    # inject frozen data instead of live API calls
    with mock_tools(scenario["frozen_forecast"], scenario["frozen_weather"],
                    scenario["frozen_snowpack"]):
        response = await ask_claude(scenario["user_query"])

    # score it
    score = {
        "mentions_required_terms": all(
            term.lower() in response.lower()
            for term in scenario["expected"]["must_mention"]
        ),
        "avoids_bad_phrases": all(
            phrase.lower() not in response.lower()
            for phrase in scenario["expected"].get("must_not_say", [])
        ),
    }

    return score


# run all 20
results = [await run_eval(s) for s in SCENARIOS]
pass_rate = sum(1 for r in results if all(r.values())) / len(results)
print(f"Pass rate: {pass_rate:.0%}")  # target: >85%
```

### What Eval Failure Tells You

| Failure type | Where to fix |
|---|---|
| Wrong data in response | Tool output schema — pre-processing problem |
| Missing domain knowledge | RAG corpus or system prompt |
| Over-hedging on clear signals | System prompt — tone and directness |
| Under-hedging on data gaps | System prompt — uncertainty handling |
| Wrong go/no-go on clear scenario | Both — data quality + prompt |

---

## RAG-Specific Tests

```python
# tests/test_rag.py

# For each query, verify the right source material surfaces
RAG_GROUND_TRUTH = [
    {
        "query": "what does a whumpf sound mean",
        "expected_topic": ["instability_signs", "weak_layers"],
        "min_similarity": 0.78
    },
    {
        "query": "shooting cracks in the snow",
        "expected_topic": ["instability_signs", "slab_propagation"],
        "min_similarity": 0.80
    },
    {
        "query": "sugary snow below a hard layer in my pit",
        "expected_topic": ["facets", "depth_hoar", "persistent_slab"],
        "min_similarity": 0.72
    },
    {
        "query": "is it safe to ski after it rains",
        "expected_topic": ["wet_avalanche", "melt_freeze_crust"],
        "min_similarity": 0.70
    }
]

async def test_rag_ground_truth():
    for case in RAG_GROUND_TRUTH:
        results = await search_knowledge(case["query"])
        assert results[0]["similarity"] >= case["min_similarity"], \
            f"Low similarity for: {case['query']}"
        assert any(
            r["topic"] in case["expected_topic"] for r in results[:3]
        ), f"Wrong topic returned for: {case['query']}"
```

---

## Test Run Order

```
On every file save (local dev):
  → unit tests only (~2 seconds)

Before every commit:
  → unit tests + RAG ground truth (~30 seconds)

Before every deploy:
  → unit tests + integration tests + RAG tests (~3 minutes)

Weekly / after prompt changes:
  → full eval suite against golden set (~10 minutes, ~$0.50)
```
