import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function BuyerProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: products } = await admin
    .from("products")
    .select("id, name, description, price, category, seller_id")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const productIds = products?.map((p) => p.id) ?? []

  const { data: images } = productIds.length > 0 ? await admin
    .from("product_images")
    .select("product_id, url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true }) : { data: [] }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
            Tienda
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111' }}>
            Productos disponibles
          </h1>
        </div>

        {!products || products.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.875rem' }}>No hay productos disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {products.map((product) => {
              const firstImage = images?.filter((img) => img.product_id === product.id)[0]?.url

              return (
                <Link
                  key={product.id}
                  href={`/producto/detalle?id=${product.id}`}
                  style={{ textDecoration: 'none', color: '#111', display: 'flex', flexDirection: 'column', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}
                >
                  <div style={{ position: 'relative', paddingBottom: '100%', background: '#f5f5f5', overflow: 'hidden' }}>
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: '#bbb' }}>Sin imagen</p>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: '0.65rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.375rem' }}>
                      {product.category}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#111', marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.5rem' }}>
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>
                        ${Number(product.price).toLocaleString("es-CO")}
                      </p>
                      <span style={{ background: '#C9A84C', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.375rem 0.875rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Ver
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}