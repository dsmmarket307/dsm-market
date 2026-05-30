'use client'

import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark:  { bg: '#0a0a0a', bg2: '#111111', bg3: '#1a1a1a', bg4: '#161616', text: '#ffffff', text2: '#888888', text3: '#cccccc', border: '#222222', border2: '#1a1a1a', gold: '#D4AF37' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#e8e8e8', bg4: '#f0f0f0', text: '#111111', text2: '#666666', text3: '#444444', border: '#dddddd', border2: '#eeeeee', gold: '#B8960C' },
}

interface Profile {
  id: string
  name?: string
  full_name?: string
  role: string
  phone?: string
  celular?: string
  city?: string
  ciudad?: string
  created_at: string
  store_name?: string
  blocked?: boolean
}

interface Props {
  sellers: Profile[]
  buyers: Profile[]
  emailMap: Record<string, string>
  ventasMap: Record<string, { total: number; count: number; productos: Record<string, number> }>
  comprasMap: Record<string, { total: number; count: number }>
  totalVentas: number
  totalCompras: number
}

const formatDate  = (d: string) => new Date(d).toLocaleDateString('es-CO')
const formatMoney = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const getMasVendido = (productos: Record<string, number>) => {
  const entries = Object.entries(productos)
  if (!entries.length) return '—'
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

export function UsuariosClient({ sellers, buyers, emailMap, ventasMap, comprasMap, totalVentas, totalCompras }: Props) {
  const { theme } = useTheme()
  const t = THEMES[theme]

  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: "'Poppins', sans-serif", padding: '2rem', color: t.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `2px solid ${t.gold}` }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: t.gold, marginBottom: '0.25rem' }}>Administrador</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem', color: t.text }}>Usuarios</h1>
          <p style={{ color: t.text2, fontSize: '0.95rem', margin: 0 }}>Vendedores y compradores registrados en DMS Market</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total vendedores',  value: sellers.length  },
            { label: 'Total compradores', value: buyers.length   },
            { label: 'Total ventas',      value: totalVentas     },
            { label: 'Total compras',     value: totalCompras    },
          ].map((s, i) => (
            <div key={i} style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 10, padding: '1.2rem' }}>
              <div style={{ fontSize: '0.78rem', color: t.text2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: t.gold }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Vendedores */}
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: t.gold, marginTop: '2.5rem' }}>
          Vendedores de productos
        </div>
        <div style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                {['Nombre', 'Tienda', 'Email', 'Celular', 'Ciudad', 'Registro', 'Ventas', 'Total vendido', 'Mas vendido', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: t.text2, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${t.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => {
                const v = ventasMap[s.id] || { total: 0, count: 0, productos: {} }
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${t.border2}` }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: t.text }}>{s.full_name || s.name || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text3 }}>{s.store_name || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{emailMap[s.id] || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text3 }}>{s.celular || s.phone || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{s.ciudad || s.city || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{formatDate(s.created_at)}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.gold, fontWeight: 700 }}>{v.count}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>{formatMoney(v.total)}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: t.text2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getMasVendido(v.productos)}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: s.blocked ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)', color: s.blocked ? '#ef4444' : '#4ade80' }}>
                        {s.blocked ? 'Bloqueado' : 'Activo'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {sellers.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: t.text2 }}>No hay vendedores</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Compradores */}
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: t.gold, marginTop: '2.5rem' }}>
          Compradores
        </div>
        <div style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                {['Nombre', 'Email', 'Celular', 'Ciudad', 'Registro', 'Compras', 'Total gastado'].map(h => (
                  <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: t.text2, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${t.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buyers.map((b) => {
                const c = comprasMap[b.id] || { total: 0, count: 0 }
                return (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${t.border2}` }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: t.text }}>{b.full_name || b.name || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{emailMap[b.id] || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text3 }}>{b.celular || b.phone || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{b.ciudad || b.city || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.text2 }}>{formatDate(b.created_at)}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: t.gold, fontWeight: 700 }}>{c.count}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>{formatMoney(c.total)}</td>
                  </tr>
                )
              })}
              {buyers.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: t.text2 }}>No hay compradores</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
