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

  const { data: profile } = await admin
    .from("profiles")
    .select("seller_status")
    .eq("id", user.id)
    .single()

  const { data: products } = await admin
    .from("products")
    .select("id, name, category, price, status")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const productIds = products?.map(p => p.id) ?? []

  const { data: images } = productIds.length > 0 ? await admin
    .from("product_images")
    .select("product_id, url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true }) : { data: [] }

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const { data: payouts } = await admin
    .from("payouts")
    .select("id, amount, status")
    .eq("seller_id", user.id)

  const approved = products?.filter(p => p.status === "approved").length ?? 0
  const pending = products?.filter(p => p.status === "pending").length ?? 0
  const rejected = products?.filter(p => p.status === "rejected").length ?? 0
  const isApproved = profile?.seller_status === "approved"
  const totalVentas = orders?.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + Number(o.seller_earnings), 0) ?? 0
  const ordenesPendientes = orders?.filter(o => o.status === 'paid' || o.status === 'processing').length ?? 0
  const saldoPendiente = payouts?.filter(p => p.status === 'held').reduce((acc, p) => acc + Number(p.amount), 0) ?? 0
  const totalOrdenes = orders?.length ?? 0
  const ordenesNecesitanGuia = orders?.filter(o => o.status === 'paid' && !o.tracking_number).length ?? 0

  const statusLabel: Record<string, string> = {
    pending_payment: 'Pago pendiente',
    paid: 'Pagado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    held: 'Retenido',
    released: 'Liberado',
    cancelled: 'Cancelado',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Panel de vendedor</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111' }}>
              {user.user_metadata?.name ?? user.email?.split("@")[0]}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard/vendor/datos-bancarios"
              style={{ background: '#fff', color: '#C9A84C', padding: '0.75rem 1.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid #C9A84C', whiteSpace: 'nowrap' }}>
              Datos de pago
            </Link>
            <Link href="/dashboard/vendor/ordenes"
              style={{ background: '#fff', color: '#111', padding: '0.75rem 1.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid #ddd', whiteSpace: 'nowrap', position: 'relative' }}>
              Mis ordenes
              {ordenesNecesitanGuia > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', fontSize: '0.6rem', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ordenesNecesitanGuia}
                </span>
              )}
            </Link>
            {isApproved && (
              <Link href="/dashboard/vendor/products/new"
                style={{ background: '#C9A84C', color: '#fff', padding: '0.75rem 1.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                + Nuevo producto
              </Link>
            )}
          </div>
        </div>

        {/* Alerta guia pendiente */}
        {ordenesNecesitanGuia > 0 && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#fff5f5', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600, marginBottom: '0.25rem' }}>
                Tienes {ordenesNecesitanGuia} orden(es) que necesitan guia de envio
              </p>
              <p style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Sin guia de envio no se libera tu pago. Subela dentro de 48 horas.</p>
            </div>
            <Link href="/dashboard/vendor/ordenes"
              style={{ background: '#dc2626', color: '#fff', padding: '0.625rem 1.25rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Subir guia
            </Link>
          </div>
        )}

        {/* Alerta cuenta pendiente */}
        {!isApproved && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#fffbeb', border: '1px solid #C9A84C', borderLeft: '4px solid #C9A84C' }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: 500, marginBottom: '0.25rem' }}>Cuenta pendiente de aprobacion</p>
            <p style={{ fontSize: '0.8rem', color: '#b45309' }}>El admin debe aprobar tu perfil antes de publicar productos.</p>
          </div>
        )}

        {/* Metricas ventas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total ventas', value: '$' + totalVentas.toLocaleString('es-CO'), color: '#1D9E75' },
            { label: 'Ordenes', value: totalOrdenes, color: '#C9A84C' },
            { label: 'Pendientes envio', value: ordenesPendientes, color: '#f59e0b' },
            { label: 'Saldo retenido', value: '$' + saldoPendiente.toLocaleString('es-CO'), color: '#6366f1' },
          ].map(item => (
            <div key={item.label} style={{ padding: '1.25rem', background: '#fafafa', border: '1px solid #eee', borderTop: '2px solid ' + item.color }}>
              <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '0.5rem' }}>{item.label}</p>
              <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 300, color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Metricas productos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Aprobados', value: approved, color: '#1D9E75' },
            { label: 'Pendientes', value: pending, color: '#C9A84C' },
            { label: 'Rechazados', value: rejected, color: '#dc2626' },
          ].map(item => (
            <div key={item.label} style={{ padding: '1.25rem', background: '#fafafa', border: '1px solid #eee', borderTop: '2px solid ' + item.color }}>
              <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '0.5rem' }}>{item.label}</p>
              <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Ordenes recientes */}
        {orders && orders.length > 0 && (
          <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888' }}>Ordenes recientes</p>
              <Link href="/dashboard/vendor/ordenes" style={{ fontSize: '0.75rem', color: '#C9A84C', textDecoration: 'none' }}>Ver todas</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['Orden', 'Estado', 'Guia', 'Tu ganancia', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order, i) => (
                    <tr key={order.id} style={{ borderBottom: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#111', fontFamily: 'monospace', fontSize: '0.75rem' }}>{order.id.slice(0, 8)}...</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600,
                          background: order.status === 'delivered' || order.status === 'released' ? '#e8f5e9' : order.status === 'paid' ? '#fffbeb' : order.status === 'shipped' ? '#ede9fe' : '#f0f0f0',
                          color: order.status === 'delivered' || order.status === 'released' ? '#2e7d32' : order.status === 'paid' ? '#92400e' : order.status === 'shipped' ? '#5b21b6' : '#555'
                        }}>
                          {statusLabel[order.status] ?? order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {order.status === 'paid' && !order.tracking_number ? (
                          <Link href="/dashboard/vendor/ordenes"
                            style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600, background: '#fff5f5', color: '#dc2626', textDecoration: 'none', border: '1px solid #fecaca' }}>
                            Subir guia
                          </Link>
                        ) : order.tracking_number ? (
                          <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600, background: '#e8f5e9', color: '#2e7d32' }}>Subida</span>
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#ccc' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#1D9E75', fontWeight: 600, whiteSpace: 'nowrap' }}>${Number(order.seller_earnings).toLocaleString('es-CO')}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#888', whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista productos */}
        <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #eee' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888' }}>Mis productos</p>
          </div>
          {!products || products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '0.875rem' }}>No tienes productos aun.</p>
              {isApproved && (
                <Link href="/dashboard/vendor/products/new" style={{ display: 'inline-block', marginTop: '1rem', color: '#C9A84C', fontSize: '0.875rem', textDecoration: 'none' }}>
                  Publica tu primer producto
                </Link>
              )}
            </div>
          ) : (
            <div>
              {products.map((product, i) => {
                const firstImage = images?.filter(img => img.product_id === product.id)[0]?.url
                return (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < products.length - 1 ? '1px solid #f0f0f0' : 'none', flexWrap: 'wrap' }}>
                    <div style={{ width: '48px', height: '48px', flexShrink: 0, background: '#f5f5f5', border: '1px solid #eee', overflow: 'hidden', borderRadius: '4px' }}>
                      {firstImage ? (
                        <img src={firstImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: '#ccc' }}>Sin foto</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', marginBottom: '0.2rem' }}>{product.name}</p>
                      <p style={{ fontSize: '0.7rem', color: '#aaa' }}>{product.category}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                        ${Number(product.price).toLocaleString("es-CO")}
                      </p>
                      <span style={{
                        fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 600, whiteSpace: 'nowrap',
                        background: product.status === "approved" ? '#e8f5e9' : product.status === "rejected" ? '#fff5f5' : '#fffbeb',
                        color: product.status === "approved" ? '#2e7d32' : product.status === "rejected" ? '#dc2626' : '#92400e',
                      }}>
                        {product.status === "approved" ? "Aprobado" : product.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={"/dashboard/vendor/products/" + product.id + "/edit"}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', color: '#555', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          Editar
                        </Link>
                        <Link href={"/dashboard/vendor/products/" + product.id + "/delete"}
                          style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #fecaca', color: '#dc2626', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          Eliminar
                        </Link>
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
  )
}


