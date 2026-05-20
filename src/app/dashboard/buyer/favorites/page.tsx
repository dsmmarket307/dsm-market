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

      const { data: favs } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id)

      if (!favs || favs.length === 0) { setLoading(false); return }

      const ids = favs.map((f: any) => f.product_id)

      const { data: products } = await supabase
        .from("products")
        .select("id, name, price, category")
        .in("id", ids)

      const { data: images } = await supabase
        .from("product_images")
        .select("product_id, url")
        .in("product_id", ids)
        .order("position")

      const merged = (products ?? []).map((p: any) => ({
        ...p,
        image: (images ?? []).find((i: any) => i.product_id === p.id)?.url ?? null
      }))

      setFavorites(merged)
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
          <p style={{ color: "#555", fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes productos favoritos aun.</p>
          <button onClick={() => router.push("/dashboard/buyer/products")}
            style={{ padding: "0.75rem 1.5rem", background: "#D4AF37", color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
            Ver productos
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {favorites.map((p: any) => (
            <div key={p.id} onClick={() => router.push("/producto/" + p.id)}
              style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: "180px", background: "#1a1a1a", overflow: "hidden" }}>
                {p.image
                  ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                }
              </div>
              <div style={{ padding: "1rem" }}>
                <p style={{ fontSize: "0.65rem", color: "#D4AF37", textTransform: "uppercase", marginBottom: "0.25rem" }}>{p.category}</p>
                <p style={{ fontSize: "0.875rem", color: "#fff", fontWeight: 500, marginBottom: "0.5rem" }}>{p.name}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#D4AF37" }}>${Number(p.price ?? 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
