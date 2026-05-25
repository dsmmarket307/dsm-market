'use client'

import { useState, useEffect } from 'react'
import type { RankedService } from '@/lib/ranking'

const LOGO = 'https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png'

const categories = [
  'Todos', 'Diseno y creatividad', 'Tecnologia y sistemas', 'Clases y tutorias',
  'Belleza y bienestar', 'Reparaciones y mantenimiento', 'Eventos y fotografia',
  'Juridico y contable', 'Salud y medicina', 'Construccion y remodelacion',
  'Delivery y mandados', 'Marketing y publicidad', 'Otros',
]

const PLAN_CONFIG: Record<string, { badge: string; badgeColor: string; badgeBg: string; border: string; shadow: string; glow: string }> = {
  premium: {
    badge: 'Premium Partner',
    badgeColor: '#fff',
    badgeBg: '#0B0B0B',
    border: '2px solid #D4AF37',
    shadow: '0 8px 32px rgba(212,175,55,0.18)',
    glow: '0 0 0 3px rgba(212,175,55,0.08)',
  },
  pro: {
    badge: 'Verificado',
    badgeColor: '#0B0B0B',
    badgeBg: '#D4AF37',
    border: '2px solid #D4AF37',
    shadow: '0 6px 24px rgba(212,175,55,0.12)',
    glow: '0 0 0 2px rgba(212,175,55,0.06)',
  },
  basic: {
    badge: 'Activo',
    badgeColor: '#D4AF37',
    badgeBg: 'rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.3)',
    shadow: '0 2px 12px rgba(0,0,0,0.06)',
    glow: 'none',
  },
}

interface Props {
  services: RankedService[]
  banners: any[]
  user: any
  profile: any
}

