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
    <div style={{ display: "flex", gap: "2px", marginBottom: "0.5rem" }}>
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= rating ? "#C9A84C" : "#e5e5e5"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: "0.65rem", color: "#aaa", marginLeft: "2px" }}>({rating}.0)</span>
    </div>
  )
}

export default function BuyerProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
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

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* BUSCADOR Y FILTROS — SIN TOCAR */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #eee", background: "#fff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..."
              style={{ flex: 1, padding: "0.625rem 1rem", border: "1px solid #ddd", borderRight: "none", fontSize: "0.875rem", outline: "none" }} />
            <div style={{ padding: "0.625rem 1rem", background: "#C9A84C", color: "#fff", fontSize: "0.875rem" }}>Buscar</div>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ padding: "0.625rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", background: "#fff", minWidth: "160px" }}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
            style={{ padding: "0.625rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", background: "#fff", minWidth: "200px" }}>
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
              const rating = product.rating ?? 4
              return (
                <div key={product.id}
                  style={{ border: "1px solid #f0f0f0", background: "#fff", cursor: "pointer", transition: "all 0.2s", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)" }}
                  onClick={() => router.push("/producto/" + product.id)}>

                  {/* IMAGEN */}
                  <div style={{ position: "relative", paddingBottom: "100%", background: "#f8f8f8", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={product.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p style={{ fontSize: "0.75rem", color: "#ccc" }}>Sin imagen</p>
                      </div>
                    )}

                    {/* BADGE */}
                    {product.badge && (
                      <div style={{
                        position: "absolute", top: "0.6rem", left: "0.6rem",
                        background: product.badge === "Lo más vendido" ? "#C9A84C" : "#EF4444",
                        color: "#fff", fontSize: "0.6rem", fontWeight: 700,
                        padding: "0.25rem 0.6rem", borderRadius: "999px", letterSpacing: "0.5px"
                      }}>
                        {product.badge}
                      </div>
                    )}

                    {/* DESCUENTO */}
                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", background: "#EF4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "999px" }}>
                        -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
                      </div>
                    )}

                    {/* USADO */}
                    {product.condition === "used" && (
                      <div style={{ position: "absolute", bottom: "0.6rem", left: "0.6rem", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.6rem", padding: "0.2rem 0.5rem", borderRadius: "999px" }}>Usado</div>
                    )}
                  </div>

                  {/* CONTENIDO */}
                  <div style={{ padding: "0.875rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontSize: "0.6rem", color: "#C9A84C", textTransform: "uppercase", marginBottom: "0.25rem", fontWeight: 700, letterSpacing: "1px" }}>{product.category}</p>
                    <p style={{ fontSize: "0.875rem", color: "#111", marginBottom: "0.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.5rem", fontWeight: 500, lineHeight: 1.4 }}>{product.name}</p>

                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <p style={{ fontSize: "0.75rem", color: "#bbb", textDecoration: "line-through" }}>${Number(product.original_price).toLocaleString("es-CO")}</p>
                    )}
                    <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111", marginBottom: "0.25rem" }}>${Number(product.price).toLocaleString("es-CO")}</p>

                    <Stars rating={rating} />

                    <button
                      onClick={(e) => { e.stopPropagation(); router.push("/producto/" + product.id) }}
                      style={{ width: "100%", padding: "0.625rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", borderRadius: "999px", letterSpacing: "0.05em", marginTop: "auto" }}>
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