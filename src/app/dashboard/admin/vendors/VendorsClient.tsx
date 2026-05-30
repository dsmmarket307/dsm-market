'use client'
import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark: { bg: '#0f0f0f', bg2: '#1a1a1a', bg3: '#1a1600', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', gold: '#D4AF37' },
  light: { bg: '#f5f5f5', bg2: '#e8e8e8', bg3: '#fffdf0', text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.1)', gold: '#B8960C' },
}

export default function VendorsClient({ vendors, approveVendor, rejectVendor }: { vendors: any[], approveVendor: any, rejectVendor: any }) {
  const { theme } = useTheme()
  const T = THEMES[theme]

  const total = vendors.length
  const approved = vendors.filter(v => v.seller_status === 'approved').length
  const pending = vendors.filter(v => v.seller_status === 'pending').length
  const rejected = vendors.filter(v => v.seller_status === 'rejected').length

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto', background: T.bg, minHeight: '100vh' }}>

      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `2px solid ${T.gold}` }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.gold, marginBottom: '0.25rem' }}>Administrador</p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: T.text }}>Vendedores</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: total, color: T.text },
          { label: 'Aprobados', value: approved, color: '#4CAF7D' },
          { label: 'Pendientes', value: pending, color: T.gold },
          { label: 'Rechazados', value: rejected, color: '#E05252' },
        ].map(stat => (
          <div key={stat.label} style={{ border: `1px solid ${T.border}`, padding: '1.25rem', textAlign: 'center', background: T.bg2, borderRadius: 8 }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p style={{ fontSize: '0.75rem', color: T.text2, textTransform: 'uppercase' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {vendors.length === 0 ? (
          <p style={{ color: T.text2, textAlign: 'center', padding: '2rem' }}>No hay vendedores registrados.</p>
        ) : vendors.map(vendor => (
          <div key={vendor.id} style={{ border: `1px solid ${T.border}`, background: T.bg, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, background: '#FBF5E6', border: '1px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: '50%' }}>
                    <span style={{ color: '#D4AF37', fontWeight: 700 }}>{vendor.name?.charAt(0)?.toUpperCase() ?? 'V'}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: T.text }}>{vendor.name}</p>
                    <p style={{ fontSize: '0.75rem', color: T.text2 }}>ID: {vendor.id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.75rem', background: vendor.seller_status === 'approved' ? '#e8f5e9' : vendor.seller_status === 'rejected' ? '#fdecea' : '#fff8e1', color: vendor.seller_status === 'approved' ? '#2e7d32' : vendor.seller_status === 'rejected' ? '#c62828' : '#f57f17', border: `1px solid ${vendor.seller_status === 'approved' ? '#4CAF7D' : vendor.seller_status === 'rejected' ? '#E05252' : '#C9A84C'}`, borderRadius: 999 }}>
                    {vendor.seller_status === 'approved' ? 'Aprobado' : vendor.seller_status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </span>
                  {vendor.politicas_aceptadas && (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.75rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #4CAF7D', borderRadius: 999 }}>Politicas aceptadas</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {vendor.seller_status === 'pending' && (
                  <>
                    <form action={approveVendor.bind(null, vendor.id)}>
                      <button type="submit" style={{ padding: '0.5rem 1rem', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, width: '100%', borderRadius: 6 }}>Aprobar</button>
                    </form>
                    <form action={rejectVendor.bind(null, vendor.id)}>
                      <button type="submit" style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#E05252', border: '1px solid #E05252', cursor: 'pointer', fontSize: '0.8rem', width: '100%', borderRadius: 6 }}>Rechazar</button>
                    </form>
                  </>
                )}
                {vendor.seller_status === 'approved' && (
                  <form action={rejectVendor.bind(null, vendor.id)}>
                    <button type="submit" style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#E05252', border: '1px solid #E05252', cursor: 'pointer', fontSize: '0.8rem', width: '100%', borderRadius: 6 }}>Desactivar</button>
                  </form>
                )}
                {vendor.seller_status === 'rejected' && (
                  <form action={approveVendor.bind(null, vendor.id)}>
                    <button type="submit" style={{ padding: '0.5rem 1rem', background: '#C9A84C', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', width: '100%', borderRadius: 6 }}>Reactivar</button>
                  </form>
                )}
              </div>
            </div>

            <div style={{ padding: '1rem 1.25rem', background: T.bg2, borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Celular', value: vendor.celular ?? vendor.phone ?? 'No registrado' },
                { label: 'Cedula', value: vendor.cedula ?? 'No registrada' },
                { label: 'Ciudad', value: vendor.ciudad ?? vendor.city ?? 'No registrada' },
                { label: 'Direccion', value: vendor.direccion ?? 'No registrada' },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, color: T.text2, marginBottom: '0.25rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.875rem', color: T.text }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem 1.25rem', background: T.bg3, borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Banco', value: vendor.banco ?? 'No registrado' },
                { label: 'Tipo de cuenta', value: vendor.tipo_cuenta ?? 'No registrado' },
                { label: 'Numero de cuenta', value: vendor.numero_cuenta ?? 'No registrado' },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, color: T.gold, marginBottom: '0.25rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.875rem', color: T.text, fontWeight: 500 }}>{item.value}</p>
                </div>
              ))}
              {vendor.documento_url && (
                <div>
                  <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: 1, color: T.gold, marginBottom: '0.25rem' }}>Documento</p>
                  <a href={vendor.documento_url} target="_blank" style={{ fontSize: '0.875rem', color: T.gold, fontWeight: 600, textDecoration: 'none' }}>Ver documento</a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
