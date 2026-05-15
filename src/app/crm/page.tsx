'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CRMDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pendientes: 0,
    enviados: 0,
    entregados: 0,
    gananciasTotal: 0,
    gananciasMes: 0,
  })
  const [pedidosRecientes, setPedidosRecientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: pedidos } = await supabase
        .from('crm_pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (pedidos) {
        const ahora = new Date()
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

        setStats({
          totalPedidos: pedidos.length,
          pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
          enviados: pedidos.filter(p => p.estado === 'enviado').length,
          entregados: pedidos.filter(p => p.estado === 'entregado').length,
          gananciasTotal: pedidos.reduce((acc, p) => acc + (p.ganancia ?? 0), 0),
          gananciasMes: pedidos
            .filter(p => new Date(p.created_at) >= inicioMes)
            .reduce((acc, p) => acc + (p.ganancia ?? 0), 0),
        })
        setPedidosRecientes(pedidos.slice(0, 5))
      }
      setLoading(false)
    }
    load()
  }, [])

  const estadoColor: Record<string, string> = {
    pendiente: '#F59E0B',
    enviado: '#3B82F6',
    entregado: '#10B981',
    cancelado: '#EF4444',
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>Panel de control</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', margin: '0.25rem 0 0' }}>Dashboard</h1>
      </div>

      {loading ? (
        <p style={{ color: '#aaa' }}>Cargando...</p>
      ) : (
        <>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total pedidos', value: stats.totalPedidos, color: '#111' },
              { label: 'Pendientes', value: stats.pendientes, color: '#F59E0B' },
              { label: 'Enviados', value: stats.enviados, color: '#3B82F6' },
              { label: 'Entregados', value: stats.entregados, color: '#10B981' },
              { label: 'Ganancias totales', value: '$' + stats.gananciasTotal.toLocaleString('es-CO'), color: '#C9A84C' },
              { label: 'Ganancias este mes', value: '$' + stats.gananciasMes.toLocaleString('es-CO'), color: '#C9A84C' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* PEDIDOS RECIENTES */}
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Pedidos recientes</h2>
              <a href="/crm/pedidos" style={{ fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</a>
            </div>

            {pedidosRecientes.length === 0 ? (
              <p style={{ color: '#aaa', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No hay pedidos aún</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {['Código', 'Cliente', 'Producto', 'Ganancia', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidosRecientes.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '0.75rem', color: '#C9A84C', fontWeight: 600 }}>{p.codigo ?? '—'}</td>
                      <td style={{ padding: '0.75rem', color: '#111' }}>{p.cliente_nombre ?? '—'}</td>
                      <td style={{ padding: '0.75rem', color: '#555' }}>{p.producto_nombre ?? '—'}</td>
                      <td style={{ padding: '0.75rem', color: '#111', fontWeight: 600 }}>${(p.ganancia ?? 0).toLocaleString('es-CO')}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ background: estadoColor[p.estado] + '20', color: estadoColor[p.estado], padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}