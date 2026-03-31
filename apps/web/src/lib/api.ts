import type { ForecastSummaryResponse } from "@workspace/schema/contracts"

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "" : "http://localhost:3220")
).replace(/\/$/, "")

function getTomorrowDate() {
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10)
}

async function apiFetch<T>(path: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal })
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`)
  }

  return (await response.json()) as T
}

export function fetchForecastSummary(options?: {
  date?: string
  spot?: string
  signal?: AbortSignal
}) {
  const params = new URLSearchParams()
  params.set("date", options?.date ?? getTomorrowDate())
  if (options?.spot) {
    params.set("spot", options.spot)
  }

  return apiFetch<ForecastSummaryResponse>(
    `/api/forecasts/summary?${params.toString()}`,
    options?.signal
  )
}

export { API_BASE_URL, getTomorrowDate }
