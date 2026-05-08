import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export default async function ProductoPage({ params }: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: product } = await admin
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("status", "approved")
    .single()

  if (!product) redirect("/")

  const { data: images } = await admin
    .from("product_images")
    .select("url, position")
    .eq("product_id", params.id)
    .order("position", { ascending: true })

  const platformFee = Number(product.price) * 0.05
  const total = Number(product.price)

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>

      <nav style={{ borderBottom: "2px solid #C9A84C", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none" }}>DMS Market</a>
        {user ? (
          <a href="/dashboard" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none" }}>Mi cuenta</a>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="/auth/login" style={{ fontSize: "0.875rem", color: "#111", textDecoration: "none", padding: "0.5rem 1rem" }}>Ingresar</a>
            <a href="/auth/register" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none" }}>Registrarse</a>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <a href="/" style={{ fontSize: "0.8rem", color: "#888", textDecoration: "none" }}>← Volver a productos</a>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginTop: "2rem" }}>

          <div>
            <div style={{ aspectRatio: "1", background: "#f5f5f5", border: "1px solid #eee", overflow: "hidden", marginBottom: "1rem" }}>
              {images && images.length > 0 ? (
                <img src={images[0].url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#bbb", fontSize: "0.875rem" }}>Sin imagen</p>
                </div>
              )}
            </div>
            {images && images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {images.map((img: any, i: number) => (
                  <div key={i} style={{ aspectRatio: "1", background: "#f5f5f5", border: "1px solid #eee", overflow: "hidden" }}>
                    <img src={img.url} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.25rem" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p style={{ fontSize: "0.7rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem", fontWeight: 600 }}>{product.category}</p>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 400, color: "#111", marginBottom: "1rem", lineHeight: 1.2 }}>{product.name}</h1>

            {product.description && (
              <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, marginBottom: "1.5rem" }}>{product.description}</p>
            )}

            <div style={{ borderTop: "1px solid #eee", borderBottom: "1px solid #eee", padding: "1.25rem 0", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>${Number(product.price).toLocaleString("es-CO")} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#888" }}>COP</span></p>
            </div>

            <div style={{ background: "#f9f9f9", border: "1px solid #eee", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>Precio del producto</p>
                <p style={{ fontSize: "0.8rem", color: "#111" }}>${Number(product.price).toLocaleString("es-CO")}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>Envio</p>
                <p style={{ fontSize: "0.8rem", color: "#C9A84C" }}>A cargo del comprador</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111" }}>Total</p>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111" }}>${total.toLocaleString("es-CO")}</p>
              </div>
            </div>

            {user ? (
              <a href={`/checkout?product=${product.id}`} style={{ display: "block", background: "#C9A84C", color: "#fff", padding: "1rem", textAlign: "center", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "0.75rem" }}>
                Comprar ahora
              </a>
            ) : (
              <a href="/auth/login" style={{ display: "block", background: "#C9A84C", color: "#fff", padding: "1rem", textAlign: "center", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "0.75rem" }}>
                Ingresar para comprar
              </a>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <div style={{ width: "16px", height: "16px", background: "#4CAF7D", borderRadius: "50%", flexShrink: 0 }} />
              <p style={{ fontSize: "0.75rem", color: "#555" }}>Pago protegido — DMS Market garantiza tu compra por 7 dias</p>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #eee", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4rem" }}>
        <span style={{ color: "#C9A84C", fontWeight: 700 }}>DMS Market</span>
        <p style={{ fontSize: "0.75rem", color: "#999" }}>2025 DMS Market. Colombia</p>
      </footer>
    </div>
  )
}
