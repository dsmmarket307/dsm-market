"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function Stars({ rating, interactive, onRate }: any) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s}
          style={{ color: s <= (hover || rating) ? "#C9A84C" : "#ddd", fontSize: "1.25rem", cursor: interactive ? "pointer" : "default" }}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(s)}>★</span>
      ))}
    </div>
  )
}

export default function ProductDetail({ product, images, reviews: initialReviews, avgRating, user }: any) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [cartMsg, setCartMsg] = useState("")
  const [reviews, setReviews] = useState(initialReviews)
  const isAdmin = user?.user_metadata?.role === 'admin'

  function handleBuy() {
    sessionStorage.setItem('checkout_item', JSON.stringify({
      id: product.id, name: product.name, price: Number(product.price),
      quantity, image: images[0]?.url ?? null,
    }))
    router.push('/checkout')
  }

  async function handleAddToCart() {
    if (!user) { router.push("/auth/login"); return }
    const { data: existing } = await supabase.from("carts").select("quantity")
      .eq("buyer_id", user.id).eq("product_id", product.id).single()
    if (existing) {
      await supabase.from("carts").update({ quantity: existing.quantity + quantity })
        .eq("buyer_id", user.id).eq("product_id", product.id)
    } else {
      await supabase.from("carts").insert({ buyer_id: user.id, product_id: product.id, quantity })
    }
    setCartMsg("✓ Agregado al carrito")
    setTimeout(() => setCartMsg(""), 3000)
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setReviewError("Selecciona una calificación"); return }
    if (!reviewerName.trim()) { setReviewError("Escribe tu nombre"); return }
    setSubmitting(true)
    setReviewError("")
    try {
      const formData = new FormData()
      formData.append("product_id", product.id)
      formData.append("rating", String(rating))
      formData.append("comment", comment)
      formData.append("reviewer_name", reviewerName)
      if (reviewPhoto) formData.append("photo", reviewPhoto)
      const res = await fetch("/api/reviews", { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) { setReviewError(data.error); setSubmitting(false) }
      else { setReviewSuccess(true); setSubmitting(false) }
    } catch {
      setReviewError("Error al enviar la reseña. Intenta de nuevo.")
      setSubmitting(false)
    }
  }

  async function handleDeleteReview(id: string) {
    const res = await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.success) setReviews((prev: any[]) => prev.filter((r: any) => r.id !== id))
  }

  const discount = product.original_price && Number(product.original_price) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0

  const maxStock = product.stock ?? 10
  const productRating = product.rating ?? avgRating ?? 4
  const vendidos = product.vendidos ?? 0

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>

      <nav style={{ borderBottom: "2px solid #C9A84C", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontSize: "1.25rem", fontWeight: 700, color: "#C9A84C", textDecoration: "none" }}>DMS Market</a>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {user ? (
            <a href="/dashboard" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none", borderRadius: "999px" }}>Mi cuenta</a>
          ) : (
            <>
              <a href="/auth/login" style={{ fontSize: "0.875rem", color: "#111", textDecoration: "none", padding: "0.5rem 1rem" }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: "0.875rem", background: "#C9A84C", color: "#fff", padding: "0.5rem 1.25rem", textDecoration: "none", borderRadius: "999px" }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        <a href="javascript:history.back()" style={{ fontSize: "0.8rem", color: "#888", textDecoration: "none", display: "inline-block", marginBottom: "1.5rem" }}>← Volver</a>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>

          {/* IMAGENES */}
          <div>
            <div style={{ position: "relative", aspectRatio: "1", background: "#f9f9f9", border: "1px solid #eee", overflow: "hidden", marginBottom: "0.75rem", borderRadius: "12px" }}>
              {images.length > 0 ? (
                <img src={images[selectedImage]?.url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#bbb" }}>Sin imagen</p>
                </div>
              )}
              {product.badge && (
                <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: product.badge === "Lo más vendido" ? "#C9A84C" : "#EF4444", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "0.3rem 0.75rem", borderRadius: "999px" }}>
                  {product.badge}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                {images.map((img: any, i: number) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{ aspectRatio: "1", background: "#f9f9f9", border: `2px solid ${i === selectedImage ? "#C9A84C" : "#eee"}`, overflow: "hidden", cursor: "pointer", borderRadius: "6px" }}>
                    <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.25rem" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{product.category}</span>
              {product.condition === "used" && <span style={{ fontSize: "0.7rem", background: "#555", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>Usado</span>}
              {discount > 0 && <span style={{ fontSize: "0.7rem", background: "#E05252", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: "4px" }}>-{discount}% OFF</span>}
            </div>

            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#111", marginBottom: "1rem", lineHeight: 1.3 }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Stars rating={productRating} />
              <span style={{ fontSize: "0.8rem", color: "#888" }}>({reviews.length} reseñas)</span>
            </div>

            {vendidos > 0 && (
              <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "1rem", fontWeight: 500 }}>
                +{vendidos.toLocaleString("es-CO")} vendidos
              </p>
            )}

            <div style={{ marginBottom: "1.25rem" }}>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <p style={{ fontSize: "0.9rem", color: "#bbb", textDecoration: "line-through" }}>${Number(product.original_price).toLocaleString("es-CO")}</p>
              )}
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>${Number(product.price).toLocaleString("es-CO")} <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "#888" }}>COP</span></p>
            </div>

            {product.description && (
              <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, marginBottom: "1.25rem" }}>{product.description}</p>
            )}

            {product.stock > 0 && (
              <p style={{ fontSize: "0.8rem", color: "#4CAF7D", marginBottom: "1rem" }}>● {product.stock} unidades disponibles</p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#888" }}>Cantidad:</p>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "999px", overflow: "hidden" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: "0.4rem 0.9rem", background: "#f5f5f5", border: "none", cursor: "pointer", fontSize: "1rem", color: "#111" }}>−</button>
                <span style={{ padding: "0.4rem 1rem", fontSize: "0.9rem", fontWeight: 600, color: "#111" }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(maxStock, q + 1))} style={{ padding: "0.4rem 0.9rem", background: "#f5f5f5", border: "none", cursor: "pointer", fontSize: "1rem", color: "#111" }}>+</button>
              </div>
            </div>

            <div style={{ background: "#f9f9f9", border: "1px solid #eee", padding: "1rem", marginBottom: "1.25rem", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>Precio unitario</p>
                <p style={{ fontSize: "0.8rem", color: "#111" }}>${Number(product.price).toLocaleString("es-CO")}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>Cantidad</p>
                <p style={{ fontSize: "0.8rem", color: "#111" }}>{quantity}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>Envío</p>
                <p style={{ fontSize: "0.8rem", color: "#C9A84C" }}>A cargo del comprador</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>Total</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111" }}>${(Number(product.price) * quantity).toLocaleString("es-CO")}</p>
              </div>
            </div>

            {user ? (
              <>
                <button onClick={handleBuy} style={{ display: "block", width: "100%", background: "linear-gradient(135deg, #C9A84C 0%, #e8c96a 100%)", color: "#fff", padding: "1rem", textAlign: "center", border: "none", fontSize: "1rem", textTransform: "uppercase", fontWeight: 700, borderRadius: "999px", marginBottom: "0.75rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(201,168,76,0.4)", letterSpacing: "0.06em" }}>
                  🛒 Comprar ahora
                </button>
                <button onClick={handleAddToCart} style={{ display: "block", width: "100%", background: "#fff", color: "#C9A84C", padding: "0.875rem", textAlign: "center", border: "2px solid #C9A84C", fontSize: "0.875rem", textTransform: "uppercase", fontWeight: 700, borderRadius: "999px", marginBottom: "0.5rem", cursor: "pointer", letterSpacing: "0.06em" }}>
                  🛍️ Agregar al carrito
                </button>
                {cartMsg && <p style={{ fontSize: "0.8rem", color: "#4CAF7D", textAlign: "center", marginBottom: "0.5rem" }}>{cartMsg}</p>}
                <p style={{ fontSize: "0.72rem", color: "#aaa", textAlign: "center", marginBottom: "0.75rem" }}>
                  <a href="/carrito" style={{ color: "#C9A84C", textDecoration: "none" }}>Ver mi carrito</a>
                </p>
              </>
            ) : (
              <button onClick={() => router.push("/auth/login")} style={{ display: "block", width: "100%", background: "linear-gradient(135deg, #C9A84C 0%, #e8c96a 100%)", color: "#fff", padding: "1rem", textAlign: "center", border: "none", fontSize: "1rem", textTransform: "uppercase", fontWeight: 700, borderRadius: "999px", marginBottom: "0.75rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(201,168,76,0.4)", letterSpacing: "0.06em" }}>
                Ingresar para comprar
              </button>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.68rem", color: "#aaa", textAlign: "center", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Medios de pago aceptados</p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <div style={{ background: "#1a1f71", borderRadius: "6px", padding: "4px 10px" }}><span style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em" }}>VISA</span></div>
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center" }}>
                  <div style={{ width: "16px", height: "16px", background: "#EB001B", borderRadius: "50%" }} />
                  <div style={{ width: "16px", height: "16px", background: "#F79E1B", borderRadius: "50%", marginLeft: "-6px" }} />
                </div>
                <div style={{ background: "#009639", borderRadius: "6px", padding: "4px 10px" }}><span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800 }}>PSE</span></div>
                <div style={{ background: "#FFD100", borderRadius: "6px", padding: "4px 10px" }}><span style={{ color: "#000", fontSize: "0.72rem", fontWeight: 800 }}>efecty</span></div>
                <div style={{ background: "#6b0fa3", borderRadius: "6px", padding: "4px 10px" }}><span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800 }}>Nequi</span></div>
                <div style={{ background: "#CE0000", borderRadius: "6px", padding: "4px 10px" }}><span style={{ color: "#fff", fontSize: "0.72rem", fontWeight: 800 }}>Daviplata</span></div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.75rem", background: "#f0faf4", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
              <div style={{ width: "10px", height: "10px", background: "#4CAF7D", borderRadius: "50%" }} />
              <p style={{ fontSize: "0.75rem", color: "#2e7d32" }}>Pago protegido — DMS Market garantiza tu compra por 7 días</p>
            </div>
          </div>
        </div>

        {/* RESEÑAS */}
        <div style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111", marginBottom: "1.5rem" }}>Reseñas ({reviews.length})</h2>

          {user && !reviewSuccess && (
            <div style={{ border: "1px solid #eee", padding: "1.25rem", marginBottom: "1.5rem", borderRadius: "10px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111", marginBottom: "1rem" }}>Dejar una reseña</h3>
              <form onSubmit={handleReview}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>Tu nombre *</label>
                  <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="¿Cómo te llamas?" style={{ width: "100%", padding: "0.65rem 0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>Calificación *</label>
                  <Stars rating={rating} interactive onRate={setRating} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>Comentario (opcional)</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Cuéntanos tu experiencia con este producto..." style={{ width: "100%", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#888", marginBottom: "0.5rem" }}>Foto del producto (opcional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setReviewPhoto(e.target.files?.[0] ?? null)} style={{ fontSize: "0.8rem", color: "#555" }} />
                  {reviewPhoto && <img src={URL.createObjectURL(reviewPhoto)} alt="preview" style={{ marginTop: "0.5rem", width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #eee" }} />}
                </div>
                {reviewError && <p style={{ color: "#E05252", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{reviewError}</p>}
                <button type="submit" disabled={submitting} style={{ padding: "0.75rem 1.5rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, borderRadius: "999px" }}>
                  {submitting ? "Enviando..." : "Publicar reseña"}
                </button>
              </form>
            </div>
          )}

          {reviewSuccess && (
            <div style={{ padding: "1rem", background: "#e8f5e9", border: "1px solid #4CAF7D", marginBottom: "1.5rem", borderRadius: "8px" }}>
              <p style={{ color: "#2e7d32", fontSize: "0.875rem" }}>¡Gracias por tu reseña!</p>
            </div>
          )}

          {reviews.length === 0 ? (
            <p style={{ color: "#888", fontSize: "0.875rem" }}>Aún no hay reseñas para este producto.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ border: "1px solid #eee", padding: "1rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111", marginBottom: "0.25rem" }}>
                        {review.reviewer_name || review.profiles?.name || "Comprador verificado"}
                      </p>
                      <Stars rating={review.rating} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(review.created_at).toLocaleDateString("es-CO")}</p>
                      {isAdmin && (
                        <button onClick={() => handleDeleteReview(review.id)}
                          style={{ background: "none", border: "1px solid #EF4444", color: "#EF4444", fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "999px", cursor: "pointer" }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && <p style={{ fontSize: "0.875rem", color: "#555", marginTop: "0.5rem" }}>{review.comment}</p>}
                  {review.photo_url && <img src={review.photo_url} alt="foto reseña" style={{ marginTop: "0.75rem", width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #eee", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "3rem" }}>
        <span style={{ color: "#C9A84C", fontWeight: 700 }}>DMS Market</span>
        <p style={{ fontSize: "0.75rem", color: "#999" }}>2025 DMS Market. Colombia</p>
      </footer>
    </div>
  )
}