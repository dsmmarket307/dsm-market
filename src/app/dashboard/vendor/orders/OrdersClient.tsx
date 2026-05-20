'use client'

import { useState } from 'react'
import { uploadGuide } from '@/lib/actions/orders'

function calcComisiones(total: number) {
  const dsmFee = Math.round(total * 0.05)
  const mpBase = Math.round(total * 0.0329)
  const mpIva = Math.round(mpBase * 0.19)
  const mpFijo = 952
  const mpTotal = mpBase + mpIva + mpFijo
  const neto = total - dsmFee - mpTotal
  return { dsmFee, mpTotal, neto }
}

const statusMap: Record<string, string> = {
  released: 'Pago liberado',
  delivered: 'Entregado',
  shipped: 'Enviado',
  paid: 'Pago recibido',
}

const statusColor: Record<string, { bg: string; color: string }> = {
  released: { bg: 'rgba(29,158,117,.1)', color: '#1D9E75' },
  delivered: { bg: 'rgba(29,158,117,.1)', color: '#1D9E75' },
  shipped: { bg: 'rgba(167,139,250,.1)', color: '#a78bfa' },
  paid: { bg: 'rgba(212,175,55,.1)', color: '#D4AF37' },
}

export default function OrdersClient({ orders }: { orders: any[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const filtradas = orders.filter(order => {
    const q = busqueda.toLowerCase()
    const matchBusqueda = !busqueda ||
      order.id?.toLowerCase().includes(q) ||
      order.buyer_name?.toLowerCase().includes(q) ||
      order.buyer_city?.toLowerCase().includes(q) ||
      order.tracking_number?.toLowerCase().includes(q)
    const matchEstado = filtroEstado === 'todos' || order.status === filtroEstado
    return matchBusqueda && matchEstado
  })

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .vo-root{background:#0f0f0f;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .vo-inner{max-width:1000px;margin:0 auto;}
    .vo-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .vo-card{background:#151515;border-radius:16px;border:1px solid rgba(212,175,55,.08);box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:1.25rem;overflow:hidden;}
    .vo-card-top{padding:1.25rem 1.5rem;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(212,175,55,.08);flex-wrap:wrap;gap:1rem;}
    .vo-badge{font-size:11px;padding:4px 12px;border-radius:999px;font-weight:600;font-family:'Poppins',sans-serif;}
    .vo-section{padding:1.25rem 1.5rem;border-bottom:1px solid rgba(212,175,55,.08);}
    .vo-section-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#D4AF37;margin-bottom:12px;font-weight:700;font-family:'Poppins',sans-serif;}
    .vo-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13.5px;}
    .vo-label{color:#999999;font-family:'Poppins',sans-serif;}
    .vo-value{color:#ffffff;font-weight:600;font-family:'Poppins',sans-serif;}
    .vo-fee-row{display:flex;justify-content:space-between;font-size:13px;padding:4px 0;font-family:'Poppins',sans-serif;}
    .vo-input{width:100%;padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#151515;color:#ffffff;}
    .vo-input:focus{border-color:#D4AF37;}
    .vo-select{width:100%;padding:10px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:13.5px;outline:none;font-family:'Poppins',sans-serif;background:#151515;color:#ffffff;}
    .vo-submit{padding:10px 24px;background:#D4AF37;color:#0B0B0B;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;transition:background .2s;white-space:nowrap;}
    .vo-submit:hover{background:#e8c84a;}
  `

  return (
    <>
      <style>{css}</style>
      <div className="vo-root">
        <div className="vo-inner">

          <div className="vo-header">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Vendedor</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem', fontFamily: "'Poppins',sans-serif" }}>Mis Ordenes</h1>

            {/* BUSCADOR Y FILTROS */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por cliente, ciudad, guia..."
                className="vo-input"
                style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}
              />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="vo-select"
                style={{ maxWidth: '200px' }}>
                <option value="todos">Todos los estados</option>
                <option value="paid">Pago recibido</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="released">Pago liberado</option>
              </select>
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: '0.75rem', fontFamily: "'Poppins',sans-serif" }}>
              {filtradas.length} de {orders.length} ordenes
            </p>
          </div>

          {filtradas.length === 0 ? (
            <div style={{ background: '#151515', borderRadius: 16, padding: '3rem', textAlign: 'center', border: '1px solid rgba(212,175,55,.08)' }}>
              <p style={{ color: '#888', fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>No se encontraron ordenes.</p>
            </div>
          ) : (
            filtradas.map((order: any) => {
              const total = Number(order.total_price ?? 0)
              const { dsmFee, mpTotal, neto } = calcComisiones(total)
              const sc = statusColor[order.status] ?? { bg: 'rgba(0,0,0,.06)', color: '#888' }
              const statusText = statusMap[order.status] ?? 'Pendiente'

              return (
                <div key={order.id} className="vo-card">
                  <div className="vo-card-top">
                    <div>
                      <p style={{ fontSize: 12, color: '#888888', marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Orden #{order.id?.slice(0, 8).toUpperCase()}</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: '0 0 4px', fontFamily: "'Poppins',sans-serif" }}>${total.toLocaleString('es-CO')}</p>
                      <p style={{ fontSize: 12, color: '#888888', fontFamily: "'Poppins',sans-serif" }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                    <span className="vo-badge" style={{ background: sc.bg, color: sc.color }}>{statusText}</span>
                  </div>

                  <div className="vo-section">
                    <p className="vo-section-title">Datos de envio del comprador</p>
                    <div className="vo-grid2">
                      {order.buyer_name && <div><span className="vo-label">Nombre: </span><span className="vo-value">{order.buyer_name}</span></div>}
                      {order.buyer_phone && <div><span className="vo-label">Telefono: </span><span className="vo-value">{order.buyer_phone}</span></div>}
                      {order.buyer_address && <div style={{ gridColumn: '1/-1' }}><span className="vo-label">Direccion: </span><span className="vo-value">{order.buyer_address}</span></div>}
                      {order.buyer_city && <div><span className="vo-label">Ciudad: </span><span className="vo-value">{order.buyer_city}</span></div>}
                      {order.buyer_department && <div><span className="vo-label">Departamento: </span><span className="vo-value">{order.buyer_department}</span></div>}
                      {order.buyer_transportadora && <div style={{ gridColumn: '1/-1' }}><span className="vo-label">Transportadora: </span><span className="vo-value">{order.buyer_transportadora}</span></div>}
                      {order.buyer_notes && <div style={{ gridColumn: '1/-1' }}><span className="vo-label">Notas: </span><span className="vo-value">{order.buyer_notes}</span></div>}
                      {!order.buyer_name && !order.buyer_address && <div style={{ gridColumn: '1/-1', color: '#888888', fontSize: 13, fontStyle: 'italic' }}>Sin datos de envio registrados</div>}
                    </div>
                  </div>

                  <div className="vo-section" style={{ background: '#0f0f0f' }}>
                    <p className="vo-section-title" style={{ color: '#888' }}>Desglose de comisiones</p>
                    <div className="vo-fee-row"><span style={{ color: '#cccccc' }}>Valor del producto</span><span style={{ fontWeight: 600, color: '#ffffff' }}>${total.toLocaleString('es-CO')}</span></div>
                    <div className="vo-fee-row"><span style={{ color: '#ef4444' }}>Comision DSM (5%)</span><span style={{ color: '#ef4444' }}>- ${dsmFee.toLocaleString('es-CO')}</span></div>
                    <div className="vo-fee-row"><span style={{ color: '#ef4444' }}>Comision MP (3.29% + IVA + $952)</span><span style={{ color: '#ef4444' }}>- ${mpTotal.toLocaleString('es-CO')}</span></div>
                    <div className="vo-fee-row" style={{ borderTop: '1px solid rgba(212,175,55,.1)', marginTop: 6, paddingTop: 8 }}>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>Lo que recibes</span>
                      <span style={{ fontWeight: 700, color: '#1D9E75', fontSize: 16 }}>${neto.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="vo-section">
                      <p style={{ fontSize: 13, color: '#cccccc', fontFamily: "'Poppins',sans-serif" }}>Transportadora: <strong style={{ color: '#ffffff' }}>{order.shipping_company}</strong></p>
                      <p style={{ fontSize: 13, color: '#cccccc', fontFamily: "'Poppins',sans-serif" }}>Guia: <strong style={{ color: '#ffffff' }}>{order.tracking_number}</strong></p>
                    </div>
                  )}

                  {(order.status === 'paid' || order.status === 'shipped') && (
                    <div className="vo-section">
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Poppins',sans-serif" }}>
                        {order.tracking_number ? 'Editar guia de envio' : 'Subir guia de envio'}
                      </p>
                      <form action={async (formData: FormData) => { 'use server'; await uploadGuide(formData) }}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                          <div>
                            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>Transportadora</label>
                            <select name="shippingCompany" required className="vo-select">
                              <option value="">Seleccionar...</option>
                              {['Servientrega', 'Coordinadora', 'Envia', 'Inter Rapidisimo', 'TCC', 'Deprisa', 'Otra'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>Numero de guia</label>
                            <input name="trackingNumber" required defaultValue={order.tracking_number ?? ''} placeholder="Ej: 1234567890" className="vo-input" />
                          </div>
                          <button type="submit" className="vo-submit">{order.tracking_number ? 'Actualizar' : 'Subir guia'}</button>
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