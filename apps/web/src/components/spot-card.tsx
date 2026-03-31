import type { SpotSummary } from "@workspace/schema/contracts"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  formatHeightRange,
  formatRating,
  formatSessionWindow,
  getRatingToneClasses,
  getSourceLabel,
  getWindToneClasses,
} from "@/lib/format"

type SpotCardProps = {
  spot: SpotSummary
  date: string
  featured?: boolean
}

export function SpotCard({ spot, date, featured = false }: SpotCardProps) {
  const ratingTone = getRatingToneClasses(spot.overview.ratingBand)
  const windTone = getWindToneClasses(spot.overview.windState)

  return (
    <article
      className={`rounded-[1.75rem] border p-5 shadow-[0_24px_80px_rgba(2,8,18,0.38)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 ${
        featured
          ? "border-cyan-300/25 bg-cyan-300/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            {featured ? "Best Bet" : "Tomorrow"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{spot.spot.name}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {spot.spot.description ?? "No description yet."}
            </p>
          </div>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-medium ${ratingTone}`}
        >
          {formatRating(spot.overview.bestRating)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-black/20 p-3">
          <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
            Height
          </div>
          <div className="mt-1 text-lg font-medium text-white">
            {formatHeightRange(
              spot.overview.consensusWaveHeightMin,
              spot.overview.consensusWaveHeightMax
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-black/20 p-3">
          <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
            Wind
          </div>
          <div className={`mt-1 text-lg font-medium ${windTone}`}>
            {spot.overview.windEmoji} {spot.overview.windState ?? "Unknown"}
          </div>
        </div>

        <div className="rounded-2xl bg-black/20 p-3">
          <div className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
            Session
          </div>
          <div className="mt-1 text-lg font-medium text-white">
            {formatSessionWindow(spot.overview.bestSessionWindow)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-slate-300">
        <div>
          Best source:{" "}
          <span className="font-medium text-white">
            {spot.overview.bestSource
              ? getSourceLabel(spot.overview.bestSource)
              : "Waiting for ratings"}
          </span>
        </div>

        <Button asChild variant="ghost" className="text-cyan-100 hover:text-white">
          <Link to={`/spot/${spot.spot.slug}?date=${date}`}>
            Open detail
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
