'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function ProductContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [seller, setSeller] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: p } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(p)
      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('position')
      setImages(imgs ?? [])
      if (p?.seller_id) {
        const { data: s } = await supabase.from('profiles').select('*').eq('id', p.seller_id).single()
        setSeller(s)
      }
      const { data: r } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
      setReviews(r ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const variantes = (() => {
    try {
      if (!product?.variantes) return []
      if (typeof product.variantes === 'string') return JSON.parse(product.variantes)
      return product.variantes
    } catch { return [] }
  })()

  const todasSeleccionadas = variantes.length === 0 || variantes.every((v: any) => variantesSeleccionadas[v.nombre])

  async function handleAddToCart() {
    if (!todasSeleccionadas) return
    setAdding(true)
    if (!user) { router.push('/auth/login'); return }
    await supabase.from('carts').upsert({ buyer_id: user.id, product_id: product.id, quantity }, { onConflict: 'buyer_id,product_id' })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    setAdding(false)
  }

  function handleBuyNow() {
    if (!product || !todasSeleccionadas) return
    const variantesStr = Object.entries(variantesSeleccionadas).map(([k, v]) => k + ':' + v).join('|')
    window.location.href = '/checkout?id=' + product.id + '&qty=' + quantity + (variantesStr ? '&variantes=' + encodeURIComponent(variantesStr) : '')
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    setSubmittingReview(true)
    await supabase.from('reviews').insert({ product_id: product.id, buyer_id: user.id, rating: reviewRating, comment: reviewText })
    setReviewSuccess(true)
    setReviewText('')
    setSubmittingReview(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#D4AF37', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#888' }}>Producto no encontrado</p>
    </div>
  )

  const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price)
  const formattedOriginal = product.original_price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.original_price) : null
  const discount = product.original_price && Number(product.original_price) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0
  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : product.rating || 4

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>

      <nav style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 50, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <a href="/"><img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} /></a>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Catalogo</a>
          <a href="/servicios" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Servicios</a>
          {user
            ? <a href="/dashboard" style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Mi cuenta</a>
            : <a href="/auth/login" style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Ingresar</a>
          }
        </div>
      </nav>

      <div style={{ background: '#f8f8f8', padding: '0.75rem clamp(1rem, 4vw, 2.5rem)', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a>
          <span>/</span>
          <span style={{ color: '#111' }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(1.5rem, 4vw, 4rem)', alignItems: 'start' }}>

          <div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#f8f8f8', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', marginBottom: '1rem' }}>
              {images.length > 0
                ? <img src={images[currentImage]?.url} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  </div>
              }
              {discount > 0 && <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#EF4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '999px' }}>-{discount}%</div>}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    style={{ flexShrink: 0, width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', border: i === currentImage ? '2px solid #D4AF37' : '2px solid transparent', background: 'none', padding: 0, cursor: 'pointer' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p style={{ fontSize: '0.65rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.5rem' }}>{product.category}</p>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: '#111', lineHeight: 1.2, marginBottom: '0.75rem' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= avgRating ? '#D4AF37' : '#e5e5e5'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>({reviews.length} resenas)</span>
              {product.vendidos > 0 && <span style={{ fontSize: '0.8rem', color: '#888' }}>· {product.vendidos} vendidos</span>}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              {formattedOriginal && <p style={{ fontSize: '0.9rem', color: '#bbb', textDecoration: 'line-through', marginBottom: '0.25rem' }}>{formattedOriginal}</p>}
              <p style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#111', lineHeight: 1 }}>{formattedPrice}</p>
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>COP · Precio final</p>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.7, marginBottom: '1.25rem' }}>{product.description}</p>

            {variantes.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                {variantes.map((variante: any) => (
                  <div key={variante.nombre} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{variante.nombre}</p>
                      {variantesSeleccionadas[variante.nombre] && (
                        <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600 }}>
                          {variantesSeleccionadas[variante.nombre]}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {variante.opciones.map((opcion: string) => {
                        const selected = variantesSeleccionadas[variante.nombre] === opcion
                        return (
                          <button
                            key={opcion}
                            type="button"
                            onClick={() => setVariantesSeleccionadas(prev => ({ ...prev, [variante.nombre]: opcion }))}
                            style={{
                              padding: '0.4rem 0.875rem',
                              borderRadius: '8px',
                              border: selected ? '2px solid #D4AF37' : '1px solid #ddd',
                              background: selected ? '#D4AF37' : '#fff',
                              color: selected ? '#0B0B0B' : '#555',
                              fontSize: '0.8rem',
                              fontWeight: selected ? 700 : 400,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {opcion}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {!todasSeleccionadas && (
                  <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500 }}>
                    Selecciona todas las opciones para continuar
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 500 }}>Cantidad</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', background: '#f8f8f8', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#333', borderRight: '1px solid #ddd' }}>-</button>
                <span style={{ width: '48px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600, color: '#111' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ width: '40px', height: '40px', background: '#f8f8f8', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#333', borderLeft: '1px solid #ddd' }}>+</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button onClick={handleBuyNow} disabled={adding || !todasSeleccionadas}
                style={{ width: '100%', padding: '1rem', background: !todasSeleccionadas ? '#e5e5e5' : adding ? '#ccc' : '#D4AF37', color: !todasSeleccionadas ? '#999' : '#0B0B0B', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: !todasSeleccionadas || adding ? 'not-allowed' : 'pointer' }}>
                {adding ? 'Procesando...' : 'Comprar ahora'}
              </button>
              <button onClick={handleAddToCart} disabled={adding || !todasSeleccionadas}
                style={{ width: '100%', padding: '1rem', background: '#fff', color: !todasSeleccionadas ? '#bbb' : '#111', border: !todasSeleccionadas ? '2px solid #ddd' : '2px solid #111', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: !todasSeleccionadas || adding ? 'not-allowed' : 'pointer' }}>
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
              {added && (
                <a href="/carrito" style={{ width: '100%', padding: '0.875rem', background: '#0B0B0B', color: '#D4AF37', border: '1px solid rgba(212,175,55,.3)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                  Ver mi carrito
                </a>
              )}
            </div>

            <div style={{ padding: '1rem', background: '#f8f8f8', borderRadius: '12px', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Medios de pago aceptados</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.1/mercadopago/logo__large@2x.png" alt="Mercado Pago" style={{ height: '20px', objectFit: 'contain' }} />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" style={{ height: '16px', objectFit: 'contain' }} />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '20px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', color: '#888' }}>PSE · Efecty · Baloto</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Compra segura' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.75"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: 'Envio rapido' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.75"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Garantia DSM' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 0.5rem', border: '1px solid #eee', borderRadius: '10px', textAlign: 'center' }}>
                  {item.icon}
                  <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>

            {seller && (
              <div style={{ padding: '1rem', background: '#f8f8f8', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D4AF37', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#0B0B0B', fontWeight: 700, fontSize: 18 }}>{(seller.store_name || seller.name || 'T').charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 2px' }}>Vendido por</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0 }}>{seller.store_name || seller.name}</p>
                  </div>
                </div>
              </div>
            )}

            {product.envio_gratis && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                Este producto tiene envio gratis
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>
            Resenas {reviews.length > 0 ? `(${reviews.length})` : ''}
          </h2>

          {user ? (
            <form onSubmit={handleReview} style={{ background: '#f8f8f8', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #eee' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>Deja tu resena</p>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={s <= reviewRating ? '#D4AF37' : '#e5e5e5'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                ))}
              </div>
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required rows={3}
                placeholder="Contanos tu experiencia con este producto..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box' }} />
              {reviewSuccess && <p style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.5rem' }}>Resena enviada. Gracias!</p>}
              <button type="submit" disabled={submittingReview}
                style={{ marginTop: '0.75rem', padding: '0.75rem 1.5rem', background: '#D4AF37', color: '#0B0B0B', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                {submittingReview ? 'Enviando...' : 'Enviar resena'}
              </button>
            </form>
          ) : (
            <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>
                <a href="/auth/login" style={{ color: '#D4AF37', fontWeight: 600 }}>Inicia sesion</a> para dejar una resena
              </p>
            </div>
          )}

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ padding: '1.25rem', border: '1px solid #eee', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B0B0B', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      U
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111', margin: 0 }}>Usuario</p>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= review.rating ? '#D4AF37' : '#e5e5e5'}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#bbb' }}>{new Date(review.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Aun no hay resenas. Se el primero en opinar.</p>
          )}
        </div>
      </div>

      <footer style={{ background: '#0B0B0B', borderTop: '1px solid rgba(212,175,55,.15)', marginTop: '4rem', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: '60px', objectFit: 'contain', marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.7 }}>El marketplace colombiano donde el comercio se vuelve arte.</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem', fontWeight: 600 }}>Comprar</p>
              {['Catalogo', 'Servicios', 'Ofertas del mes'].map(l => (
                <a key={l} href="/" style={{ display: 'block', fontSize: '0.85rem', color: '#888', textDecoration: 'none', marginBottom: '0.5rem' }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem', fontWeight: 600 }}>Vender</p>
              {['Registrarse como vendedor', 'Como funciona', 'Comisiones'].map(l => (
                <a key={l} href="/auth/register" style={{ display: 'block', fontSize: '0.85rem', color: '#888', textDecoration: 'none', marginBottom: '0.5rem' }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem', fontWeight: 600 }}>Garantias</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Pagos protegidos con escrow' },
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, text: 'Vendedores verificados' },
                  { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, text: 'Envio a todo Colombia' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.icon}
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#444' }}>2025 DMS Market. Colombia. Todos los derechos reservados.</p>
            <p style={{ fontSize: '0.75rem', color: '#444' }}>Pagos procesados por Mercado Pago</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <ProductContent />
    </Suspense>
  )
}
