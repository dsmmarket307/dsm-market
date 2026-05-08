'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CarritoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: cartItems } = await supabase
        .from('carts')
        .select('product_id, quantity, products(id, name, price, category)')
        .eq('buyer_id', user.id)

      if (!cartItems || cartItems.length === 0) {
        setLoading(false)
        return
      }

      const productIds = cartItems.map((i: any) => i.product_id)
      const { data: imgs } = await supabase
        .from('product_images')
        .select('product_id, url, position')
        .in('product_id', productIds)
        .order('position')

      setItems(cartItems)
      setImages(imgs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleRemove(productId: string) {
    setRemoving(productId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('carts').delete().eq('buyer_id', user.id).eq('product_id', productId)
    setItems(prev => prev.filter((i: any) => i.product_id !== productId))
    setRemoving(null)
  }

  async function handleUpdateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('carts').update({ quantity }).eq('buyer_id', user.id).eq('product_id', productId)
    setItems(prev => prev.map((i: any) => i.product_id === productId ? { ...i, quantity } : i))
  }

  function handleBuyItem(item: any) {
    const img = images.find((i: any) => i.product_id === item.product_id)?.url
    const checkoutItem = {
      id: item.product_id,
      name: item.products?.name,
      price: item.products?.price,
      quantity: item.quantity,
      image: img ?? null,
    }
    sessionStorage.setItem('checkout_item', JSON.stringify(checkoutItem))
    router.push('/checkout')
  }

  const subtotal = items.reduce((acc, i) => acc + (i.products?.price * i.quantity), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
        <span style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Mi carrito</span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Compras</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111' }}>Mi carrito</h1>
          </div>
          <a href="/dashboard/buyer/products" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'none' }}>Seguir comprando</a>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '1rem' }}>Tu carrito esta vacio.</p>
            <a href="/dashboard/buyer/products" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#C9A84C', color: '#fff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Ver productos
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {/* Lista */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item: any) => {
                const img = images.find((i: any) => i.product_id === item.product_id)?.url
                return (
                  <div key={item.product_id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '4px', alignItems: 'flex-start' }}>
                    <div style={{ width: '80px', height: '80px', flexShrink: 0, background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt={item.products?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.65rem', color: '#ccc' }}>Sin foto</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', marginBottom: '0.25rem' }}>{item.products?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '0.75rem' }}>{item.products?.category}</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>
                        ${Number(item.products?.price * item.quantity).toLocaleString('es-CO')}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                          <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>-</button>
                          <span style={{ width: '32px', textAlign: 'center', fontSize: '0.875rem', color: '#111', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', border: 'none', background: '#fafafa', cursor: 'pointer', fontSize: '1rem', color: '#555' }}>+</button>
                        </div>

                        <button onClick={() => handleBuyItem(item)}
                          style={{ padding: '0.375rem 0.875rem', background: '#C9A84C', color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
                          Comprar
                        </button>

                        <button onClick={() => handleRemove(item.product_id)} disabled={removing === item.product_id}
                          style={{ padding: '0.375rem 0.875rem', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                          {removing === item.product_id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumen */}
            <div>
              <div style={{ border: '1px solid #eee', borderTop: '3px solid #C9A84C', padding: '1.5rem', position: 'sticky', top: '80px' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem' }}>Resumen</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ color: '#666' }}>{items.length} producto(s)</span>
                  <span style={{ color: '#111', fontWeight: 600 }}>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  Haz clic en "Comprar" en cada producto para ir al checkout.
                </p>
                <a href="/dashboard/buyer/products"
                  style={{ display: 'block', padding: '0.875rem', background: '#fff', color: '#111', border: '1px solid #ddd', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' }}>
                  Seguir comprando
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}