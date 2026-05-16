import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"

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
  const productIds = products?.map(p => p.id) ?? []
  const { data: images } = productIds.length > 0 ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).order("position", { ascending: true }) : { data: [] }
  const { data: orders } = await admin.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false })
  const { data: payouts } = await admin.from("payouts").select("id, amount, status").eq("seller_id", user.id)

  const approved = products?.filter(p => p.status === "approved").length ?? 0
  const pending  = products?.filter(p => p.status === "pending").length ?? 0
  const rejected = products?.filter(p => p.status === "rejected").length ?? 0
  const isApproved = profile?.seller_status === "approved"
  const totalVentas = orders?.filter(o => o.status !== "cancelled").reduce((acc, o) => acc + Number(o.seller_earnings), 0) ?? 0
  const ordenesPendientes = orders?.filter(o => o.status === "paid" || o.status === "processing").length ?? 0
  const saldoPendiente = payouts?.filter(p => p.status === "held").reduce((acc, p) => acc + Number(p.amount), 0) ?? 0
  const totalOrdenes = orders?.length ?? 0
  const ordenesNecesitanGuia = orders?.filter(o => o.status === "paid" && !o.tracking_number).length ?? 0
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]

  const statusLabel: Record<string, string> = {
    pending_payment: "Pago pendiente", paid: "Pagado", processing: "Procesando",
    shipped: "Enviado", delivered: "Entregado", held: "Retenido",
    released: "Liberado", cancelled: "Cancelado",
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .vd-root{background:#F5F5F5;min-height:100vh;font-family:'Poppins',sans-serif;}
    .vd-inner{max-width:1000px;margin:0 auto;padding:2rem;}
    .vd-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;border:1px solid rgba(212,175,55,.12);}
    .vd-header-title{font-size:1.5rem;font-weight:700;color:#fff;margin:0;}
    .vd-header-sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D4AF37;margin-bottom:4px;}
    .vd-btn-gold{background:#D4AF37;color:#0B0B0B;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:700;font-family:'Poppins',sans-serif;white-space:nowrap;transition:background .2s;}
    .vd-btn-gold:hover{background:#e8c84a;}
    .vd-btn-outline{background:transparent;color:#D4AF37;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;border:1px solid rgba(212,175,55,.35);white-space:nowrap;position:relative;transition:all .2s;}
    .vd-btn-outline:hover{border-color:#D4AF37;background:rgba(212,175,55,.06);}
    .vd-btn-white{background:#fff;color:#555;padding:10px 20px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;border:1px solid rgba(0,0,0,.08);white-space:nowrap;transition:all .2s;}
    .vd-btn-white:hover{border-color:#D4AF37;color:#D4AF37;}
    .vd-alert-red{background:#151515;border:1px solid rgba(220,38,38,.3);border-left:3px solid #dc2626;border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;}
    .vd-alert-yellow{background:#151515;border:1px solid rgba(212,175,55,.25);border-left:3px solid #D4AF37;border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1.25rem;}
    .vd-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:1.25rem;}
    .vd-metric{background:#fff;border-radius:14px;padding:1.25rem;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.04);}
    .vd-metric-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#888;margin-bottom:8px;font-family:'Poppins',sans-serif;}
    .vd-metric-value{font-size:1.6rem;font-weight:700;font-family:'Poppins',sans-serif;}
    .vd-card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:1.25rem;}
    .vd-card-header{padding:1rem 1.5rem;border-bottom:1px solid rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;}
    .vd-card-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;font-family:'Poppins',sans-serif;}
    .vd-table{width:100%;border-collapse:collapse;font-size:13px;}
    .vd-table th{padding:10px 16px;text-align:left;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888;border-bottom:1px solid rgba(0,0,0,.06);font-family:'Poppins',sans-serif;white-space:nowrap;}
    .vd-table td{padding:12px 16px;border-bottom:1px solid rgba(0,0,0,.04);font-family:'Poppins',sans-serif;}
    .vd-product-row{display:flex;align-items:center;gap:16px;padding:1rem 1.5rem;border-bottom:1px solid rgba(0,0,0,.04);}
    .vd-product-row:last-child{border-bottom:none;}
    .vd-badge{font-size:10px;padding:3px 10px;border-radius:999px;font-weight:600;font-family:'Poppins',sans-serif;white-space:nowrap;}
  `

  return (
    <>
      <style>{css}</style>
      <div className="vd-root">
        <div className="vd-inner">

          {/* HEADER */}
          <div className="vd-header">
            <div>
              <p className="vd-header-sub">Panel de vendedor</p>
              <h1 className="vd-header-title">{name}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/dashboard/vendor/datos-bancarios" className="vd-btn-outline">Datos de pago</Link>
              <Link href="/dashboard/vendor/ordenes" className="vd-btn-white" style={{ position: "relative" }}>
                Mis ordenes
                {ordenesNecesitanGuia > 0 && (
                  <span style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{ordenesNecesitanGuia}</span>
                )}
              </Link>
              {isApproved && <Link href="/dashboard/vendor/products/new" className="vd-btn-gold">+ Nuevo producto</Link>}
            </div>
          </div>

          {/* ALERTA GUIA */}
          {ordenesNecesitanGuia > 0 && (
            <div className="vd-alert-red">
              <div>
                <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600, marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Tienes {ordenesNecesitanGuia} orden(es) que necesitan guia de envio</p>
                <p style={{ fontSize: 13, color: "#888", fontFamily: "'Poppins',sans-serif" }}>Sin guia no se libera tu pago. Subela dentro de 48 horas.</p>
              </div>
              <Link href="/dashboard/vendor/ordenes" className="vd-btn-gold">Subir guia</Link>
            </div>
          )}

          {/* ALERTA PENDIENTE */}
          {!isApproved && (
            <div className="vd-alert-yellow">
              <p style={{ fontSize: 14, color: "#D4AF37", fontWeight: 600, marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Cuenta pendiente de aprobacion</p>
              <p style={{ fontSize: 13, color: "#888", fontFamily: "'Poppins',sans-serif" }}>El admin debe aprobar tu perfil antes de publicar productos.</p>
            </div>
          )}

          {/* METRICAS VENTAS */}
          <div className="vd-metrics">
            {[
              { label: "Total ventas",      value: "$" + totalVentas.toLocaleString("es-CO"),       color: "#1D9E75" },
              { label: "Ordenes",           value: totalOrdenes,                                     color: "#D4AF37" },
              { label: "Pendientes envio",  value: ordenesPendientes,                               color: "#f59e0b" },
              { label: "Saldo retenido",    value: "$" + saldoPendiente.toLocaleString("es-CO"),    color: "#a78bfa" },
            ].map(item => (
              <div key={item.label} className="vd-metric">
                <p className="vd-metric-label">{item.label}</p>
                <p className="vd-metric-value" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* METRICAS PRODUCTOS */}
          <div className="vd-metrics">
            {[
              { label: "Aprobados",  value: approved, color: "#1D9E75" },
              { label: "Pendientes", value: pending,  color: "#D4AF37" },
              { label: "Rechazados", value: rejected, color: "#ef4444" },
            ].map(item => (
              <div key={item.label} className="vd-metric">
                <p className="vd-metric-label">{item.label}</p>
                <p className="vd-metric-value" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* ORDENES RECIENTES */}
          {orders && orders.length > 0 && (
            <div className="vd-card">
              <div className="vd-card-header">
                <span className="vd-card-title">Ordenes recientes</span>
                <Link href="/dashboard/vendor/ordenes" style={{ fontSize: 13, color: "#D4AF37", textDecoration: "none", fontFamily: "'Poppins',sans-serif" }}>Ver todas</Link>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="vd-table">
                  <thead>
                    <tr>{["Orden","Estado","Guia","Tu ganancia","Fecha"].map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {orders.slice(0,5).map((order: any) => (
                      <tr key={order.id}>
                        <td style={{ color: "#111", fontFamily: "monospace", fontSize: 12 }}>{order.id.slice(0,8)}...</td>
                        <td>
                          <span className="vd-badge" style={{
                            background: ["delivered","released"].includes(order.status) ? "rgba(29,158,117,.12)" : order.status === "paid" ? "rgba(212,175,55,.12)" : order.status === "shipped" ? "rgba(167,139,250,.12)" : "rgba(0,0,0,.06)",
                            color: ["delivered","released"].includes(order.status) ? "#1D9E75" : order.status === "paid" ? "#D4AF37" : order.status === "shipped" ? "#a78bfa" : "#888",
                          }}>{statusLabel[order.status] ?? order.status}</span>
                        </td>
                        <td>
                          {order.status === "paid" && !order.tracking_number
                            ? <Link href="/dashboard/vendor/ordenes" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: "rgba(220,38,38,.1)", color: "#ef4444", textDecoration: "none", border: "1px solid rgba(220,38,38,.2)" }}>Subir guia</Link>
                            : order.tracking_number
                              ? <span className="vd-badge" style={{ background: "rgba(29,158,117,.1)", color: "#1D9E75" }}>Subida</span>
                              : <span style={{ fontSize: 12, color: "#ccc" }}>-</span>
                          }
                        </td>
                        <td style={{ color: "#1D9E75", fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif" }}>${Number(order.seller_earnings).toLocaleString("es-CO")}</td>
                        <td style={{ color: "#888", whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif" }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTOS */}
          <div className="vd-card">
            <div className="vd-card-header">
              <span className="vd-card-title">Mis productos</span>
            </div>
            {!products || products.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <p style={{ color: "#aaa", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>No tienes productos aun.</p>
                {isApproved && <Link href="/dashboard/vendor/products/new" style={{ display: "inline-block", marginTop: 12, color: "#D4AF37", fontSize: 14, textDecoration: "none", fontFamily: "'Poppins',sans-serif" }}>Publica tu primer producto</Link>}
              </div>
            ) : (
              <div>
                {products.map((product: any) => {
                  const firstImage = images?.find((img: any) => img.product_id === product.id)?.url
                  return (
                    <div key={product.id} className="vd-product-row">
                      <div style={{ width: 52, height: 52, flexShrink: 0, background: "#f5f5f5", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,.06)" }}>
                        {firstImage
                          ? <img src={firstImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, color: "#ccc" }}>Sin foto</span></div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 3, fontFamily: "'Poppins',sans-serif" }}>{product.name}</p>
                        <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'Poppins',sans-serif" }}>{product.category}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#111", whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif" }}>${Number(product.price).toLocaleString("es-CO")}</p>
                        <span className="vd-badge" style={{
                          background: product.status === "approved" ? "rgba(29,158,117,.1)" : product.status === "rejected" ? "rgba(220,38,38,.1)" : "rgba(212,175,55,.1)",
                          color: product.status === "approved" ? "#1D9E75" : product.status === "rejected" ? "#ef4444" : "#D4AF37",
                        }}>
                          {product.status === "approved" ? "Aprobado" : product.status === "rejected" ? "Rechazado" : "Pendiente"}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Link href={"/dashboard/vendor/products/" + product.id + "/edit"} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid rgba(0,0,0,.1)", color: "#555", textDecoration: "none", fontWeight: 600, borderRadius: 8, fontFamily: "'Poppins',sans-serif" }}>Editar</Link>
                          <Link href={"/dashboard/vendor/products/" + product.id + "/delete"} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid rgba(220,38,38,.2)", color: "#ef4444", textDecoration: "none", fontWeight: 600, borderRadius: 8, fontFamily: "'Poppins',sans-serif" }}>Eliminar</Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}