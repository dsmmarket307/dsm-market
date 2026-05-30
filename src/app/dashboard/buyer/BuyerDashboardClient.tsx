'use client'

import { useTheme } from "@/lib/theme-context"
import { confirmDelivery } from "@/lib/actions/orders"
import Link from "next/link"
import RecomendadoParaTi from "@/components/RecomendadoParaTi"

const THEMES = {
  dark: { bg: '#0f0f0f', bg2: '#1a1a1a', card: '#151515', text: '#ffffff', text2: '#999999', text3: '#555555', border: 'rgba(255,255,255,0.06)', borderSubtle: 'rgba(255,255,255,0.04)', gold: '#D4AF37' },
  light: { bg: '#f5f5f5', bg2: '#e8e8e8', card: '#ffffff', text: '#111111', text2: '#666666', text3: '#888888', border: 'rgba(0,0,0,0.1)', borderSubtle: 'rgba(0,0,0,0.06)', gold: '#B8960C' },
}

interface Order {
  id: string
  total_price: number
  status: string
  created_at: string
  tracking_number?: string
  shipping_company?: string
  confirmed_by_buyer_at?: string
}

interface Props {
  name: string
  orders: Order[]
  totalSpent: number
  active: number
  delivered: number
}

export default function BuyerDashboardClient({ name, orders, totalSpent, active, delivered }: Props) {
  const { theme } = useTheme()
  const t = THEMES[theme]

  const statusLabel: Record<string, string> = {
    delivered: "Entregado",
    released: "Completado",
    shipped: "En camino",
    paid: "Pagado",
  }

  const statusStyle = (status: string) => {
    if (["delivered", "released"].includes(status)) return { bg: "rgba(76,175,80,0.15)", color: "#4CAF7D" }
    if (status === "shipped") return { bg: "rgba(245,127,23,0.15)", color: "#f57f17" }
    if (status === "paid") return { bg: `rgba(212,175,55,0.15)`, color: t.gold }
    return { bg: t.border, color: t.text2 }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "'Poppins', sans-serif", background: t.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: t.gold, marginBottom: "0.25rem" }}>
          Bienvenido de vuelta
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: t.text, margin: 0 }}>
          Hola, <span style={{ color: t.gold }}>{name}</span>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          {
            label: "Pedidos activos", value: active, color: t.gold,
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.gold} strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          },
          {
            label: "Total comprado", value: "$" + totalSpent.toLocaleString("es-CO"), color: t.gold,
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.gold} strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          },
          {
            label: "Entregados", value: delivered, color: "#4CAF7D",
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          },
        ].map((item, i) => (
          <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: t.text2, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>{item.label}</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
            <div style={{ opacity: 0.6 }}>{item.icon}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/buyer/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: t.gold, color: "#0B0B0B", padding: "0.875rem 1.75rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderRadius: "8px", boxShadow: `0 4px 20px rgba(212,175,55,0.3)` }}>
          Ver productos
        </Link>
      </div>

      {/* Orders */}
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${t.border}` }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: t.text, margin: 0 }}>Mis pedidos</h2>
        </div>

        {!orders || orders.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: t.text3, fontSize: "0.875rem" }}>No tienes pedidos aun.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {orders.map((order, i) => {
              const s = statusStyle(order.status)
              const confirmAction = confirmDelivery.bind(null, order.id)
              return (
                <div key={order.id} style={{ padding: "1.25rem 1.5rem", borderBottom: i < orders.length - 1 ? `1px solid ${t.borderSubtle}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: t.text3, marginBottom: "0.25rem" }}>#{order.id?.slice(0, 8).toUpperCase()}</p>
                    {order.tracking_number && (
                      <p style={{ fontSize: "0.8rem", color: t.text2, marginBottom: "0.25rem" }}>
                        Guia: {order.tracking_number} — {order.shipping_company}
                      </p>
                    )}
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: t.text, margin: 0 }}>
                      ${Number(order.total_price ?? 0).toLocaleString("es-CO")}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: t.text3, margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString("es-CO")}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.3rem 0.875rem", borderRadius: "999px", fontWeight: 600, background: s.bg, color: s.color }}>
                      {statusLabel[order.status] ?? "Pendiente"}
                    </span>

                    {order.status === "shipped" && !order.confirmed_by_buyer_at && (
                      <form action={confirmAction}>
                        <button type="submit" style={{ padding: "0.4rem 0.875rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "6px" }}>
                          Confirmar recibido
                        </button>
                      </form>
                    )}

                    {order.confirmed_by_buyer_at && order.status !== "released" && (
                      <p style={{ fontSize: "0.7rem", color: t.text3 }}>Pago en proceso de liberacion</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RecomendadoParaTi />
    </div>
  )
}