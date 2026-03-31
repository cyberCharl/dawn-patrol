import { Hono } from "hono"
import { db } from "@workspace/schema/db"
import { forecasts as forecastsTable, spots as spotsTable } from "@workspace/schema/tables"
import { eq, and, desc } from "drizzle-orm"

export const forecasts = new Hono()

// Get forecasts — optionally filter by date, spot, source
forecasts.get("/", async (c) => {
  const date = c.req.query("date")
  const spot = c.req.query("spot")
  const source = c.req.query("source")
  const limit = parseInt(c.req.query("limit") ?? "50")

  const conditions = []
  if (date) conditions.push(eq(forecastsTable.forecastDate, date))
  if (source) conditions.push(eq(forecastsTable.source, source))

  let query = db
    .select({
      id: forecastsTable.id,
      scrapeRunId: forecastsTable.scrapeRunId,
      spotSlug: spotsTable.slug,
      spotName: spotsTable.name,
      source: forecastsTable.source,
      forecastDate: forecastsTable.forecastDate,
      waveHeightMin: forecastsTable.waveHeightMin,
      waveHeightMax: forecastsTable.waveHeightMax,
      wavePeriod: forecastsTable.wavePeriod,
      swellDirection: forecastsTable.swellDirection,
      windSpeed: forecastsTable.windSpeed,
      windDirection: forecastsTable.windDirection,
      windState: forecastsTable.windState,
      rating: forecastsTable.rating,
      conditionText: forecastsTable.conditionText,
      highTideTime: forecastsTable.highTideTime,
      highTideHeight: forecastsTable.highTideHeight,
      lowTideTime: forecastsTable.lowTideTime,
      lowTideHeight: forecastsTable.lowTideHeight,
      waterTemp: forecastsTable.waterTemp,
      sunrise: forecastsTable.sunrise,
      sunset: forecastsTable.sunset,
      createdAt: forecastsTable.createdAt,
    })
    .from(forecastsTable)
    .innerJoin(spotsTable, eq(forecastsTable.spotId, spotsTable.id))

  if (spot) conditions.push(eq(spotsTable.slug, spot))
  if (conditions.length) {
    query = query.where(and(...conditions)) as typeof query
  }

  const rows = await query.orderBy(desc(forecastsTable.createdAt)).limit(limit)
  return c.json(rows)
})

// Get latest forecast summary for tomorrow (or a given date)
forecasts.get("/summary", async (c) => {
  const date = c.req.query("date")
  const targetDate =
    date ??
    new Date(Date.now() + 86400000).toISOString().split("T")[0]

  // Get the latest scrape run for this date
  const allForecasts = await db
    .select({
      spotSlug: spotsTable.slug,
      spotName: spotsTable.name,
      spotDescription: spotsTable.description,
      source: forecastsTable.source,
      waveHeightMin: forecastsTable.waveHeightMin,
      waveHeightMax: forecastsTable.waveHeightMax,
      wavePeriod: forecastsTable.wavePeriod,
      swellDirection: forecastsTable.swellDirection,
      windSpeed: forecastsTable.windSpeed,
      windDirection: forecastsTable.windDirection,
      windState: forecastsTable.windState,
      rating: forecastsTable.rating,
      conditionText: forecastsTable.conditionText,
      highTideTime: forecastsTable.highTideTime,
      lowTideTime: forecastsTable.lowTideTime,
      waterTemp: forecastsTable.waterTemp,
      sunrise: forecastsTable.sunrise,
      sunset: forecastsTable.sunset,
    })
    .from(forecastsTable)
    .innerJoin(spotsTable, eq(forecastsTable.spotId, spotsTable.id))
    .where(eq(forecastsTable.forecastDate, targetDate))
    .orderBy(spotsTable.slug, forecastsTable.source)

  // Group by spot
  const bySpot: Record<string, { spot: { slug: string; name: string; description: string | null }; sources: Record<string, unknown> }> = {}
  for (const row of allForecasts) {
    if (!bySpot[row.spotSlug]) {
      bySpot[row.spotSlug] = {
        spot: { slug: row.spotSlug, name: row.spotName, description: row.spotDescription },
        sources: {},
      }
    }
    bySpot[row.spotSlug].sources[row.source] = {
      waveHeightMin: row.waveHeightMin,
      waveHeightMax: row.waveHeightMax,
      wavePeriod: row.wavePeriod,
      swellDirection: row.swellDirection,
      windSpeed: row.windSpeed,
      windDirection: row.windDirection,
      windState: row.windState,
      rating: row.rating,
      conditionText: row.conditionText,
      highTideTime: row.highTideTime,
      lowTideTime: row.lowTideTime,
      waterTemp: row.waterTemp,
      sunrise: row.sunrise,
      sunset: row.sunset,
    }
  }

  return c.json({ date: targetDate, spots: Object.values(bySpot) })
})
