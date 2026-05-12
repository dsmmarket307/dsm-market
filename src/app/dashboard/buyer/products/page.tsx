"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const categories = [
  "Todas","Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda",
  "Tecnologia","Cocina","Belleza","Salud","Hogar","Natural home",
  "Deportes","Bebe","Aseo","Bienestar","Herramientas","Pinateria",
  "Navidad","Halloween","Libros","Papeleria","Vehiculos","Otros"
]

const priceRanges = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $50.000", min: 0, max: 50000 },
  { label: "$50.000 - $150.000", min: 50000, max: 150000 },
  { label: "$150.000 - $500.000", min: 150000, max: 500000 },
  { label: "Mas de $500.000", min: 500000, max: Infinity },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map((s) => (
        <span key={s} style={{ color: s <= rating ? "#C9A84C" : "#ddd", fontSize: "0.875rem" }}>★</span>
      ))}
    </div>
  )
}

export default function BuyerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todas")
  const [priceRange, setPriceRange] = useState(0)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? [])
        setImages(data.images ?? [])
        setReviews(data.reviews ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const range = priceRanges[priceRange]

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === "Todas" || p.category === category
    const price = Number(p.price)
    const matchPrice = price >= range.min && price <= range.max
    return matchSearch && matchCategory && matchPrice
  })

  function getProductImage(productId: string) {
    return images.filter((i) => i.product_id === productId)[0]?.url
  }

  function getProductRating(productId: string) {
    const productReviews = reviews.filter((r) => r.product_id === productId)
    if (productReviews.length === 0) return { avg: 0, count: 0 }
    const avg = productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length
    return { avg: Math.round(avg), count: productReviews.length }
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>

      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #eee", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              style={{ flex: 1, padding: "0.625rem 1rem", border: "1px solid #ddd", borderRight: "none", fontSize: "0.875rem", outline: "none" }}
            />
            <div style={{ padding: "0.625rem 1rem", background: "#C9A84C", color: "#fff", fontSize: "0.875rem" }}>Buscar</div>
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "0.625rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", background: "#fff", minWidth: "160px" }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} style={{ padding: "0.625rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", background: "#fff", minWidth: "200px" }}>
            {priceRanges.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111" }}>
            {search || category !== "Todas" || priceRange !== 0 ? `${filtered.length} resultados` : "Productos disponibles"}
          </h2>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#888", padding: "3rem" }}>Cargando productos...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", border: "1px solid #eee" }}>
            <p style={{ color: "#888" }}>No se encontraron productos.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.25rem" }}>
            {filtered.map((product) => {
              const img = getProductImage(product.id)
              const { avg, count } = getProductRating(product.id)
              return (
                <div key={product.id} style={{ border: "1px solid #eee", background: "#fff", cursor: "pointer", transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                  onClick={() => router.push("/producto/" + product.id)}
                >
                  <div style={{ position: "relative", paddingBottom: "100%", background: "#f9f9f9", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={product.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", padding: "0.75rem" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: "0.75rem", color: "#bbb" }}>Sin imagen</p>
                      </div>
                    )}
                    {product.condition === "used" && (
                      <span style={{ position: "absolute", top: "8px", left: "8px", fontSize: "0.65rem", background: "#555", color: "#fff", padding: "0.2rem 0.5rem" }}>Usado</span>
                    )}
                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <span style={{ position: "absolute", top: "8px", right: "8px", fontSize: "0.65rem", background: "#E05252", color: "#fff", padding: "0.2rem 0.5rem" }}>
                        -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "0.875rem" }}>
                    <p style={{ fontSize: "0.65rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem", fontWeight: 600 }}>{product.category}</p>
                    <p style={{ fontSize: "0.875rem", color: "#111", marginBottom: "0.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.5rem", fontWeight: 500 }}>{product.name}</p>

                    <div style={{ marginBottom: "0.5rem" }}>
                      {product.original_price && Number(product.original_price) > Number(product.price) && (
                        <p style={{ fontSize: "0.75rem", color: "#bbb", textDecoration: "line-through" }}>${Number(product.original_price).toLocaleString("es-CO")}</p>
                      )}
                      <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111" }}>${Number(product.price).toLocaleString("es-CO")}</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <Stars rating={avg} />
                      <span style={{ fontSize: "0.7rem", color: "#888" }}>({count})</span>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); router.push("/producto/" + product.id) }}
                      style={{ width: "100%", padding: "0.625rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", borderRadius: "999px", letterSpacing: "0.05em" }}
                    >
                      Comprar ahora
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
