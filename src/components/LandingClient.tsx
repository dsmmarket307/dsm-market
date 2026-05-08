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

  function handleProductClick(productId: string) {
    sessionStorage.setItem('redirect_after_login', `/producto/detalle%3Fid%3D${productId}`)
    router.push(`/auth/register?redirect=/producto/detalle%3Fid%3D${productId}`)
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', color: '#111' }}>

      {/* NAVBAR */}
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 clamp(1rem, 4vw, 2rem)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <span style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#C9A84C', letterSpacing: '1px' }}>DMS Market</span>
        <div style={{ flex: 1, maxWidth: '480px', margin: '0 clamp(0.5rem, 2vw, 2rem)', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            style={{ flex: 1, padding: '0.625rem 1rem', border: '1px solid #eee', borderRight: 'none', fontSize: '0.875rem', outline: 'none', color: '#111', background: '#fff' }}
          />
          <button style={{ padding: '0.625rem 1.25rem', background: '#C9A84C', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Buscar
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/auth/login" style={{ fontSize: '0.875rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem', display: 'none' }} className="desktop-only">Ingresar</a>
          <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
          <a href="/auth/register" style={{ fontSize: '0.8rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1rem', textDecoration: 'none', borderRadius: '4px', fontWeight: 600 }}>Registrarse</a>
        </div>
      </nav>

      {/* HERO BANNER */}
      {banners.length > 0 ? (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 40vw, 420px)', overflow: 'hidden' }}>
          {banners.map((banner: any, i: number) => (
            <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentBanner ? 1 : 0 }}>
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(1.5rem, 5vw, 4rem)' }}>
                  <p style={{ color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem' }}>{banner.tag ?? 'DMS Market'}</p>
                  <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 300, lineHeight: 1.2, maxWidth: '600px', marginBottom: '1rem' }}>{banner.title}</h2>
                  {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.8rem, 2vw, 1rem)', maxWidth: '500px', marginBottom: '2rem' }}>{banner.subtitle}</p>}
                  {banner.cta_text && (
                    <a href={banner.cta_link ?? '/auth/register'} style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                      {banner.cta_text}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            {banners.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentBanner(i)} style={{ width: i === currentBanner ? '28px' : '8px', height: '8px', borderRadius: '4px', background: i === currentBanner ? '#C9A84C' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
          <button onClick={() => setCurrentBanner(p => (p - 1 + banners.length) % banners.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
          <button onClick={() => setCurrentBanner(p => (p + 1) % banners.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem' }}>Marketplace Colombiano</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, lineHeight: 1.2, marginBottom: '1.5rem', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            Compra y vende con <span style={{ color: '#C9A84C' }}>confianza</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', marginBottom: '2.5rem' }}>Pagos protegidos. Vendedores verificados. 100% colombiano.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/register" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Empezar ahora</a>
            <a href="/auth/login" style={{ display: 'inline-block', background: 'transparent', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.3)' }}>Iniciar sesion</a>
          </div>
        </div>
      )}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <div style={{ borderBottom: '1px solid #f0f0f0', padding: '1rem clamp(1rem, 4vw, 2rem)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
            <button onClick={() => setSelectedCategory('')}
              style={{ padding: '0.375rem 1rem', border: '1px solid ' + (selectedCategory === '' ? '#C9A84C' : '#eee'), background: selectedCategory === '' ? '#C9A84C' : '#fff', color: selectedCategory === '' ? '#fff' : '#555', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '999px', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Todos
            </button>
            {categories.map((cat: any) => (
              <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                style={{ padding: '0.375rem 1rem', border: '1px solid ' + (selectedCategory === cat ? '#C9A84C' : '#eee'), background: selectedCategory === cat ? '#C9A84C' : '#fff', color: selectedCategory === cat ? '#fff' : '#555', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '999px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTOS */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, color: '#111' }}>
            {search ? 'Resultados de busqueda' : selectedCategory ? selectedCategory : 'Productos destacados'}
            <span style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({filtered.length})</span>
          </h2>
          <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>Ver todos</a>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#888', marginBottom: '1rem' }}>No se encontraron productos.</p>
            <button onClick={() => { setSearch(''); setSelectedCategory('') }} style={{ padding: '0.5rem 1.5rem', background: '#C9A84C', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Ver todos</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(150px, 20vw, 220px), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
            {filtered.map((product: any) => {
              const img = images.filter((i: any) => i.product_id === product.id)[0]?.url
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  style={{ color: '#111', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ position: 'relative', paddingBottom: '100%', background: '#f8f8f8', overflow: 'hidden' }}>
                    {img ? (
                      <img src={img} alt={product.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: '#ccc' }}>Sin imagen</p>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 'clamp(0.5rem, 2vw, 0.875rem)' }}>
                    <p style={{ fontSize: '0.6rem', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 700, letterSpacing: '1px' }}>{product.category}</p>
                    <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginBottom: '0.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.5rem', color: '#222', lineHeight: 1.4 }}>{product.name}</p>
                    <p style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>${Number(product.price).toLocaleString('es-CO')}</p>
                    <div style={{ background: 'linear-gradient(135deg, #C9A84C, #b8943d)', color: '#fff', padding: '0.375rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '4px' }}>Ver producto</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ background: '#fafafa', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.75rem' }}>Simple y seguro</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111', marginBottom: 'clamp(2rem, 4vw, 3rem)', textAlign: 'center' }}>Como funciona DMS Market</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', title: 'Crea tu cuenta', desc: 'Registrate gratis en minutos como comprador o vendedor.' },
              { num: '02', title: 'Compra o vende', desc: 'Publica productos o encuentra exactamente lo que necesitas.' },
              { num: '03', title: 'Pago protegido', desc: 'Tu dinero queda retenido 7 dias hasta confirmar la entrega.' },
            ].map((s) => (
              <div key={s.num} style={{ background: '#fff', border: '1px solid #eee', padding: '2rem 1.5rem', borderTop: '3px solid #C9A84C', borderRadius: '0 0 8px 8px' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 200, color: '#C9A84C', marginBottom: '1rem', lineHeight: 1 }}>{s.num}</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section style={{ background: '#fff', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '🔒', title: 'Pagos seguros', desc: 'Sistema escrow que protege tu dinero hasta confirmar la entrega.' },
            { icon: '✅', title: 'Vendedores verificados', desc: 'Todos los vendedores pasan por un proceso de verificacion de identidad.' },
            { icon: '📦', title: 'Envio flexible', desc: 'El vendedor elige la transportadora. Tu pagas solo el envio real.' },
            { icon: '🇨🇴', title: '100% colombiano', desc: 'Plataforma hecha en Colombia para colombianos.' },
          ].map(item => (
            <div key={item.title} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA VENDEDORES */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem' }}>Cupos limitados</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, color: '#fff', marginBottom: '1rem' }}>Vende en DMS Market</h2>
        <p style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Solo 5% de comision. Sin mensualidades. Sin costos ocultos. Tu decides cuando y cuanto vender.
        </p>
        <a href="/auth/register" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '1rem 2.5rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Quiero ser vendedor
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1rem, 4vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1rem' }}>DMS Market</span>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>2025 DMS Market. Colombia</p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="/politicas" style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'none' }}>Politicas</a>
          <a href="/politicas" style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'none' }}>Privacidad</a>
          <a href="/auth/login" style={{ fontSize: '0.75rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
        </div>
      </footer>

    </div>
  )
}