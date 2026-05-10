"use client"
import { logout } from "@/lib/actions/auth"
const roleLabels: any = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador" }
export default function DashboardNav({ role, name, email }: any) {
  const navItems = role === "admin" ? [
    { href: "/dashboard/admin", label: "Inicio" },
    { href: "/dashboard/admin/vendors", label: "Vendedores" },
    { href: "/dashboard/admin/products", label: "Productos" },
    { href: "/dashboard/admin/orders", label: "Ordenes y Pagos" },
    { href: "/dashboard/admin/disputes", label: "Disputas" },
  ] : role === "seller" ? [
    { href: "/dashboard/vendor", label: "Inicio" },
    { href: "/dashboard/vendor/orders", label: "Mis Ordenes" },
    { href: "/dashboard/vendor/products/new", label: "Nuevo producto" },
    { href: "/dashboard/vendor/disputes", label: "Disputas" },
  ] : [
    { href: "/dashboard/buyer", label: "Inicio" },
    { href: "/dashboard/buyer/products", label: "Tienda" },
    { href: "/dashboard/buyer/disputes", label: "Abrir disputa" },
  ]
  return (
    <aside style={{ width: "220px", background: "#fff", borderRight: "1px solid #eee", display: "flex", flexDirection: "column", minHeight: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "1.5rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#C9A84C" }}>DMS Market</p>
      </div>
      <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee" }}>
        <div style={{ width: "36px", height: "36px", background: "#FBF5E6", border: "1px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" }}>
          <span style={{ color: "#C9A84C", fontWeight: 700 }}>{name?.charAt(0)?.toUpperCase() ?? "U"}</span>
        </div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>{name || email}</p>
        <p style={{ fontSize: "0.75rem", color: "#C9A84C" }}>{roleLabels[role] ?? "Usuario"}</p>
      </div>
      <nav style={{ flex: 1, padding: "1rem 0" }}>
        {navItems.map((item) => (
          <a key={item.href} href={item.href} style={{ display: "block", padding: "0.625rem 1.5rem", fontSize: "0.875rem", color: "#444", textDecoration: "none", borderLeft: "3px solid transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.borderLeftColor = "#C9A84C"; e.currentTarget.style.background = "#FBF5E6" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#444"; e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent" }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #eee" }}>
        <form action={logout}>
          <button type="submit" style={{ width: "100%", padding: "0.625rem", background: "#fff", color: "#888", border: "1px solid #eee", cursor: "pointer", fontSize: "0.8rem", textAlign: "left" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#E05252"; e.currentTarget.style.borderColor = "#E05252" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.borderColor = "#eee" }}
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </aside>
  )
}
