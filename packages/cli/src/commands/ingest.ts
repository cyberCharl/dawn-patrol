import { Command } from "commander"
import type { IngestPayload } from "@workspace/schema/validators"

export function ingestCmd(apiUrl: string) {
  const cmd = new Command("ingest")
    .description("Ingest forecast data from stdin (JSON)")
    .option("-d, --date <date>", "Forecast date (YYYY-MM-DD)")
    .option("-f, --file <path>", "Read JSON from file instead of stdin")
    .action(async (opts) => {
      let raw: string

      if (opts.file) {
        raw = await Bun.file(opts.file).text()
      } else {
        // Read from stdin
        const chunks: string[] = []
        const reader = Bun.stdin.stream().getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(decoder.decode(value))
        }
        raw = chunks.join("")
      }

      const data = JSON.parse(raw) as IngestPayload

      // Override date if provided via flag
      if (opts.date) {
        data.forecastDate = opts.date
      }

      const res = await fetch(`${apiUrl}/api/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error(`Error ${res.status}: ${err}`)
        process.exit(1)
      }

      const result = await res.json()
      console.log(
        `✅ Ingested ${result.inserted} forecasts for ${result.forecastDate} (run #${result.runId})`,
      )
      if (result.skipped?.length) {
        console.warn(`⚠️  Skipped unknown spots: ${result.skipped.join(", ")}`)
      }
    })

  return cmd
}
