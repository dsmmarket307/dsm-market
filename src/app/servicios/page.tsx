'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const LOGO = 'https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png'

const categories = [
  'Todos', 'Diseno y creatividad', 'Tecnologia y sistemas', 'Clases y tutorias',
  'Belleza y bienestar', 'Reparaciones y mantenimiento', 'Eventos y fotografia',
  'Juridico y contable', 'Salud y medicina', 'Construccion y remodelacion',
  'Delivery y mandados', 'Marketing y publicidad', 'Otros',
]

const PLAN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  premium: { label: 'PREMIUM', color: '#fff', bg: '#0B0B0B' },
  pro:     { label: 'PRO',     color: '#0B0B0B', bg: '#D4AF37' },
  basic:   { label: 'BASICO',  color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
}

export default function ServiciosPage() {
  const supabase = createClient()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [banners, setBanners] = useState<any[]>([])

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % banners.length), 4500)
    return () => clearInterval(t)
  }, [banners.length])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setProfile(prof)
      }
      const { data: bannersData } = await supabase
        .from('banners_servicios')
        .select('id, title, subtitle, image_url, link, active, position')
        .eq('active', true)
        .order('position', { ascending: true })
      setBanners(bannersData ?? [])

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('user_id, plan_type')
        .eq('status', 'active')

      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const subMap: Record<string, string> = {}
      subs?.forEach((s: any) => { subMap[s.user_id] = s.plan_type })

      const enriched = (data ?? []).map((s: any) => ({
        ...s,
        plan_type: subMap[s.provider_id] ?? null,
      }))

      setServices(enriched)
      setLoading(false)
    }
    load()
  }, [])

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
    const matchSearch = !search.trim() || s.business_name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.filter(s => s.plan_type === 'premium' || s.plan_type === 'pro')
  const basic = filtered.filter(s => s.plan_type === 'basic')
  const free = filtered.filter(s => !s.plan_type)

  function ServiceCard({ service }: { service: any }) {
    const plan = service.plan_type ? PLAN_BADGE[service.plan_type] : null
    const isPremiumOrPro = service.plan_type === 'premium' || service.plan_type === 'pro'

    return (
      <div style={{
        border: isPremiumOrPro ? '2px solid #D4AF37' : '1px solid #f0f0f0',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: isPremiumOrPro ? '0 8px 32px rgba(212,175,55,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.25s',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = isPremiumOrPro ? '0 16px 48px rgba(212,175,55,0.2)' : '0 12px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = isPremiumOrPro ? '0 8px 32px rgba(212,175,55,0.12)' : '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ position: 'relative', paddingBottom: '60%', background: '#f8f8f8', overflow: 'hidden' }}>
          {service.service_image_url ? (
            <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1c1c1c, #333)' }}>
              <span style={{ fontSize: '3rem', color: '#D4AF37', fontWeight: 700 }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>{service.category}</div>
          {plan && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: plan.bg, color: plan.color, fontSize: '0.6rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 800, letterSpacing: '1px', border: service.plan_type === 'basic' ? '1px solid #D4AF37' : 'none' }}>
              {plan.label}
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #f0d060)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isPremiumOrPro ? '2px solid #D4AF37' : '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              {service.avatar_url ? (
                <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.1rem' }}>{service.business_name}</p>
              {service.profession && <p style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 600, marginBottom: '0.1rem' }}>{service.profession}</p>}
              <p style={{ fontSize: '0.72rem', color: '#aaa' }}>{service.city}</p>
            </div>
          </div>

          {service.experience && (
            <div style={{ background: '#f8f8f8', borderRadius: '6px', padding: '0.4rem 0.75rem', marginBottom: '0.75rem', display: 'inline-block' }}>
              <p style={{ fontSize: '0.7rem', color: '#555', fontWeight: 500, margin: 0 }}>
                Experiencia: <span style={{ color: '#111', fontWeight: 700 }}>{service.experience}</span>
              </p>
            </div>
          )}

          <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.7, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', flex: 1 }}>
            {service.description}
          </p>

          {service.price && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Desde</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>{service.price}</span>
            </div>
          )}

          
            href={`https://wa.me/57${(service.whatsapp || service.phone)?.replace(/\D/g, '')}?text=Hola,%20vi%20tu%20servicio%20en%20DMS%20Market%20y%20me%20interesa%20${encodeURIComponent(service.business_name)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, borderRadius: '999px', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Segoe UI', sans-serif", color: '#111' }}>

      {/* NAV */}
      <nav style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 50, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src={LOGO} alt="DMS Market" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
        </a>
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 clamp(0.5rem, 2vw, 2rem)', display: 'flex', background: '#1a1a1a', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar servicios profesionales..."
            style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', fontSize: '0.875rem', outline: 'none', color: '#fff', background: 'transparent' }}
          />
          <button style={{ padding: '0.7rem 1.25rem', background: '#D4AF37', color: '#0B0B0B', border: 'none', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <a href="/" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>Productos</a>
          {user ? (
            <a href={getDashboardUrl()} style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Mi panel</a>
          ) : (
            <>
              <a href="/auth/login" style={{ fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: '0.8rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.6rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      {/* CARRUSEL */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 45vw, 500px)', overflow: 'hidden', background: '#111' }}>
        {banners.map((banner, i) => (
          <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentSlide ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 6vw, 5rem)', textAlign: 'center', overflow: 'hidden' }}>
            {banner.image_url && <img src={banner.image_url} alt={banner.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market - Servicios</p>
              {banner.title && <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2, maxWidth: '700px' }}>{banner.title}</h1>}
              {banner.subtitle && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>{banner.subtitle}</p>}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handlePublicar} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}>
                  Publica tu servicio gratis
                </button>
                <a href="#servicios" style={{ background: 'transparent', color: '#fff', padding: '0.875rem 2rem', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '999px', textDecoration: 'none' }}>
                  Ver servicios
                </a>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a0a0a, #1c1c1c)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market - Servicios</p>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem' }}>Profesionales verificados en Colombia</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '2rem' }}>Encuentra el profesional ideal para tu proyecto. Diseño, tecnologia, salud, reparaciones y mucho mas.</p>
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

        {/* Sellos seguridad */}
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

      <div id="servicios" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: '#D4AF37' }}>Cargando servicios...</p>
          </div>
        ) : (
          <>
            {/* SERVICIOS DESTACADOS PREMIUM Y PRO */}
            {featured.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Maxima visibilidad</p>
                    <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>
                      Servicios destacados
                      <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({featured.length})</span>
                    </h2>
                  </div>
                  <button onClick={handlePublicar} style={{ fontSize: '0.82rem', color: '#D4AF37', background: 'none', border: '1px solid #D4AF37', padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}>
                    + Destacar mi servicio
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {featured.map(s => <ServiceCard key={s.id} service={s} />)}
                </div>
              </section>
            )}

            {/* SERVICIOS BASICOS */}
            {basic.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 0.25rem' }}>Plan basico</p>
                    <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#0B0B0B', margin: 0 }}>
                      Profesionales activos
                      <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({basic.length})</span>
                    </h2>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {basic.map(s => <ServiceCard key={s.id} service={s} />)}
                </div>
              </section>
            )}

            {/* SEPARADOR */}
            {free.length > 0 && (featured.length > 0 || basic.length > 0) && (
              <div style={{ borderTop: '2px dashed #f0f0f0', margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ background: '#fff', padding: '0 1rem', color: '#aaa', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Otros servicios disponibles</span>
              </div>
            )}

            {/* SERVICIOS GRATIS */}
            {free.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 600, color: '#888', margin: 0 }}>
                    Todos los servicios
                    <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({free.length})</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', opacity: 0.85 }}>
                  {free.map(s => <ServiceCard key={s.id} service={s} />)}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>No hay servicios en esta categoria.</p>
                <button onClick={() => setSelectedCategory('Todos')} style={{ background: '#D4AF37', color: '#0B0B0B', padding: '0.875rem 2rem', border: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>Ver todos</button>
              </div>
            )}
          </>
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
              <img src={LOGO} alt="DMS Market" style={{ height: '60px', width: 'auto', objectFit: 'contain', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.8rem', color: '#D1D1D1', lineHeight: 1.7, marginBottom: '1rem' }}>Conectamos profesionales con clientes en toda Colombia.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  <svg key="fb" width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                  <svg key="ig" width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#0B0B0B"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#0B0B0B" strokeWidth="2"/></svg>,
                  <svg key="tw" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
                ].map((icon, i) => (
                  <div key={i} style={{ width: '32px', height: '32px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Navegacion', links: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/' }, { label: 'Servicios', href: '/servicios' }, { label: 'Publicar servicio', href: '/auth/register-provider' }] },
              { title: 'Ayuda', links: [{ label: 'Centro de ayuda', href: '/soporte' }, { label: 'Como funciona', href: '/soporte' }, { label: 'Soporte', href: '/soporte' }, { label: 'Contacto', href: '/soporte' }] },
              { title: 'Legal', links: [{ label: 'Politica de Privacidad', href: '/politicas#privacidad' }, { label: 'Terminos y Condiciones', href: '/politicas#terminos' }, { label: 'Devoluciones', href: '/politicas#devoluciones' }, { label: 'Envios', href: '/politicas#envios' }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>{col.title}</p>
                {col.links.map(link => (
                  <a key={link.label} href={link.href} style={{ display: 'block', fontSize: '0.8rem', color: '#D1D1D1', textDecoration: 'none', marginBottom: '0.5rem' }}>{link.label}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Sellos */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Profesionales verificados' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>, text: 'Perfiles con respaldo' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, text: 'Soporte disponible' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: 'Plataforma segura' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.875rem', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '999px' }}>
                  {item.icon}
                  <span style={{ fontSize: '0.72rem', color: '#D1D1D1', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
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
