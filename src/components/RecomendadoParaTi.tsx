'use client'

import { useState, useEffect } from 'react'

export default function RecomendadoParaTi() {
  const [products, setProducts] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [type, setType] = useState<string>('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recommendations')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products ?? [])
        setImages(data.images ?? [])
        setType(data.type ?? 'recent')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function getImage(productId: string) {
    return images.find(img => img.product_id === productId)?.url ?? null
  }

  if (loading) return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ height: 24, width: 200, background: '#1a1a1a', borderRadius: 6, marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ background: '#151515', borderRadius: 12, height: 220, border: '1px solid rgba(255,255,255,.05)' }} />
        ))}
      </div>
    </div>
  )

  if (products.length === 0) return null

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <div style={{ width: 3, height: 20, background: '#D4AF37', borderRadius: 999 }} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Poppins, sans-serif' }}>
          {type === 'personalized' ? 'Recomendado para ti' : 'Productos destacados'}
        </h2>
        {type === 'personalized' && (
          <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 999, color: '#D4AF37', fontFamily: 'Poppins, sans-serif' }}>
            Personalizado
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}>
        {products.map((product: any) => {
          const img = getImage(product.id)
          const discount = product.original_price && Number(product.original_price) > Number(product.price)
            ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0
          return (
            <a key={product.id} href={'/producto/detalle?id=' + product.id}
              onClick={() => {
                fetch('/api/recommendations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: product.id, category: product.category })
                }).catch(() => {})
              }}
              style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: '#151515', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.05)', transition: 'border-color .2s', cursor: 'pointer' }}>
                <div style={{ aspectRatio: '1', background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
                  {img ? (
                    <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.25">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                  {discount > 0 && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                      -{discount}%
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem' }}>
                  <p style={{ fontSize: 10, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px', fontFamily: 'Poppins, sans-serif' }}>{product.category}</p>
                  <p style={{ fontSize: 13, color: '#fff', fontWeight: 500, margin: '0 0 6px', lineHeight: 1.3, fontFamily: 'Poppins, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{product.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#D4AF37', margin: 0, fontFamily: 'Poppins, sans-serif' }}>${Number(product.price).toLocaleString('es-CO')}</p>
                    {product.original_price && Number(product.original_price) > Number(product.price) && (
                      <p style={{ fontSize: 11, color: '#555', textDecoration: 'line-through', margin: 0 }}>${Number(product.original_price).toLocaleString('es-CO')}</p>
                    )}
                  </div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
