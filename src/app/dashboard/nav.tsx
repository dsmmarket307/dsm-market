"use client"
import { useState } from "react"
import { logout } from "@/lib/actions/auth"

const roleLabels: any = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador", provider: "Proveedor" }

export default function DashboardNav({ role, name, email }: any) {
  const [open, setOpen] = useState(false)

  const navItems = role === "admin" ? [
    { href: "/dashboard/admin", label: "Inicio" },
    { href: "/dashboard/admin/vendors", label: "Vendedores" },
    { href: "/dashboard/admin/products", label: "Productos" },
    { href: "/dashboard/admin/orders", label: "Ordenes y Pagos" },
    { href: "/dashboard/admin/disputes", label: "Disputas" },
    { href: "/dashboard/admin/crm", label: "CRM Dropi" },
  ] : role === "seller" ? [
    { href: "/dashboard/vendor", label: "Inicio" },
    { href: "/dashboard/vendor/orders", label: "Mis Ordenes" },
    { href: "/dashboard/vendor/products/new", label: "Nuevo producto" },
    { href: "/dashboard/vendor/disputes", label: "Disputas" },
  ] : role === "provider" ? [
    { href: "/dashboard/provider", label: "Inicio" },
    { href: "/dashboard/provider/servicio", label: "Mi servicio" },
  ] : [
    { href: "/dashboard/buyer", label: "Inicio" },
    { href: "/dashboard/buyer/products", label: "Tienda" },
    { href: "/dashboard/buyer/disputes", label: "Abrir disputa" },
  ]

  return (
    <>
      {/* MOBILE — barra superior */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: '56px', background: '#fff', borderBottom: '2px solid #C9A84C', zIndex: 100, alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }} className="mobile-nav">
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>DMS Market</span>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#C9A84C', padding: '0.5rem' }}>
          {open ? '?' : '?'}
        </button>
      </div>

      {/* MOBILE — menu desplegable */}
      {open && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 99, overflowY: 'auto', display: 'none' }} className="mobile-menu">
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: '#FBF5E6', border: '1px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#C9A84C', fontWeight: 700 }}>{name?.charAt(0)?.toUpperCase() ?? 'U'}</span>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{name || email}</p>
              <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>{roleLabels[role] ?? 'Usuario'}</p>
            </div>
          </div>
          <nav style={{ padding: '0.5rem 0' }}>
            {navItems.map(item => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '0.875rem 1.5rem', fontSize: '0.95rem', color: '#444', textDecoration: 'none', borderBottom: '1px solid #f5f5f5' }}>
                {item.label}
              </a>
            ))}
          </nav>
          <div style={{ padding: '1rem 1.5rem' }}>
            <form action={logout}>
              <button type="submit" style={{ width: '100%', padding: '0.875rem', background: '#fff', color: '#E05252', border: '1px solid #E05252', cursor: 'pointer', fontSize: '0.875rem' }}>
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DESKTOP — sidebar */}
      <aside style={{ width: '220px', background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }} className="desktop-nav">
        <div style={{ padding: '1.5rem', borderBottom: '2px solid #C9A84C' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C9A84C' }}>DMS Market</p>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee' }}>
          <div style={{ width: '36px', height: '36px', background: '#FBF5E6', border: '1px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: '#C9A84C', fontWeight: 700 }}>{name?.charAt(0)?.toUpperCase() ?? 'U'}</span>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{name || email}</p>
          <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>{roleLabels[role] ?? 'Usuario'}</p>
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map(item => (
            <a key={item.href} href={item.href}
              style={{ display: 'block', padding: '0.625rem 1.5rem', fontSize: '0.875rem', color: '#444', textDecoration: 'none', borderLeft: '3px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderLeftColor = '#C9A84C'; e.currentTarget.style.background = '#FBF5E6' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderLeftColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}>
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee' }}>
          <form action={logout}>
            <button type="submit" style={{ width: '100%', padding: '0.625rem', background: '#fff', color: '#888', border: '1px solid #eee', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E05252'; e.currentTarget.style.borderColor = '#E05252' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#eee' }}>
              Cerrar sesion
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .mobile-nav { display: flex !important; }
          .mobile-menu { display: block !important; }
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
