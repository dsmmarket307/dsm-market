import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"

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

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#0f0f0f", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #D4AF37" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Panel</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#ffffff" }}>Administrador</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#999999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Vendedores pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#D4AF37" }}>{pendingVendors?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#999999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Productos pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#D4AF37" }}>{pendingProducts?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#999999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Servicios pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#D4AF37" }}>{pendingServices?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#999999", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Comisiones ganadas</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#4CAF7D" }}>${totalRevenue.toLocaleString("es-CO")}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <Link href="/dashboard/admin/vendors" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Vendedores</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Aprobar o rechazar perfiles de vendedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver vendedores</p>
        </Link>

        <Link href="/dashboard/admin/products" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Productos</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Aprobar o rechazar productos de vendedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver productos</p>
        </Link>

        <Link href="/dashboard/admin/services" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Servicios</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Aprobar o rechazar servicios de proveedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver servicios</p>
        </Link>

        <Link href="/dashboard/admin/orders" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Ordenes y Pagos</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Ver y gestionar ordenes del marketplace</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver ordenes</p>
        </Link>

        <Link href="/dashboard/admin/disputes" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Disputas</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Resolver disputas entre compradores y vendedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver disputas</p>
        </Link>

        <Link href="/crm" style={{ textDecoration: "none", border: "1px solid rgba(212,175,55,.12)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#D4AF37", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>CRM Dropi</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Gestion de pedidos y productos Dropi</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#D4AF37", fontWeight: 600 }}>Ver CRM</p>
        </Link>

        <Link href="/dashboard/admin/soporte" style={{ textDecoration: "none", border: "1px solid rgba(76,175,61,.2)", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#4CAF7D", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.375rem" }}>Soporte</p>
          <p style={{ fontSize: "0.8rem", color: "#999999" }}>Responder conversaciones de usuarios en tiempo real</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#4CAF7D", fontWeight: 600 }}>Ver soporte</p>
        </Link>
      </div>
    </div>
  )
}
