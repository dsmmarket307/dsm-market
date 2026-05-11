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

  const { data: reviews } = await admin
    .from("reviews")
    .select("*")
    .eq("product_id", params.id)
    .order("created_at", { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : null

  const total = Number(product.price)

  return (
    <div style={{ background: "#fafaf8", minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* NAV — sin tocar lógica */}
      <nav style={{ borderBottom: "2px solid #C9A84C", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none", letterSpacing: "0.05em" }}>DMS Market</a>
        {user ? (
          <a href="/dashboard" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none", borderRadius: "999px" }}>Mi cuenta</a>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <a href="/auth/login" style={{ fontSize: "0.875rem", color: "#111", textDecoration: "none", padding: "0.5rem 1rem" }}>Ingresar</a>
            <a href="/auth/register" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none", borderRadius: "999px" }}>Registrarse</a>
          </div>
        )}
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>

        {/* BREADCRUMB */}
        <a href="/" style={{ fontSize: "0.8rem", color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          ← Volver a productos
        </a>

        {/* GRID PRINCIPAL */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", marginTop: "2rem" }}>

          {/* COLUMNA IZQUIERDA — Imágenes */}
          <div>
            <div style={{
              aspectRatio: "1",
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "1rem",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)"
            }}>
              {images && images.length > 0 ? (
                <img
                  src={images[0].url}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1.5rem" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#bbb", fontSize: "0.875rem" }}>Sin imagen</p>
                </div>
              )}
            </div>

            {images && images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {images.map((img: any, i: number) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    background: "#fff",
                    border: "1px solid #e8e2d6",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer"
                  }}>
                    <img src={img.url} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.25rem" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA — Info */}
          <div>

            {/* CATEGORÍA */}
            <p style={{
              fontSize: "0.7rem",
              color: "#C9A84C",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
              fontWeight: 600,
              fontFamily: "sans-serif"
            }}>{product.category}</p>

            {/* NOMBRE */}
            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "0.75rem",
              lineHeight: 1.25
            }}>{product.name}</h1>

            {/* ESTRELLAS PROMEDIO */}
            {avgRating !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= Math.round(avgRating) ? "#C9A84C" : "#ddd"}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: "0.8rem", color: "#888", fontFamily: "sans-serif" }}>
                  {avgRating.toFixed(1)} · {reviews?.length} reseña{reviews?.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* CONDICIÓN Y STOCK */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {product.condition && (
                <span style={{
                  fontSize: "0.72rem",
                  fontFamily: "sans-serif",
                  fontWeight: 600,
                  background: product.condition === "nuevo" ? "#e8f5e9" : "#fff8e1",
                  color: product.condition === "nuevo" ? "#2e7d32" : "#f57f17",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  textTransform: "capitalize"
                }}>
                  {product.condition === "nuevo" ? "✓ Nuevo" : `Condición: ${product.condition}`}
                </span>
              )}
              {product.stock !== undefined && product.stock !== null && (
                <span style={{
                  fontSize: "0.72rem",
                  fontFamily: "sans-serif",
                  fontWeight: 600,
                  background: product.stock > 5 ? "#e3f2fd" : "#fce4ec",
                  color: product.stock > 5 ? "#1565c0" : "#c62828",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px"
                }}>
                  {product.stock > 5 ? `${product.stock} disponibles` : product.stock === 0 ? "Sin stock" : `¡Solo ${product.stock} disponibles!`}
                </span>
              )}
            </div>

            {/* PRECIO */}
            <div style={{ borderTop: "1px solid #e8e2d6", borderBottom: "1px solid #e8e2d6", padding: "1.25rem 0", marginBottom: "1.5rem" }}>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <p style={{ fontSize: "0.95rem", color: "#aaa", textDecoration: "line-through", marginBottom: "0.2rem", fontFamily: "sans-serif" }}>
                  ${Number(product.original_price).toLocaleString("es-CO")} COP
                </p>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                <p style={{ fontSize: "2.25rem", fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>
                  ${Number(product.price).toLocaleString("es-CO")}
                </p>
                <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#888", fontFamily: "sans-serif" }}>COP</span>
                {product.original_price && Number(product.original_price) > Number(product.price) && (
                  <span style={{
                    fontSize: "0.75rem",
                    background: "#C9A84C",
                    color: "#fff",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "999px",
                    fontFamily: "sans-serif",
                    fontWeight: 600
                  }}>
                    {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* RESUMEN DE PAGO */}
            <div style={{ background: "#fff", border: "1px solid #e8e2d6", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888", fontFamily: "sans-serif" }}>Precio del producto</p>
                <p style={{ fontSize: "0.8rem", color: "#111", fontFamily: "sans-serif" }}>${Number(product.price).toLocaleString("es-CO")}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888", fontFamily: "sans-serif" }}>Envío</p>
                <p style={{ fontSize: "0.8rem", color: "#C9A84C", fontFamily: "sans-serif" }}>A cargo del comprador</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111", fontFamily: "sans-serif" }}>Total</p>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111", fontFamily: "sans-serif" }}>${total.toLocaleString("es-CO")} COP</p>
              </div>
            </div>

            {/* BOTÓN COMPRAR — redondeado y profesional */}
            {user ? (
              <a href={`/checkout?product=${product.id}`} style={{
                display: "block",
                background: "linear-gradient(135deg, #C9A84C 0%, #e8c96a 100%)",
                color: "#fff",
                padding: "1rem 2rem",
                textAlign: "center",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: "999px",
                letterSpacing: "0.06em",
                marginBottom: "0.75rem",
                boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                fontFamily: "sans-serif",
                transition: "transform 0.15s, box-shadow 0.15s"
              }}>
                🛒 Comprar ahora
              </a>
            ) : (
              <a href="/auth/login" style={{
                display: "block",
                background: "linear-gradient(135deg, #C9A84C 0%, #e8c96a 100%)",
                color: "#fff",
                padding: "1rem 2rem",
                textAlign: "center",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: "999px",
                letterSpacing: "0.06em",
                marginBottom: "0.75rem",
                boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
                fontFamily: "sans-serif"
              }}>
                Ingresar para comprar
              </a>
            )}

            {/* MÉTODOS DE PAGO */}
            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.7rem", color: "#aaa", textAlign: "center", marginBottom: "0.5rem", fontFamily: "sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Medios de pago aceptados</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                {/* Visa */}
                <div style={{ background: "#1a1f71", borderRadius: "6px", padding: "4px 10px", display: "flex", alignItems: "center" }}>
                  <span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "0.05em" }}>VISA</span>
                </div>
                {/* Mastercard */}
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "3px" }}>
                  <div style={{ width: "16px", height: "16px", background: "#EB001B", borderRadius: "50%" }} />
                  <div style={{ width: "16px", height: "16px", background: "#F79E1B", borderRadius: "50%", marginLeft: "-6px" }} />
                </div>
                {/* PSE */}
                <div style={{ background: "#009639", borderRadius: "6px", padding: "4px 10px" }}>
                  <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800, fontFamily: "sans-serif" }}>PSE</span>
                </div>
                {/* Efecty */}
                <div style={{ background: "#FFD100", borderRadius: "6px", padding: "4px 10px" }}>
                  <span style={{ color: "#000", fontSize: "0.72rem", fontWeight: 800, fontFamily: "sans-serif" }}>efecty</span>
                </div>
                {/* Nequi */}
                <div style={{ background: "#6b0fa3", borderRadius: "6px", padding: "4px 10px" }}>
                  <span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800, fontFamily: "sans-serif" }}>Nequi</span>
                </div>
              </div>
            </div>

            {/* GARANTÍA */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.75rem", background: "#f0faf4", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
              <div style={{ width: "16px", height: "16px", background: "#4CAF7D", borderRadius: "50%", flexShrink: 0 }} />
              <p style={{ fontSize: "0.75rem", color: "#2e7d32", fontFamily: "sans-serif" }}>Pago protegido — DMS Market garantiza tu compra por 7 días</p>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN DETALLADA */}
        {product.description && (
          <div style={{ marginTop: "3.5rem", borderTop: "2px solid #e8e2d6", paddingTop: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.25rem", letterSpacing: "0.02em" }}>
              Descripción del producto
            </h2>
            <div style={{
              background: "#fff",
              border: "1px solid #e8e2d6",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
            }}>
              {product.description.split("\n").filter(Boolean).map((parrafo: string, i: number) => (
                <p key={i} style={{
                  fontSize: "0.95rem",
                  color: "#444",
                  lineHeight: 1.85,
                  marginBottom: "1rem",
                  fontFamily: "sans-serif"
                }}>
                  {parrafo}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN DE RESEÑAS */}
        <div style={{ marginTop: "3.5rem", borderTop: "2px solid #e8e2d6", paddingTop: "2.5rem", marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.02em" }}>
              Reseñas de compradores
            </h2>
            {avgRating !== null && (
              <span style={{ fontSize: "0.85rem", color: "#888", fontFamily: "sans-serif" }}>
                {avgRating.toFixed(1)} / 5 · {reviews?.length} reseña{reviews?.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{
                  background: "#fff",
                  border: "1px solid #e8e2d6",
                  borderRadius: "12px",
                  padding: "1.25rem 1.5rem",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                    <div>
                      <div style={{ display: "flex", gap: "2px", marginBottom: "0.35rem" }}>
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= review.rating ? "#C9A84C" : "#ddd"}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333", fontFamily: "sans-serif" }}>
                        {review.buyer_name || "Comprador verificado"}
                      </p>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "#aaa", fontFamily: "sans-serif" }}>
                      {new Date(review.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, fontFamily: "sans-serif" }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: "#fff",
              border: "1px dashed #ddd",
              borderRadius: "12px",
              padding: "2.5rem",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⭐</p>
              <p style={{ fontSize: "0.9rem", color: "#888", fontFamily: "sans-serif" }}>Aún no hay reseñas para este producto.</p>
              <p style={{ fontSize: "0.8rem", color: "#bbb", fontFamily: "sans-serif", marginTop: "0.25rem" }}>¡Sé el primero en comprar y dejar tu opinión!</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER — sin tocar */}
      <footer style={{ borderTop: "1px solid #eee", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <span style={{ color: "#C9A84C", fontWeight: 700, fontFamily: "sans-serif" }}>DMS Market</span>
        <p style={{ fontSize: "0.75rem", color: "#999", fontFamily: "sans-serif" }}>2025 DMS Market. Colombia</p>
      </footer>
    </div>
  )
}