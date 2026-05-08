import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { approveProduct, rejectProduct } from "@/lib/actions/products"

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: products } = await admin
    .from("products")
    .select("id, name, description, price, category, status, seller_id, created_at")
    .order("created_at", { ascending: false })

  const productIds = products?.map((p: any) => p.id) ?? []

  const { data: images } = productIds.length > 0 ? await admin
    .from("product_images")
    .select("product_id, url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true }) : { data: [] }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "2rem", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Administrador</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "#111" }}>Gestion de Productos</h1>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, border: "1px solid #eee", padding: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C" }}>{products?.filter((p: any) => p.status === "pending").length ?? 0}</p>
            <p style={{ fontSize: "0.75rem", color: "#888" }}>Pendientes</p>
          </div>
          <div style={{ flex: 1, border: "1px solid #eee", padding: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4CAF7D" }}>{products?.filter((p: any) => p.status === "approved").length ?? 0}</p>
            <p style={{ fontSize: "0.75rem", color: "#888" }}>Aprobados</p>
          </div>
          <div style={{ flex: 1, border: "1px solid #eee", padding: "1rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#E05252" }}>{products?.filter((p: any) => p.status === "rejected").length ?? 0}</p>
            <p style={{ fontSize: "0.75rem", color: "#888" }}>Rechazados</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!products || products.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>No hay productos.</p>
          ) : (
            products.map((product: any) => {
              const productImages = images?.filter((i: any) => i.product_id === product.id) ?? []
              const firstImage = productImages[0]?.url
              return (
                <div key={product.id} style={{ border: "1px solid #eee", padding: "1.25rem", display: "flex", gap: "1.25rem", alignItems: "flex-start", background: "#fff" }}>
                  <div style={{ width: "100px", height: "100px", flexShrink: 0, background: "#f5f5f5", border: "1px solid #eee", overflow: "hidden" }}>
                    {firstImage ? (
                      <img src={firstImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.25rem" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: "0.65rem", color: "#bbb" }}>Sin foto</p>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "0.25rem" }}>{product.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.1em" }}>{product.category}</p>
                      </div>
                      <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", background: product.status === "approved" ? "#e8f5e9" : product.status === "rejected" ? "#fdecea" : "#fff8e1", color: product.status === "approved" ? "#2e7d32" : product.status === "rejected" ? "#c62828" : "#f57f17", border: `1px solid ${product.status === "approved" ? "#4CAF7D" : product.status === "rejected" ? "#E05252" : "#C9A84C"}` }}>
                        {product.status === "approved" ? "Aprobado" : product.status === "rejected" ? "Rechazado" : "Pendiente"}
                      </span>
                    </div>

                    {product.description && (
                      <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.5rem", lineHeight: 1.5 }}>{product.description}</p>
                    )}

                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>${Number(product.price).toLocaleString("es-CO")} COP</p>

                    {productImages.length > 1 && (
                      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "0.75rem" }}>
                        {productImages.slice(1, 5).map((img: any, i: number) => (
                          <div key={i} style={{ width: "48px", height: "48px", background: "#f5f5f5", border: "1px solid #eee", overflow: "hidden" }}>
                            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {product.status === "pending" && (
                        <>
                          <form action={async () => { "use server"; await approveProduct(product.id) }}>
                            <button type="submit" style={{ padding: "0.5rem 1.25rem", background: "#4CAF7D", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>Aprobar</button>
                          </form>
                          <form action={async () => { "use server"; await rejectProduct(product.id) }}>
                            <button type="submit" style={{ padding: "0.5rem 1.25rem", background: "#fff", color: "#E05252", border: "1px solid #E05252", cursor: "pointer", fontSize: "0.8rem" }}>Rechazar</button>
                          </form>
                        </>
                      )}
                      {product.status === "approved" && (
                        <form action={async () => { "use server"; await rejectProduct(product.id) }}>
                          <button type="submit" style={{ padding: "0.5rem 1.25rem", background: "#fff", color: "#E05252", border: "1px solid #E05252", cursor: "pointer", fontSize: "0.8rem" }}>Desactivar</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
