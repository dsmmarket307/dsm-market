'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CRMImportar() {
  const supabase = createClient()
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [importando, setImportando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [pagina, setPagina] = useState(1)

  async function buscarProductos() {
    setLoading(true)
    setMensaje('')
    try {
      const res = await fetch(`/api/dropi/productos?q=${busqueda}&page=${pagina}`)
      const data = await res.json()
      if (data.error) {
        setMensaje('Error: ' + data.error)
      } else {
        setProductos(data.productos ?? [])
      }
    } catch {
      setMensaje('Error conectando con Dropi')
    }
    setLoading(false)
  }

  async function importarProducto(p: any) {
    setImportando(p.id)
    setMensaje('')
    try {
      const res = await fetch('/api/dropi/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto: p }),
      })
      const data = await res.json()
      if (data.error) {
        setMensaje('Error: ' + data.error)
      } else {
        setMensaje('✓ Producto importado correctamente — pendiente de aprobación')
      }
    } catch {
      setMensaje('Error importando producto')
    }
    setImportando(null)
  }

  const input: React.CSSProperties = {
    padding: '0.625rem 0.875rem', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '0.85rem', color: '#111',
    outline: 'none', background: '#fafafa',
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>Dropi</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111', margin: '0.25rem 0 0' }}>Importar productos</h1>
      </div>

      {/* BUSCADOR */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscarProductos()}
          placeholder="Buscar producto en Dropi..."
          style={{ ...input, flex: 1, minWidth: '200px' }} />
        <button onClick={buscarProductos} disabled={loading}
          style={{ background: '#C9A84C', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button onClick={() => { setBusqueda(''); buscarProductos() }}
          style={{ background: '#111', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          Ver todos
        </button>
      </div>

      {mensaje && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: mensaje.startsWith('✓') ? '#f0fdf4' : '#fff5f5', border: '1px solid ' + (mensaje.startsWith('✓') ? '#bbf7d0' : '#fecaca'), borderRadius: '8px', fontSize: '0.85rem', color: mensaje.startsWith('✓') ? '#166534' : '#dc2626', fontWeight: 600 }}>
          {mensaje}
        </div>
      )}

      {/* PRODUCTOS */}
      {productos.length === 0 && !loading && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>Busca un producto de Dropi para importarlo al marketplace</p>
        </div>
      )}

      {productos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {productos.map(p => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {p.images?.[0] && (
                <div style={{ paddingBottom: '60%', position: 'relative', background: '#f5f5f5' }}>
                  <img src={p.images[0]} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0 0 0.5rem' }}>ID: {p.id}</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#C9A84C', margin: '0 0 1rem' }}>${Number(p.price ?? 0).toLocaleString('es-CO')}</p>
                <button onClick={() => importarProducto(p)} disabled={importando === p.id}
                  style={{ width: '100%', padding: '0.625rem', background: importando === p.id ? '#e5e5e5' : '#111', color: importando === p.id ? '#999' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: importando === p.id ? 'not-allowed' : 'pointer' }}>
                  {importando === p.id ? 'Importando...' : 'Importar al marketplace'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}