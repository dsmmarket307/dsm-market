import { createClient as createAdmin } from "@supabase/supabase-js"
import { notFound } from "next/navigation"

export default async function TiendaPage({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: profile } = await admin.from("profiles").select("*").eq("id", vendorId).single()
  if (!profile) notFound()

  const { data: products } = await admin.from("products").select("id, name, price, original_price, category, badge, envio_gratis, rating").eq("seller_id", vendorId).eq("status", "approved").order("created_at", { ascending: false })

  const productIds = products?.map((p: any) => p.id) ?? []
  const { data: images } = productIds.length > 0
    ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).order("position", { ascending: true })
    : { data: [] }

  const storeName = profile.store_name || profile.name || "Tienda"
  const storeDescription = profile.store_description || "Productos de calidad"
  const storeLogo = profile.store_logo_url
  const storePhone = profile.store_phone || profile.celular

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI', sans-serif" }}>

      <nav style={{ padding: "0 clamp(1rem, 4vw, 2.5rem)", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0B0B0B", zIndex: 50, boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <a href="/"><img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: "52px", width: "auto", objectFit: "contain" }} /></a>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <a href="/catalogo" style={{ fontSize: "0.8rem", color: "#D1D1D1", textDecoration: "none", padding: "0.5rem 0.75rem" }}>Catalogo</a>
          <a href="/auth/login" style={{ fontSize: "0.8rem", background: "#D4AF37", color: "#0B0B0B", padding: "0.6rem 1.25rem", textDecoration: "none", borderRadius: "8px", fontWeight: 700 }}>Ingresar</a>
        </div>
      </nav>

      <div style={{ background: "#0B0B0B", borderBottom: "1px solid rgba(212,175,55,.15)", padding: "3rem clamp(1rem, 4vw, 2.5rem)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#D4AF37", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "3px solid rgba(212,175,55,.3)" }}>
            {storeLogo
              ? <img src={storeLogo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={storeName} />
              : <span style={{ color: "#0B0B0B", fontWeight: 700, fontSize: 36 }}>{storeName.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", color: "#D4AF37", marginBottom: 4 }}>Tienda verificada · DMS Market</p>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{storeName}</h1>
            <p style={{ fontSize: "0.9rem", color: "#888", margin: "0 0 8px" }}>{storeDescription}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#999" }}>{products?.length ?? 0} productos</span>
              {storePhone && <span style={{ fontSize: "0.8rem", color: "#D4AF37" }}>Tel: {storePhone}</span>}
              <span style={{ fontSize: "0.75rem", padding: "3px 10px", background: "rgba(29,158,117,.1)", color: "#1D9E75", borderRadius: 999, fontWeight: 600 }}>Vendedor verificado</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem clamp(1rem, 4vw, 2rem)" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: 2, textTransform: "uppercase", color: "#D4AF37", marginBottom: 16, fontWeight: 600 }}>Productos de la tienda</p>

        {!products || products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#888" }}>
            <p>Esta tienda aun no tiene productos publicados.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" }}>
            {products.map((product: any) => {
              const img = images?.find((i: any) => i.product_id === product.id)?.url
              const discount = product.original_price && Number(product.original_price) > Number(product.price)
                ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0
              return (
                <a key={product.id} href={`/producto/${product.id}`} style={{ textDecoration: "none", color: "#111", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "16px", overflow: "hidden", transition: "all 0.3s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ position: "relative", paddingBottom: "100%", background: "#f8f8f8", overflow: "hidden" }}>
                    {img
                      ? <img src={img} alt={product.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </div>
                    }
                    {discount > 0 && <div style={{ position: "absolute", top: "0.6rem", left: "0.6rem", background: "#EF4444", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "999px" }}>-{discount}%</div>}
                    {product.envio_gratis && <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", background: "#16a34a", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "999px" }}>Envio gratis</div>}
                  </div>
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={{ fontSize: "0.6rem", color: "#D4AF37", textTransform: "uppercase", marginBottom: "0.25rem", fontWeight: 700, letterSpacing: "1px" }}>{product.category}</p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.5rem", color: "#111", lineHeight: 1.4, fontWeight: 500 }}>{product.name}</p>
                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <p style={{ fontSize: "0.75rem", color: "#bbb", textDecoration: "line-through", marginBottom: "0.1rem" }}>${Number(product.original_price).toLocaleString("es-CO")}</p>
                    )}
                    <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0B0B0B", marginBottom: "0.75rem" }}>${Number(product.price).toLocaleString("es-CO")}</p>
                    <div style={{ background: "#D4AF37", color: "#0B0B0B", padding: "0.6rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, borderRadius: "8px", marginTop: "auto" }}>Ver producto</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      <footer style={{ background: "#0B0B0B", borderTop: "1px solid rgba(212,175,55,.15)", marginTop: "4rem", padding: "2rem clamp(1rem, 4vw, 2.5rem)", textAlign: "center" }}>
        <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: "50px", objectFit: "contain", marginBottom: "1rem" }} />
        <p style={{ fontSize: "0.75rem", color: "#444" }}>2025 DMS Market · Colombia · Todos los derechos reservados</p>
        <a href="/" style={{ fontSize: "0.8rem", color: "#D4AF37", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}>Ver todos los productos →</a>
      </footer>
    </div>
  )
}