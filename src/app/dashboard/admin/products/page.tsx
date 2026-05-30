'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark: { bg: '#0f0f0f', bg2: '#1a1a1a', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', gold: '#D4AF37', inputBg: '#1a1a1a', inputBorder: 'rgba(255,255,255,0.1)' },
  light: { bg: '#f5f5f5', bg2: '#e8e8e8', text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.1)', gold: '#B8960C', inputBg: '#ffffff', inputBorder: 'rgba(0,0,0,0.2)' },
}

export default function AdminProductsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const T = THEMES[theme]
  const [products, setProducts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [vendidosEdit, setVendidosEdit] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const role = user.user_metadata?.role ?? 'buyer'
      if (role !== 'admin') { router.push('/dashboard'); return }
      const { data: prods } = await supabase.from('products').select('id, name, description, price, category, status, seller_id, created_at, badge, oferta_mes, rating, vendidos').order('created_at', { ascending: false })
      const ids = prods?.map((p: any) => p.id) ?? []
      const { data: imgs } = ids.length > 0 ? await supabase.from('product_images').select('product_id, url, position').in('product_id', ids).order('position', { ascending: true }) : { data: [] }
      setProducts(prods ?? [])
      setImages(imgs ?? [])
      const initialVendidos: Record<string, string> = {}
      prods?.forEach((p: any) => { initialVendidos[p.id] = String(p.vendidos ?? 0) })
      setVendidosEdit(initialVendidos)
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

  async function saveVendidos(id: string) {
    const val = parseInt(vendidosEdit[id] ?? '0')
    if (isNaN(val)) return
    await updateProduct(id, { vendidos: val })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: T.gold }}>Cargando productos...</p>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `2px solid ${T.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.gold, marginBottom: '0.25rem' }}>Administrador</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: T.text }}>Gestion de Productos</h1>
          </div>
          <a href="/dashboard/admin" style={{ fontSize: '0.8rem', color: T.text2, textDecoration: 'none' }}>Volver</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pendientes', value: products.filter(p => p.status === 'pending').length, color: T.gold },
            { label: 'Aprobados', value: products.filter(p => p.status === 'approved').length, color: '#4CAF7D' },
            { label: 'Rechazados', value: products.filter(p => p.status === 'rejected').length, color: '#E05252' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, border: `1px solid ${T.border}`, padding: '1rem', textAlign: 'center', background: T.bg2, borderRadius: 8 }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: T.text2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.length === 0 ? (
            <p style={{ color: T.text2, textAlign: 'center', padding: '2rem' }}>No hay productos.</p>
          ) : products.map(product => {
            const firstImage = images.filter(i => i.product_id === product.id)[0]?.url
            return (
              <div key={product.id} style={{ border: `1px solid ${T.border}`, padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: T.bg, borderRadius: 8 }}>
                <div style={{ width: 100, height: 100, flexShrink: 0, background: T.bg2, border: `1px solid ${T.border}`, overflow: 'hidden', borderRadius: 4 }}>
                  {firstImage ? (
                    <img src={firstImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.65rem', color: T.text2 }}>Sin foto</p>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: T.text, marginBottom: '0.25rem' }}>{product.name}</p>
                      <p style={{ fontSize: '0.75rem', color: T.gold, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: product.status === 'approved' ? '#e8f5e9' : product.status === 'rejected' ? '#fdecea' : '#fff8e1', color: product.status === 'approved' ? '#2e7d32' : product.status === 'rejected' ? '#c62828' : '#f57f17', border: `1px solid ${product.status === 'approved' ? '#4CAF7D' : product.status === 'rejected' ? '#E05252' : '#C9A84C'}`, borderRadius: 999 }}>
                      {product.status === 'approved' ? 'Aprobado' : product.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </span>
                  </div>

                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: T.text, marginBottom: '0.75rem' }}>${Number(product.price).toLocaleString('es-CO')} COP</p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {product.status !== 'approved' && (
                      <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { status: 'approved' })}
                        style={{ padding: '0.4rem 1rem', background: '#4CAF7D', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, borderRadius: 999 }}>
                        Aprobar
                      </button>
                    )}
                    {product.status !== 'rejected' && (
                      <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { status: 'rejected' })}
                        style={{ padding: '0.4rem 1rem', background: 'transparent', color: '#E05252', border: '1px solid #E05252', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 999 }}>
                        {product.status === 'approved' ? 'Desactivar' : 'Rechazar'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: `1px solid ${T.border}` }}>
                    <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { badge: product.badge === 'Lo más vendido' ? null : 'Lo más vendido' })}
                      style={{ padding: '0.35rem 0.875rem', background: product.badge === 'Lo más vendido' ? '#C9A84C' : T.bg2, color: product.badge === 'Lo más vendido' ? '#fff' : '#C9A84C', border: '1px solid #C9A84C', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: 999 }}>
                      {product.badge === 'Lo más vendido' ? 'Lo mas vendido' : '+ Lo mas vendido'}
                    </button>
                    <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { badge: product.badge === 'Oferta' ? null : 'Oferta' })}
                      style={{ padding: '0.35rem 0.875rem', background: product.badge === 'Oferta' ? '#EF4444' : T.bg2, color: product.badge === 'Oferta' ? '#fff' : '#EF4444', border: '1px solid #EF4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: 999 }}>
                      {product.badge === 'Oferta' ? 'Oferta' : '+ Oferta'}
                    </button>
                    <button disabled={procesando === product.id} onClick={() => updateProduct(product.id, { oferta_mes: !product.oferta_mes })}
                      style={{ padding: '0.35rem 0.875rem', background: product.oferta_mes ? '#7C3AED' : T.bg2, color: product.oferta_mes ? '#fff' : '#7C3AED', border: '1px solid #7C3AED', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, borderRadius: 999 }}>
                      {product.oferta_mes ? 'Oferta del mes' : '+ Oferta del mes'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: T.text2 }}>Estrellas:</span>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} disabled={procesando === product.id} onClick={() => updateProduct(product.id, { rating: star })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={star <= (product.rating ?? 4) ? '#C9A84C' : T.bg2}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: T.gold, fontWeight: 700 }}>{product.rating ?? 4}.0</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: '0.7rem', color: T.text2 }}>Vendidos:</span>
                    <input type="number" min="0" value={vendidosEdit[product.id] ?? '0'}
                      onChange={e => setVendidosEdit(prev => ({ ...prev, [product.id]: e.target.value }))}
                      style={{ width: 80, padding: '0.3rem 0.5rem', border: `1px solid ${T.inputBorder}`, borderRadius: 6, fontSize: '0.8rem', outline: 'none', background: T.inputBg, color: T.text }} />
                    <button onClick={() => saveVendidos(product.id)} disabled={procesando === product.id}
                      style={{ padding: '0.3rem 0.75rem', background: T.bg2, color: T.text, border: `1px solid ${T.border}`, borderRadius: 999, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>
                      Guardar
                    </button>
                    <span style={{ fontSize: '0.7rem', color: T.text2 }}>actual: {product.vendidos ?? 0}</span>
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.border}` }}>
                    <a href={`/producto/${product.id}`} target="_blank" style={{ fontSize: '0.7rem', color: T.gold, textDecoration: 'none', fontWeight: 600 }}>
                      Ver producto y eliminar resenas
                    </a>
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
