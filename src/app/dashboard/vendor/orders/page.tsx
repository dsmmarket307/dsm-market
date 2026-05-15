import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { uploadGuide } from "@/lib/actions/orders"

function calcComisiones(total: number) {
  const dsmFee = Math.round(total * 0.05)
  const mpBase = Math.round(total * 0.0329)
  const mpIva = Math.round(mpBase * 0.19)
  const mpFijo = 952
  const mpTotal = mpBase + mpIva + mpFijo
  const neto = total - dsmFee - mpTotal
  return { dsmFee, mpBase, mpIva, mpFijo, mpTotal, neto }
}

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Vendedor</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Mis Ordenes</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center", padding: "3rem" }}>No tienes ordenes aun.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {orders.map((order: any) => {
            const total = Number(order.total_price ?? 0)
            const { dsmFee, mpTotal, neto } = calcComisiones(total)
            return (
              <div key={order.id} style={{ border: "1px solid #eee", padding: "1.25rem" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.25rem" }}>Orden: #{order.id?.slice(0,8).toUpperCase()}</p>
                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111" }}>${total.toLocaleString("es-CO")}</p>
                    <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                  </div>
                  <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: order.status === "released" ? "#e8f5e9" : order.status === "shipped" ? "#fff8e1" : order.status === "paid" ? "#e3f2fd" : "#f5f5f5", color: order.status === "released" ? "#2e7d32" : order.status === "shipped" ? "#f57f17" : order.status === "paid" ? "#1565c0" : "#555", border: "1px solid #eee" }}>
                    {order.status === "released" ? "Pago liberado" : order.status === "delivered" ? "Entregado" : order.status === "shipped" ? "Enviado" : order.status === "paid" ? "Pago recibido" : "Pendiente"}
                  </span>
                </div>

                {(order.buyer_name || order.buyer_address) && (
                  <div style={{ background: "#fff", border: "1px solid #C9A84C", borderRadius: "6px", padding: "1rem", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "#333", marginBottom: "0.75rem" }}>Datos de envio del comprador</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.82rem" }}>
                      {order.buyer_name && <div><span style={{ color: "#888" }}>Nombre: </span><strong>{order.buyer_name}</strong></div>}
                      {order.buyer_phone && <div><span style={{ color: "#888" }}>Telefono: </span><strong>{order.buyer_phone}</strong></div>}
                      {order.buyer_address && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>Direccion: </span><strong>{order.buyer_address}</strong></div>}
                      {order.buyer_city && <div><span style={{ color: "#888" }}>Ciudad: </span><strong>{order.buyer_city}</strong></div>}
                      {order.buyer_department && <div><span style={{ color: "#888" }}>Departamento: </span><strong>{order.buyer_department}</strong></div>}
                      {order.buyer_transportadora && <div><span style={{ color: "#888" }}>Transportadora elegida: </span><strong>{order.buyer_transportadora}</strong></div>}
                      {order.buyer_notes && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>Notas: </span><strong>{order.buyer_notes}</strong></div>}
                    </div>
                  </div>
                )}

                <div style={{ background: "#fffbf0", border: "1px solid #f0e4b0", borderRadius: "6px", padding: "1rem", marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: "#888", marginBottom: "0.75rem" }}>Desglose de comisiones</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#555" }}>Valor del producto</span>
                      <span style={{ fontWeight: 600, color: "#111" }}>${total.toLocaleString("es-CO")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#dc2626" }}>Comision DSM (5%)</span>
                      <span style={{ color: "#dc2626" }}>- ${dsmFee.toLocaleString("es-CO")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#dc2626" }}>Comision MP (3.29% + IVA + $952)</span>
                      <span style={{ color: "#dc2626" }}>- ${mpTotal.toLocaleString("es-CO")}</span>
                    </div>
                    <div style={{ borderTop: "1px solid #e0c97a", marginTop: "0.4rem", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, color: "#111" }}>Lo que recibes</span>
                      <span style={{ fontWeight: 700, color: "#4CAF7D", fontSize: "1rem" }}>${neto.toLocaleString("es-CO")}</span>
                    </div>
                  </div>
                </div>

                {order.tracking_number && (
                  <div style={{ padding: "0.75rem", background: "#f9f9f9", border: "1px solid #eee", marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.8rem", color: "#555" }}>Transportadora: <strong>{order.shipping_company}</strong></p>
                    <p style={{ fontSize: "0.8rem", color: "#555" }}>Guia: <strong>{order.tracking_number}</strong></p>
                  </div>
                )}

                {(order.status === "paid" || order.status === "shipped") && (
                  <form action={async (formData: FormData) => { "use server"; await uploadGuide(formData) }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <p style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.5rem" }}>
                      {order.tracking_number ? "Editar guia de envio" : "Subir guia de envio"}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Transportadora</label>
                        <select name="shippingCompany" required style={{ width: "100%", padding: "0.625rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none" }}>
                          <option value="">Seleccionar...</option>
                          <option value="Servientrega">Servientrega</option>
                          <option value="Coordinadora">Coordinadora</option>
                          <option value="Envia">Envia</option>
                          <option value="Inter Rapidisimo">Inter Rapidisimo</option>
                          <option value="TCC">TCC</option>
                          <option value="Deprisa">Deprisa</option>
                          <option value="Otra">Otra</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Numero de guia</label>
                        <input name="trackingNumber" required defaultValue={order.tracking_number ?? ""} placeholder="Ej: 1234567890" style={{ width: "100%", padding: "0.625rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none" }} />
                      </div>
                      <button type="submit" style={{ padding: "0.625rem 1.25rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                        {order.tracking_number ? "Actualizar" : "Subir guia"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