export default function ServiciosClient({ services, banners, user, profile }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % banners.length), 4500)
    return () => clearInterval(t)
  }, [banners.length])

  function getDashboardUrl() {
    if (!profile) return '/dashboard'
    if (profile.role === 'seller') return '/dashboard/vendor'
    if (profile.role === 'provider') return '/dashboard/provider'
    if (profile.role === 'admin') return '/dashboard/admin'
    return '/dashboard/buyer'
  }

  function handlePublicar() {
    window.location.href = user ? '/auth/register-provider' : '/auth/login?redirect=/auth/register-provider'
  }

  const filtered = services.filter(s => {
    const matchCat = selectedCategory === 'Todos' || s.category === selectedCategory
    const matchSearch = !search.trim() ||
      s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const premium = filtered.filter(s => s.plan_type === 'premium')
  const pro = filtered.filter(s => s.plan_type === 'pro')
  const basic = filtered.filter(s => s.plan_type === 'basic')
  const free = filtered.filter(s => !s.plan_type)
  const featured = [...premium, ...pro]

  function StarRating({ rating }: { rating?: number | null }) {
    const r = Math.round(rating ?? 0)
    if (!r) return null
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', marginBottom: '0.4rem' }}>
        {[1,2,3,4,5].map(s => (
          <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= r ? '#D4AF37' : '#e5e5e5'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
        <span style={{ fontSize: '0.65rem', color: '#aaa', marginLeft: '2px' }}>({rating?.toFixed(1)})</span>
      </div>
    )
  }

  function ServiceCard({ service, size = 'normal' }: { service: RankedService; size?: 'large' | 'normal' | 'small' }) {
    const plan = service.plan_type ? PLAN_CONFIG[service.plan_type] : null
    const isPremium = service.plan_type === 'premium'
    const isPro = service.plan_type === 'pro'
    const isHighlighted = isPremium || isPro

    return (
      <div style={{
        border: plan?.border ?? '1px solid #f0f0f0',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: plan?.shadow ?? '0 2px 8px rgba(0,0,0,0.06)',
        outline: plan?.glow ?? 'none',
        transition: 'all 0.25s',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = isHighlighted ? '0 20px 60px rgba(212,175,55,0.25)' : '0 12px 40px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = plan?.shadow ?? '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        {/* Imagen */}
        <div style={{ position: 'relative', paddingBottom: size === 'large' ? '55%' : '60%', background: '#f8f8f8', overflow: 'hidden' }}>
          {service.service_image_url ? (
            <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPremium ? 'linear-gradient(135deg, #1a1000, #2a1f00)' : 'linear-gradient(135deg, #1c1c1c, #333)' }}>
              <span style={{ fontSize: '3rem', color: '#D4AF37', fontWeight: 700 }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            </div>
          )}

          {/* Categoria */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
            {service.category}
          </div>

          {/* Badge plan */}
          {plan && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: plan.badgeBg, color: plan.badgeColor, fontSize: '0.6rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 800, letterSpacing: '0.5px', border: service.plan_type === 'basic' ? '1px solid #D4AF37' : 'none' }}>
              {plan.badge}
            </div>
          )}

          {/* Score indicator para premium */}
          {isPremium && (
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(212,175,55,0.9)', color: '#0B0B0B', fontSize: '0.6rem', padding: '0.25rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>
              Score {Math.round(service.computed_score)}
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: isPremium ? '52px' : '44px', height: isPremium ? '52px' : '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #f0d060)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isHighlighted ? '2px solid #D4AF37' : '2px solid #f0f0f0', boxShadow: isHighlighted ? '0 2px 8px rgba(212,175,55,0.3)' : '0 2px 8px rgba(0,0,0,0.1)' }}>
              {service.avatar_url ? (
                <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: isPremium ? '1rem' : '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.business_name}</p>
              {service.profession && <p style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 600, marginBottom: '0.1rem' }}>{service.profession}</p>}
              <p style={{ fontSize: '0.7rem', color: '#aaa', margin: 0 }}>{service.city}</p>
            </div>
          </div>

          <StarRating rating={service.avg_rating} />

          {service.experience && (
            <div style={{ background: '#f8f8f8', borderRadius: '6px', padding: '0.35rem 0.6rem', marginBottom: '0.6rem', display: 'inline-block' }}>
              <p style={{ fontSize: '0.68rem', color: '#555', margin: 0 }}>
                Experiencia: <span style={{ fontWeight: 700, color: '#111' }}>{service.experience}</span>
              </p>
            </div>
          )}

          <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.65, marginBottom: '0.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', flex: 1 }}>
            {service.description}
          </p>

          {service.price && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Desde</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111' }}>{service.price}</span>
            </div>
          )}

          
            href={`https://wa.me/57${(service.whatsapp || service.phone)?.replace(/\D/g, '')}?text=Hola,%20vi%20tu%20servicio%20en%20DMS%20Market%20y%20me%20interesa%20${encodeURIComponent(service.business_name)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, borderRadius: '999px', boxShadow: '0 2px 8px rgba(37,211,102,0.30)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  function SectionHeader({ eyebrow, title, count, color = '#D4AF37' }: { eyebrow: string; title: string; count: number; color?: string }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <p style={{ fontSize: '0.65rem', color, letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>{eyebrow}</p>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>
            {title}
            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({count})</span>
          </h2>
        </div>
        <button onClick={handlePublicar} style={{ fontSize: '0.8rem', color, background: 'none', border: `1px solid ${color}`, padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}>
          + Destacar mi servicio
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Segoe UI', sans-serif", color: '#111' }}>

      {/* NAV */}
      <nav style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 50, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src={LOGO} alt="DMS Market" style={{ height: '52px', objectFit: 'contain' }} />
        </a>
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 clamp(0.5rem, 2vw, 2rem)', display: 'flex', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar servicios profesionales..."
            style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', fontSize: '0.875rem', outline: 'none', color: '#fff', background: 'transparent' }} />
          <button style={{ padding: '0.7rem 1.25rem', background: '#D4AF37', color: '#0B0B0B', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <a href="/" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Productos</a>
          {user ? (
            <a href={getDashboardUrl()} style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Mi panel</a>
          ) : (
            <>
              <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      {/* CARRUSEL */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 45vw, 500px)', overflow: 'hidden', background: '#111' }}>
        {banners.length > 0 ? banners.map((banner, i) => (
          <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentSlide ? 1 : 0, overflow: 'hidden' }}>
            {banner.image_url && <img src={banner.image_url} alt={banner.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 6vw, 5rem)', textAlign: 'center', zIndex: 1 }}>
              <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market - Servicios</p>
              {banner.title && <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2, maxWidth: '700px' }}>{banner.title}</h1>}
              {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>{banner.subtitle}</p>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handlePublicar} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>
                  Publica tu servicio gratis
                </button>
                <a href="#servicios" style={{ background: 'transparent', color: '#fff', padding: '0.875rem 2rem', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '999px', textDecoration: 'none' }}>
                  Ver servicios
                </a>
              </div>
            </div>
          </div>
        )) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a, #1c1c1c)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market - Servicios</p>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>Profesionales verificados en Colombia</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '2rem' }}>Encuentra diseñadores, tecnologos, salud, reparaciones y mucho mas.</p>
            <button onClick={handlePublicar} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>
              Publica tu servicio gratis
            </button>
          </div>
        )}

        {banners.length > 1 && (
          <>
            <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '28px' : '8px', height: '8px', borderRadius: '4px', background: i === currentSlide ? '#D4AF37' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
            <button onClick={() => setCurrentSlide(p => (p - 1 + banners.length) % banners.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
            <button onClick={() => setCurrentSlide(p => (p + 1) % banners.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
          </>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(11,11,11,0.85)', backdropFilter: 'blur(10px)', padding: '0.875rem clamp(1rem, 4vw, 3rem)', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 4rem)', flexWrap: 'wrap', zIndex: 5 }}>
          {[
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Profesionales verificados' },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>, text: 'Perfiles con respaldo' },
            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, text: 'Soporte 24/7' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {b.icon}
              <span style={{ fontSize: '0.8rem', color: '#D1D1D1', fontWeight: 500 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '1.5rem clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 6vw, 5rem)', flexWrap: 'wrap' }}>
          {[['500+', 'Profesionales'], ['98%', 'Satisfaccion'], ['24h', 'Respuesta'], ['13', 'Categorias']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ color: '#D4AF37', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, margin: 0 }}>{n}</p>
              <p style={{ color: '#888', fontSize: '0.75rem', margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTRO CATEGORIAS */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '1rem clamp(1rem, 4vw, 2rem)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: '0.375rem 1rem', border: '1px solid ' + (selectedCategory === cat ? '#D4AF37' : '#eee'), background: selectedCategory === cat ? '#D4AF37' : '#fff', color: selectedCategory === cat ? '#0B0B0B' : '#555', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '999px', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO */}
      <div id="servicios" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        {/* PREMIUM */}
        {premium.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #0B0B0B, #1a1200)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.2rem' }}>Maxima visibilidad</p>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Premium Partners
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: '0.5rem' }}>({premium.length})</span>
                </h2>
              </div>
              <button onClick={handlePublicar} style={{ fontSize: '0.8rem', color: '#D4AF37', background: 'none', border: '1px solid rgba(212,175,55,0.4)', padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}>
                Ser Premium Partner
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
              {premium.map(s => <ServiceCard key={s.id} service={s} size="large" />)}
            </div>
          </section>
        )}

        {/* PRO */}
        {pro.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <SectionHeader eyebrow="Profesionales verificados" title="Servicios Pro" count={pro.length} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {pro.map(s => <ServiceCard key={s.id} service={s} />)}
            </div>
          </section>
        )}

        {/* BASICO */}
        {basic.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <SectionHeader eyebrow="Plan basico" title="Profesionales activos" count={basic.length} color="#888" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
              {basic.map(s => <ServiceCard key={s.id} service={s} />)}
            </div>
          </section>
        )}

        {/* SEPARADOR */}
        {free.length > 0 && (premium.length > 0 || pro.length > 0 || basic.length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 2rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
            <span style={{ color: '#ccc', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Otros servicios disponibles</span>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          </div>
        )}

        {/* GRATIS */}
        {free.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 600, color: '#aaa', margin: 0 }}>
                Todos los servicios
                <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 400, marginLeft: '0.5rem' }}>({free.length})</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem', opacity: 0.8 }}>
              {free.map(s => <ServiceCard key={s.id} service={s} size="small" />)}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>No hay servicios en esta categoria.</p>
            <button onClick={() => { setSelectedCategory('Todos'); setSearch('') }} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', border: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>
              Ver todos
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #1c1c1c)', padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.75rem', fontWeight: 600 }}>3 meses gratis</p>
        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Ofreces un servicio profesional?</h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.75rem' }}>Publica gratis y llega a miles de clientes en Colombia.</p>
        <button onClick={handlePublicar} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.9rem 2.25rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}>
          Publicar mi servicio gratis
        </button>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0B0B0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <img src={LOGO} alt="DMS Market" style={{ height: '60px', objectFit: 'contain', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.8rem', color: '#D1D1D1', lineHeight: 1.7, marginBottom: '1rem' }}>Conectamos profesionales con clientes en toda Colombia.</p>
            </div>
            {[
              { title: 'Navegacion', links: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/' }, { label: 'Servicios', href: '/servicios' }, { label: 'Publicar servicio', href: '/auth/register-provider' }] },
              { title: 'Ayuda', links: [{ label: 'Centro de ayuda', href: '/soporte' }, { label: 'Como funciona', href: '/soporte' }, { label: 'Soporte', href: '/soporte' }] },
              { title: 'Legal', links: [{ label: 'Privacidad', href: '/politicas#privacidad' }, { label: 'Terminos', href: '/politicas#terminos' }, { label: 'Devoluciones', href: '/politicas#devoluciones' }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>{col.title}</p>
                {col.links.map(link => (
                  <a key={link.label} href={link.href} style={{ display: 'block', fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', marginBottom: '0.5rem' }}>{link.label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {['Profesionales verificados', 'Perfiles con respaldo', 'Soporte disponible', 'Plataforma segura'].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '999px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37' }} />
                <span style={{ fontSize: '0.72rem', color: '#D1D1D1', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>2025 DMS Market. Colombia. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/politicas#privacidad" style={{ fontSize: '0.75rem', color: '#666', textDecoration: 'none' }}>Privacidad</a>
              <a href="/politicas#terminos" style={{ fontSize: '0.75rem', color: '#666', textDecoration: 'none' }}>Terminos</a>
              <a href="/auth/login" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}



