'use client'

import { useTheme } from "@/lib/theme-context"
import Link from "next/link"
import ReporteIA from "@/components/ReporteIA"
import AlertasVendedor from "@/components/AlertasVendedor"

const THEMES = {
  dark:  { bg: '#0f0f0f', card: '#151515', card2: '#1a1a1a', text: '#ffffff', text2: '#cccccc', text3: '#888888', text4: '#aaaaaa', border: 'rgba(255,255,255,0.06)', borderSubtle: 'rgba(255,255,255,0.04)', gold: '#D4AF37', goldBg: 'rgba(212,175,55,0.12)', goldBorder: 'rgba(212,175,55,0.25)' },
  light: { bg: '#f5f5f5', card: '#ffffff', card2: '#e8e8e8', text: '#111111', text2: '#333333', text3: '#666666', text4: '#999999', border: 'rgba(0,0,0,0.1)', borderSubtle: 'rgba(0,0,0,0.06)', gold: '#B8960C', goldBg: 'rgba(184,150,12,0.1)', goldBorder: 'rgba(184,150,12,0.3)' },
}

interface Product { id: string; name: string; category: string; price: number; status: string }
interface Order { id: string; status: string; tracking_number?: string; seller_earnings: number; created_at: string }
interface Payout { id: string; amount: number; status: string }
interface Image { product_id: string; url: string }

interface Props {
  name: string
  profile: { seller_status: string; documento_url?: string; politicas_aceptadas?: boolean } | null
  products: Product[]
  orders: Order[]
  payouts: Payout[]
  images: Image[]
}

