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

  const sellers = (allProfiles || []).filter(p => p.role === 'seller')
  const buyers = (allProfiles || []).filter(p => p.role === 'buyer')

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-CO')

  const tableStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .au-root { background: #0a0a0a; min-height: 100vh; font-family: 'Poppins', sans-serif; padding: 2rem; color: #fff; }
    .au-inner { max-width: 1200px; margin: 0 auto; }
    .au-header { margin-bottom: 2rem; }
    .au-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #222; }
    .au-tab { padding: 0.6rem 1.4rem; background: transparent; border: none; border-bottom: 2px solid transparent; color: #888; font-weight: 500; cursor: pointer; font-size: 0.95rem; font-family: 'Poppins', sans-serif; margin-bottom: -1px; transition: all 0.2s; }
    .au-tab.active { color: #D4AF37; border-bottom-color: #D4AF37; font-weight: 700; }
    .au-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .au-stat { background: #111; border: 1px solid #222; border-radius: 10px; padding: 1.2rem; }
    .au-stat-label { font-size: 0.78rem; color: #888; margin-bottom: 6px; }
    .au-stat-value { font-size: 1.6rem; font-weight: 700; color: #D4AF37; }
    .au-table-wrap { background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
    .au-table { width: 100%; border-collapse: collapse; }
    .au-th { padding: 0.8rem 1rem; text-align: left; color: #888; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }
    .au-td { padding: 0.85rem 1rem; font-size: 0.87rem; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
    .au-tr:last-child .au-td { border-bottom: none; }
    .au-tr:hover .au-td { background: #161616; }
    .au-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
    .au-search { width: 100%; padding: 10px 16px; background: #111; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 0.875rem; font-family: 'Poppins', sans-serif; outline: none; margin-bottom: 1.5rem; }
    .au-search:focus { border-color: #D4AF37; }
  `

  return (
    <>
      <style>{tableStyles}</style>
      <div className="au-root">
        <div className="au-inner">
          <div className="au-header">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Usuarios</h1>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>Vendedores y compradores registrados en DMS Market</p>
          </div>

          <div className="au-stats">
            <div className="au-stat">
              <div className="au-stat-label">Total vendedores</div>
              <div className="au-stat-value">{sellers.length}</div>
            </div>
            <div className="au-stat">
              <div className="au-stat-label">Total compradores</div>
              <div className="au-stat-value">{buyers.length}</div>
            </div>
            <div className="au-stat">
              <div className="au-stat-label">Total usuarios</div>
              <div className="au-stat-value">{sellers.length + buyers.length}</div>
            </div>
          </div>

          {/* VENDEDORES */}
          <div id="tab-sellers">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#D4AF37' }}>Vendedores de productos</h2>
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
                    <th className="au-th">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((s: any) => (
                    <tr key={s.id} className="au-tr">
                      <td className="au-td" style={{ fontWeight: 600, color: '#fff' }}>{s.full_name || s.name || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{s.store_name || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{emailMap[s.id] || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{s.celular || s.phone || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{s.ciudad || s.city || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{formatDate(s.created_at)}</td>
                      <td className="au-td">
                        <span className="au-badge" style={{ background: s.blocked ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)', color: s.blocked ? '#ef4444' : '#4ade80' }}>
                          {s.blocked ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sellers.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay vendedores registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPRADORES */}
          <div id="tab-buyers" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#D4AF37' }}>Compradores</h2>
            <div className="au-table-wrap">
              <table className="au-table">
                <thead>
                  <tr>
                    <th className="au-th">Nombre</th>
                    <th className="au-th">Email</th>
                    <th className="au-th">Celular</th>
                    <th className="au-th">Ciudad</th>
                    <th className="au-th">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((b: any) => (
                    <tr key={b.id} className="au-tr">
                      <td className="au-td" style={{ fontWeight: 600, color: '#fff' }}>{b.full_name || b.name || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{emailMap[b.id] || '—'}</td>
                      <td className="au-td" style={{ color: '#ccc' }}>{b.celular || b.phone || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{b.ciudad || b.city || '—'}</td>
                      <td className="au-td" style={{ color: '#888' }}>{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                  {buyers.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No hay compradores registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
