'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const estados = ['todos', 'pendiente', 'enviado', 'entregado', 'cancelado']

const estadoColor: Record<string, string> = {
  pendiente: '#F59E0B',
  enviado: '#3B82F6',
  entregado: '#10B981',
  cancelado: '#EF4444',
}

export default function CRMPedidos() {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pedidoActivo, setPedidoActivo] = useState<any>(null)
  const [guia, setGuia] = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showNuevo, setShowNuevo] = useState(false)
  const [nuevo, setNuevo] = useState({
    cliente_nombre: '', cliente_email: '', cliente_telefono: '',
    cliente_direccion: '', cliente_ciudad: '', producto_nombre: '',
    codigo_dropi: '', precio_proveedor: '', precio_venta: '',
  })

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('crm_pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    setPedidos(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let result = pedidos
    if (estadoFiltro !== 'todos') result = result.filter(p => p.estado === estadoFiltro)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(p =>
        p.cliente_nombre?.toLowerCase().includes(q) ||
        p.codigo?.toLowerCase().includes(q) ||
        p.producto_nombre?.toLowerCase().includes(q) ||
        p.codigo_dropi?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [estadoFiltro, busqueda, pedidos])

  function abrirPedido(p: any) {
    setPedidoActivo(p)
    setGuia(p.guia ?? '')
    setTransportadora(p.transportadora ?? '')
    setNotas(p.notas ?? '')
    setShowModal(true)
  }

  async function guardarPedido() {
    if (!pedidoActivo) return
    setGuardando(true)
    const updates: any = { guia, transportadora, notas }
    if (guia && pedidoActivo.estado === 'pendiente') updates.estado = 'enviado'
    await supabase.from('crm_pedidos').update(updates).eq('id', pedidoActivo.id)
    setShowModal(false)
    cargar()
    setGuardando(false)
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from('crm_pedidos').update({ estado }).eq('id', id)
    cargar()
  }

  async function crearPedido() {
    setGuardando(true)
    const codigo = 'DMS-' + Date.now().toString().slice(-6)
    await supabase.from('crm_pedidos').insert({
      codigo,
      cliente_nombre: nuevo.cliente_nombre,
      cliente_email: nuevo.cliente_email,
      cliente_telefono: nuevo.cliente_telefono,
      cliente_direccion: nuevo.cliente_direccion,
      cliente_ciudad: nuevo.cliente_ciudad,
      producto_nombre: nuevo.producto_nombre,
      codigo_dropi: nuevo.codigo_dropi,
      precio_proveedor: parseFloat(nuevo.precio_proveedor) || 0,
      precio_venta: parseFloat(nuevo.precio_venta) || 0,
      estado: 'pendiente',
    })
    setShowNuevo(false)
    setNuevo({ cliente_nombre: '', cliente_email: '', cliente_telefono: '', cliente_direccion: '', cliente_ciudad: '', producto_nombre: '', codigo_dropi: '', precio_proveedor: '', precio_venta: '' })
    cargar()
    setGuardando(false)
  }

  const input: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.85rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>Gestión</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', margin: '0.25rem 0 0' }}>Pedidos</h1>
        </div>
        <button onClick={() => setShowNuevo(true)} style={{ background: '#C9A84C', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          + Nuevo pedido
        </button>
      </div>

      {/* FILTROS */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por cliente, código, producto..."
          style={{ ...input, maxWidth: '320px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {estados.map(e => (
            <button key={e} onClick={() => setEstadoFiltro(e)}
              style={{ padding: '0.375rem 0.875rem', border: '1px solid ' + (estadoFiltro === e ? '#C9A84C' : '#eee'), background: estadoFiltro === e ? '#C9A84C' : '#fff', color: estadoFiltro === e ? '#fff' : '#555', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>No hay pedidos</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {['Código', 'Cliente', 'Producto', 'Cód. Dropi', 'P. Venta', 'Ganancia', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1rem', color: '#C9A84C', fontWeight: 700 }}>{p.codigo}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>{p.cliente_nombre}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa' }}>{p.cliente_ciudad}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#555', maxWidth: '180px' }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.producto_nombre}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>{p.codigo_dropi ?? '—'}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#111' }}>${(p.precio_venta ?? 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#10B981' }}>${(p.ganancia ?? 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)}
                        style={{ background: (estadoColor[p.estado] ?? '#aaa') + '20', color: estadoColor[p.estado] ?? '#aaa', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                        {['pendiente', 'enviado', 'entregado', 'cancelado'].map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button onClick={() => abrirPedido(p)} style={{ background: '#111', color: '#fff', border: 'none', padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                        Abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PEDIDO */}
      {showModal && pedidoActivo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Pedido {pedidoActivo.codigo}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', background: '#fafafa', padding: '1rem', borderRadius: '8px' }}>
              {[
                ['Cliente', pedidoActivo.cliente_nombre],
                ['Teléfono', pedidoActivo.cliente_telefono],
                ['Ciudad', pedidoActivo.cliente_ciudad],
                ['Dirección', pedidoActivo.cliente_direccion],
                ['Producto', pedidoActivo.producto_nombre],
                ['Código Dropi', pedidoActivo.codigo_dropi],
                ['Precio venta', '$' + (pedidoActivo.precio_venta ?? 0).toLocaleString('es-CO')],
                ['Precio proveedor', '$' + (pedidoActivo.precio_proveedor ?? 0).toLocaleString('es-CO')],
                ['Ganancia', '$' + (pedidoActivo.ganancia ?? 0).toLocaleString('es-CO')],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>{k}</p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#111', fontSize: '0.875rem' }}>{v ?? '—'}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Guía de envío</label>
                <input value={guia} onChange={e => setGuia(e.target.value)} placeholder="Número de guía" style={input} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Transportadora</label>
                <input value={transportadora} onChange={e => setTransportadora(e.target.value)} placeholder="Ej: Servientrega, Coordinadora..." style={input} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>Notas</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} placeholder="Notas internas..." style={{ ...input, resize: 'vertical', fontFamily: 'sans-serif' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
              <button onClick={guardarPedido} disabled={guardando} style={{ flex: 2, padding: '0.75rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PEDIDO */}
      {showNuevo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Nuevo pedido</h2>
              <button onClick={() => setShowNuevo(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#aaa' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { key: 'cliente_nombre', label: 'Nombre cliente', placeholder: 'Nombre completo' },
                { key: 'cliente_email', label: 'Email', placeholder: 'correo@ejemplo.com' },
                { key: 'cliente_telefono', label: 'Teléfono', placeholder: '300 000 0000' },
                { key: 'cliente_ciudad', label: 'Ciudad', placeholder: 'Ciudad de entrega' },
                { key: 'cliente_direccion', label: 'Dirección', placeholder: 'Dirección completa' },
                { key: 'producto_nombre', label: 'Producto', placeholder: 'Nombre del producto' },
                { key: 'codigo_dropi', label: 'Código Dropi', placeholder: 'Código en Dropi' },
                { key: 'precio_proveedor', label: 'Precio proveedor', placeholder: '0' },
                { key: 'precio_venta', label: 'Precio venta', placeholder: '0' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input value={(nuevo as any)[f.key]} onChange={e => setNuevo(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={input} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowNuevo(false)} style={{ flex: 1, padding: '0.75rem', background: '#fff', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
              <button onClick={crearPedido} disabled={guardando} style={{ flex: 2, padding: '0.75rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                {guardando ? 'Creando...' : 'Crear pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}