import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { approveVendor, rejectVendor } from "@/lib/actions/products"

export default async function AdminVendorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: vendors } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "seller")
    .order("created_at", { ascending: false })

  const total = vendors?.length ?? 0
  const approved = vendors?.filter((v: any) => v.seller_status === "approved").length ?? 0
  const pending = vendors?.filter((v: any) => v.seller_status === "pending").length ?? 0
  const rejected = vendors?.filter((v: any) => v.seller_status === "rejected").length ?? 0

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Administrador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Vendedores</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total", value: total, color: "#111" },
          { label: "Aprobados", value: approved, color: "#4CAF7D" },
          { label: "Pendientes", value: pending, color: "#C9A84C" },
          { label: "Rechazados", value: rejected, color: "#E05252" },
        ].map((stat) => (
          <div key={stat.label} style={{ border: "1px solid #eee", padding: "1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!vendors || vendors.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>No hay vendedores registrados.</p>
        ) : (
          vendors.map((vendor: any) => (
            <div key={vendor.id} style={{ border: "1px solid #eee", padding: "1.25rem", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "40px", height: "40px", background: "#FBF5E6", border: "1px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#C9A84C", fontWeight: 700 }}>{vendor.name?.charAt(0)?.toUpperCase() ?? "V"}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: "1rem", fontWeight: 600, color: "#111" }}>{vendor.name}</p>
                      <p style={{ fontSize: "0.75rem", color: "#888" }}>ID: {vendor.id?.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {vendor.phone && <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>Tel: {vendor.phone}</p>}
                  {vendor.city && <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>Ciudad: {vendor.city}</p>}
                  {vendor.store_name && <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>Tienda: {vendor.store_name}</p>}

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.75rem", background: vendor.seller_status === "approved" ? "#e8f5e9" : vendor.seller_status === "rejected" ? "#fdecea" : "#fff8e1", color: vendor.seller_status === "approved" ? "#2e7d32" : vendor.seller_status === "rejected" ? "#c62828" : "#f57f17", border: `1px solid ${vendor.seller_status === "approved" ? "#4CAF7D" : vendor.seller_status === "rejected" ? "#E05252" : "#C9A84C"}` }}>
                      {vendor.seller_status === "approved" ? "Aprobado" : vendor.seller_status === "rejected" ? "Rechazado" : "Pendiente"}
                    </span>
                    {vendor.blocked && <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.75rem", background: "#fdecea", color: "#c62828", border: "1px solid #E05252" }}>Bloqueado</span>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginLeft: "1rem" }}>
                  {vendor.seller_status === "pending" && (
                    <>
                      <form action={async () => { "use server"; await approveVendor(vendor.id) }}>
                        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, width: "100%" }}>
                          Aprobar
                        </button>
                      </form>
                      <form action={async () => { "use server"; await rejectVendor(vendor.id) }}>
                        <button type="submit" style={{ padding: "0.5rem 1rem", background: "#fff", color: "#E05252", border: "1px solid #E05252", cursor: "pointer", fontSize: "0.8rem", width: "100%" }}>
                          Rechazar
                        </button>
                      </form>
                    </>
                  )}
                  {vendor.seller_status === "approved" && (
                    <form action={async () => { "use server"; await rejectVendor(vendor.id) }}>
                      <button type="submit" style={{ padding: "0.5rem 1rem", background: "#fff", color: "#E05252", border: "1px solid #E05252", cursor: "pointer", fontSize: "0.8rem", width: "100%" }}>
                        Desactivar
                      </button>
                    </form>
                  )}
                  {vendor.seller_status === "rejected" && (
                    <form action={async () => { "use server"; await approveVendor(vendor.id) }}>
                      <button type="submit" style={{ padding: "0.5rem 1rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", width: "100%" }}>
                        Reactivar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
