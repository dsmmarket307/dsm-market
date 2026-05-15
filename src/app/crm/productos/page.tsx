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
      .select('id, name, price, category, status, es_dropi, codigo_dropi, stock')
      .order('created_at', { ascending: false })
    setProductos(data ?? [])
    setLoading(false)
  }

  const filtered = productos.filter(p => {
    const q = busqueda.toLowerCase()
    return !busqueda || p.name?.toLowerCase().includes(q) || p.codigo_dropi?.toLowerCase().includes(q)
  })

  function abrir(p: any) {
    setEditando({ ...p })
    setShowModal(true)
  }

  async function guardar() {
    if (!editando) return
    setGuardando(true)
    await supabase.from('products').update({
      es_dropi: editando.es_dropi,
      codigo_dropi: editando.codigo_dropi,
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
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Dropi', 'Código Dropi', 'Acción'].map(h => (
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
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Editar producto Dropi</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1.25rem', fontWeight: 600 }}>{editando.name}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" id="es_dropi" checked={editando.es_dropi ?? false}
                  onChange={e => setEditando((prev: any) => ({ ...prev, es_dropi: e.target.checked }))}
                  style={{ width: '18px', height: '18px', accentColor: '#C9A84C', cursor: 'pointer' }} />
                <label htmlFor="es_dropi" style={{ fontSize: '0.875rem', color: '#111', cursor: 'pointer', fontWeight: 600 }}>
                  Es producto de Dropi
                </label>
              </div>

              {editando.es_dropi && (
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Código Dropi</label>
                  <input value={editando.codigo_dropi ?? ''} onChange={e => setEditando((prev: any) => ({ ...prev, codigo_dropi: e.target.value }))}
                    placeholder="Código del producto en Dropi" style={input} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
              <button onClick={guardar} disabled={guardando} style={{ flex: 2, padding: '0.75rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}