import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"
import ReporteIA from "@/components/ReporteIA"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pendingVendors } = await admin.from("profiles").select("*").eq("role", "seller").eq("seller_status", "pending")
  const { data: pendingProducts } = await admin.from("products").select("*").eq("status", "pending")
  const { data: allOrders } = await admin.from("orders").select("*")
  const { data: pendingServices } = await admin.from("services").select("*").eq("status", "pending")

  const totalRevenue = allOrders?.reduce((sum: number, o: any) => sum + Number(o.platform_fee), 0) ?? 0

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    .ad-root { background: #0a0a0a; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .ad-inner { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }
    .ad-metric { background: #111; border: 1px solid rgba(212,175,55,.1); border-radius: 16px; padding: 1.5rem; transition: border-color .2s, transform .2s; }
    .ad-metric:hover { border-color: rgba(212,175,55,.3); transform: translateY(-2px); }
    .ad-card { background: #111; border: 1px solid rgba(212,175,55,.1); border-radius: 16px; padding: 1.75rem; display: block; text-decoration: none; transition: all .2s; position: relative; overflow: hidden; }
    .ad-card:hover { border-color: rgba(212,175,55,.35); transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,.4); }
    .ad-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #D4AF37, transparent); opacity: 0; transition: opacity .2s; }
    .ad-card:hover::before { opacity: 1; }
    .ad-card-green { border-color: rgba(76,175,61,.15) !important; }
    .ad-card-green:hover { border-color: rgba(76,175,61,.4) !important; }
    .ad-card-green::before { background: linear-gradient(90deg, #4CAF7D, transparent) !important; }
  `

  const menuItems = [
    { href: "/dashboard/admin/vendors", label: "Vendedores", desc: "Aprobar o rechazar perfiles de vendedores", color: "#D4AF37", badge: pendingVendors?.length ?? 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href: "/dashboard/admin/products", label: "Productos", desc: "Aprobar o rechazar productos de vendedores", color: "#D4AF37", badge: pendingProducts?.length ?? 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { href: "/dashboard/admin/services", label: "Servicios", desc: "Aprobar o rechazar servicios de proveedores", color: "#D4AF37", badge: pendingServices?.length ?? 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
    { href: "/dashboard/admin/orders", label: "Ordenes y Pagos", desc: "Ver y gestionar ordenes del marketplace", color: "#D4AF37", badge: 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { href: "/dashboard/admin/disputes", label: "Disputas", desc: "Resolver disputas entre compradores y vendedores", color: "#D4AF37", badge: 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    { href: "/crm", label: "CRM Dropi", desc: "Gestion de pedidos y productos Dropi", color: "#D4AF37", badge: 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { href: "/dashboard/admin/soporte", label: "Soporte", desc: "Responder conversaciones en tiempo real", color: "#4CAF7D", badge: 0, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, green: true },
  ]

  return (
    <>
      <style>{css}</style>
      <div className="ad-root">
        <div className="ad-inner">

          <div style={{ marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(212,175,55,.15)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.375rem", fontWeight: 600 }}>Panel de Control</p>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>Administrador</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#111", border: "1px solid rgba(212,175,55,.15)", borderRadius: "10px", padding: "0.5rem 1rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4CAF7D" }} />
              <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500 }}>Sistema activo</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {[
              { label: "Vendedores pendientes", value: pendingVendors?.length ?? 0, color: "#D4AF37", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, alert: (pendingVendors?.length ?? 0) > 0 },
              { label: "Productos pendientes", value: pendingProducts?.length ?? 0, color: "#D4AF37", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>, alert: (pendingProducts?.length ?? 0) > 0 },
              { label: "Servicios pendientes", value: pendingServices?.length ?? 0, color: "#D4AF37", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>, alert: (pendingServices?.length ?? 0) > 0 },
              { label: "Comisiones ganadas", value: "$" + totalRevenue.toLocaleString("es-CO"), color: "#4CAF7D", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, alert: false },
            ].map((item, i) => (
              <div key={i} className="ad-metric">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(212,175,55,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </div>
                  {item.alert && (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,.5)" }} />
                  )}
                </div>
                <p style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "0.5rem", fontWeight: 500 }}>{item.label}</p>
                <p style={{ fontSize: "2.25rem", fontWeight: 800, color: item.color, margin: 0, letterSpacing: "-0.02em" }}>{item.value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#555", marginBottom: "1rem", fontWeight: 600 }}>Accesos rapidos</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className={"ad-card" + (item.green ? " ad-card-green" : "")}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: item.green ? "rgba(76,175,61,.08)" : "rgba(212,175,55,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.icon}
                  </div>
                  {item.badge > 0 && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(245,158,11,.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.3)", borderRadius: "999px", padding: "2px 8px" }}>
                      {item.badge} pendientes
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.375rem", letterSpacing: "-0.01em" }}>{item.label}</p>
                <p style={{ fontSize: "0.8rem", color: "#666", lineHeight: 1.5, marginBottom: "1.25rem" }}>{item.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ fontSize: "0.78rem", color: item.color, fontWeight: 600 }}>Abrir</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <ReporteIA type="admin" />
        </div>
      </div>
    </>
  )
}
