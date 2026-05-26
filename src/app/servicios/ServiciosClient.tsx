'use client'

import { useState, useEffect, useMemo } from 'react'
import type { RankedService } from '@/lib/ranking'

const LOGO = 'https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png'

const CATEGORIES = [
  'Todas las categorias',
  'Diseno y creatividad',
  'Tecnologia y sistemas',
  'Clases y tutorias',
  'Belleza y bienestar',
  'Reparaciones y mantenimiento',
  'Eventos y fotografia',
  'Juridico y contable',
  'Salud y medicina',
  'Construccion y remodelacion',
  'Delivery y mandados',
  'Marketing y publicidad',
  'Otros',
]

const PLAN_CONFIG = {
  premium: { label: 'PREMIUM PARTNER', color: '#92400e', bg: '#fef3c7', border: '#D4AF37', glow: 'rgba(212,175,55,0.15)', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  pro: { label: 'PRO VERIFICADO', color: '#1e40af', bg: '#eff6ff', border: '#3b82f6', glow: 'rgba(59,130,246,0.1)', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  basic: { label: 'PROVEEDOR ACTIVO', color: '#065f46', bg: '#ecfdf5', border: '#10b981', glow: 'rgba(16,185,129,0.08)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
}

interface Props {
  services: RankedService[]
  banners: any[]
  user: any
  profile: any
}

type TabType = 'todos' | 'premium' | 'pro' | 'activos'
type SortType = 'relevancia' | 'rating' | 'recientes'

export default function ServiciosClient({ services, banners, user, profile }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorias')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('todos')
  const [sortBy, setSortBy] = useState<SortType>('relevancia')
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

  const filtered = useMemo(() => {
    let result = services.filter(s => {
      const matchCat = selectedCategory === 'Todas las categorias' || s.category === selectedCategory
      const matchSearch = !search.trim() ||
        s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
      const matchTab =
        activeTab === 'todos' ? true :
        activeTab === 'premium' ? s.plan_type === 'premium' :
        activeTab === 'pro' ? s.plan_type === 'pro' :
        activeTab === 'activos' ? s.plan_type === 'basic' : true
      return matchCat && matchSearch && matchTab
    })
    if (sortBy === 'rating') result = [...result].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    else if (sortBy === 'recientes') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }, [services, selectedCategory, search, activeTab, sortBy])

  const stats = useMemo(() => ({
    total: services.length,
    verified: services.filter(s => s.plan_type).length,
    premium: services.filter(s => s.plan_type === 'premium').length,
  }), [services])

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    services.forEach(s => { counts[s.category] = (counts[s.category] ?? 0) + 1 })
    return counts
  }, [services])

  function PlanBadge({ plan }: { plan: string | null }) {
    if (!plan || !PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]) return null
    const cfg = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '6px', padding: '3px 8px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill={cfg.color}><path d={cfg.icon} /></svg>
        {cfg.label}
      </div>
    )
  }

  function StarRating({ rating, count }: { rating?: number | null; count?: number | null }) {
    const r = rating ?? 0
    if (!r) return null
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111' }}>{r.toFixed(1)}</span>
        {count ? <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>({count})</span> : null}
      </div>
    )
  }

  function ServiceCard({ service }: { service: RankedService }) {
    const plan = service.plan_type
    const cfg = plan ? PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] : null
    const isPremium = plan === 'premium'
    const isPro = plan === 'pro'
    const isHighlighted = isPremium || isPro
    const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu servicio en DMS Market y me interesa ' + service.business_name)}`

    return (
      <div style={{ background: '#fff', borderRadius: '16px', border: cfg ? `1.5px solid ${cfg.border}` : '1px solid #e5e7eb', boxShadow: cfg ? `0 4px 24px ${cfg.glow}` : '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.22s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = cfg ? `0 12px 40px ${cfg.glow}` : '0 8px 24px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = cfg ? `0 4px 24px ${cfg.glow}` : '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div style={{ position: 'relative', paddingBottom: '56%', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
          {service.service_image_url
            ? <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, background: isPremium ? 'linear-gradient(135deg, #1a0f00, #3d2200)' : isPro ? 'linear-gradient(135deg, #0f172a, #1e3a5f)' : 'linear-gradient(135deg, #1f2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: isPremium ? '#D4AF37' : isPro ? '#60a5fa' : '#6b7280' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
              </div>
          }
          {cfg && <div style={{ position: 'absolute', top: '10px', left: '10px' }}><PlanBadge plan={plan} /></div>}
          {isPremium && (
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700, color: '#D4AF37' }}>
              Score {Math.round(service.computed_score)}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: `2px solid ${cfg?.border ?? '#e5e7eb'}`, background: 'linear-gradient(135deg, #D4AF37, #f0d060)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {service.avatar_url
                ? <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.business_name}</p>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{service.city}</p>
            </div>
          </div>

          {service.avg_rating ? <StarRating rating={service.avg_rating} count={service.review_count} /> : null}
          {service.profession && <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', margin: 0 }}>{service.profession}</p>}

          <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', flex: 1 }}>
            {service.description}
          </p>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>{service.category}</span>
            {service.experience && <span style={{ fontSize: '0.65rem', background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>{service.experience}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem' }}>
            {[['Respuesta', '24h'], ['Proyectos', String(service.sale_count ?? 0)], ['Satisfaccion', '98%']].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: '0 0 1px' }}>{label}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0 }}>Desde</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: isPremium ? '#92400e' : isPro ? '#1e40af' : '#111', margin: 0 }}>{service.price ?? 'Consultar'}</p>
            </div>
            <a href={`/servicios/${service.id}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: isPremium ? '#D4AF37' : isPro ? '#3b82f6' : '#111', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Ver servicio
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos los servicios', count: services.length },
    { key: 'premium', label: 'Premium Partner', count: services.filter(s => s.plan_type === 'premium').length },
    { key: 'pro', label: 'Pro Verificados', count: services.filter(s => s.plan_type === 'pro').length },
    { key: 'activos', label: 'Proveedores Activos', count: services.filter(s => s.plan_type === 'basic').length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#0B0B0B', borderBottom: '1px solid rgba(212,175,55,0.15)', padding: '0 clamp(1rem, 4vw, 2rem)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src={LOGO} alt="DMS Market" style={{ height: '44px', objectFit: 'contain' }} />
        </a>
        <div style={{ flex: 1, maxWidth: '520px', display: 'flex', background: '#1a1a1a', border: '1.5px solid rgba(212,175,55,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar servicios, habilidades o proveedores..."
            style={{ flex: 1, padding: '0.625rem 1rem', border: 'none', fontSize: '0.875rem', outline: 'none', background: 'transparent', color: '#fff' }} />
          <button style={{ padding: '0.625rem 1rem', background: '#D4AF37', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Productos</a>
          {user ? (
            <a href={getDashboardUrl()} style={{ fontSize: '0.85rem', background: '#111', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>Mi panel</a>
          ) : (
            <>
              <a href="/auth/login" style={{ fontSize: '0.85rem', color: '#374151', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: '0.85rem', background: '#D4AF37', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      {/* CARRUSEL */}
      {banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(220px, 35vw, 400px)', overflow: 'hidden', background: '#111' }}>
          {banners.map((banner, i) => (
            <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentSlide ? 1 : 0, overflow: 'hidden' }}>
              {banner.image_url && <img src={banner.image_url} alt={banner.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 6vw, 5rem)', textAlign: 'center', zIndex: 1 }}>
                <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>DMS Market - Servicios</p>
                {banner.title && <h2 style={{ color: '#fff', fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.2, maxWidth: '700px' }}>{banner.title}</h2>}
                {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>{banner.subtitle}</p>}
                <button onClick={handlePublicar} style={{ background: '#D4AF37', color: '#fff', padding: '0.75rem 2rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>
                  Publica tu servicio gratis
                </button>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <>
              <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                {banners.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '24px' : '7px', height: '7px', borderRadius: '4px', background: i === currentSlide ? '#D4AF37' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />))}
              </div>
              <button onClick={() => setCurrentSlide(p => (p - 1 + banners.length) % banners.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
              <button onClick={() => setCurrentSlide(p => (p + 1) % banners.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
            </>
          )}
        </div>
      )}

      {/* HERO STATS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1.25rem clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 800, color: '#111', margin: '0 0 0.2rem' }}>Encuentra los mejores servicios profesionales</h1>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Conecta con expertos verificados listos para tu proyecto</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { value: `${stats.total}`, label: 'Servicios activos', color: '#D4AF37' },
              { value: `${stats.verified}`, label: 'Proveedores verificados', color: '#3b82f6' },
              { value: '4.9', label: 'Calificacion promedio', color: '#f59e0b' },
              { value: '100%', label: 'Pago seguro', color: '#10b981' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '0.875rem 1.1rem', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #D4AF37' : '2px solid transparent', background: 'transparent', color: activeTab === tab.key ? '#111' : '#6b7280', fontWeight: activeTab === tab.key ? 700 : 400, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {tab.label}
                <span style={{ fontSize: '0.68rem', background: activeTab === tab.key ? '#D4AF37' : '#f3f4f6', color: activeTab === tab.key ? '#fff' : '#6b7280', padding: '1px 6px', borderRadius: '999px', transition: 'all 0.2s' }}>{tab.count}</span>
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
            style={{ fontSize: '0.82rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.375rem 0.75rem', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none', margin: '0.5rem 0' }}>
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="rating">Mejor rating</option>
            <option value="recientes">Mas recientes</option>
          </select>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* SIDEBAR */}
          <aside style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', position: 'sticky', top: '80px' }}>
            <div style={{ padding: '0.875rem 1.1rem', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categorias</p>
            </div>
            <div style={{ padding: '0.4rem' }}>
              {CATEGORIES.map(cat => {
                const count = cat === 'Todas las categorias' ? services.length : (catCounts[cat] ?? 0)
                const isActive = selectedCategory === cat
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.7rem', border: 'none', borderRadius: '7px', background: isActive ? '#fef9ec' : 'transparent', color: isActive ? '#92400e' : '#374151', fontWeight: isActive ? 600 : 400, fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', gap: '0.5rem', marginBottom: '1px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                    <span style={{ fontSize: '0.68rem', background: isActive ? '#D4AF37' : '#f3f4f6', color: isActive ? '#fff' : '#9ca3af', padding: '1px 6px', borderRadius: '999px', flexShrink: 0 }}>{count}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ padding: '0.875rem 1.1rem', borderTop: '1px solid #f3f4f6', marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', margin: '0 0 0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel del proveedor</p>
              {[
                { label: 'Premium Partner', color: '#92400e', bg: '#fef3c7', count: stats.premium },
                { label: 'Pro Verificado', color: '#1e40af', bg: '#eff6ff', count: services.filter(s => s.plan_type === 'pro').length },
                { label: 'Proveedor Activo', color: '#065f46', bg: '#ecfdf5', count: services.filter(s => s.plan_type === 'basic').length },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '0.78rem', color: '#374151' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', background: item.bg, color: item.color, padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '0.875rem 1.1rem', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={handlePublicar}
                style={{ width: '100%', padding: '0.7rem', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                Publicar mi servicio
              </button>
            </div>
          </aside>

          {/* GRID */}
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem' }}>
              <span style={{ fontWeight: 700, color: '#111' }}>{filtered.length}</span> servicios encontrados
              {selectedCategory !== 'Todas las categorias' && <span> en <span style={{ fontWeight: 600, color: '#D4AF37' }}>{selectedCategory}</span></span>}
            </p>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '4rem 2rem', textAlign: 'center' }}>
                <p style={{ color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>No hay servicios disponibles</p>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Intenta con otra categoria o busqueda</p>
                <button onClick={() => { setSelectedCategory('Todas las categorias'); setSearch(''); setActiveTab('todos') }}
                  style={{ background: '#D4AF37', color: '#fff', padding: '0.625rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  Ver todos
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem' }}>
                {filtered.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)', marginTop: '1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { title: 'Proveedores Verificados', desc: 'Todos nuestros proveedores pasan por un proceso de verificacion', color: '#3b82f6' },
            { title: 'Pago Seguro', desc: 'Tu dinero esta protegido con nuestro sistema de seguridad', color: '#10b981' },
            { title: 'Calidad Garantizada', desc: 'Trabajos de calidad o te devolvemos tu dinero', color: '#D4AF37' },
            { title: 'Soporte 24/7', desc: 'Estamos aqui para ayudarte en todo momento', color: '#8b5cf6' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: b.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: b.color }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>{b.title}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#111', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <img src={LOGO} alt="DMS Market" style={{ height: '48px', objectFit: 'contain', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>Conectamos profesionales con clientes en toda Colombia.</p>
            </div>
            {[
              { title: 'Navegacion', links: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/' }, { label: 'Servicios', href: '/servicios' }, { label: 'Publicar servicio', href: '/auth/register-provider' }] },
              { title: 'Ayuda', links: [{ label: 'Centro de ayuda', href: '/soporte' }, { label: 'Como funciona', href: '/soporte' }, { label: 'Soporte', href: '/soporte' }] },
              { title: 'Legal', links: [{ label: 'Privacidad', href: '/politicas#privacidad' }, { label: 'Terminos', href: '/politicas#terminos' }, { label: 'Devoluciones', href: '/politicas#devoluciones' }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>{col.title}</p>
                {col.links.map(link => (<a key={link.label} href={link.href} style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', textDecoration: 'none', marginBottom: '0.4rem' }}>{link.label}</a>))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>2025 DMS Market. Colombia. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/politicas#privacidad" style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>Privacidad</a>
              <a href="/politicas#terminos" style={{ fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none' }}>Terminos</a>
              <a href="/auth/login" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}


