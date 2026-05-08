"use client"

import { useState } from "react"

export default function ShipmentForm({ orderId }: { orderId: string }) {
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!carrier || !tracking) {
      setError("Completa todos los campos")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, carrier, tracking }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setDone(true)
    } catch {
      setError("No se pudo registrar el envio")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p style={{ fontSize: "0.75rem", color: "#1D9E75", fontWeight: 600 }}>
        Envio registrado correctamente
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input
          placeholder="Transportadora (ej: Servientrega)"
          value={carrier}
          onChange={e => setCarrier(e.target.value)}
          style={{ flex: 1, minWidth: "160px", padding: "0.5rem 0.75rem", border: "1px solid #ddd", fontSize: "0.8rem", outline: "none" }}
        />
        <input
          placeholder="Numero de guia"
          value={tracking}
          onChange={e => setTracking(e.target.value)}
          style={{ flex: 1, minWidth: "160px", padding: "0.5rem 0.75rem", border: "1px solid #ddd", fontSize: "0.8rem", outline: "none" }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ padding: "0.5rem 1.25rem", background: "#C9A84C", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Guardando..." : "Registrar envio"}
        </button>
      </div>
      {error && <p style={{ fontSize: "0.75rem", color: "#dc2626" }}>{error}</p>}
    </div>
  )
}
