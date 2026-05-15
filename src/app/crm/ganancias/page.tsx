'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CRMGanancias() {
  const supabase = createClient()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mesFiltro, setMesFiltro] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase
      .from('crm_pedidos')
      .select('*')
      .order('created_at', { ascending: false })
    setPedidos(data ?? [])
    setLoading(false)
  }

  const meses = [...new Set(pedidos.map(p => p.created_at?.slice(0, 7)))].sort().reverse()

  const filtrados = mesFiltro ? pedidos.filter(p => p.created_at?.startsWith(mesFiltro)) : pedidos

  const totalVentas = filtrados.reduce((acc, p) => acc + (p.precio_venta ?? 0), 0)
  const totalCosto = filtrados.reduce((acc, p) => acc + (p.precio_proveedor ?? 0), 0)
  const totalGanancia = filtrados.reduce((acc, p) => acc + (p.ganancia ?? 0), 0)
  const entregados = filtrados.filter(p => p.estado === 'entregado').length
  const pendientes = filtrados.filter(p => p.estado === 'pendiente').length
  const enviados = filtrados.filter(p => p.estado === 'enviado').length

  function exportarCSV() {
    const headers = ['Codigo', 'Cliente', 'Producto', 'Precio Venta', 'Precio Proveedor', 'Ganancia', 'Estado', 'Fecha']
    const rows = filtrados.map(p => [
      p.codigo, p.cliente_nombre, p.producto_nombre,
      p.precio_venta, p.precio_proveedor, p.ganancia,
      p.estado, p.created_at?.slice(0, 10)
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ganancias-dropi.csv'
    a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>Finanzas</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', margin: '0.25rem 0 0' }}>Ganancias</h1>
        </div>
        <button onClick={exportarCSV} style={{ background: '#111', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Exportar CSV
        </button>
      </div>

      {/* FILTRO MES */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setMesFiltro('')}
          style={{ padding: '0.375rem 0.875rem', border: '1px solid ' + (!mesFiltro ? '#C9A84C' : '#eee'), background: !mesFiltro ? '#C9A84C' : '#fff', color: !mesFiltro ? '#fff' : '#555', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
          Todo
        </button>
        {meses.map(m => (
          <button key={m} onClick={() => setMesFiltro(m)}
            style={{ padding: '0.375rem 0.875rem', border: '1px solid ' + (mesFiltro === m ? '#C9A84C' : '#eee'), background: mesFiltro === m ? '#C9A84C' : '#fff', color: mesFiltro === m ? '#fff' : '#555', borderRadius: '999px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
            {m}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total ventas', value: '$' + totalVentas.toLocaleString('es-CO'), color: '#111' },
          { label: 'Total costos', value: '$' + totalCosto.toLocaleString('es-CO'), color: '#EF4444' },
          { label: 'Ganancia neta', value: '$' + totalGanancia.toLocaleString('es-CO'), color: '#10B981' },
          { label: 'Pedidos totales', value: filtrados.length, color: '#111' },
          { label: 'Entregados', value: entregados, color: '#10B981' },
          { label: 'Enviados', value: enviados, color: '#3B82F6' },
          { label: 'Pendientes', value: pendientes, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABLA */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>No hay datos</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {['Fecha', 'Código', 'Cliente', 'Producto', 'Venta', 'Costo', 'Ganancia', 'Estado'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.875rem 1rem', color: '#aaa', fontSize: '0.8rem' }}>{p.created_at?.slice(0, 10)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#C9A84C', fontWeight: 700 }}>{p.codigo}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#111' }}>{p.cliente_nombre}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#555', maxWidth: '160px' }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.producto_nombre}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>${(p.precio_venta ?? 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#EF4444' }}>${(p.precio_proveedor ?? 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#10B981' }}>${(p.ganancia ?? 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{p.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}