import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { releasePayout, deleteOrder } from "@/lib/actions/orders"

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

  const { data: orders } = await admin.from("orders").select("*").order("created_at", { ascending: false })

  const totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.platform_fee ?? 0), 0) ?? 0
  const pendingRelease = orders?.filter((o: any) => o.status === "delivered" && !o.payout_released_at) ?? []

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Administrador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Ordenes y Pagos</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Total ordenes</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{orders?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Pagos pendientes</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#C9A84C" }}>{pendingRelease.length}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Comisiones ganadas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4CAF7D" }}>${totalRevenue.toLocaleString("es-CO")}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!orders || orders.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>No hay ordenes aun.</p>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} style={{ border: "1px solid #eee", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>Orden: {order.id?.slice(0, 8)}...</p>
                  <div style={{ display: "flex", gap: "2rem", marginBottom: "0.5rem" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#888" }}>Total pagado</p>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111" }}>${Number(order.total_price ?? 0).toLocaleString("es-CO")}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#888" }}>Comision DSM</p>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#C9A84C" }}>${Number(order.platform_fee ?? 0).toLocaleString("es-CO")}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "#888" }}>Para vendedor</p>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#4CAF7D" }}>${Number(order.seller_earnings ?? 0).toLocaleString("es-CO")}</p>
                    </div>
                  </div>
                  {order.tracking_number && (
                    <p style={{ fontSize: "0.8rem", color: "#555" }}>Guia: {order.tracking_number} — {order.shipping_company}</p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: order.status === "delivered" ? "#e8f5e9" : order.status === "released" ? "#e3f2fd" : order.status === "shipped" ? "#fff8e1" : "#f5f5f5", color: order.status === "delivered" ? "#2e7d32" : order.status === "released" ? "#1565c0" : order.status === "shipped" ? "#f57f17" : "#555", border: "1px solid #eee" }}>
                    {order.status === "delivered" ? "Entregado" : order.status === "released" ? "Pago liberado" : order.status === "shipped" ? "Enviado" : order.status === "paid" ? "Pagado" : "Pendiente"}
                  </span>
                  {order.status === "delivered" && !order.payout_released_at && (
                    <form action={async () => { "use server"; await releasePayout(order.id) }}>
                      <button type="submit" style={{ padding: "0.5rem 1rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                        Liberar pago
                      </button>
                    </form>
                  )}
                  {order.payout_released_at && (
                    <p style={{ fontSize: "0.75rem", color: "#4CAF7D" }}>Liberado: {new Date(order.payout_released_at).toLocaleDateString("es-CO")}</p>
                  )}
                  <form action={async () => { "use server"; await deleteOrder(order.id) }}>
                    <button type="submit" style={{ padding: "0.5rem 1rem", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                      Eliminar orden
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
