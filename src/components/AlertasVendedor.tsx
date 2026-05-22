"use client"

import { useEffect, useState } from "react"

export default function AlertasVendedor({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/alerts?uid=" + userId)
      const data = await res.json()
      setAlerts(data.alerts ?? [])
    }
    load()
  }, [userId])

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setAlerts((prev: any[]) => prev.filter((a: any) => a.id !== id))
  }

  if (alerts.length === 0) return null

  const borderColor: Record<string, string> = {
    stock_low: "#f59e0b",
    no_sales: "#ef4444",
    selling_fast: "#1D9E75",
    trending: "#a78bfa",
    popular_product: "#1D9E75",
    almost_out: "#f59e0b",
  }

  const bgColor: Record<string, string> = {
    stock_low: "rgba(245,158,11,.08)",
    no_sales: "rgba(239,68,68,.08)",
    selling_fast: "rgba(29,158,117,.08)",
    trending: "rgba(167,139,250,.08)",
    popular_product: "rgba(29,158,117,.08)",
    almost_out: "rgba(245,158,11,.08)",
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 10, fontFamily: "Poppins,sans-serif" }}>
        Alertas inteligentes
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {alerts.map((alert: any) => (
          <div key={alert.id} style={{
            background: bgColor[alert.type as string] ?? "rgba(212,175,55,.06)",
            border: "1px solid " + (borderColor[alert.type as string] ?? "#D4AF37"),
            borderLeft: "3px solid " + (borderColor[alert.type as string] ?? "#D4AF37"),
            borderRadius: 12,
            padding: "1rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3, fontFamily: "Poppins,sans-serif" }}>{alert.title}</p>
              <p style={{ fontSize: 12, color: "#aaa", fontFamily: "Poppins,sans-serif", lineHeight: 1.5 }}>{alert.message}</p>
            </div>
            <button onClick={() => markRead(alert.id)} style={{
              background: "transparent", border: "none", color: "#555",
              cursor: "pointer", fontSize: 18, flexShrink: 0, padding: "0 4px",
            }}>x</button>
          </div>
        ))}
      </div>
    </div>
  )
}
