"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/lib/theme-context"

const THEMES = {
  dark:  { bg: '#0f0f0f', card: '#151515', card2: '#1a1a1a', text: '#ffffff', text2: '#999999', text3: '#555555', border: 'rgba(255,255,255,0.06)', gold: '#D4AF37' },
  light: { bg: '#f5f5f5', card: '#ffffff', card2: '#e8e8e8', text: '#111111', text2: '#666666', text3: '#999999', border: 'rgba(0,0,0,0.1)', gold: '#B8960C' },
}

export default function FavoritesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const t = THEMES[theme]

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
    <div style={{ padding: "2rem", fontFamily: "'Poppins', sans-serif", background: t.bg, minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: t.gold, marginBottom: "0.25rem" }}>Mi cuenta</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: t.text, margin: 0 }}>Mis <span style={{ color: t.gold }}>Favoritos</span></h1>
      </div>

      {loading ? (
        <p style={{ color: t.text2 }}>Cargando...</p>
      ) : favorites.length === 0 ? (
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "3rem", textAlign: "center" }}>
          <p style={{ color: t.text3, fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes productos favoritos aun.</p>
          <button onClick={() => router.push("/dashboard/buyer/products")}
            style={{ padding: "0.75rem 1.5rem", background: t.gold, color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
            Ver productos
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {favorites.map((p: any) => (
            <div key={p.id} onClick={() => router.push("/producto/" + p.id)}
              style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", overflow: "hidden", cursor: "pointer" }}>
              <div style={{ height: "180px", background: t.card2, overflow: "hidden" }}>
                {p.image
                  ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                }
              </div>
              <div style={{ padding: "1rem" }}>
                <p style={{ fontSize: "0.65rem", color: t.gold, textTransform: "uppercase", marginBottom: "0.25rem" }}>{p.category}</p>
                <p style={{ fontSize: "0.875rem", color: t.text, fontWeight: 500, marginBottom: "0.5rem" }}>{p.name}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: t.gold }}>${Number(p.price ?? 0).toLocaleString("es-CO")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
