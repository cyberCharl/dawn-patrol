import { Hono } from "hono"
import { db } from "@workspace/schema/db"
import { scrapeRuns } from "@workspace/schema/tables"
import { desc } from "drizzle-orm"

export const runs = new Hono()

// List recent scrape runs
runs.get("/", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "20")
  const rows = await db
    .select()
    .from(scrapeRuns)
    .orderBy(desc(scrapeRuns.scrapedAt))
    .limit(limit)
  return c.json(rows)
})
