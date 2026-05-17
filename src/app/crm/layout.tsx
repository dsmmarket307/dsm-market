'use client'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '220px', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, borderRight: '1px solid rgba(212,175,55,.1)' }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ width: '90px', objectFit: 'contain' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase', margin: '4px 0 0' }}>CRM Admin</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {[
            { href: '/crm', label: 'Dashboard', icon: '▦' },
            { href: '/crm/pedidos', label: 'Pedidos', icon: '◈' },
            { href: '/crm/productos', label: 'Productos Dropi', icon: '◉' },
            { href: '/crm/ganancias', label: 'Ganancias', icon: '◎' },
            { href: '/crm/importar', label: 'Importar Dropi', icon: '↓' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              <span style={{ fontSize: '1rem', color: '#D4AF37' }}>{item.icon}</span>
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