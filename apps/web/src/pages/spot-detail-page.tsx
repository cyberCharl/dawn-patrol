import { useEffect, useState } from "react"
import type { ForecastSummaryResponse } from "@workspace/schema/contracts"
import { Link, useSearchParams, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { AppShell } from "@/components/app-shell"
import { SourceForecastCard } from "@/components/source-forecast-card"
import { StatePanel } from "@/components/state-panel"
import { fetchForecastSummary, getTomorrowDate } from "@/lib/api"
import {
  formatHeightRange,
  formatRating,
  formatSessionWindow,
  getSourceLabel,
} from "@/lib/format"

type DetailState = {
  data: ForecastSummaryResponse | null
  error: string | null
  loading: boolean
}

export function SpotDetailPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const date = searchParams.get("date") ?? getTomorrowDate()
  const [state, setState] = useState<DetailState>({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!slug) {
      setState({
        data: null,
        error: "Missing spot slug.",
        loading: false,
      })
      return
    }

    const controller = new AbortController()
    void (async () => {
      try {
        const data = await fetchForecastSummary({
          date,
          spot: slug,
          signal: controller.signal,
        })
        setState({ data, error: null, loading: false })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setState({
          data: null,
          error: error instanceof Error ? error.message : "Unable to load spot detail.",
          loading: false,
        })
      }
    })()

    return () => {
      controller.abort()
    }
  }, [date, slug])

  const spot = state.data?.spots[0] ?? null
  const sources = spot ? Object.values(spot.sources) : []

  return (
    <AppShell
      eyebrow="Spot Detail"
      title={spot?.spot.name ?? "Spot detail"}
      subtitle={
        spot?.spot.description ??
        "Compare tomorrow's source-by-source calls, tides, and timing windows."
      }
      meta={state.data ? `Forecast date ${state.data.date}` : undefined}
    >
      <div>
        <Button asChild variant="ghost" className="pl-0 text-cyan-100 hover:text-white">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to overview
          </Link>
        </Button>
      </div>

      {state.loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : state.error ? (
        <StatePanel
          title="Spot detail unavailable"
          body={`${state.error} Check that the API is reachable and the spot exists.`}
        />
      ) : !spot ? (
        <StatePanel
          title="No forecast for this spot"
          body="This spot has not been populated for the selected date yet."
        />
      ) : (
        <div className="space-y-5">
          <section className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-[0_24px_80px_rgba(2,8,18,0.38)] backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="Best rating" value={formatRating(spot.overview.bestRating)} />
              <SummaryMetric
                label="Consensus height"
                value={formatHeightRange(
                  spot.overview.consensusWaveHeightMin,
                  spot.overview.consensusWaveHeightMax
                )}
              />
              <SummaryMetric
                label="Wind state"
                value={`${spot.overview.windEmoji} ${spot.overview.windState ?? "Unknown"}`}
              />
              <SummaryMetric
                label="Best session"
                value={formatSessionWindow(spot.overview.bestSessionWindow)}
              />
            </div>

            <div className="mt-4 text-sm leading-6 text-slate-300">
              Best source:{" "}
              <span className="font-medium text-white">
                {spot.overview.bestSource
                  ? getSourceLabel(spot.overview.bestSource)
                  : "Waiting on a rated source"}
              </span>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {sources.map((source) => (
              <SourceForecastCard key={source.source} forecast={source} />
            ))}
          </section>
        </div>
      )}
    </AppShell>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-medium text-white">{value}</div>
    </div>
  )
}
