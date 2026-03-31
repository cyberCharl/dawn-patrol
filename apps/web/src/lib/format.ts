import type { SpotOverview, SpotSourceForecast } from "@workspace/schema/contracts"

const SOURCE_LABELS: Record<string, string> = {
  "surf-forecast": "Surf Forecast",
  surfline: "Surfline",
  windguru: "Windguru",
}

export function getSourceLabel(source: string) {
  return SOURCE_LABELS[source] ?? source
}

export function formatHeightRange(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "No wave call yet"
  }

  if (min != null && max != null) {
    return `${min.toFixed(1)}-${max.toFixed(1)} m`
  }

  return `${(min ?? max)?.toFixed(1)} m`
}

export function formatNumber(
  value: number | null,
  suffix: string,
  digits = 0
) {
  if (value == null) {
    return "—"
  }

  return `${value.toFixed(digits)}${suffix}`
}

export function formatDirection(value: string | null) {
  return value ?? "—"
}

export function formatRating(value: number | null) {
  if (value == null) {
    return "—"
  }

  return `${value.toFixed(1)}/10`
}

export function formatWindSummary(forecast: SpotSourceForecast) {
  const parts = [forecast.windDirection, formatNumber(forecast.windSpeed, " km/h")]
    .filter((value) => value && value !== "—")
    .join(" ")

  if (!forecast.windState && !parts) {
    return "No wind call yet"
  }

  const state = forecast.windState ? `(${forecast.windState})` : ""
  return [parts, state].filter(Boolean).join(" ").trim()
}

export function formatSessionWindow(value: SpotOverview["bestSessionWindow"]) {
  if (!value) {
    return "Watch for updates"
  }

  return value === "morning" ? "Morning window" : "Afternoon window"
}

export function getRatingToneClasses(value: SpotOverview["ratingBand"]) {
  if (value === "good") {
    return "border-emerald-400/30 bg-emerald-400/20 text-emerald-200"
  }

  if (value === "fair") {
    return "border-amber-400/30 bg-amber-400/20 text-amber-100"
  }

  if (value === "poor") {
    return "border-slate-400/30 bg-slate-400/20 text-slate-100"
  }

  return "border-white/10 bg-white/5 text-slate-200"
}

export function getWindToneClasses(windState: string | null) {
  if (windState === "glassy" || windState === "offshore") {
    return "text-emerald-200"
  }

  if (windState === "cross-shore") {
    return "text-amber-100"
  }

  if (windState === "onshore") {
    return "text-rose-200"
  }

  return "text-slate-200"
}
