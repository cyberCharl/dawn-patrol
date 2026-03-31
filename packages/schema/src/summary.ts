import type {
  SessionWindow,
  SpotOverview,
  SpotRecord,
  SpotSourceForecast,
} from "./contracts"

const WIND_PRIORITY: Record<string, number> = {
  glassy: 4,
  offshore: 3,
  "cross-shore": 2,
  onshore: 1,
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10
}

function average(values: number[]) {
  if (!values.length) {
    return null
  }

  return roundToSingleDecimal(
    values.reduce((total, value) => total + value, 0) / values.length
  )
}

function normalizeWindState(value: string | null | undefined) {
  if (!value) {
    return null
  }

  return value.trim().toLowerCase()
}

function getWindEmoji(value: string | null) {
  const normalized = normalizeWindState(value)

  if (normalized === "glassy" || normalized === "offshore") {
    return "✅"
  }

  if (normalized === "cross-shore") {
    return "⚠️"
  }

  if (normalized === "onshore") {
    return "❌"
  }

  return "•"
}

function pickConsensusWindState(sources: SpotSourceForecast[]) {
  const counts = new Map<string, number>()

  for (const source of sources) {
    const normalized = normalizeWindState(source.windState)
    if (!normalized) {
      continue
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
  }

  let bestState: string | null = null
  let bestCount = -1
  let bestPriority = -1

  for (const [state, count] of counts) {
    const priority = WIND_PRIORITY[state] ?? 0
    if (
      count > bestCount ||
      (count === bestCount && priority > bestPriority)
    ) {
      bestState = state
      bestCount = count
      bestPriority = priority
    }
  }

  return bestState
}

function pickBestSessionWindow(sources: SpotSourceForecast[]): SessionWindow | null {
  let morningMentions = 0
  let afternoonMentions = 0

  for (const source of sources) {
    const conditionText = source.conditionText?.toLowerCase()
    if (!conditionText) {
      continue
    }

    if (conditionText.includes("morning")) {
      morningMentions += 1
    }

    if (
      conditionText.includes("afternoon") ||
      conditionText.includes("evening")
    ) {
      afternoonMentions += 1
    }
  }

  if (morningMentions === 0 && afternoonMentions === 0) {
    return null
  }

  return morningMentions >= afternoonMentions ? "morning" : "afternoon"
}

function scoreHeightFit(
  consensusMin: number | null,
  consensusMax: number | null,
  spot: Pick<SpotRecord, "idealMinHeight" | "idealMaxHeight">
) {
  if (
    consensusMin == null ||
    consensusMax == null ||
    spot.idealMinHeight == null ||
    spot.idealMaxHeight == null
  ) {
    return 0
  }

  const midpoint = (consensusMin + consensusMax) / 2
  if (midpoint >= spot.idealMinHeight && midpoint <= spot.idealMaxHeight) {
    return 1.5
  }

  const distance = Math.min(
    Math.abs(midpoint - spot.idealMinHeight),
    Math.abs(midpoint - spot.idealMaxHeight)
  )

  if (distance <= 0.3) {
    return 0.75
  }

  return 0
}

export function buildSpotOverview(
  sourcesByName: Record<string, SpotSourceForecast>,
  spot: Pick<SpotRecord, "idealMinHeight" | "idealMaxHeight">
): SpotOverview {
  const sources = Object.values(sourcesByName)
  const bestRated = sources.reduce<SpotSourceForecast | null>((best, source) => {
    if (source.rating == null) {
      return best
    }

    if (!best || (best.rating ?? -1) < source.rating) {
      return source
    }

    return best
  }, null)

  const consensusWaveHeightMin = average(
    sources.flatMap((source) =>
      source.waveHeightMin == null ? [] : [source.waveHeightMin]
    )
  )
  const consensusWaveHeightMax = average(
    sources.flatMap((source) =>
      source.waveHeightMax == null ? [] : [source.waveHeightMax]
    )
  )

  const windState = pickConsensusWindState(sources)
  const bestSessionWindow = pickBestSessionWindow(sources)
  const bestRating = bestRated?.rating ?? null
  const windScore = windState ? (WIND_PRIORITY[windState] ?? 0) / 2 : 0
  const score =
    (bestRating ?? 0) +
    windScore +
    scoreHeightFit(consensusWaveHeightMin, consensusWaveHeightMax, spot) +
    (bestSessionWindow ? 0.5 : 0)

  return {
    bestRating,
    ratingBand:
      bestRating == null
        ? "unknown"
        : bestRating >= 5
          ? "good"
          : bestRating >= 3
            ? "fair"
            : "poor",
    consensusWaveHeightMin,
    consensusWaveHeightMax,
    windState,
    windEmoji: getWindEmoji(windState),
    bestSessionWindow,
    bestSource: bestRated?.source ?? null,
    score: roundToSingleDecimal(score),
  }
}
