import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { uploadGuide } from "@/lib/actions/orders"

function calcComisiones(total: number) {
  const dsmFee = Math.round(total * 0.05)
  const mpBase = Math.round(total * 0.0329)
  const mpIva  = Math.round(mpBase * 0.19)
  const mpFijo = 952
  const mpTotal = mpBase + mpIva + mpFijo
  const neto = total - dsmFee - mpTotal
  return { dsmFee, mpTotal, neto }
}

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: orders } = await admin.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false })

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .vo-root{background:#F5F5F5;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .vo-inner{max-width:1000px;margin:0 auto;}
    .vo-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .vo-card{background:#fff;border-radius:16px;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:1.25rem;overflow:hidden;}
    .vo-card-top{padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(0,0,0,.06);flex-wrap:wrap;gap:1rem;}
    .vo-badge{font-size:11px;padding:4px 12px;border-radius:999px;font-weight:600;font-family:'Poppins',sans-serif;}
    .vo-section{padding:1.25rem 1.5rem;border-bottom:1px solid rgba(0,0,0,.06);}
    .vo-section-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#D4AF37;margin-bottom:12px;font-weight:700;font-family:'Poppins',sans-serif;}
    .vo-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13.5px;}
    .vo-label{color:#888;font-family:'Poppins',sans-serif;}
    .vo-value{color:#111;font-weight:600;font-family:'Poppins',sans-serif;}
    .vo-fee-row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;font-family:'Poppins',sans-serif;}
    .vo-input{width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,.12);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#fff;color:#111;}
    .vo-input:focus{border-color:#D4AF37;}
    .vo-select{width:100%;padding:10px 14px;border:1px solid rgba(0,0,0,.12);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#fff;color:#111;}
    .vo-submit{padding:10px 24px;background:#D4AF37;color:#0B0B0B;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;transition:background .2s;white-space:nowrap;}
    .vo-submit:hover{background:#e8c84a;}
  `

  return (
    <>
      <style>{css}</style>
      <div className="vo-root">
        <div className="vo-inner">

          <div className="vo-header">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#D4AF37", marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Vendedor</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Poppins',sans-serif" }}>Mis Ordenes</h1>
          </div>

          {!orders || orders.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: "3rem", textAlign: "center", border: "1px solid rgba(0,0,0,.06)" }}>
              <p style={{ color: "#888", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>No tienes ordenes aun.</p>
            </div>
          ) : (
            orders.map((order: any) => {
              const total = Number(order.total_price ?? 0)
              const { dsmFee, mpTotal, neto } = calcComisiones(total)
              const statusColor = ["delivered","released"].includes(order.status)
                ? { bg: "rgba(29,158,117,.1)", color: "#1D9E75" }
                : order.status === "paid"
                  ? { bg: "rgba(212,175,55,.1)", color: "#D4AF37" }
                  : order.status === "shipped"
                    ? { bg: "rgba(167,139,250,.1)", color: "#a78bfa" }
                    : { bg: "rgba(0,0,0,.06)", color: "#888" }
              const statusText = { released: "Pago liberado", delivered: "Entregado", shipped: "Enviado", paid: "Pago recibido" }[order.status] ?? "Pendiente"

              return (
                <div key={order.id} className="vo-card">
                  <div className="vo-card-top">
                    <div>
                      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Orden #{order.id?.slice(0,8).toUpperCase()}</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111", margin: "0 0 4px", fontFamily: "'Poppins',sans-serif" }}>${total.toLocaleString("es-CO")}</p>
                      <p style={{ fontSize: 12, color: "#aaa", fontFamily: "'Poppins',sans-serif" }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                    </div>
                    <span className="vo-badge" style={{ background: statusColor.bg, color: statusColor.color }}>{statusText}</span>
                  </div>

                  {/* DATOS ENVIO */}
                  <div className="vo-section">
                    <p className="vo-section-title">Datos de envio del comprador</p>
                    <div className="vo-grid2">
                      {order.buyer_name     && <div><span className="vo-label">Nombre: </span><span className="vo-value">{order.buyer_name}</span></div>}
                      {order.buyer_phone    && <div><span className="vo-label">Telefono: </span><span className="vo-value">{order.buyer_phone}</span></div>}
                      {order.buyer_address  && <div style={{ gridColumn: "1/-1" }}><span className="vo-label">Direccion: </span><span className="vo-value">{order.buyer_address}</span></div>}
                      {order.buyer_city     && <div><span className="vo-label">Ciudad: </span><span className="vo-value">{order.buyer_city}</span></div>}
                      {order.buyer_department && <div><span className="vo-label">Departamento: </span><span className="vo-value">{order.buyer_department}</span></div>}
                      {order.buyer_transportadora && <div style={{ gridColumn: "1/-1" }}><span className="vo-label">Transportadora: </span><span className="vo-value">{order.buyer_transportadora}</span></div>}
                      {order.buyer_notes   && <div style={{ gridColumn: "1/-1" }}><span className="vo-label">Notas: </span><span className="vo-value">{order.buyer_notes}</span></div>}
                      {!order.buyer_name && !order.buyer_address && <div style={{ gridColumn: "1/-1", color: "#aaa", fontSize: 13, fontStyle: "italic" }}>Sin datos de envio registrados</div>}
                    </div>
                  </div>

                  {/* COMISIONES */}
                  <div className="vo-section" style={{ background: "#fafafa" }}>
                    <p className="vo-section-title" style={{ color: "#888" }}>Desglose de comisiones</p>
                    <div className="vo-fee-row"><span style={{ color: "#555" }}>Valor del producto</span><span style={{ fontWeight: 600, color: "#111" }}>${total.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row"><span style={{ color: "#ef4444" }}>Comision DSM (5%)</span><span style={{ color: "#ef4444" }}>- ${dsmFee.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row"><span style={{ color: "#ef4444" }}>Comision MP (3.29% + IVA + $952)</span><span style={{ color: "#ef4444" }}>- ${mpTotal.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row" style={{ borderTop: "1px solid rgba(0,0,0,.08)", marginTop: 6, paddingTop: 8 }}>
                      <span style={{ fontWeight: 700, color: "#111" }}>Lo que recibes</span>
                      <span style={{ fontWeight: 700, color: "#1D9E75", fontSize: 16 }}>${neto.toLocaleString("es-CO")}</span>
                    </div>
                  </div>

                  {/* GUIA ACTUAL */}
                  {order.tracking_number && (
                    <div className="vo-section">
                      <p style={{ fontSize: 13, color: "#555", fontFamily: "'Poppins',sans-serif" }}>Transportadora: <strong style={{ color: "#111" }}>{order.shipping_company}</strong></p>
                      <p style={{ fontSize: 13, color: "#555", fontFamily: "'Poppins',sans-serif" }}>Guia: <strong style={{ color: "#111" }}>{order.tracking_number}</strong></p>
                    </div>
                  )}

                  {/* SUBIR GUIA */}
                  {(order.status === "paid" || order.status === "shipped") && (
                    <div className="vo-section">
                      <p style={{ fontSize: 11, color: "#888", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Poppins',sans-serif" }}>
                        {order.tracking_number ? "Editar guia de envio" : "Subir guia de envio"}
                      </p>
                      <form action={async (formData: FormData) => { "use server"; await uploadGuide(formData) }}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
                          <div>
                            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>Transportadora</label>
                            <select name="shippingCompany" required className="vo-select">
                              <option value="">Seleccionar...</option>
                              {["Servientrega","Coordinadora","Envia","Inter Rapidisimo","TCC","Deprisa","Otra"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>Numero de guia</label>
                            <input name="trackingNumber" required defaultValue={order.tracking_number ?? ""} placeholder="Ej: 1234567890" className="vo-input" />
                          </div>
                          <button type="submit" className="vo-submit">{order.tracking_number ? "Actualizar" : "Subir guia"}</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}