'use client'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f9f9', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '220px', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px', margin: 0 }}>DMS</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>CRM Admin</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {[
            { href: '/crm', label: 'Dashboard', icon: '▦' },
            { href: '/crm/pedidos', label: 'Pedidos', icon: '◈' },
            { href: '/crm/productos', label: 'Productos Dropi', icon: '◉' },
            { href: '/crm/ganancias', label: 'Ganancias', icon: '◎' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem' }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/dashboard/admin" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Volver al admin</a>
        </div>
      </aside>
      <main style={{ marginLeft: '220px', flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}