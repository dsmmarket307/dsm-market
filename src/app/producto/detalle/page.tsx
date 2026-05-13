'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const transportadoras = [
  'Selecciona la transportadora',
  'Servientrega',
  'Interrapidisimo',
  'Envia',
  'TCC',
  'Coordinadora',
  'Deprisa',
  'Veloces',
  'Otro',
]

function ProductContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [seller, setSeller] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [transportadora, setTransportadora] = useState('')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: p } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(p)
      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('position')
      setImages(imgs ?? [])
      if (p?.seller_id) {
        const { data: s } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', p.seller_id).single()
        setSeller(s)
      }
      const { data: r } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
      setReviews(r ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  const formattedPrice = product
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price)
    : ''

  async function handleAddToCart() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    await supabase.from('carts').upsert(
      { buyer_id: user.id, product_id: product.id, quantity },
      { onConflict: 'buyer_id,product_id' }
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    setAdding(false)
  }

  async function handleBuyNow() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const checkoutItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: images[0]?.url ?? null,
      transportadora,
    }
    sessionStorage.setItem('checkout_item', JSON.stringify(checkoutItem))
    router.push('/checkout')
    setAdding(false)
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingReview(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    await supabase.from('reviews').insert({
      product_id: product.id,
      buyer_id: user.id,
      rating: reviewRating,
      comment: reviewText,
    })
    setReviewText('')
    setReviewRating(5)
    const { data: r } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
    setReviews(r ?? [])
    setSubmittingReview(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#888' }}>Producto no encontrado</p>
    </div>
  )

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .product-image-main { aspect-ratio: 1 !important; width: 100% !important; height: auto !important; max-height: 400px !important; }
          .product-nav-breadcrumb { display: none !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 1rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS Market</a>
        <div className="product-nav-breadcrumb" style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#aaa' }}>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</a>
          <span>/</span>
          <a href="/dashboard/buyer/products" style={{ color: '#aaa', textDecoration: 'none' }}>Catalogo</a>
          <span>/</span>
          <span style={{ color: '#111' }}>{product.name}</span>
        </div>
        <a href="/dashboard/buyer" style={{ fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Mi cuenta</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2.5rem) clamp(0.75rem, 3vw, 2rem)' }}>
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

          {/* Galeria */}
          <div>
            <div className="product-image-main" style={{ background: '#f8f8f8', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', border: '1px solid #f0f0f0' }}>
              {images.length > 0 ? (
                <img src={images[currentImage]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <p style={{ color: '#ccc', fontSize: '0.875rem' }}>Sin imagen</p>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setCurrentImage(i)}
                    style={{ width: '64px', height: '64px', flexShrink: 0, border: i === currentImage ? '2px solid #C9A84C' : '2px solid #eee', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: '#f8f8f8', padding: 0 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>{product.category}</p>
            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 600, color: '#111', lineHeight: 1.3, marginBottom: '0.5rem' }}>{product.name}</h1>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#C9A84C', fontSize: '0.875rem' }}>{'★'.repeat(Math.round(Number(avgRating)))}</span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{avgRating} ({reviews.length} resenas)</span>
              </div>
            )}

            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>{formattedPrice} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#888' }}>COP</span></div>
            <p style={{ fontSize: '0.75rem', color: '#1D9E75', marginBottom: '1rem', fontWeight: 500 }}>Envio a cargo del comprador</p>

            <div style={{ background: '#f8f8f8', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Precio unitario</span>
                <span style={{ color: '#111', fontWeight: 500 }}>{formattedPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#666' }}>Cantidad</span>
                <span style={{ color: '#111', fontWeight: 500 }}>{quantity}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Envio</span>
                <span style={{ color: '#C9A84C', fontWeight: 500 }}>A cargo del comprador</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: '#111', fontWeight: 700 }}>Total</span>
                <span style={{ color: '#111', fontWeight: 700 }}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(product.price * quantity)}</span>
              </div>
            </div>

            {/* Cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Cantidad:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}>-</button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', color: '#111', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ width: '40px', height: '40px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1.2rem', color: '#555' }}>+</button>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              <button onClick={handleBuyNow} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: adding ? '#e5e5e5' : '#C9A84C', color: adding ? '#999' : '#fff', border: 'none', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {adding ? 'Procesando...' : 'COMPRAR AHORA'}
              </button>
              <button onClick={handleAddToCart} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: '#fff', color: '#C9A84C', border: '2px solid #C9A84C', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {added ? 'Agregado' : 'AGREGAR AL CARRITO'}
              </button>
              {added && (
                <a href="/carrito" style={{ textAlign: 'center', fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>Ver mi carrito</a>
              )}
            </div>

            {/* Medios de pago */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Medios de pago aceptados</p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {[
                  { name: 'Visa', color: '#1a1f71' },
                  { name: 'Mastercard', color: '#eb001b' },
                  { name: 'PSE', color: '#00529b' },
                  { name: 'Efecty', color: '#f5a623' },
                  { name: 'Nequi', color: '#6c00c8' },
                  { name: 'Daviplata', color: '#e8140a' },
                ].map(method => (
                  <span key={method.name} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', border: `1px solid ${method.color}`, borderRadius: '4px', color: method.color, background: '#fff', fontWeight: 700 }}>
                    {method.name}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '0.5rem' }}>Procesado por MercadoPago</p>
            </div>

            {/* Transportadora */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                Transportadora preferida
              </label>
              <select value={transportadora} onChange={e => setTransportadora(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box', borderRadius: '6px' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}>
                {transportadoras.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Vendedor */}
            {seller && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', border: '1px solid #f0f0f0', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{seller.full_name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '2px' }}>Vendedor</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111' }}>{seller.full_name}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.65rem', background: '#e8f5e9', color: '#2e7d32', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>Verificado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripcion */}
        <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>Descripcion del producto</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>{product.description}</p>
        </div>

        {/* RESENAS */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>
            Resenas
            {avgRating && <span style={{ fontSize: '0.875rem', color: '#C9A84C', marginLeft: '0.75rem', fontWeight: 400 }}>★ {avgRating}</span>}
          </h2>

          <form onSubmit={handleReview} style={{ background: '#fafafa', border: '1px solid #f0f0f0', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.75rem' }}>Deja tu resena</p>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}
                  style={{ fontSize: '1.75rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#C9A84C' : '#ddd', padding: '0' }}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required rows={3}
              placeholder="Cuentanos tu experiencia..."
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem', borderRadius: '6px' }}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')}
              onBlur={e => (e.target.style.borderColor = '#ddd')} />
            <button type="submit" disabled={submittingReview}
              style={{ padding: '0.75rem 1.5rem', background: submittingReview ? '#e5e5e5' : '#C9A84C', color: submittingReview ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: submittingReview ? 'not-allowed' : 'pointer', borderRadius: '6px' }}>
              {submittingReview ? 'Enviando...' : 'Publicar resena'}
            </button>
          </form>

          {reviews.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No hay resenas aun.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#C9A84C', fontSize: '0.875rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{new Date(review.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                  {review.comment && <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.6 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #eee', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ color: '#C9A84C', fontWeight: 700 }}>DMS Market</span>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>2025 DMS Market. Colombia</p>
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