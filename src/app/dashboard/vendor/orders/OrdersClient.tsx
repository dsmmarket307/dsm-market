'use client'
import { useTheme } from '@/lib/theme-context'
import { useState } from 'react'

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#1a1a1a', bg3: '#151515', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', borderFaint: 'rgba(212,175,55,0.08)', gold: '#D4AF37', cardBg: '#151515', headerBg: '#0B0B0B' },
  light: { bg: '#f5f5f5', bg2: '#e8e8e8', bg3: '#ffffff',  text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.12)',        borderFaint: 'rgba(0,0,0,0.07)',        gold: '#B8960C', cardBg: '#ffffff', headerBg: '#ffffff' },
}

function calcComisiones(total: number) {
  const dsmFee = Math.round(total * 0.05)
  const mpBase = Math.round(total * 0.0329)
  const mpIva  = Math.round(mpBase * 0.19)
  const mpFijo = 952
  const mpTotal = mpBase + mpIva + mpFijo
  const neto = total - dsmFee - mpTotal
  return { dsmFee, mpTotal, neto }
}

export default function OrdersClient({ orders, uploadGuide }: { orders: any[]; uploadGuide: (formData: FormData) => Promise<any> }) {
  const { theme, toggleTheme } = useTheme()
  const T = THEMES[theme]
  const [query, setQuery] = useState('')

  const filtered = orders.filter(o => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      o.id?.toLowerCase().includes(q) ||
      o.products?.name?.toLowerCase().includes(q) ||
      o.buyer_name?.toLowerCase().includes(q) ||
      o.buyer_city?.toLowerCase().includes(q)
    )
  })

  const statusColor = (status: string) =>
    ['delivered','released'].includes(status) ? { bg: 'rgba(29,158,117,.1)', color: '#1D9E75' }
    : status === 'paid'    ? { bg: 'rgba(212,175,55,.1)', color: T.gold }
    : status === 'shipped' ? { bg: 'rgba(167,139,250,.1)', color: '#a78bfa' }
    : { bg: 'rgba(0,0,0,.06)', color: T.text2 }

  const statusText = (s: string) => ({ released:'Pago liberado', delivered:'Entregado', shipped:'Enviado', paid:'Pago recibido' } as Record<string,string>)[s] ?? 'Pendiente'

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Poppins',sans-serif", padding: '2rem', transition: 'background .3s, color .3s' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ background: T.headerBg, borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.5rem', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: T.gold, marginBottom: 4 }}>Vendedor</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, margin: 0 }}>Mis Ordenes</h1>
            <p style={{ color: T.text2, fontSize: 13, marginTop: 6 }}>{orders.length} orden{orders.length !== 1 ? 'es' : ''} en total</p>
          </div>
          <button onClick={toggleTheme} title="Cambiar tema" style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: T.text2, fontSize: 12 }}>
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.text2 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Buscar por orden, producto o comprador..." value={query} onChange={e => setQuery(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 14, fontFamily: "'Poppins',sans-serif", outline: 'none' }} />
        </div>

        {filtered.length === 0 && (
          <div style={{ background: T.cardBg, borderRadius: 16, padding: '3rem', textAlign: 'center', border: `1px solid ${T.borderFaint}` }}>
            <p style={{ color: T.text2, fontSize: 14 }}>{query ? 'Sin resultados.' : 'No tienes ordenes aun.'}</p>
          </div>
        )}

        {filtered.map((order: any) => {
          const total = Number(order.total_price ?? 0)
          const { dsmFee, mpTotal, neto } = calcComisiones(total)
          const product = order.products
          const sc = statusColor(order.status)

          return (
            <div key={order.id} style={{ background: T.cardBg, borderRadius: 16, border: `1px solid ${T.borderFaint}`, marginBottom: '1.25rem', overflow: 'hidden' }}>

              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${T.borderFaint}`, flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: 12, color: T.text2, marginBottom: 4 }}>Orden #{order.id?.slice(0,8).toUpperCase()}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: T.text, margin: '0 0 4px' }}>${total.toLocaleString('es-CO')}</p>
                  <p style={{ fontSize: 12, color: T.text2 }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                </div>
                <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 999, fontWeight: 600, background: sc.bg, color: sc.color }}>{statusText(order.status)}</span>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.borderFaint}` }}>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, marginBottom: 12, fontWeight: 700 }}>Producto comprado</p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {order.mainImage ? (
                    <img src={order.mainImage} alt={product?.name} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: `1px solid ${T.border}`, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: 12, border: `1px solid ${T.borderFaint}`, flexShrink: 0, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, lineHeight: 1.3 }}>{product?.name || 'Producto no disponible'}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginBottom: 3 }}>Categoria: {product?.category || '---'}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginBottom: 3 }}>Cantidad: {order.quantity ?? 1}</div>
                    {order.variantes?.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {order.variantes.map((v: any, i: number) => (
                          <span key={i} style={{ display: 'inline-block', background: theme === 'dark' ? '#1a1500' : '#fef9e7', border: `1px solid ${T.border}`, color: T.gold, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, marginRight: 6, marginTop: 4 }}>{v.nombre}: {v.opcion}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: T.gold, fontWeight: 700, marginTop: 6 }}>${total.toLocaleString('es-CO')}</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.borderFaint}` }}>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, marginBottom: 12, fontWeight: 700 }}>Datos de envio del comprador</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13.5 }}>
                  {order.buyer_name && <div><span style={{ color: T.text2 }}>Nombre: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_name}</span></div>}
                  {order.buyer_phone && <div><span style={{ color: T.text2 }}>Telefono: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_phone}</span></div>}
                  {order.buyer_address && <div style={{ gridColumn: '1/-1' }}><span style={{ color: T.text2 }}>Direccion: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_address}</span></div>}
                  {order.buyer_city && <div><span style={{ color: T.text2 }}>Ciudad: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_city}</span></div>}
                  {order.buyer_department && <div><span style={{ color: T.text2 }}>Departamento: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_department}</span></div>}
                  {order.buyer_transportadora && <div style={{ gridColumn: '1/-1' }}><span style={{ color: T.text2 }}>Transportadora: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_transportadora}</span></div>}
                  {order.buyer_notes && <div style={{ gridColumn: '1/-1' }}><span style={{ color: T.text2 }}>Notas: </span><span style={{ color: T.text, fontWeight: 600 }}>{order.buyer_notes}</span></div>}
                  {!order.buyer_name && !order.buyer_address && <div style={{ gridColumn: '1/-1', color: T.text2, fontSize: 13, fontStyle: 'italic' }}>Sin datos de envio registrados</div>}
                </div>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.borderFaint}` }}>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, marginBottom: 12, fontWeight: 700 }}>Desglose de comisiones</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: T.text2 }}>Valor del producto</span><span style={{ fontWeight: 600, color: T.text }}>${total.toLocaleString('es-CO')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: '#ef4444' }}>Comision DSM (5%)</span><span style={{ color: '#ef4444' }}>- ${dsmFee.toLocaleString('es-CO')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}><span style={{ color: '#ef4444' }}>Comision Mercado Pago (3.29% + IVA)</span><span style={{ color: '#ef4444' }}>- ${mpTotal.toLocaleString('es-CO')}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0 4px', borderTop: `1px solid ${T.borderFaint}`, marginTop: 6 }}>
                  <span style={{ fontWeight: 700, color: T.text }}>Lo que recibes</span>
                  <span style={{ fontWeight: 700, color: '#1D9E75', fontSize: 16 }}>${neto.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {order.tracking_number && (
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${T.borderFaint}` }}>
                  <p style={{ fontSize: 13, color: T.text2 }}>Transportadora: <strong style={{ color: T.text }}>{order.shipping_company}</strong></p>
                  <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>Guia: <strong style={{ color: T.text }}>{order.tracking_number}</strong></p>
                </div>
              )}

              {(order.status === 'paid' || order.status === 'shipped') && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <p style={{ fontSize: 11, color: T.text2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {order.tracking_number ? 'Editar guia de envio' : 'Subir guia de envio'}
                  </p>
                  <form action={uploadGuide.bind(null, order.id)}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: 11, color: T.text2, display: 'block', marginBottom: 6 }}>Transportadora</label>
                        <select name="shippingCompany" required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13.5, outline: 'none', fontFamily: "'Poppins',sans-serif", background: T.bg2, color: T.text }}>
                          <option value="">Seleccionar...</option>
                          {['Servientrega','Coordinadora','Envia','Inter Rapidisimo','TCC','Deprisa','Otra'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: T.text2, display: 'block', marginBottom: 6 }}>Numero de guia</label>
                        <input name="trackingNumber" required defaultValue={order.tracking_number ?? ''} placeholder="Ej: 1234567890" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13.5, outline: 'none', fontFamily: "'Poppins',sans-serif", background: T.bg2, color: T.text }} />
                      </div>
                      <button type="submit" style={{ padding: '10px 24px', background: T.gold, color: '#0B0B0B', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {order.tracking_number ? 'Actualizar' : 'Subir guia'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )
        })}

      </div>
    </div>
  )
}
