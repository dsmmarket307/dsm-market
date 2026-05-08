'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ProductContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [seller, setSeller] = useState<any>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(true)

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
    const { error } = await supabase.from('carts').upsert(
      { buyer_id: user.id, product_id: product.id, quantity },
      { onConflict: 'buyer_id,product_id' }
    )
    if (error) console.error('Cart error:', error)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    setAdding(false)
  }

  async function handleBuyNow() {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    
    // Guarda solo este producto en sessionStorage para el checkout
    const checkoutItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: images[0]?.url ?? null,
    }
    sessionStorage.setItem('checkout_item', JSON.stringify(checkoutItem))
    router.push('/checkout')
    setAdding(false)
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
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
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111', lineHeight: 1.2, marginBottom: '1.25rem' }}>{product.name}</h1>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>{formattedPrice}</div>
            <div style={{ width: '40px', height: '1px', background: '#C9A84C', marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>{product.description}</p>

            {/* Cantidad */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#888' }}>Cantidad</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '36px', height: '36px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>-</button>
                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.875rem', color: '#111', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={{ width: '36px', height: '36px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>+</button>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <button onClick={handleBuyNow} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: adding ? '#e5e5e5' : '#C9A84C', color: adding ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer' }}>
                {adding ? 'Procesando...' : 'Comprar ahora'}
              </button>
              <button onClick={handleAddToCart} disabled={adding}
                style={{ width: '100%', padding: '1rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: adding ? 'not-allowed' : 'pointer' }}>
                {added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
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
      </div>
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