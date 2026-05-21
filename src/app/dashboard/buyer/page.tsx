import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { confirmDelivery } from "@/lib/actions/orders"
import Link from "next/link"
import RecomendadoParaTi from "@/components/RecomendadoParaTi"

export default async function BuyerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "buyer") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const totalSpent = orders?.reduce((sum: number, o: any) => sum + Number(o.total_price ?? 0), 0) ?? 0
  const active = orders?.filter((o: any) => !["delivered","released","cancelled"].includes(o.status)).length ?? 0
  const delivered = orders?.filter((o: any) => ["delivered","released"].includes(o.status)).length ?? 0
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]

  return (
    <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif" }}>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Bienvenido de vuelta</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>Hola, <span style={{ color: "#D4AF37" }}>{name}</span></h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Pedidos activos", value: active, color: "#D4AF37", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
          { label: "Total comprado", value: "$" + totalSpent.toLocaleString("es-CO"), color: "#D4AF37", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          { label: "Entregados", value: delivered, color: "#4CAF7D", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
        ].map((item, i) => (
          <div key={i} style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>{item.label}</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
            <div style={{ opacity: 0.6 }}>{item.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <Link href="/dashboard/buyer/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#D4AF37", color: "#0B0B0B", padding: "0.875rem 1.75rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderRadius: "8px", boxShadow: "0 4px 20px rgba(212,175,55,0.3)" }}>
          Ver productos
        </Link>
      </div>

      <div style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: 0 }}>Mis pedidos</h2>
        </div>

        {!orders || orders.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "#555", fontSize: "0.875rem" }}>No tienes pedidos aun.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {orders.map((order: any, i: number) => (
              <div key={order.id} style={{ padding: "1.25rem 1.5rem", borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#555", marginBottom: "0.25rem" }}>#{order.id?.slice(0,8).toUpperCase()}</p>
                  {order.tracking_number && (
                    <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.25rem" }}>Guia: {order.tracking_number} — {order.shipping_company}</p>
                  )}
                  <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>${Number(order.total_price ?? 0).toLocaleString("es-CO")}</p>
                  <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", padding: "0.3rem 0.875rem", borderRadius: "999px", fontWeight: 600, background: ["delivered","released"].includes(order.status) ? "rgba(76,175,80,0.15)" : order.status === "shipped" ? "rgba(245,127,23,0.15)" : order.status === "paid" ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)", color: ["delivered","released"].includes(order.status) ? "#4CAF7D" : order.status === "shipped" ? "#f57f17" : order.status === "paid" ? "#D4AF37" : "#888" }}>
                    {order.status === "delivered" ? "Entregado" : order.status === "released" ? "Completado" : order.status === "shipped" ? "En camino" : order.status === "paid" ? "Pagado" : "Pendiente"}
                  </span>
                  {order.status === "shipped" && !order.confirmed_by_buyer_at && (
                    <form action={async () => { "use server"; await confirmDelivery(order.id) }}>
                      <button type="submit" style={{ padding: "0.4rem 0.875rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "6px" }}>
                        Confirmar recibido
                      </button>
                    </form>
                  )}
                  {order.confirmed_by_buyer_at && order.status !== "released" && (
                    <p style={{ fontSize: "0.7rem", color: "#555" }}>Pago en proceso de liberacion</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecomendadoParaTi />
    </div>
  )
}
