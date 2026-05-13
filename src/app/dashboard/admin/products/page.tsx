'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminProductsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const role = user.user_metadata?.role ?? 'buyer'
      if (role !== 'admin') { router.push('/dashboard'); return }

      const { data: prods } = await supabase
        .from('products')
        .select('id, name, description, price, category, status, seller_id, created_at, badge, oferta_mes')
        .order('created_at', { ascending: false })

      const ids = prods?.map((p: any) => p.id) ?? []
      const { data: imgs } = ids.length > 0
        ? await supabase.from('product_images').select('product_id, url, position').in('product_id', ids).order('position', { ascending: true })
        : { data: [] }

      setProducts(prods ?? [])
      setImages(imgs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateProduct(id: string, fields: any) {
    setProcesando(id)
    await supabase.from('products').update(fields).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p))
    setProcesando(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#C9A84C' }}>Cargando productos...</p>
    </div>
  )

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #C9A84C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.25rem' }}>Administrador</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#111' }}>Gestion de Productos</h1>
          </div>
          <a href="/dashboard/admin" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}>← Volver</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, border: '1px solid #eee', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>{products.filter(p => p.status === 'pending').length}</p>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>Pendientes</p>
          </div>
          <div style={{ flex: 1, border: '1px solid #eee', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF7D' }}>{products.filter(p => p.status === 'approved').length}</p>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>Aprobados</p>
          </div>
          <div style={{ flex: 1, border: '1px solid #eee', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E05252' }}>{products.filter(p => p.status === 'rejected').length}</p>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>Rechazados</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No hay productos.</p>
          ) : products.map((product: any) => {
            const productImages = images.filter(i => i.product_id === product.id)
            const firstImage = productImages[0]?.url
            return (
              <div key={product.id} style={{ border: '1px solid #eee', padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: '#fff', borderRadius: '8px' }}>
                <div style={{ width: '100px', height: '100px', flexShrink: 0, background: '#f5f5f5', border: '1px solid #eee', overflow: 'hidden', borderRadius: '4px' }}>
                  {firstImage ? (
                    <img src={firstImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.65rem', color: '#bbb' }}>Sin foto</p>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.25rem' }}>{product.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: product.status === 'approved' ? '#e8f5e9' : product.status === 'rejected' ? '#fdecea' : '#fff8e1', color: product.status === 'approved' ? '#2e7d32' : product.status === 'rejected' ? '#c62828' : '#f57f17', border: `1px solid ${product.status === 'approved' ? '#4CAF7D' : product.status === 'rejected' ? '#E05252' : '#C9A84C'}`, borderRadius: '999px' }}>
                      {product.status === 'approved' ? 'Aprobado' : product.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>

                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>${Number(product.price).toLocaleString('es-CO')} COP</p>

                  {/* BOTONES ESTADO */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {product.status !== 'approved' && (
                      <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { status: 'approved' })}
                        style={{ padding: '0.4rem 1rem', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px' }}>
                        Aprobar
                      </button>
                    )}
                    {product.status !== 'rejected' && (
                      <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { status: 'rejected' })}
                        style={{ padding: '0.4rem 1rem', background: '#fff', color: '#E05252', border: '1px solid #E05252', cursor: 'pointer', fontSize: '0.75rem', borderRadius: '999px' }}>
                        {product.status === 'approved' ? 'Desactivar' : 'Rechazar'}
                      </button>
                    )}
                  </div>

                  {/* BADGES Y OFERTAS */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                    <button
                      disabled={procesando === product.id}
                      onClick={() => updateProduct(product.id, { badge: product.badge === 'Lo más vendido' ? null : 'Lo más vendido' })}
                      style={{ padding: '0.35rem 0.875rem', background: product.badge === 'Lo más vendido' ? '#C9A84C' : '#fff', color: product.badge === 'Lo más vendido' ? '#fff' : '#C9A84C', border: '1px solid #C9A84C', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: '999px' }}>
                      {product.badge === 'Lo más vendido' ? '✓ Lo más vendido' : '+ Lo más vendido'}
                    </button>
                    <button
                      disabled={procesando === product.id}
                      onClick={() => updateProduct(product.id, { badge: product.badge === 'Oferta' ? null : 'Oferta' })}
                      style={{ padding: '0.35rem 0.875rem', background: product.badge === 'Oferta' ? '#EF4444' : '#fff', color: product.badge === 'Oferta' ? '#fff' : '#EF4444', border: '1px solid #EF4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: '999px' }}>
                      {product.badge === 'Oferta' ? '✓ Oferta' : '+ Oferta'}
                    </button>
                    <button
                      disabled={procesando === product.id}
                      onClick={() => updateProduct(product.id, { oferta_mes: !product.oferta_mes })}
                      style={{ padding: '0.35rem 0.875rem', background: product.oferta_mes ? '#7C3AED' : '#fff', color: product.oferta_mes ? '#fff' : '#7C3AED', border: '1px solid #7C3AED', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: '999px' }}>
                      {product.oferta_mes ? '✓ Oferta del mes' : '+ Oferta del mes'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}