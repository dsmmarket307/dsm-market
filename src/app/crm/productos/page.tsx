'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CRMProductos() {
  const supabase = createClient()
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, category, status, es_dropi, codigo_dropi, stock, original_price')
      .order('created_at', { ascending: false })
    setProductos(data ?? [])
    setLoading(false)
  }

  const filtered = productos.filter(p => {
    const q = busqueda.toLowerCase()
    return !busqueda || p.name?.toLowerCase().includes(q) || p.codigo_dropi?.toLowerCase().includes(q)
  })

  function abrir(p: any) {
    setEditando({
      ...p,
      precio_proveedor: p.precio_proveedor ?? '',
      flete: p.flete ?? '',
      precio_venta_final: p.price ?? '',
    })
    setShowModal(true)
  }

  // Cálculos
  function calcular(proveedor: number, flete: number) {
    const costoTotal = proveedor + flete
    const precioMinimo = costoTotal > 0 ? Math.ceil(costoTotal / 0.65) : 0
    return { costoTotal, precioMinimo }
  }

  function ganancia(precioVenta: number, proveedor: number, flete: number) {
    const costoTotal = proveedor + flete
    const g = precioVenta - costoTotal
    const pct = precioVenta > 0 ? ((g / precioVenta) * 100).toFixed(1) : '0'
    return { ganancia: g, porcentaje: pct }
  }

  const prov = parseFloat(editando?.precio_proveedor) || 0
  const flete = parseFloat(editando?.flete) || 0
  const venta = parseFloat(editando?.precio_venta_final) || 0
  const { costoTotal, precioMinimo } = calcular(prov, flete)
  const { ganancia: gan, porcentaje } = ganancia(venta, prov, flete)
  const precioOk = venta >= precioMinimo || venta === 0

  async function guardar() {
    if (!editando) return
    if (!precioOk) return
    setGuardando(true)
    await supabase.from('products').update({
      es_dropi: editando.es_dropi,
      codigo_dropi: editando.codigo_dropi,
      price: venta || editando.price,
      envio_gratis: editando.es_dropi ? true : editando.envio_gratis,
    }).eq('id', editando.id)
    setShowModal(false)
    cargar()
    setGuardando(false)
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '0.85rem', color: '#111', outline: 'none',
    background: '#fafafa', boxSizing: 'border-box',
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>Gestión</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', margin: '0.25rem 0 0' }}>Productos Dropi</h1>
      </div>

      {/* BUSCADOR */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código Dropi..."
          style={{ ...input, maxWidth: '400px' }} />
      </div>

      {/* TABLA */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Cargando...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {['Producto', 'Categoría', 'Precio venta', 'Stock', 'Dropi', 'Código Dropi', 'Acción'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#111', maxWidth: '200px' }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#555' }}>{p.category}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>${Number(p.price).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#555' }}>{p.stock ?? '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {p.es_dropi ? (
                        <span style={{ background: '#10B98120', color: '#10B981', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>Sí</span>
                      ) : (
                        <span style={{ background: '#f0f0f0', color: '#aaa', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>No</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {p.codigo_dropi ? (
                        <span style={{ background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>{p.codigo_dropi}</span>
                      ) : (
                        <span style={{ color: '#ccc', fontSize: '0.8rem' }}>Sin código</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => abrir(p)} style={{ background: '#111', color: '#fff', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Configurar producto Dropi</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1.25rem', fontWeight: 600, background: '#fafafa', padding: '0.75rem', borderRadius: '8px' }}>{editando.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* ES DROPI */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="es_dropi" checked={editando.es_dropi ?? false}
                  onChange={e => setEditando((prev: any) => ({ ...prev, es_dropi: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#C9A84C', cursor: 'pointer' }} />
                <label htmlFor="es_dropi" style={{ fontSize: '0.875rem', color: '#111', cursor: 'pointer', fontWeight: 600 }}>
                  Es producto de Dropi
                </label>
              </div>

              {editando.es_dropi && (
                <>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Código Dropi</label>
                    <input value={editando.codigo_dropi ?? ''} onChange={e => setEditando((prev: any) => ({ ...prev, codigo_dropi: e.target.value }))}
                      placeholder="Código del producto en Dropi" style={input} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Precio proveedor</label>
                      <input type="number" value={editando.precio_proveedor} onChange={e => setEditando((prev: any) => ({ ...prev, precio_proveedor: e.target.value }))}
                        placeholder="0" style={input} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Flete estimado</label>
                      <input type="number" value={editando.flete} onChange={e => setEditando((prev: any) => ({ ...prev, flete: e.target.value }))}
                        placeholder="0" style={input} />
                    </div>
                  </div>

                  {/* CALCULADORA */}
                  {costoTotal > 0 && (
                    <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '1rem' }}>
                      <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.75rem', fontWeight: 600 }}>Calculadora de precio</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>Costo total</p>
                          <p style={{ margin: 0, fontWeight: 700, color: '#111' }}>${costoTotal.toLocaleString('es-CO')}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>Precio mínimo (35%)</p>
                          <p style={{ margin: 0, fontWeight: 700, color: '#C9A84C' }}>${precioMinimo.toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                      {venta > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #eee' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>Ganancia DMS</p>
                            <p style={{ margin: 0, fontWeight: 700, color: gan >= 0 ? '#10B981' : '#EF4444' }}>${gan.toLocaleString('es-CO')}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>% sobre venta</p>
                            <p style={{ margin: 0, fontWeight: 700, color: parseFloat(porcentaje) >= 35 ? '#10B981' : '#EF4444' }}>{porcentaje}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>
                      Precio de venta final
                      {precioMinimo > 0 && <span style={{ color: '#C9A84C', marginLeft: '0.5rem' }}>mín. ${precioMinimo.toLocaleString('es-CO')}</span>}
                    </label>
                    <input type="number" value={editando.precio_venta_final} onChange={e => setEditando((prev: any) => ({ ...prev, precio_venta_final: e.target.value }))}
                      placeholder={precioMinimo > 0 ? precioMinimo.toString() : '0'}
                      style={{ ...input, borderColor: !precioOk && venta > 0 ? '#EF4444' : '#e5e5e5' }} />
                    {!precioOk && venta > 0 && (
                      <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.25rem 0 0' }}>
                        El precio debe ser mínimo ${precioMinimo.toLocaleString('es-CO')} para garantizar 35% de ganancia
                      </p>
                    )}
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#166534' }}>
                    ✓ Este producto se publicará con <strong>envío gratis</strong> en el marketplace
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando || (!precioOk && venta > 0)} style={{ flex: 2, padding: '0.75rem', background: guardando || (!precioOk && venta > 0) ? '#e5e5e5' : '#C9A84C', color: guardando || (!precioOk && venta > 0) ? '#999' : '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}