export default function VendorDashboardClient({ name, profile, products, orders, payouts, images }: Props) {
  const { theme } = useTheme()
  const t = THEMES[theme]

  const approved = products.filter(p => p.status === "approved").length
  const pending  = products.filter(p => p.status === "pending").length
  const rejected = products.filter(p => p.status === "rejected").length
  const isApproved = profile?.seller_status === "approved"
  const tieneDocumento = !!profile?.documento_url
  const totalVentas = orders.filter(o => o.status !== "cancelled").reduce((acc, o) => acc + Number(o.seller_earnings), 0)
  const ordenesPendientes = orders.filter(o => o.status === "paid" || o.status === "processing").length
  const saldoPendiente = payouts.filter(p => p.status === "held").reduce((acc, p) => acc + Number(p.amount), 0)
  const totalOrdenes = orders.length
  const ordenesNecesitanGuia = orders.filter(o => o.status === "paid" && !o.tracking_number).length

  const statusLabel: Record<string, string> = {
    pending_payment: "Pago pendiente", paid: "Pagado", processing: "Procesando",
    shipped: "Enviado", delivered: "Entregado", held: "Retenido",
    released: "Liberado", cancelled: "Cancelado",
  }

  const badgeStyle = (status: string) => {
    if (["delivered","released"].includes(status)) return { background: "rgba(29,158,117,.12)", color: "#1D9E75" }
    if (status === "paid") return { background: t.goldBg, color: t.gold }
    if (status === "shipped") return { background: "rgba(167,139,250,.12)", color: "#a78bfa" }
    return { background: t.border, color: t.text3 }
  }

  const productBadge = (status: string) => {
    if (status === "approved") return { background: "rgba(29,158,117,.1)", color: "#1D9E75" }
    if (status === "rejected") return { background: "rgba(220,38,38,.1)", color: "#ef4444" }
    return { background: t.goldBg, color: t.gold }
  }

  return (
    <div style={{ background: t.bg, minHeight: "100vh", fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem" }}>

        {/* HEADER */}
        <div style={{ background: t.card, border: `1px solid ${t.goldBorder}`, borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.gold, marginBottom: 4 }}>Panel de vendedor</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: t.text, margin: 0 }}>{name}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard/vendor/datos-bancarios" style={{ background: "transparent", color: t.gold, padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${t.goldBorder}` }}>
              Datos de pago
            </Link>
            <Link href="/dashboard/vendor/ordenes" style={{ background: t.card2, color: t.text2, padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${t.border}`, position: "relative" }}>
              Mis ordenes
              {ordenesNecesitanGuia > 0 && (
                <span style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{ordenesNecesitanGuia}</span>
              )}
            </Link>
            {isApproved && (
              <Link href="/dashboard/vendor/products/new" style={{ background: t.gold, color: "#0B0B0B", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                + Nuevo producto
              </Link>
            )}
          </div>
        </div>

        {/* BANNER DOCUMENTO */}
        {!tieneDocumento && (
          <div style={{ background: theme === "dark" ? "#1a0a0a" : "#fff5f5", border: "1px solid rgba(239,68,68,0.4)", borderLeft: "4px solid #ef4444", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: 15, color: "#ef4444", fontWeight: 700, marginBottom: 4 }}>Documento de identidad requerido</p>
                <p style={{ fontSize: 13, color: t.text3, marginBottom: 10 }}>Sube tu documento para que el administrador pueda aprobar tu cuenta y puedas publicar productos.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>1. Subir documento</span>
                  <span style={{ fontSize: 11, background: t.goldBg, color: t.gold, padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>2. Revision admin</span>
                  <span style={{ fontSize: 11, background: "rgba(29,158,117,0.1)", color: "#1D9E75", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>3. Publicar productos</span>
                </div>
              </div>
              <Link href="/dashboard/vendor/verificacion" style={{ background: "#ef4444", color: "#fff", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                Subir documento
              </Link>
            </div>
          </div>
        )}

        {/* ALERTA GUIA */}
        {ordenesNecesitanGuia > 0 && (
          <div style={{ background: t.card, border: "1px solid rgba(220,38,38,.3)", borderLeft: "3px solid #dc2626", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600, marginBottom: 4 }}>Tienes {ordenesNecesitanGuia} orden(es) que necesitan guia de envio</p>
              <p style={{ fontSize: 13, color: t.text3 }}>Sin guia no se libera tu pago. Subela dentro de 48 horas.</p>
            </div>
            <Link href="/dashboard/vendor/ordenes" style={{ background: t.gold, color: "#0B0B0B", padding: "10px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Subir guia</Link>
          </div>
        )}

        {/* ALERTA PENDIENTE */}
        {tieneDocumento && !isApproved && (
          <div style={{ background: t.card, border: `1px solid ${t.goldBorder}`, borderLeft: `3px solid ${t.gold}`, borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: 14, color: t.gold, fontWeight: 600, marginBottom: 4 }}>Documento recibido - Cuenta pendiente de aprobacion</p>
            <p style={{ fontSize: 13, color: t.text3 }}>El admin esta revisando tu documento. Te notificaremos cuando tu cuenta este aprobada.</p>
          </div>
        )}

        {/* METRICAS VENTAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: "1.25rem" }}>
          {[
            { label: "Total ventas",     value: "$" + totalVentas.toLocaleString("es-CO"),    color: "#1D9E75" },
            { label: "Ordenes",          value: totalOrdenes,                                   color: t.gold },
            { label: "Pendientes envio", value: ordenesPendientes,                             color: "#f59e0b" },
            { label: "Saldo retenido",   value: "$" + saldoPendiente.toLocaleString("es-CO"), color: "#a78bfa" },
          ].map(item => (
            <div key={item.label} style={{ background: t.card, borderRadius: 14, padding: "1.25rem", border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: t.text3, marginBottom: 8 }}>{item.label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* METRICAS PRODUCTOS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: "1.25rem" }}>
          {[
            { label: "Aprobados",  value: approved, color: "#1D9E75" },
            { label: "Pendientes", value: pending,  color: t.gold },
            { label: "Rechazados", value: rejected, color: "#ef4444" },
          ].map(item => (
            <div key={item.label} style={{ background: t.card, borderRadius: 14, padding: "1.25rem", border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: t.text3, marginBottom: 8 }}>{item.label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* ORDENES RECIENTES */}
        {orders.length > 0 && (
          <div style={{ background: t.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: "1.25rem" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.text3 }}>Ordenes recientes</span>
              <Link href="/dashboard/vendor/ordenes" style={{ fontSize: 13, color: t.gold, textDecoration: "none" }}>Ver todas</Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Orden","Estado","Guia","Tu ganancia","Fecha"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: t.text3, borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0,5).map((order) => (
                    <tr key={order.id}>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderSubtle}`, color: t.text2, fontFamily: "monospace", fontSize: 12 }}>{order.id.slice(0,8)}...</td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderSubtle}` }}>
                        <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, fontWeight: 600, ...badgeStyle(order.status) }}>{statusLabel[order.status] ?? order.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderSubtle}` }}>
                        {order.status === "paid" && !order.tracking_number
                          ? <Link href="/dashboard/vendor/ordenes" style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: "rgba(220,38,38,.1)", color: "#ef4444", textDecoration: "none", border: "1px solid rgba(220,38,38,.2)" }}>Subir guia</Link>
                          : order.tracking_number
                            ? <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, fontWeight: 600, background: "rgba(29,158,117,.1)", color: "#1D9E75" }}>Subida</span>
                            : <span style={{ fontSize: 12, color: t.text3 }}>-</span>
                        }
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderSubtle}`, color: "#1D9E75", fontWeight: 600, whiteSpace: "nowrap" }}>${Number(order.seller_earnings).toLocaleString("es-CO")}</td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${t.borderSubtle}`, color: t.text3, whiteSpace: "nowrap" }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTOS */}
        <div style={{ background: t.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${t.border}`, marginBottom: "1.25rem" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.text3 }}>Mis productos</span>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: t.text4, fontSize: 14 }}>No tienes productos aun.</p>
              {isApproved && <Link href="/dashboard/vendor/products/new" style={{ display: "inline-block", marginTop: 12, color: t.gold, fontSize: 14, textDecoration: "none" }}>Publica tu primer producto</Link>}
            </div>
          ) : (
            <div>
              {products.map((product) => {
                const firstImage = images.find(img => img.product_id === product.id)?.url
                const pb = productBadge(product.status)
                return (
                  <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.5rem", borderBottom: `1px solid ${t.borderSubtle}` }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, background: t.card2, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
                      {firstImage
                        ? <img src={firstImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, color: t.text3 }}>Sin foto</span></div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: t.text, marginBottom: 3 }}>{product.name}</p>
                      <p style={{ fontSize: 11, color: t.text4 }}>{product.category}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: t.text, whiteSpace: "nowrap" }}>${Number(product.price).toLocaleString("es-CO")}</p>
                      <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, fontWeight: 600, ...pb }}>
                        {product.status === "approved" ? "Aprobado" : product.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={"/dashboard/vendor/products/" + product.id + "/edit"} style={{ fontSize: 12, padding: "4px 12px", border: `1px solid ${t.border}`, color: t.text2, textDecoration: "none", fontWeight: 600, borderRadius: 8 }}>Editar</Link>
                        <Link href={"/dashboard/vendor/products/" + product.id + "/delete"} style={{ fontSize: 12, padding: "4px 12px", border: "1px solid rgba(220,38,38,.2)", color: "#ef4444", textDecoration: "none", fontWeight: 600, borderRadius: 8 }}>Eliminar</Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <AlertasVendedor />
        <ReporteIA type="vendor" />
      </div>
    </div>
  )
}
