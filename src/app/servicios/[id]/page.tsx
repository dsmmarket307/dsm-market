import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('business_name, description, category').eq('id', params.id).single()
  if (!data) return { title: 'Servicio | DMS Market' }
  return {
    title: `${data.business_name} | DMS Market`,
    description: data.description?.slice(0, 160),
    openGraph: { title: data.business_name, description: data.description?.slice(0, 160) },
  }
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (!service) notFound()

  const { data: related } = await supabase
    .from('services')
    .select('id, business_name, category, price, avatar_url, service_image_url, city, avg_rating')
    .eq('category', service.category)
    .eq('status', 'approved')
    .neq('id', params.id)
    .limit(3)

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', service.provider_id)
    .eq('status', 'active')
    .single()

  const plan = sub?.plan_type ?? null
  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu servicio en DMS Market y me interesa ' + service.business_name)}`

  const PLAN_BADGE: Record<string, { label: string; bg: string; color: string }> = {
    premium: { label: 'Premium Partner', bg: '#D4AF37', color: '#0B0B0B' },
    pro: { label: 'Pro Verificado', bg: '#1a1a1a', color: '#D4AF37' },
    basic: { label: 'Activo', bg: '#1a1a1a', color: '#aaa' },
  }
  const badge = plan ? PLAN_BADGE[plan] : null

  return (
    <main style={{ background: '#0B0B0B', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", color: '#fff' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 100 }}>
        <a href="/" style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
        <a href="/servicios" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>← Volver a servicios</a>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>

        {/* COLUMNA PRINCIPAL */}
        <div>

          {/* IMAGEN HERO */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/7', background: '#1a1a1a', marginBottom: '1.5rem', position: 'relative' }}>
            {service.service_image_url
              ? <img src={service.service_image_url} alt={service.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)' }}>
                  <span style={{ fontSize: '5rem', color: '#D4AF37', fontWeight: 800 }}>{service.business_name?.charAt(0)}</span>
                </div>
            }
            {badge && (
              <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: badge.bg, color: badge.color, fontSize: '0.65rem', fontWeight: 800, padding: '0.4rem 1rem', borderRadius: '999px', letterSpacing: '1px' }}>
                {badge.label}
              </span>
            )}
            <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.65rem', padding: '0.4rem 0.9rem', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
              {service.category}
            </span>
          </div>

          {/* TÍTULO Y RATING */}
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>{service.business_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>★</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{service.avg_rating ? Number(service.avg_rating).toFixed(1) : '5.0'}</span>
              <span style={{ color: '#555', fontSize: '0.8rem' }}>({service.review_count ?? 0} reseñas)</span>
            </div>
            <span style={{ color: '#555' }}>·</span>
            <span style={{ color: '#aaa', fontSize: '0.82rem' }}>📍 {service.city}</span>
            <span style={{ color: '#555' }}>·</span>
            <span style={{ color: '#aaa', fontSize: '0.82rem' }}>{service.sale_count ?? 0} proyectos</span>
          </div>

          {/* PROVEEDOR */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #D4AF3740', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {service.avatar_url
                ? <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.3rem' }}>{service.business_name?.charAt(0)}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{service.business_name}</p>
              {service.profession && <p style={{ color: '#D4AF37', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{service.profession}</p>}
              <p style={{ color: '#555', fontSize: '0.75rem' }}>📍 {service.city}</p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>24h</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Respuesta</p></div>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>{service.sale_count ?? 0}</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Proyectos</p></div>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>98%</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Satisfacción</p></div>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#D4AF37' }}>◆</span> Sobre este servicio
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{service.description}</p>
          </div>

          {/* EXPERIENCIA */}
          {service.experience && (
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#D4AF37' }}>◆</span> Experiencia
              </h2>
              <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.9 }}>{service.experience}</p>
            </div>
          )}

          {/* BENEFICIOS */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#D4AF37' }}>◆</span> Por qué elegirnos
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['Proveedor verificado por DMS', 'Pago seguro con escrow', 'Calidad garantizada', 'Soporte DMS Market'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#D4AF37', fontSize: '0.8rem' }}>✓</span>
                  <span style={{ color: '#aaa', fontSize: '0.82rem' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICIOS RELACIONADOS */}
          {related && related.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#D4AF37' }}>◆</span> Servicios relacionados
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {related.map((r: any) => (
                  <a key={r.id} href={`/servicios/${r.id}`} style={{ textDecoration: 'none', background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', display: 'block', transition: 'border-color 0.2s' }}>
                    <div style={{ height: '120px', background: '#1a1a1a', overflow: 'hidden' }}>
                      {r.service_image_url
                        ? <img src={r.service_image_url} alt={r.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#D4AF37', fontSize: '2rem', fontWeight: 800 }}>{r.business_name?.charAt(0)}</span>
                          </div>
                      }
                    </div>
                    <div style={{ padding: '0.85rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', marginBottom: '0.25rem' }}>{r.business_name}</p>
                      <p style={{ color: '#555', fontSize: '0.72rem' }}>{r.city}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR STICKY */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: '#111', border: plan === 'premium' ? '1px solid #D4AF3760' : '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem', boxShadow: plan === 'premium' ? '0 8px 32px rgba(212,175,55,0.12)' : 'none' }}>
            {service.price && (
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #1e1e1e' }}>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '0.25rem' }}>Desde</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{service.price}</p>
              </div>
            )}

            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.9rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, borderRadius: '10px', marginBottom: '0.75rem', boxSizing: 'border-box' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contactar por WhatsApp
            </a>

            <button style={{ width: '100%', padding: '0.9rem', background: 'transparent', border: '1px solid #D4AF3760', color: '#D4AF37', fontSize: '0.88rem', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', marginBottom: '1.25rem', boxSizing: 'border-box' }}>
              Solicitar cotización
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid #1e1e1e' }}>
              {[['✓', 'Proveedor verificado'], ['✓', 'Pago seguro'], ['✓', 'Soporte DMS Market'], ['✓', 'Calidad garantizada']].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#D4AF37', fontSize: '0.8rem' }}>{icon}</span>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}