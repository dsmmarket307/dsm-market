import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { confirmDelivery } from "@/lib/actions/orders"
import Link from "next/link"

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

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Panel de comprador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{user.user_metadata?.name ?? user.email?.split("@")[0]}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Total gastado</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#C9A84C" }}>${totalSpent.toLocaleString("es-CO")}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Pedidos activos</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{active}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Entregados</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4CAF7D" }}>{delivered}</p>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/dashboard/buyer/products" style={{ display: "inline-block", background: "#C9A84C", color: "#fff", padding: "0.75rem 1.5rem", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase" }}>
          Ver productos disponibles
        </Link>
      </div>

      <div style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "1rem" }}>Mis pedidos</h2>
        {!orders || orders.length === 0 ? (
          <p style={{ color: "#888", fontSize: "0.875rem" }}>No tienes pedidos aun.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order: any) => (
              <div key={order.id} style={{ border: "1px solid #eee", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.25rem" }}>Orden: {order.id?.slice(0,8)}...</p>
                    {order.tracking_number && (
                      <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>Guia: {order.tracking_number} — {order.shipping_company}</p>
                    )}
                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111" }}>${Number(order.total_price ?? 0).toLocaleString("es-CO")}</p>
                    <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: ["delivered","released"].includes(order.status) ? "#e8f5e9" : order.status === "shipped" ? "#fff8e1" : "#f5f5f5", color: ["delivered","released"].includes(order.status) ? "#2e7d32" : order.status === "shipped" ? "#f57f17" : "#555", border: "1px solid #eee" }}>
                      {order.status === "delivered" ? "Entregado" : order.status === "released" ? "Completado" : order.status === "shipped" ? "En camino" : order.status === "paid" ? "Pagado" : "Pendiente"}
                    </span>
                    {order.status === "shipped" && !order.confirmed_by_buyer_at && (
                      <form action={async () => { "use server"; await confirmDelivery(order.id) }}>
                        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          Confirmar recibido
                        </button>
                      </form>
                    )}
                    {order.confirmed_by_buyer_at && order.status !== "released" && (
                      <p style={{ fontSize: "0.75rem", color: "#888" }}>Pago en proceso de liberacion</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
