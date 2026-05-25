import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data } = await supabase.from('services').select('business_name, description, category').eq('id', params.id).single()
  if (!data) return { title: 'Servicio | DMS Market' }
  return {
    title: `${data.business_name} | DMS Market`,
    description: data.description?.slice(0, 160),
    openGraph: { title: data.business_name, description: data.description?.slice(0, 160) },
  }
}

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    
    .single()

  if (!service) notFound()

  const { data: related } = await supabase
    .from('services')
    .select('id, business_name, category, price, avatar_url, service_image_url, city, avg_rating')
    .eq('category', service.category)
    
    .neq('id', params.id)
    .limit(3)

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', service.provider_id)
    .eq('status', 'approved')
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
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 100 }}>
        <a href="/" style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
        <a href="/servicios" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>← Volver a servicios</a>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
        <div>
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
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>{service.business_name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ color: '#D4AF37', fontSize: '0.9rem' }}>★</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{service.avg_rating ? Number(service.avg_rating).toFixed(1) : '5.0'}</span>
              <span style={{ color: '#555', fontSize: '0.8rem' }}>({service.review_count ?? 0} resenas)</span>
            </div>
            <span style={{ color: '#555' }}>.</span>
            <span style={{ color: '#aaa', fontSize: '0.82rem' }}>📍 {service.city}</span>
            <span style={{ color: '#555' }}>.</span>
            <span style={{ color: '#aaa', fontSize: '0.82rem' }}>{service.sale_count ?? 0} proyectos</span>
          </div>
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
            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' as const }}>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>24h</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Respuesta</p></div>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>{service.sale_count ?? 0}</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Proyectos</p></div>
              <div><p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#D4AF37' }}>98%</p><p style={{ color: '#555', fontSize: '0.68rem' }}>Satisfaccion</p></div>
            </div>
          </div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Sobre este servicio</h2>
            <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{service.description}</p>
          </div>
          {service.experience && (
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Experiencia</h2>
              <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.9 }}>{service.experience}</p>
            </div>
          )}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Por que elegirnos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['Proveedor verificado por DMS', 'Pago seguro con escrow', 'Calidad garantizada', 'Soporte DMS Market'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#D4AF37', fontSize: '0.8rem' }}>✓</span>
                  <span style={{ color: '#aaa', fontSize: '0.82rem' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
          {related && related.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Servicios relacionados</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {related.map((r: any) => (
                  <a key={r.id} href={`/servicios/${r.id}`} style={{ textDecoration: 'none', background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden', display: 'block' }}>
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
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: '#111', border: plan === 'premium' ? '1px solid #D4AF3760' : '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem' }}>
            {service.price && (
              <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #1e1e1e' }}>
                <p style={{ color: '#aaa', fontSize: '0.72rem', marginBottom: '0.25rem' }}>Desde</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{service.price}</p>
              </div>
            )}
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.9rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, borderRadius: '10px', marginBottom: '0.75rem', boxSizing: 'border-box' as const }}>
              Contactar por WhatsApp
            </a>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.6rem', paddingTop: '1rem', borderTop: '1px solid #1e1e1e' }}>
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



