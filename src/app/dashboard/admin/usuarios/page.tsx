import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: allProfiles } = await admin
    .from('profiles')
    .select('id, name, full_name, role, phone, celular, city, ciudad, created_at, store_name, blocked')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  authUsers?.users?.forEach((u: any) => { emailMap[u.id] = u.email || '' })

  const { data: ventasData } = await admin
    .from('orders')
    .select('seller_id, total_price, product_id, products(name)')
    .in('status', ['paid', 'delivered', 'released'])

  const { data: comprasData } = await admin
    .from('orders')
    .select('buyer_id, total_price')
    .in('status', ['paid', 'delivered', 'released'])

  const ventasMap: Record<string, { total: number; count: number; productos: Record<string, number> }> = {}
  ;(ventasData || []).forEach((o: any) => {
    if (!o.seller_id) return
    if (!ventasMap[o.seller_id]) ventasMap[o.seller_id] = { total: 0, count: 0, productos: {} }
    ventasMap[o.seller_id].total += Number(o.total_price || 0)
    ventasMap[o.seller_id].count += 1
    const pname = o.products?.name || 'Sin nombre'
    ventasMap[o.seller_id].productos[pname] = (ventasMap[o.seller_id].productos[pname] || 0) + 1
  })

  const comprasMap: Record<string, { total: number; count: number }> = {}
  ;(comprasData || []).forEach((o: any) => {
    if (!o.buyer_id) return
    if (!comprasMap[o.buyer_id]) comprasMap[o.buyer_id] = { total: 0, count: 0 }
    comprasMap[o.buyer_id].total += Number(o.total_price || 0)
    comprasMap[o.buyer_id].count += 1
  })

  const sellers = (allProfiles || []).filter(p => p.role === 'seller')
  const buyers = (allProfiles || []).filter(p => p.role === 'buyer')

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-CO')
  const formatMoney = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  const getMasVendido = (productos: Record<string, number>) => {
    const entries = Object.entries(productos)
    if (!entries.length) return '—'
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .au-root { background: #0a0a0a; min-height: 100vh; font-family: 'Poppins', sans-serif; padding: 2rem; color: #fff; }
    .au-inner { max-width: 1300px; margin: 0 auto; }
    .au-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .au-stat { background: #111; border: 1px solid #222; border-radius: 10px; padding: 1.2rem; }
    .au-stat-label { font-size: 0.78rem; color: #888; margin-bottom: 6px; }
    .au-stat-value { font-size: 1.6rem; font-weight: 700; color: #D4AF37; }
    .au-table-wrap { background: #111; border: 1px solid #222; border-radius: 12px; overflow-x: auto; }
    .au-table { width: 100%; border-collapse: collapse; min-width: 900px; }
    .au-th { padding: 0.8rem 1rem; text-align: left; color: #888; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; white-space: nowrap; }
    .au-td { padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
    .au-tr:last-child .au-td { border-bottom: none; }
    .au-tr:hover .au-td { background: #161616; }
    .au-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .au-section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: #D4AF37; margin-top: 2.5rem; }
    .au-product { font-size: 0.78rem; color: #888; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `

  return (
    <>
      <style>{css}</style>
      <div className="au-root">
        <div className="au-inner">
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Usuarios</h1>
          <p style={{ color: '#888', fontSize: '0.95rem', marginBottom: '2rem' }}>Vendedores y compradores registrados en DMS Market</p>

          <div className="au-stats">
            <div className="au-stat"><div className="au-stat-label">Total vendedores</div><div className="au-stat-value">{sellers.length}</div></div>
            <div className="au-stat"><div className="au-stat-label">Total compradores</div><div className="au-stat-value">{buyers.length}</div></div>
            <div className="au-stat"><div className="au-stat-label">Total ventas</div><div className="au-stat-value">{(ventasData || []).length}</div></div>
            <div className="au-stat"><div className="au-stat-label">Total compras</div><div className="au-stat-value">{(comprasData || []).length}</div></div>
          </div>

          {/* VENDEDORES */}
          <div className="au-section-title">Vendedores de productos</div>
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th className="au-th">Nombre</th>
                  <th className="au-th">Tienda</th>
                  <th className="au-th">Email</th>
                  <th className="au-th">Celular</th>
                  <th className="au-th">Ciudad</th>
                  <th className="au-th">Registro</th>
                  <th className="au-th">Ventas</th>
                  <th className="au-th">Total vendido</th>
                  <th className="au-th">Mas vendido</th>
                  <th className="au-th">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s: any) => {
                  const v = ventasMap[s.id] || { total: 0, count: 0, productos: {} }
                  return (
                    <tr key={s.id} className="au-tr">
                      <td className="au-td" style={{ fontWeight: 600, color: '#fff' }}>{s.full_name || s.name || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{s.store_name || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{emailMap[s.id] || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{s.celular || s.phone || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{s.ciudad || s.city || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{formatDate(s.created_at)}</td>
                      <td className="au-td" style={{ color: '#D4AF37', fontWeight: 700 }}>{v.count}</td>
                      <td className="au-td" style={{ color: '#4ade80', fontWeight: 700 }}>{formatMoney(v.total)}</td>
                      <td className="au-td"><div className="au-product">{getMasVendido(v.productos)}</div></td>
                      <td className="au-td">
                        <span className="au-badge" style={{ background: s.blocked ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)', color: s.blocked ? '#ef4444' : '#4ade80' }}>
                          {s.blocked ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {sellers.length === 0 && <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay vendedores</td></tr>}
              </tbody>
            </table>
          </div>

          {/* COMPRADORES */}
          <div className="au-section-title">Compradores</div>
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th className="au-th">Nombre</th>
                  <th className="au-th">Email</th>
                  <th className="au-th">Celular</th>
                  <th className="au-th">Ciudad</th>
                  <th className="au-th">Registro</th>
                  <th className="au-th">Compras</th>
                  <th className="au-th">Total gastado</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((b: any) => {
                  const c = comprasMap[b.id] || { total: 0, count: 0 }
                  return (
                    <tr key={b.id} className="au-tr">
                      <td className="au-td" style={{ fontWeight: 600, color: '#fff' }}>{b.full_name || b.name || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{emailMap[b.id] || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{b.celular || b.phone || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{b.ciudad || b.city || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{formatDate(b.created_at)}</td>
                      <td className="au-td" style={{ color: '#D4AF37', fontWeight: 700 }}>{c.count}</td>
                      <td className="au-td" style={{ color: '#4ade80', fontWeight: 700 }}>{formatMoney(c.total)}</td>
                    </tr>
                  )
                })}
                {buyers.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay compradores</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
