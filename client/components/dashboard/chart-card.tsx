"use client"

import { useEffect, useState } from "react"

export default function ChartCard({ chartId, title }: { chartId: string; title: string }) {
  const [csv, setCsv] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    fetch(`/api/amplitude/chart/${chartId}`, { cache: "no-store" })
      .then(async (r) => {
        const text = await r.text()
        if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
        return text
      })
      .then((text) => {
        if (!alive) return
        setCsv(text)
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.message ?? "Failed to load chart")
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [chartId])

  return (
    <div className="rounded-xl border bg-card p-4 text-foreground shadow-sm">
      <div className="mb-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">Chart: {chartId}</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!loading && error && (
        <pre className="whitespace-pre-wrap text-sm text-red-600">{error}</pre>
      )}

      {!loading && !error && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs text-foreground">
          {csv || "No data returned"}
        </pre>
      )}
    </div>
  )
}
