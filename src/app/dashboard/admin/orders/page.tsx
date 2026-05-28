import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { releasePayout, deleteOrder } from "@/lib/actions/orders"

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

function getCountdown(confirmedAt: string | null, autoReleaseDate: string | null) {
  if (!confirmedAt) return null
  const releaseAt = autoReleaseDate
    ? new Date(autoReleaseDate)
    : new Date(new Date(confirmedAt).getTime() + 48 * 60 * 60 * 1000)
  const diff = releaseAt.getTime() - Date.now()
  if (diff <= 0) return { ready: true, hours: 0, minutes: 0 }
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { ready: false, hours, minutes }
}

function StatusBadge({ status, disputeStatus }: { status: string; disputeStatus?: string }) {
  if (disputeStatus === "open") return (
    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 999 }}>Disputa</span>
  )
  const map: Record<string, { label: string; bg: string; color: string }> = {
    paid:      { label: "Pagado",        bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
    shipped:   { label: "En transito",   bg: "rgba(59,130,246,0.1)",  color: "#60a5fa" },
    delivered: { label: "Entregado",     bg: "rgba(16,185,129,0.1)",  color: "#10b981" },
    released:  { label: "Pago liberado", bg: "rgba(99,102,241,0.1)",  color: "#818cf8" },
  }
  const s = map[status] ?? { label: status, bg: "rgba(255,255,255,0.05)", color: "#aaa" }
  return (
    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 999 }}>{s.label}</span>
  )
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.platform_fee ?? 0), 0) ?? 0
  const pendingRelease = orders?.filter((o: any) => o.status === "delivered" && !o.payout_released_at) ?? []
  const disputas = orders?.filter((o: any) => o.dispute_status === "open") ?? []
  const sinGuia = orders?.filter((o: any) => o.status === "paid" && !o.guide_uploaded_at) ?? []

  const enriched = orders?.map((o: any) => ({
    ...o,
    countdown: getCountdown(o.confirmed_by_buyer_at, o.auto_release_date),
  })) ?? []

  const listosLiberar = enriched.filter((o) => o.countdown?.ready && !o.payout_released_at)

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", background: "#0f0f0f", minHeight: "100vh", fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Administrador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Ordenes y Pagos</h1>
      </div>

      {/* Cards stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.25rem", borderRadius: 12, background: "#1a1a1a" }}>
          <p style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Total ordenes</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>{orders?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.25rem", borderRadius: 12, background: "#1a1a1a" }}>
          <p style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Pagos pendientes</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>{pendingRelease.length}</p>
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.25rem", borderRadius: 12, background: "#1a1a1a" }}>
          <p style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Comisiones ganadas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4CAF7D", margin: 0 }}>{fmt(totalRevenue)}</p>
        </div>
        <div style={{ border: "1px solid rgba(239,68,68,.2)", padding: "1.25rem", borderRadius: 12, background: "#1a1a1a" }}>
          <p style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Disputas abiertas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f87171", margin: 0 }}>{disputas.length}</p>
        </div>
      </div>

      {/* Alertas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1.5rem" }}>
        {listosLiberar.length > 0 && (
          <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "12px 16px", color: "#4ade80", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            {listosLiberar.length} pago(s) listo(s) para liberar — countdown completado
          </div>
        )}
        {sinGuia.length > 0 && (
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f59e0b", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {sinGuia.length} vendedor(es) no han subido guia de envio
          </div>
        )}
        {disputas.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {disputas.length} disputa(s) abierta(s) — pago bloqueado
          </div>
        )}
      </div>

      {/* Lista ordenes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!orders || orders.length === 0 ? (
          <p style={{ color: "#999999", textAlign: "center", padding: "2rem" }}>No hay ordenes aun.</p>
        ) : (
          enriched.map((order: any) => {
            const isReady = order.countdown?.ready && !order.payout_released_at && order.dispute_status !== "open"
            return (
              <div key={order.id} style={{ border: isReady ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(212,175,55,.12)", padding: "1.25rem", borderRadius: 12, background: "#1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "#666", marginBottom: "0.5rem" }}>Orden: {order.id?.slice(0, 8)}...</p>
                    {order.buyer_name && (
                      <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "0.5rem" }}>{order.buyer_name} — {order.buyer_city}</p>
                    )}
                    <div style={{ display: "flex", gap: "2rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: "0.7rem", color: "#999" }}>Total pagado</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>{fmt(order.total_price)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.7rem", color: "#999" }}>Comision DSM</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>{fmt(order.platform_fee)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "0.7rem", color: "#999" }}>Para vendedor</p>
                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "#4CAF7D", margin: 0 }}>{fmt(order.seller_earnings)}</p>
                      </div>
                    </div>
                    {order.tracking_number && (
                      <p style={{ fontSize: "0.8rem", color: "#cccccc", margin: "4px 0 0" }}>Guia: {order.tracking_number} — {order.shipping_company}</p>
                    )}
                    {order.countdown && !order.payout_released_at && (
                      <div style={{ marginTop: 8 }}>
                        {order.countdown.ready ? (
                          <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>Countdown completado — listo para liberar</span>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>Libera en: {order.countdown.hours}h {order.countdown.minutes}m</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <StatusBadge status={order.status} disputeStatus={order.dispute_status} />

                    {order.status === "delivered" && !order.payout_released_at && order.dispute_status !== "open" && (
                      <form action={async () => { "use server"; await releasePayout(order.id) }}>
                        <button type="submit" style={{ padding: "0.5rem 1rem", background: isReady ? "#4ade80" : "#4CAF7D", color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, borderRadius: 8 }}>
                          Liberar pago
                        </button>
                      </form>
                    )}

                    {order.payout_released_at && (
                      <p style={{ fontSize: "0.75rem", color: "#4CAF7D" }}>Liberado: {new Date(order.payout_released_at).toLocaleDateString("es-CO")}</p>
                    )}

                    <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                      <button type="submit" style={{ padding: "0.5rem 1rem", background: "#0f0f0f", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, borderRadius: 8 }}>
                        Eliminar orden
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
