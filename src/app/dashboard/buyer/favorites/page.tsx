"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function FavoritesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const { data } = await supabase
        .from("favorites")
        .select("product_id, products(id, name, price, category), product_images(url)")
        .eq("user_id", user.id)
      setFavorites(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Mi cuenta</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>Mis <span style={{ color: "#D4AF37" }}>Favoritos</span></h1>
      </div>

      {loading ? (
        <p style={{ color: "#888" }}>Cargando...</p>
      ) : favorites.length === 0 ? (
        <div style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "3rem", textAlign: "center" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: "1rem" }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p style={{ color: "#555", fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes productos favoritos aun.</p>
          <button onClick={() => router.push("/dashboard/buyer/products")}
            style={{ padding: "0.75rem 1.5rem", background: "#D4AF37", color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
            Ver productos
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {favorites.map((fav: any) => (
            <div key={fav.product_id} onClick={() => router.push("/producto/" + fav.product_id)}
              style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: "180px", background: "#1a1a1a", overflow: "hidden" }}>
                {fav.product_images?.[0]?.url
                  ? <img src={fav.product_images[0].url} alt={fav.products?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                }
              </div>
              <div style={{ padding: "1rem" }}>
                <p style={{ fontSize: "0.65rem", color: "#D4AF37", textTransform: "uppercase", marginBottom: "0.25rem" }}>{fav.products?.category}</p>
                <p style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 500, marginBottom: "0.5rem" }}>{fav.products?.name}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#D4AF37" }}>${Number(fav.products?.price ?? 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
