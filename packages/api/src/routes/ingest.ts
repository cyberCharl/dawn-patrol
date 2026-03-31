import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { db } from "@workspace/schema/db"
import {
  scrapeRuns,
  forecasts as forecastsTable,
  spots as spotsTable,
} from "@workspace/schema/tables"
import { ingestPayloadSchema } from "@workspace/schema/validators"

export const ingest = new Hono()

// Batch ingest — creates a scrape run and inserts all forecasts
ingest.post("/", zValidator("json", ingestPayloadSchema), async (c) => {
  const input = c.req.valid("json")

  // Create scrape run
  const [run] = await db
    .insert(scrapeRuns)
    .values({
      forecastDate: input.forecastDate,
      status: input.status,
    })
    .returning()

  // Resolve spot slugs to IDs
  const allSpots = await db.select().from(spotsTable)
  const slugToId = new Map(allSpots.map((s) => [s.slug, s.id]))

  const inserted: number[] = []
  const skipped: string[] = []

  for (const forecast of input.forecasts) {
    const spotId = slugToId.get(forecast.spotSlug)
    if (!spotId) {
      skipped.push(forecast.spotSlug)
      continue
    }

    const [row] = await db
      .insert(forecastsTable)
      .values({
        scrapeRunId: run.id,
        spotId,
        source: forecast.source,
        forecastDate: input.forecastDate,
        waveHeightMin: forecast.waveHeightMin,
        waveHeightMax: forecast.waveHeightMax,
        wavePeriod: forecast.wavePeriod,
        swellDirection: forecast.swellDirection,
        windSpeed: forecast.windSpeed,
        windDirection: forecast.windDirection,
        windState: forecast.windState,
        rating: forecast.rating,
        conditionText: forecast.conditionText,
        highTideTime: forecast.highTideTime,
        highTideHeight: forecast.highTideHeight,
        lowTideTime: forecast.lowTideTime,
        lowTideHeight: forecast.lowTideHeight,
        waterTemp: forecast.waterTemp,
        sunrise: forecast.sunrise,
        sunset: forecast.sunset,
        rawData: forecast.rawData ? JSON.stringify(forecast.rawData) : null,
      })
      .returning()

    inserted.push(row.id)
  }

  return c.json({
    runId: run.id,
    forecastDate: input.forecastDate,
    inserted: inserted.length,
    skipped,
  }, 201)
})
