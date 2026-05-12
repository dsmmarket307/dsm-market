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

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#aaa', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</a>
          <span>/</span>
          <a href="/dashboard/buyer/products" style={{ color: '#aaa', textDecoration: 'none' }}>Catalogo</a>
          <span>/</span>
          <span style={{ color: '#111' }}>{product.name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

          {/* Galeria */}
          <div>
            <div style={{ background: '#f8f8f8', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #f0f0f0' }}>
              {images.length > 0 ? (
                <img src={images[currentImage]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <p style={{ color: '#ccc', fontSize: '0.875rem' }}>Sin imagen</p>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setCurrentImage(i)}
                    style={{ width: '72px', height: '72px', flexShrink: 0, border: i === currentImage ? '2px solid #C9A84C' : '2px solid transparent', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: '#f8f8f8', padding: 0 }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>{product.category}</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111', lineHeight: 1.2, marginBottom: '0.5rem' }}>{product.name}</h1>

            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#C9A84C', fontSize: '1rem' }}>{'★'.repeat(Math.round(Number(avgRating)))}</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{avgRating} ({reviews.length} resenas)</span>
              </div>
            )}

            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>{formattedPrice}</div>
            <div style={{ width: '40px', height: '1px', background: '#C9A84C', marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>{product.description}</p>

            {/* Cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>Cantidad</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>-</button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.875rem', color: '#111', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ width: '36px', height: '36px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>+</button>
              </div>
            </div>

            {/* Transportadora */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                Elige tu transportadora
              </label>
              <select value={transportadora} onChange={e => setTransportadora(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}>
                {transportadoras.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button onClick={handleBuyNow} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: adding ? '#e5e5e5' : '#C9A84C', color: adding ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer' }}>
                {adding ? 'Procesando...' : 'Comprar ahora'}
              </button>
              <button onClick={handleAddToCart} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer' }}>
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
            </div>

            {/* Metodos de pago */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.75rem' }}>Medios de pago aceptados</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {['Visa', 'Mastercard', 'PSE', 'Efecty', 'Nequi', 'Daviplata'].map(method => (
                  <span key={method} style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem', border: '1px solid #ddd', borderRadius: '4px', color: '#555', background: '#fff', fontWeight: 500 }}>
                    {method}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.75rem' }}>Pagos procesados de forma segura por MercadoPago</p>
            </div>

            {/* Garantias */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
              {['Pago seguro', 'Envio rapido', 'Compra segura'].map(label => (
                <div key={label} style={{ padding: '0.75rem', background: '#fafafa', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '1px' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Vendedor */}
            {seller && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #f0f0f0', background: '#fafafa' }}>
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

        {/* RESENAS */}
        <div style={{ marginTop: '4rem', borderTop: '1px solid #f0f0f0', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 300, color: '#111', marginBottom: '2rem' }}>
            Resenas
            {avgRating && <span style={{ fontSize: '0.875rem', color: '#C9A84C', marginLeft: '0.75rem' }}>★ {avgRating}</span>}
          </h2>

          {/* Formulario resena */}
          <form onSubmit={handleReview} style={{ background: '#fafafa', border: '1px solid #f0f0f0', padding: '1.5rem', borderRadius: '4px', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Deja tu resena</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}
                  style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#C9A84C' : '#ddd' }}>
                  ★
                </button>
              ))}
            </div>

            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required rows={3}
              placeholder="Cuéntanos tu experiencia con este producto..."
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box', marginBottom: '1rem' }}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')}
              onBlur={e => (e.target.style.borderColor = '#ddd')} />

            <button type="submit" disabled={submittingReview}
              style={{ padding: '0.75rem 1.5rem', background: submittingReview ? '#e5e5e5' : '#C9A84C', color: submittingReview ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: submittingReview ? 'not-allowed' : 'pointer' }}>
              {submittingReview ? 'Enviando...' : 'Publicar resena'}
            </button>
          </form>

          {/* Lista resenas */}
          {reviews.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No hay resenas aun. Se el primero en opinar.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ padding: '1rem 1.25rem', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
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

      <footer style={{ borderTop: '1px solid #eee', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
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