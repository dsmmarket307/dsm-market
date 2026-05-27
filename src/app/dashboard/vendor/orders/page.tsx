import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { uploadGuide } from "@/lib/actions/orders"
import OrderSearch from "./OrderSearch"

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

  const { data: orders } = await admin
    .from("orders")
    .select("*, products(id, name, price, category)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const productIds = (orders || []).map((o: any) => o.product_id).filter(Boolean)
  const { data: allImages } = productIds.length > 0
    ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).eq("position", 1)
    : { data: [] }

  const imageMap: Record<string, string> = {}
  ;(allImages || []).forEach((img: any) => { imageMap[img.product_id] = img.url })
  const enriched = (orders || []).map((order: any) => ({
    ...order,
    mainImage: order.product_id ? imageMap[order.product_id] || null : null
  }))

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    *{box-sizing:border-box;}
    .vo-root{background:#0f0f0f;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .vo-inner{max-width:1000px;margin:0 auto;}
    .vo-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .vo-search-wrap{margin-bottom:1.5rem;position:relative;}
    .vo-search{width:100%;padding:12px 16px 12px 44px;background:#151515;border:1px solid rgba(212,175,55,.15);border-radius:12px;color:#fff;font-size:14px;font-family:'Poppins',sans-serif;outline:none;}
    .vo-search:focus{border-color:#D4AF37;}
    .vo-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#888;}
    .vo-card{background:#151515;border-radius:16px;border:1px solid rgba(212,175,55,.08);margin-bottom:1.25rem;overflow:hidden;}
    .vo-card-top{padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(212,175,55,.08);flex-wrap:wrap;gap:1rem;}
    .vo-badge{font-size:11px;padding:4px 12px;border-radius:999px;font-weight:600;}
    .vo-section{padding:1.25rem 1.5rem;border-bottom:1px solid rgba(212,175,55,.08);}
    .vo-section-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#D4AF37;margin-bottom:12px;font-weight:700;}
    .vo-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13.5px;}
    .vo-label{color:#999;}
    .vo-value{color:#fff;font-weight:600;}
    .vo-fee-row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;}
    .vo-input{width:100%;padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#1a1a1a;color:#fff;}
    .vo-input:focus{border-color:#D4AF37;}
    .vo-select{width:100%;padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#1a1a1a;color:#fff;}
    .vo-submit{padding:10px 24px;background:#D4AF37;color:#0B0B0B;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;}
    .vo-submit:hover{background:#e8c84a;}
    .prod-box{display:flex;gap:16px;align-items:center;}
    .prod-img{width:80px;height:80px;border-radius:12px;object-fit:cover;border:1px solid rgba(212,175,55,.15);flex-shrink:0;background:#222;}
    .prod-img-placeholder{width:80px;height:80px;border-radius:12px;border:1px solid rgba(212,175,55,.1);flex-shrink:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;}
    .prod-name{font-size:15px;font-weight:700;color:#fff;margin-bottom:6px;line-height:1.3;}
    .prod-detail{font-size:12px;color:#888;margin-bottom:3px;}
    .prod-price{font-size:14px;color:#D4AF37;font-weight:700;margin-top:6px;}
    .no-orders{background:#151515;border-radius:16px;padding:3rem;text-align:center;border:1px solid rgba(212,175,55,.08);}
  `

  return (
    <>
      <style>{css}</style>
      <div className="vo-root">
        <div className="vo-inner">

          <div className="vo-header">
            <p style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:"#D4AF37",marginBottom:4}}>Vendedor</p>
            <h1 style={{fontSize:"1.5rem",fontWeight:700,color:"#fff",margin:0}}>Mis Ordenes</h1>
            <p style={{color:"#888",fontSize:13,marginTop:6}}>{enriched.length} orden{enriched.length !== 1 ? "es" : ""} en total</p>
          </div>

          <OrderSearch />

          {enriched.length === 0 ? (
            <div className="no-orders">
              <p style={{color:"#888",fontSize:14}}>No tienes ordenes aun.</p>
            </div>
          ) : (
            enriched.map((order: any) => {
              const total = Number(order.total_price ?? 0)
              const { dsmFee, mpTotal, neto } = calcComisiones(total)
              const product = order.products

              const statusColor = ["delivered","released"].includes(order.status)
                ? { bg: "rgba(29,158,117,.1)", color: "#1D9E75" }
                : order.status === "paid"
                  ? { bg: "rgba(212,175,55,.1)", color: "#D4AF37" }
                  : order.status === "shipped"
                    ? { bg: "rgba(167,139,250,.1)", color: "#a78bfa" }
                    : { bg: "rgba(0,0,0,.06)", color: "#888" }
              const statusText = ({ released:"Pago liberado", delivered:"Entregado", shipped:"Enviado", paid:"Pago recibido" } as Record<string,string>)[order.status] ?? "Pendiente"

              return (
                <div key={order.id} className="vo-card">
                  <div className="vo-card-top">
                    <div>
                      <p style={{fontSize:12,color:"#888",marginBottom:4}}>Orden #{order.id?.slice(0,8).toUpperCase()}</p>
                      <p style={{fontSize:"1.25rem",fontWeight:700,color:"#fff",margin:"0 0 4px"}}>${total.toLocaleString("es-CO")}</p>
                      <p style={{fontSize:12,color:"#888"}}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                    </div>
                    <span className="vo-badge" style={{background:statusColor.bg,color:statusColor.color}}>{statusText}</span>
                  </div>

                  {/* PRODUCTO */}
                  <div className="vo-section">
                    <p className="vo-section-title">Producto comprado</p>
                    <div className="prod-box">
                      {order.mainImage ? (
                        <img src={order.mainImage} alt={product?.name} className="prod-img" />
                      ) : (
                        <div className="prod-img-placeholder">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                        </div>
                      )}
                      <div>
                        <div className="prod-name">{product?.name || "Producto no disponible"}</div>
                        <div className="prod-detail">Categoria: {product?.category || "—"}</div>
                        <div className="prod-detail">Cantidad: {order.quantity ?? 1}</div>
                        {order.buyer_notes && <div className="prod-detail">Nota del comprador: {order.buyer_notes}</div>}
                        <div className="prod-price">${total.toLocaleString("es-CO")}</div>
                      </div>
                    </div>
                  </div>

                  {/* DATOS ENVIO */}
                  <div className="vo-section">
                    <p className="vo-section-title">Datos de envio del comprador</p>
                    <div className="vo-grid2">
                      {order.buyer_name && <div><span className="vo-label">Nombre: </span><span className="vo-value">{order.buyer_name}</span></div>}
                      {order.buyer_phone && <div><span className="vo-label">Telefono: </span><span className="vo-value">{order.buyer_phone}</span></div>}
                      {order.buyer_address && <div style={{gridColumn:"1/-1"}}><span className="vo-label">Direccion: </span><span className="vo-value">{order.buyer_address}</span></div>}
                      {order.buyer_city && <div><span className="vo-label">Ciudad: </span><span className="vo-value">{order.buyer_city}</span></div>}
                      {order.buyer_department && <div><span className="vo-label">Departamento: </span><span className="vo-value">{order.buyer_department}</span></div>}
                      {order.buyer_transportadora && <div style={{gridColumn:"1/-1"}}><span className="vo-label">Transportadora: </span><span className="vo-value">{order.buyer_transportadora}</span></div>}
                      {!order.buyer_name && !order.buyer_address && <div style={{gridColumn:"1/-1",color:"#888",fontSize:13,fontStyle:"italic"}}>Sin datos de envio registrados</div>}
                    </div>
                  </div>

                  {/* COMISIONES */}
                  <div className="vo-section">
                    <p className="vo-section-title">Desglose de comisiones</p>
                    <div className="vo-fee-row"><span style={{color:"#ccc"}}>Valor del producto</span><span style={{fontWeight:600,color:"#fff"}}>${total.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row"><span style={{color:"#ef4444"}}>Comision DSM (5%)</span><span style={{color:"#ef4444"}}>- ${dsmFee.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row"><span style={{color:"#ef4444"}}>Comision MP (3.29% + IVA + $952)</span><span style={{color:"#ef4444"}}>- ${mpTotal.toLocaleString("es-CO")}</span></div>
                    <div className="vo-fee-row" style={{borderTop:"1px solid rgba(212,175,55,.1)",marginTop:6,paddingTop:8}}>
                      <span style={{fontWeight:700,color:"#fff"}}>Lo que recibes</span>
                      <span style={{fontWeight:700,color:"#1D9E75",fontSize:16}}>${neto.toLocaleString("es-CO")}</span>
                    </div>
                  </div>

                  {/* GUIA ACTUAL */}
                  {order.tracking_number && (
                    <div className="vo-section">
                      <p style={{fontSize:13,color:"#ccc"}}>Transportadora: <strong style={{color:"#fff"}}>{order.shipping_company}</strong></p>
                      <p style={{fontSize:13,color:"#ccc"}}>Guia: <strong style={{color:"#fff"}}>{order.tracking_number}</strong></p>
                    </div>
                  )}

                  {/* SUBIR GUIA */}
                  {(order.status === "paid" || order.status === "shipped") && (
                    <div className="vo-section">
                      <p style={{fontSize:11,color:"#888",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>
                        {order.tracking_number ? "Editar guia de envio" : "Subir guia de envio"}
                      </p>
                      <form action={async (formData: FormData) => { "use server"; await uploadGuide(formData) }}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"end"}}>
                          <div>
                            <label style={{fontSize:11,color:"#888",display:"block",marginBottom:6}}>Transportadora</label>
                            <select name="shippingCompany" required className="vo-select">
                              <option value="">Seleccionar...</option>
                              {["Servientrega","Coordinadora","Envia","Inter Rapidisimo","TCC","Deprisa","Otra"].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{fontSize:11,color:"#888",display:"block",marginBottom:6}}>Numero de guia</label>
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




