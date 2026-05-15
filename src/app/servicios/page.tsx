'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'Todos', 'Diseno y creatividad', 'Tecnologia y sistemas', 'Clases y tutorias',
  'Belleza y bienestar', 'Reparaciones y mantenimiento', 'Eventos y fotografia',
  'Juridico y contable', 'Salud y medicina', 'Construccion y remodelacion',
  'Delivery y mandados', 'Marketing y publicidad', 'Otros',
]

const bannerSlides = [
  {
    title: 'Encuentra el experto que necesitas',
    subtitle: 'Conectamos clientes con profesionales en toda Colombia.',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)',
  },
  {
    title: 'Servicios profesionales verificados',
    subtitle: 'Todos nuestros proveedores pasan por un proceso de verificacion.',
    bg: 'linear-gradient(135deg, #1a0a00 0%, #2c1500 100%)',
  },
  {
    title: '3 meses gratis para proveedores',
    subtitle: 'Publica tu servicio gratis y llega a miles de clientes.',
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #15152c 100%)',
  },
]

export default function ServiciosPage() {
  const supabase = createClient()
  const [services, setServices] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % bannerSlides.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setProfile(prof)
      }
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      setServices(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Todos') {
      setFiltered(services)
    } else {
      setFiltered(services.filter(s => s.category === selectedCategory))
    }
  }, [selectedCategory, services])

  function getDashboardUrl() {
    if (!profile) return '/dashboard'
    if (profile.role === 'seller') return '/dashboard/vendor'
    if (profile.role === 'provider') return '/dashboard/provider'
    if (profile.role === 'admin') return '/dashboard/admin'
    return '/dashboard/buyer'
  }

  function handlePublicar() {
    if (user) {
      window.location.href = '/auth/register-provider'
    } else {
      window.location.href = '/auth/login?redirect=/auth/register-provider'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #e8e8e8', padding: '0 clamp(1rem, 4vw, 2rem)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <a href="/" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '1px', textDecoration: 'none' }}>DMS Market</a>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Productos</a>
          {user ? (
            <a href={getDashboardUrl()} style={{ fontSize: '0.85rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '999px', fontWeight: 600 }}>Mi panel</a>
          ) : (
            <>
              <a href="/auth/login?redirect=/servicios" style={{ fontSize: '0.85rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: '0.85rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '999px', fontWeight: 600 }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      {/* CARRUSEL */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 45vw, 500px)', overflow: 'hidden' }}>
        {bannerSlides.map((slide, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, background: slide.bg, transition: 'opacity 0.8s ease', opacity: i === currentSlide ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 6vw, 5rem)', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>DMS Market — Servicios</p>
              <h1 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2, maxWidth: '700px' }}>{slide.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>{slide.subtitle}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handlePublicar} style={{ background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', borderRadius: '999px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(201,168,76,0.4)' }}>
                  Publica tu servicio gratis
                </button>
                <a href="#servicios" style={{ background: 'transparent', color: '#fff', padding: '0.875rem 2rem', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600, borderRadius: '999px', textDecoration: 'none' }}>
                  Ver servicios
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Indicadores */}
        <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          {bannerSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '28px' : '8px', height: '8px', borderRadius: '4px', background: i === currentSlide ? '#C9A84C' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* Flechas */}
        <button onClick={() => setCurrentSlide(p => (p - 1 + bannerSlides.length) % bannerSlides.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
        <button onClick={() => setCurrentSlide(p => (p + 1) % bannerSlides.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
      </div>

      {/* STATS */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '1.5rem clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 6vw, 5rem)', flexWrap: 'wrap' }}>
          {[['500+', 'Profesionales'], ['98%', 'Satisfaccion'], ['24h', 'Respuesta'], ['13', 'Categorias']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ color: '#C9A84C', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700 }}>{n}</p>
              <p style={{ color: '#888', fontSize: '0.75rem' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTRO CATEGORIAS */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '1rem clamp(1rem, 4vw, 2rem)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: '0.375rem 1rem', border: '1px solid ' + (selectedCategory === cat ? '#C9A84C' : '#eee'), background: selectedCategory === cat ? '#C9A84C' : '#fff', color: selectedCategory === cat ? '#fff' : '#555', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '999px', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICIOS */}
      <div id="servicios" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
            {selectedCategory === 'Todos' ? 'Todos los servicios' : selectedCategory}
            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({filtered.length})</span>
          </h2>
          <button onClick={handlePublicar} style={{ fontSize: '0.82rem', color: '#C9A84C', background: 'none', border: '1px solid #C9A84C', padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}>
            + Publicar mi servicio
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: '#C9A84C' }}>Cargando servicios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>No hay servicios en esta categoria.</p>
            <button onClick={() => setSelectedCategory('Todos')} style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', border: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>Ver todos</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((service: any) => (
              <div key={service.id}
                style={{ border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>

                {/* IMAGEN SERVICIO */}
                <div style={{ position: 'relative', paddingBottom: '60%', background: '#f8f8f8', overflow: 'hidden' }}>
                  {service.service_image_url ? (
                    <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1c1c1c, #333)' }}>
                      <span style={{ fontSize: '3rem', color: '#C9A84C', fontWeight: 700 }}>{service.business_name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>{service.category}</div>
                </div>

                <div style={{ padding: '1.25rem' }}>

                  {/* PERFIL PROVEEDOR */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #e8c96d)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      {service.avatar_url ? (
                        <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.1rem' }}>{service.business_name}</p>
                      {service.profession && (
                        <p style={{ fontSize: '0.72rem', color: '#C9A84C', fontWeight: 600, marginBottom: '0.1rem' }}>{service.profession}</p>
                      )}
                      <p style={{ fontSize: '0.72rem', color: '#aaa' }}>📍 {service.city}</p>
                    </div>
                  </div>

                  {/* EXPERIENCIA */}
                  {service.experience && (
                    <div style={{ background: '#f8f8f8', borderRadius: '6px', padding: '0.4rem 0.75rem', marginBottom: '0.75rem', display: 'inline-block' }}>
                      <p style={{ fontSize: '0.7rem', color: '#555', fontWeight: 500 }}>
                        Experiencia: <span style={{ color: '#111', fontWeight: 700 }}>{service.experience}</span>
                      </p>
                    </div>
                  )}

                  {/* DESCRIPCION */}
                  <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.7, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{service.description}</p>

                  {/* PRECIO */}
                  {service.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Desde</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>{service.price}</span>
                    </div>
                  )}

                  {/* BOTON WHATSAPP */}
                  <a href={`https://wa.me/57${(service.whatsapp || service.phone)?.replace(/\D/g, '')}?text=Hola,%20vi%20tu%20servicio%20en%20DMS%20Market%20y%20me%20interesa%20${encodeURIComponent(service.business_name)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, borderRadius: '999px', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(37,211,102,0.35)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #1c1c1c)', padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem', fontWeight: 600 }}>3 meses gratis</p>
        <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Ofreces un servicio profesional?</h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.75rem' }}>Publica gratis y llega a miles de clientes en Colombia.</p>
        <button onClick={handlePublicar} style={{ background: '#C9A84C', color: '#fff', padding: '0.9rem 2.25rem', border: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}>
          Publicar mi servicio gratis
        </button>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '1.5rem clamp(1rem, 4vw, 2rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1rem' }}>DMS Market</span>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>2025 DMS Market. Colombia</p>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="/politicas" style={{ fontSize: '0.75rem', color: '#999', textDecoration: 'none' }}>Politicas</a>
          <a href="/auth/login" style={{ fontSize: '0.75rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
        </div>
      </footer>
    </div>
  )
}