'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingClient({ products, images, banners }: any) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [currentBanner, setCurrentBanner] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    if (!banners.length) return
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 4000)
    return () => clearInterval(t)
  }, [banners.length])

  const categories = [...new Set(products.map((p: any) => p.category))].slice(0, 8)

  const filtered = products.filter((p: any) => {
    const matchSearch = search.trim()
      ? p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
      : true
    const matchCategory = selectedCategory ? p.category === selectedCategory : true
    return matchSearch && matchCategory
  })

  const ofertasMes = products.filter((p: any) => p.oferta_mes === true)

  function handleProductClick(productId: string) {
    sessionStorage.setItem('redirect_after_login', `/producto/detalle%3Fid%3D${productId}`)
    router.push(`/auth/register?redirect=/producto/detalle%3Fid%3D${productId}`)
  }

  function StarRating({ rating }: { rating?: number }) {
    const r = rating ?? 4
    return (
      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= r ? '#D4AF37' : '#e5e5e5'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        <span style={{ fontSize: '0.65rem', color: '#aaa', marginLeft: '2px' }}>({r}.0)</span>
      </div>
    )
  }

  function ProductCard({ product, showBadge = true }: any) {
    const img = images.filter((i: any) => i.product_id === product.id)[0]?.url
    return (
      <div onClick={() => handleProductClick(product.id)}
        style={{ color: '#111', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
        <div style={{ position: 'relative', paddingBottom: '100%', background: '#f8f8f8', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
          )}
          {showBadge && product.badge && (
            <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: product.badge === 'Lo más vendido' ? '#D4AF37' : '#EF4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
              {product.badge}
            </div>
          )}
          {product.envio_gratis && (
            <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: '#16a34a', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
              Envío gratis
            </div>
          )}
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.6rem', background: '#EF4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
              -{Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}%
            </div>
          )}
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p style={{ fontSize: '0.6rem', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '1px' }}>{product.category}</p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.5rem', color: '#111', lineHeight: 1.4, fontWeight: 500 }}>{product.name}</p>
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <p style={{ fontSize: '0.75rem', color: '#bbb', textDecoration: 'line-through', marginBottom: '0.1rem' }}>${Number(product.original_price).toLocaleString('es-CO')}</p>
          )}
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0B0B0B', marginBottom: '0.25rem' }}>${Number(product.price).toLocaleString('es-CO')}</p>
          <StarRating rating={product.rating} />
          <div style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px', marginTop: 'auto' }}>
            Comprar ahora
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", color: '#111' }}>

      {/* NAVBAR */}
      <nav style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 50, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <span style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: '#D4AF37', letterSpacing: '2px', flexShrink: 0 }}>DMS Market</span>
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 clamp(0.5rem, 2vw, 2rem)', display: 'flex', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos o servicios..."
            style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', fontSize: '0.875rem', outline: 'none', color: '#fff', background: 'transparent' }} />
          <button style={{ padding: '0.7rem 1.25rem', background: '#D4AF37', color: '#0B0B0B', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <a href="/servicios" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>Servicios</a>
          <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>Ingresar</a>
          <a href="/auth/register" style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Registrarse</a>
        </div>
      </nav>

      {/* BANNER CARRUSEL */}
      {banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 45vw, 560px)', overflow: 'hidden', background: '#0B0B0B' }}>
          {banners.map((banner: any, i: number) => (
            <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentBanner ? 1 : 0 }}>
              {banner.image_url ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.4) 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(2rem, 8vw, 6rem)' }}>
                    <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market</p>
                    <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, maxWidth: '600px', marginBottom: '1rem', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>{banner.title}</h1>
                    {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.875rem, 2vw, 1.1rem)', maxWidth: '460px', marginBottom: '2rem', lineHeight: 1.7 }}>{banner.subtitle}</p>}
                    <a href={banner.link ?? '/auth/register'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}>
                      Explorar productos →
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0B0B0B 0%, #151515 100%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(2rem, 8vw, 6rem)' }}>
                  <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem' }}>DMS Market</p>
                  <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, maxWidth: '600px', marginBottom: '1rem' }}>{banner.title}</h1>
                  {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.875rem, 2vw, 1.1rem)', maxWidth: '460px', marginBottom: '2rem' }}>{banner.subtitle}</p>}
                  <a href={banner.link ?? '/auth/register'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}>
                    Explorar productos →
                  </a>
                </div>
              )}
            </div>
          ))}

          {/* BENEFICIOS RAPIDOS */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(11,11,11,0.85)', backdropFilter: 'blur(10px)', padding: '0.875rem clamp(1rem, 4vw, 3rem)', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap', zIndex: 5 }}>
            {[
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Compra segura' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>, text: 'Vendedores verificados' },
              { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, text: 'Soporte 24/7' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {b.icon}
                <span style={{ fontSize: '0.8rem', color: '#D1D1D1', fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: '3.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            {banners.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentBanner(i)} style={{ width: i === currentBanner ? '28px' : '8px', height: '8px', borderRadius: '4px', background: i === currentBanner ? '#D4AF37' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
          <button onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)} style={{ position: 'absolute', left: '1rem', top: '45%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
          <button onClick={() => setCurrentBanner(p => (p + 1) % banners.length)} style={{ position: 'absolute', right: '1rem', top: '45%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
        </div>
      )}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <div style={{ background: '#fff', padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 4vw, 2rem)', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>Explora nuestras categorías</h2>
              <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</a>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <button onClick={() => setSelectedCategory('')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', border: '2px solid ' + (selectedCategory === '' ? '#D4AF37' : '#f0f0f0'), background: selectedCategory === '' ? '#D4AF37' : '#fff', borderRadius: '14px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', minWidth: '80px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedCategory === '' ? '#0B0B0B' : '#555'} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedCategory === '' ? '#0B0B0B' : '#555', whiteSpace: 'nowrap' }}>Todos</span>
              </button>
              {categories.map((cat: any) => (
                <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', border: '2px solid ' + (selectedCategory === cat ? '#D4AF37' : '#f0f0f0'), background: selectedCategory === cat ? '#D4AF37' : '#fff', borderRadius: '14px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', minWidth: '80px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={selectedCategory === cat ? '#0B0B0B' : '#555'} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedCategory === cat ? '#0B0B0B' : '#555', whiteSpace: 'nowrap' }}>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTOS DESTACADOS */}
      <section style={{ background: '#F5F5F5', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>
              {search ? 'Resultados de búsqueda' : selectedCategory ? selectedCategory : 'Productos destacados'}
              <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({filtered.length})</span>
            </h2>
            <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</a>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '16px' }}>
              <p style={{ color: '#888', marginBottom: '1rem' }}>No se encontraron productos.</p>
              <button onClick={() => { setSearch(''); setSelectedCategory('') }} style={{ padding: '0.625rem 1.5rem', background: '#D4AF37', color: '#0B0B0B', border: 'none', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700 }}>Ver todos</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 20vw, 220px), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
              {filtered.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OFERTAS DEL MES */}
      {ofertasMes.length > 0 && (
        <section style={{ background: '#fff', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: '#EF4444', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Tiempo limitado</p>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>
                  Ofertas del mes
                  <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({ofertasMes.length})</span>
                </h2>
              </div>
              <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#EF4444', textDecoration: 'none', fontWeight: 600, border: '1px solid #EF4444', padding: '0.4rem 1rem', borderRadius: '8px' }}>Ver todas →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 20vw, 220px), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
              {ofertasMes.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFICIOS */}
      <section style={{ background: '#0B0B0B', padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title: 'Compra segura', desc: 'Sistema escrow que protege tu dinero hasta confirmar la entrega.' },
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>, title: 'Vendedores verificados', desc: 'Todos los vendedores pasan por verificación de identidad.' },
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><path d="M16 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1"/></svg>, title: 'Envíos rápidos', desc: 'Recibe tus productos a tiempo con transportadoras confiables.' },
            { icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Soporte 24/7', desc: 'Estamos aquí para ayudarte en cada paso de tu compra.' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#D1D1D1', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ background: '#F5F5F5', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: '#D4AF37', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>Simple y seguro</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#0B0B0B', marginBottom: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center' }}>Cómo funciona DMS Market</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', title: 'Crea tu cuenta', desc: 'Regístrate gratis en minutos como comprador o vendedor.' },
              { num: '02', title: 'Compra o vende', desc: 'Publica productos o encuentra exactamente lo que necesitas.' },
              { num: '03', title: 'Pago protegido', desc: 'Tu dinero queda retenido 7 días hasta confirmar la entrega.' },
            ].map((s) => (
              <div key={s.num} style={{ background: '#fff', borderRadius: '16px', padding: '2rem 1.5rem', borderTop: '4px solid #D4AF37', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D4AF37', marginBottom: '1rem', lineHeight: 1 }}>{s.num}</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0B0B0B', marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#151515', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '2.5rem 2rem', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', background: 'rgba(212,175,55,0.04)' }}>
            <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Para vendedores</p>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Vende productos en DSM</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.7 }}>Solo 5% de comisión por venta. Sin mensualidades. Pagos protegidos con escrow.</p>
            <a href="/auth/register" style={{ display: 'inline-block', background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}>Quiero ser vendedor</a>
          </div>
          <div style={{ textAlign: 'center', padding: '2.5rem 2rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
            <p style={{ color: '#aaa', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Servicios Profesionales</p>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>¿Ofreces un servicio?</h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.7 }}>Publica gratis tu servicio de diseño, plomería, clases, reparaciones y más. 3 meses gratis.</p>
            <a href="/auth/register-provider" style={{ display: 'inline-block', background: 'transparent', color: '#D4AF37', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', border: '1px solid #D4AF37' }}>Publicar mi servicio gratis</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0B0B0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.75rem' }}>DMS Market</p>
              <p style={{ fontSize: '0.8rem', color: '#D1D1D1', lineHeight: 1.7, marginBottom: '1rem' }}>La plataforma donde comprar y vender es fácil, seguro y rápido.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'f', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                  { label: 'in', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#0B0B0B"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#0B0B0B" strokeWidth="2"/></svg> },
                  { label: 'tw', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg> },
                  { label: 'yt', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#D4AF37"/></svg> },
                ].map(s => (
                  <div key={s.label} style={{ width: '32px', height: '32px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {s.icon}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Navegación', links: ['Inicio', 'Categorías', 'Servicios', 'Vendedores'] },
              { title: 'Ayuda', links: ['Centro de ayuda', 'Cómo comprar', 'Cómo vender', 'Política de privacidad'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Trabaja con nosotros', 'Contacto'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>{col.title}</p>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ display: 'block', fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', marginBottom: '0.5rem' }}>{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>© 2025 DMS Market. Colombia. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/politicas" style={{ fontSize: '0.75rem', color: '#666', textDecoration: 'none' }}>Políticas</a>
              <a href="/auth/login" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}