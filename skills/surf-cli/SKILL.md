# Surf CLI — Database Interaction Skill 🖥️

How to use the Surf Check CLI to manage spots, ingest data, and query forecasts.

## Prerequisites

- API must be running: `cd /home/clawdysseus/odyssey/repos/surf-check && bun run --filter @workspace/api dev`
- CLI lives at: `/home/clawdysseus/odyssey/repos/surf-check/packages/cli/src/index.ts`
- Run with: `bun /home/clawdysseus/odyssey/repos/surf-check/packages/cli/src/index.ts <command>`
- API URL defaults to `http://localhost:3220` (override with `SURF_CHECK_API` env var)

## Commands

### Spot Management

```bash
# List all spots in the database
surf-check spots list

# Sync spots from config file to database (run once on setup, or after config changes)
surf-check spots sync
surf-check spots sync --config /path/to/config.json
```

### Data Ingestion

```bash
# Ingest forecast data from stdin
echo '{"forecastDate":"2026-04-01","forecasts":[...]}' | surf-check ingest

# Ingest from file
surf-check ingest --file /tmp/forecast.json

# Override forecast date
surf-check ingest --date 2026-04-02 --file /tmp/forecast.json
```

The ingest payload schema:
```json
{
  "forecastDate": "YYYY-MM-DD",
  "status": "complete|partial|failed",
  "forecasts": [
    {
      "spotSlug": "muizenberg",
      "source": "surf-forecast",
      "waveHeightMin": 0.6,
      "waveHeightMax": 1.2,
      "wavePeriod": 12,
      "swellDirection": "SW",
      "windSpeed": 10,
      "windDirection": "NW",
      "windState": "offshore",
      "rating": 4,
      "conditionText": "FAIR",
      "highTideTime": "06:30",
      "highTideHeight": 1.55,
      "lowTideTime": "12:45",
      "lowTideHeight": 0.10,
      "waterTemp": 18,
      "sunrise": "06:56",
      "sunset": "18:40"
    }
  ]
}
```

All fields except `spotSlug` and `source` are optional — ingest whatever you scraped.

### Querying

```bash
# Tomorrow's summary (grouped by spot, all sources)
surf-check query summary

# Summary for a specific date
surf-check query summary --date 2026-04-01

# Raw forecast records with filters
surf-check query forecasts --date 2026-04-01
surf-check query forecasts --spot muizenberg --source surf-forecast
surf-check query forecasts --limit 10
```

## Typical Agent Workflow

1. **First time setup:** `surf-check spots sync` (populates spots table from config)
2. **Scrape** forecast data using the surf-fetch skill
3. **Ingest** the scraped data: `surf-check ingest -f /tmp/forecast.json`
4. **Query** the summary: `surf-check query summary`
5. **Notify** if conditions are good (based on summary ratings)

## API Endpoints (for direct use if needed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/spots` | List all spots |
| GET | `/api/spots/:slug` | Get spot by slug |
| PUT | `/api/spots` | Upsert spot |
| POST | `/api/ingest` | Batch ingest forecasts |
| GET | `/api/forecasts` | Query forecasts (params: date, spot, source, limit) |
| GET | `/api/forecasts/summary` | Summary grouped by spot (params: date) |
| GET | `/api/runs` | List scrape runs (params: limit) |
