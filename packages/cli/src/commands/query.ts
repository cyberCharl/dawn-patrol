import { Command } from "commander"

export function queryCmd(apiUrl: string) {
  const cmd = new Command("query").description("Query forecast data")

  cmd
    .command("summary")
    .description("Get forecast summary for a date (default: tomorrow)")
    .option("-d, --date <date>", "Date to query (YYYY-MM-DD)")
    .action(async (opts) => {
      const params = new URLSearchParams()
      if (opts.date) params.set("date", opts.date)

      const res = await fetch(`${apiUrl}/api/forecasts/summary?${params}`)
      const data = await res.json()

      console.log(`\n🏄 Forecast Summary — ${data.date}\n`)

      if (!data.spots?.length) {
        console.log("  No forecast data available for this date.")
        return
      }

      for (const entry of data.spots) {
        console.log(`📍 ${entry.spot.name}`)
        if (entry.spot.description) console.log(`   ${entry.spot.description}`)

        for (const [source, info] of Object.entries(entry.sources) as [string, any][]) {
          const height =
            info.waveHeightMin && info.waveHeightMax
              ? `${info.waveHeightMin}-${info.waveHeightMax}m`
              : info.waveHeightMin
                ? `${info.waveHeightMin}m`
                : "?"
          const period = info.wavePeriod ? `@ ${info.wavePeriod}s` : ""
          const swell = info.swellDirection ?? ""
          const wind = info.windState
            ? `${info.windDirection ?? ""} ${info.windSpeed ? info.windSpeed + "km/h" : ""} (${info.windState})`
            : ""
          const rating = info.rating != null ? `Rating: ${info.rating}/10` : ""
          const condition = info.conditionText ?? ""

          console.log(`   [${source}] ${height} ${period} ${swell} | ${wind} | ${rating} ${condition}`)
        }
        console.log()
      }
    })

  cmd
    .command("forecasts")
    .description("List raw forecast records")
    .option("-d, --date <date>", "Filter by date")
    .option("-s, --spot <slug>", "Filter by spot slug")
    .option("--source <source>", "Filter by source")
    .option("-l, --limit <n>", "Limit results", "20")
    .action(async (opts) => {
      const params = new URLSearchParams()
      if (opts.date) params.set("date", opts.date)
      if (opts.spot) params.set("spot", opts.spot)
      if (opts.source) params.set("source", opts.source)
      params.set("limit", opts.limit)

      const res = await fetch(`${apiUrl}/api/forecasts?${params}`)
      const data = await res.json()

      console.log(JSON.stringify(data, null, 2))
    })

  return cmd
}
