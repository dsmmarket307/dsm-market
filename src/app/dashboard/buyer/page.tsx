import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { confirmDelivery } from "@/lib/actions/orders"
import Link from "next/link"

export default async function BuyerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "buyer") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const totalSpent = orders?.reduce((sum: number, o: any) => sum + Number(o.total_price ?? 0), 0) ?? 0
  const active = orders?.filter((o: any) => !["delivered","released","cancelled"].includes(o.status)).length ?? 0
  const delivered = orders?.filter((o: any) => ["delivered","released"].includes(o.status)).length ?? 0
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]
  const initials = name?.charAt(0).toUpperCase()

  const logoUrl = "https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png"

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", fontFamily: "'Inter', sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: "240px", background: "#0B0B0B", borderRight: "1px solid rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", padding: "1.5rem 0", position: "fixed", top: 0, left: 0, height: "100vh" }}>
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <img src={logoUrl} alt="DMS Market" style={{ width: "120px", objectFit: "contain" }} />
        </div>

        <div style={{ padding: "0 1rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: "rgba(212,175,55,0.08)", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37, #f5d77a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", color: "#0B0B0B", flexShrink: 0 }}>{initials}</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem", margin: 0 }}>{name}</p>
              <span style={{ fontSize: "0.65rem", color: "#D4AF37", background: "rgba(212,175,55,0.1)", padding: "0.1rem 0.5rem", borderRadius: "999px" }}>Comprador</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {[
            { label: "Inicio", href: "/dashboard/buyer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, active: true },
            { label: "Mis pedidos", href: "/dashboard/buyer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
            { label: "Ver productos", href: "/dashboard/buyer/products", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
          ].map((item, i) => (
            <Link key={i} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", textDecoration: "none", background: item.active ? "rgba(212,175,55,0.12)" : "transparent", color: item.active ? "#D4AF37" : "#888", transition: "all 0.2s" }}>
              {item.icon}
              <span style={{ fontSize: "0.875rem", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: "1rem" }}>
          <form action="/auth/logout" method="post">
            <button style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#888", fontSize: "0.875rem", cursor: "pointer", width: "100%" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ marginLeft: "240px", flex: 1, padding: "2rem" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Bienvenido de vuelta</p>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>Hola, <span style={{ color: "#D4AF37" }}>{name}</span></h1>
          </div>
        </div>

        {/* METRICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Pedidos activos", value: active, color: "#D4AF37", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
            { label: "Total comprado", value: "$" + totalSpent.toLocaleString("es-CO"), color: "#D4AF37", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            { label: "Entregados", value: delivered, color: "#4CAF7D", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
          ].map((item, i) => (
            <div key={i} style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>{item.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: item.color, margin: 0 }}>{item.value}</p>
              </div>
              <div style={{ opacity: 0.6 }}>{item.icon}</div>
            </div>
          ))}
        </div>

        {/* BOTON VER PRODUCTOS */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/dashboard/buyer/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#D4AF37", color: "#0B0B0B", padding: "0.875rem 1.75rem", textDecoration: "none", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderRadius: "8px", boxShadow: "0 4px 20px rgba(212,175,55,0.3)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Ver productos
          </Link>
        </div>

        {/* PEDIDOS */}
        <div style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", margin: 0 }}>Mis pedidos</h2>
          </div>

          {!orders || orders.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "#555", fontSize: "0.875rem" }}>No tienes pedidos aun.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {orders.map((order: any, i: number) => (
                <div key={order.id} style={{ padding: "1.25rem 1.5rem", borderBottom: i < orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#555", marginBottom: "0.25rem" }}>#{order.id?.slice(0,8).toUpperCase()}</p>
                    {order.tracking_number && (
                      <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.25rem" }}>Guia: {order.tracking_number} — {order.shipping_company}</p>
                    )}
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>${Number(order.total_price ?? 0).toLocaleString("es-CO")}</p>
                    <p style={{ fontSize: "0.75rem", color: "#555", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-CO")}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.3rem 0.875rem", borderRadius: "999px", fontWeight: 600, background: ["delivered","released"].includes(order.status) ? "rgba(76,175,80,0.15)" : order.status === "shipped" ? "rgba(245,127,23,0.15)" : order.status === "paid" ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.06)", color: ["delivered","released"].includes(order.status) ? "#4CAF7D" : order.status === "shipped" ? "#f57f17" : order.status === "paid" ? "#D4AF37" : "#888" }}>
                      {order.status === "delivered" ? "Entregado" : order.status === "released" ? "Completado" : order.status === "shipped" ? "En camino" : order.status === "paid" ? "Pagado" : "Pendiente"}
                    </span>
                    {order.status === "shipped" && !order.confirmed_by_buyer_at && (
                      <form action={async () => { "use server"; await confirmDelivery(order.id) }}>
                        <button type="submit" style={{ padding: "0.4rem 0.875rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, borderRadius: "6px" }}>
                          Confirmar recibido
                        </button>
                      </form>
                    )}
                    {order.confirmed_by_buyer_at && order.status !== "released" && (
                      <p style={{ fontSize: "0.7rem", color: "#555" }}>Pago en proceso de liberacion</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
