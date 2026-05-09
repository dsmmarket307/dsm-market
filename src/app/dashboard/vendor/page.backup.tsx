import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"
import { deleteProduct } from "@/lib/actions/products"

export default async function VendorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await admin.from("profiles").select("seller_status").eq("id", user.id).single()
  const { data: products } = await admin.from("products").select("id, name, category, price, status").eq("seller_id", user.id).order("created_at", { ascending: false })
  const { data: orders } = await admin.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false })

  const productIds = products?.map((p: any) => p.id) ?? []
  const { data: images } = productIds.length > 0 ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).order("position", { ascending: true }) : { data: [] }

  const approved = products?.filter((p: any) => p.status === "approved").length ?? 0
  const pending = products?.filter((p: any) => p.status === "pending").length ?? 0
  const rejected = products?.filter((p: any) => p.status === "rejected").length ?? 0
  const isApproved = profile?.seller_status === "approved"

  const totalSales = orders?.reduce((sum: number, o: any) => sum + Number(o.total_price ?? 0), 0) ?? 0
  const totalDSMFee = orders?.reduce((sum: number, o: any) => sum + Number(o.platform_fee ?? 0), 0) ?? 0
  const totalMPFee = totalSales * 0.0339
  const netEarnings = totalSales - totalDSMFee - totalMPFee
  const retained = orders?.filter((o: any) => ["paid","shipped"].includes(o.status)).reduce((sum: number, o: any) => sum + Number(o.seller_earnings ?? 0), 0) ?? 0
  const released = orders?.filter((o: any) => o.status === "released").reduce((sum: number, o: any) => sum + Number(o.seller_earnings ?? 0), 0) ?? 0
  const pendingShip = orders?.filter((o: any) => o.status === "paid").length ?? 0

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Panel de vendedor</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{user.user_metadata?.name ?? user.email?.split("@")[0]}</h1>
      </div>

      {!isApproved && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "#FBF5E6", border: "1px solid #C9A84C" }}>
          <p style={{ fontSize: "0.875rem", color: "#C9A84C", fontWeight: 600 }}>Cuenta pendiente de aprobacion</p>
          <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>El administrador debe aprobar tu perfil antes de publicar productos.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.25rem", borderTop: "3px solid #C9A84C" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Total ventas</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>${totalSales.toLocaleString("es-CO")}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem", borderTop: "3px solid #4CAF7D" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Ganancias netas</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4CAF7D" }}>${netEarnings.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem", borderTop: "3px solid #f57f17" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Saldo retenido</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f57f17" }}>${retained.toLocaleString("es-CO")}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem", borderTop: "3px solid #1565c0" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Saldo liberado</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1565c0" }}>${released.toLocaleString("es-CO")}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.25rem" }}>Comision DSM 5%</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#E05252" }}>-${totalDSMFee.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.25rem" }}>Comision MP 3.39%</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#E05252" }}>-${totalMPFee.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.25rem" }}>Pendientes envio</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#f57f17" }}>{pendingShip}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", marginBottom: "0.25rem" }}>Total ordenes</p>
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111" }}>{orders?.length ?? 0}</p>
        </div>
      </div>

      {isApproved && (
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard/vendor/products/new" style={{ display: "inline-block", background: "#C9A84C", color: "#fff", padding: "0.75rem 1.5rem", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase" }}>
            + Publicar nuevo producto
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #eee" }}>Mis ordenes</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  {["Pedido", "Venta", "Comision DSM", "Comision MP", "Neto", "Estado"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.7rem", textTransform: "uppercase", color: "#888", fontWeight: 600, borderBottom: "1px solid #eee" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const venta = Number(order.total_price ?? 0)
                  const dsmFee = Number(order.platform_fee ?? 0)
                  const mpFee = venta * 0.0339
                  const neto = venta - dsmFee - mpFee
                  return (
                    <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "#555" }}>#{order.id?.slice(0,6).toUpperCase()}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>${venta.toLocaleString("es-CO")}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#E05252" }}>-${dsmFee.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</td>
                      <td style={{ padding: "0.75rem 1rem", color: "#E05252" }}>-${mpFee.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#4CAF7D" }}>${neto.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", background: order.status === "released" ? "#e8f5e9" : order.status === "shipped" ? "#fff8e1" : "#f5f5f5", color: order.status === "released" ? "#2e7d32" : order.status === "shipped" ? "#f57f17" : "#555", border: "1px solid #eee" }}>
                          {order.status === "released" ? "Liberado" : order.status === "delivered" ? "Retenido" : order.status === "shipped" ? "Enviado" : order.status === "paid" ? "Retenido" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "1rem" }}>Mis productos</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "#4CAF7D" }}>● {approved} aprobados</span>
          <span style={{ fontSize: "0.8rem", color: "#C9A84C" }}>● {pending} pendientes</span>
          <span style={{ fontSize: "0.8rem", color: "#E05252" }}>● {rejected} rechazados</span>
        </div>
        {!products || products.length === 0 ? (
          <p style={{ color: "#888", fontSize: "0.875rem" }}>No tienes productos aun.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {products.map((product: any) => {
              const img = images?.filter((i: any) => i.product_id === product.id)[0]?.url
              return (
                <div key={product.id} style={{ border: "1px solid #eee", background: "#fff" }}>
                  <div style={{ position: "relative", paddingBottom: "75%", background: "#f5f5f5", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={product.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", padding: "0.5rem" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: "0.75rem", color: "#bbb" }}>Sin imagen</p>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.75rem" }}>
                    <p style={{ fontSize: "0.65rem", color: "#C9A84C", textTransform: "uppercase", marginBottom: "0.25rem" }}>{product.category}</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111", marginBottom: "0.25rem" }}>{product.name}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>${Number(product.price).toLocaleString("es-CO")}</p>
                    <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: product.status === "approved" ? "#e8f5e9" : product.status === "rejected" ? "#fdecea" : "#fff8e1", color: product.status === "approved" ? "#2e7d32" : product.status === "rejected" ? "#c62828" : "#f57f17", border: "1px solid #eee", display: "inline-block", marginBottom: "0.75rem" }}>
                      {product.status === "approved" ? "Aprobado" : product.status === "rejected" ? "Rechazado" : "Pendiente"}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={"/dashboard/vendor/products/edit/" + product.id} style={{ flex: 1, padding: "0.375rem", background: "#f5f5f5", color: "#555", textDecoration: "none", fontSize: "0.75rem", textAlign: "center", border: "1px solid #eee" }}>
                        Editar
                      </Link>
                      <form action={async () => { "use server"; await deleteProduct(product.id) }} style={{ flex: 1 }}>
                        <button type="submit" style={{ width: "100%", padding: "0.375rem", background: "#fdecea", color: "#c62828", border: "1px solid #E05252", cursor: "pointer", fontSize: "0.75rem" }}>
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
