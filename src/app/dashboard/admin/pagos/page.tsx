"use client";

import { useState, useEffect, useCallback } from "react";
import { releasePayout } from "@/lib/actions/orders";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  paid:     { label: "Pagado",        color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  shipped:  { label: "En transito",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  delivered:{ label: "Entregado",     color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  released: { label: "Liberado",      color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
};

export default function PagosPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/release-overview")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); else setError(r.error); })
      .catch(() => setError("Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRelease = async (orderId: string) => {
    setReleasing(orderId);
    await releasePayout(orderId);
    load();
    setReleasing(null);
  };

  const filtered = data?.orders?.filter((o: any) => {
    if (filter === "all")       return true;
    if (filter === "ready")     return o.countdown?.ready && !o.payout_released_at;
    if (filter === "countdown") return o.countdown && !o.countdown.ready && !o.payout_released_at;
    if (filter === "dispute")   return o.dispute_status === "open";
    if (filter === "released")  return !!o.payout_released_at;
    return true;
  }) ?? [];

  const statCard = (label: string, value: string | number, color?: string, sub?: string) => (
    <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", padding: "20px 24px", flex: 1, minWidth: 160 }}>
      <p style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>{label}</p>
      <p style={{ color: color ?? "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{value}</p>
      {sub && <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", padding: "32px 24px", fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", margin: "0 0 4px" }}>Administrador</p>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Liberacion de Pagos</h1>
          </div>
          <button onClick={load} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Actualizar
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#D4AF37", fontSize: 14 }}>Cargando datos...</div>
        ) : data ? (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              {statCard("Dinero Retenido", fmt(data.stats.dineroRetenido), "#D4AF37", "En escrow")}
              {statCard("Listos Liberar", data.stats.listosLiberar, "#4ade80", "Countdown completado")}
              {statCard("Disputas", data.stats.disputasAbiertas, "#f87171")}
              {statCard("Countdown Activos", data.stats.countdownActivos, "#60a5fa")}
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {statCard("Sin Guia", data.stats.sinGuia, "#f59e0b", "Vendedor pendiente")}
              {statCard("Sin Confirmar", data.stats.sinConfirmar, "#a78bfa", "Comprador pendiente")}
              <div style={{ flex: 2, minWidth: 160 }} />
            </div>

            {(data.stats.listosLiberar > 0 || data.stats.sinGuia > 0 || data.stats.disputasAbiertas > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {data.stats.listosLiberar > 0 && (
                  <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "12px 16px", color: "#4ade80", fontSize: 13 }}>
                    {data.stats.listosLiberar} pago(s) listo(s) para liberar
                  </div>
                )}
                {data.stats.sinGuia > 0 && (
                  <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f59e0b", fontSize: 13 }}>
                    {data.stats.sinGuia} vendedor(es) sin subir guia
                  </div>
                )}
                {data.stats.disputasAbiertas > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13 }}>
                    {data.stats.disputasAbiertas} disputa(s) abierta(s) — pago bloqueado
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { key: "all",       label: "Todos" },
                { key: "ready",     label: "Listos liberar" },
                { key: "countdown", label: "Countdown" },
                { key: "dispute",   label: "Disputas" },
                { key: "released",  label: "Liberados" },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: filter === key ? "#D4AF37" : "rgba(255,255,255,0.08)", background: filter === key ? "rgba(212,175,55,0.12)" : "transparent", color: filter === key ? "#D4AF37" : "#666" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Comprador", "Monto", "Vendedor recibe", "Estado", "Guia", "Countdown", "Accion"].map((h) => (
                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#555", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#555", fontSize: 14 }}>Sin pedidos en este filtro</td></tr>
                    ) : filtered.map((order: any) => {
                      const st = STATUS_LABEL[order.status] ?? { label: order.status, color: "#aaa", bg: "rgba(255,255,255,0.05)" };
                      const isReady = order.countdown?.ready && !order.payout_released_at && order.dispute_status !== "open";
                      const isDispute = order.dispute_status === "open";
                      return (
                        <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, margin: 0 }}>{order.buyer_name ?? "—"}</p>
                            <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>{order.buyer_city ?? ""}</p>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <p style={{ color: "#D4AF37", fontSize: 13, fontWeight: 600, margin: 0 }}>{fmt(order.total_price)}</p>
                            <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>Fee: {fmt(order.platform_fee)}</p>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 600, margin: 0 }}>{fmt(order.seller_earnings)}</p>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ background: isDispute ? "rgba(239,68,68,0.1)" : st.bg, color: isDispute ? "#f87171" : st.color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                              {isDispute ? "Disputa" : st.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {order.tracking_number
                              ? <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>{order.tracking_number}</p>
                              : <span style={{ color: "#f59e0b", fontSize: 11 }}>Sin guia</span>}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {order.payout_released_at
                              ? <span style={{ color: "#6366f1", fontSize: 12 }}>Liberado</span>
                              : isDispute
                              ? <span style={{ color: "#f87171", fontSize: 12 }}>Bloqueado</span>
                              : order.countdown
                              ? order.countdown.ready
                                ? <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>Listo</span>
                                : <span style={{ color: "#60a5fa", fontSize: 12 }}>{order.countdown.hours}h {order.countdown.minutes}m</span>
                              : <span style={{ color: "#555", fontSize: 12 }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {isReady ? (
                              <button onClick={() => handleRelease(order.id)} disabled={releasing === order.id} style={{ background: releasing === order.id ? "#333" : "#4ade80", color: "#0B0B0B", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: releasing === order.id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                                {releasing === order.id ? "..." : "Liberar pago"}
                              </button>
                            ) : order.payout_released_at ? (
                              <span style={{ color: "#555", fontSize: 12 }}>{new Date(order.payout_released_at).toLocaleDateString("es-CO")}</span>
                            ) : (
                              <span style={{ color: "#555", fontSize: 12 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
