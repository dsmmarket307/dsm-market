import { createClient as createAdmin } from "@supabase/supabase-js"

const categories = [
  'Todos',
  'Diseño y creatividad',
  'Tecnología y sistemas',
  'Clases y tutorías',
  'Belleza y bienestar',
  'Reparaciones y mantenimiento',
  'Eventos y fotografía',
  'Jurídico y contable',
  'Salud y medicina',
  'Construcción y remodelación',
  'Delivery y mandados',
  'Marketing y publicidad',
  'Otros',
]

export default async function ServiciosPage() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: services } = await admin
    .from('services')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #e8e8e8', padding: '0 clamp(1rem, 4vw, 2rem)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <a href="/" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '1px', textDecoration: 'none' }}>DMS Market</a>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Productos</a>
          <a href="/auth/login" style={{ fontSize: '0.85rem', color: '#555', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
          <a href="/auth/register" style={{ fontSize: '0.85rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '999px', fontWeight: 600 }}>Registrarse</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)', padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Servicios Profesionales</p>
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.75rem, 5vw, 3.25rem)', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
            Encuentra el experto<br />que necesitas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Conectamos clientes con profesionales en toda Colombia. Calidad garantizada.
          </p>
          <a href="/auth/register-provider" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.9rem 2.25rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', borderRadius: '999px', boxShadow: '0 4px 20px rgba(201,168,76,0.4)' }}>
            Publica tu servicio gratis
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['500+', 'Profesionales'], ['98%', 'Satisfaccion'], ['24h', 'Respuesta']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ color: '#C9A84C', fontSize: '1.5rem', fontWeight: 700 }}>{n}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTRO CATEGORIA DESPLEGABLE */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '1.25rem clamp(1rem, 4vw, 2rem)', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
          Categoria:
        </label>
        <select style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', color: '#111', background: '#fff', outline: 'none', cursor: 'pointer', minWidth: '220px' }}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
            Servicios disponibles
            <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({services?.length ?? 0})</span>
          </h2>
          <a href="/auth/register-provider" style={{ fontSize: '0.82rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600, border: '1px solid #C9A84C', padding: '0.4rem 1rem', borderRadius: '999px' }}>
            + Publicar mi servicio
          </a>
        </div>

        {!services || services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>No hay servicios disponibles aun.</p>
            <a href="/auth/register-provider" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px' }}>
              Se el primero en publicar
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {services.map((service: any) => (
              <div key={service.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}>

                {/* IMAGEN */}
                <div style={{ position: 'relative', paddingBottom: '56%', background: '#f8f8f8', overflow: 'hidden' }}>
                  {service.service_image_url ? (
                    <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f5f5, #ebebeb)' }}>
                      <p style={{ fontSize: '0.75rem', color: '#ccc' }}>Sin foto</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.65rem', padding: '0.25rem 0.625rem', borderRadius: '999px', fontWeight: 600 }}>
                    {service.category}
                  </div>
                </div>

                {/* CONTENIDO */}
                <div style={{ padding: '1.25rem' }}>

                  {/* PERFIL */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#C9A84C', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #f0f0f0' }}>
                      {service.avatar_url ? (
                        <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '0.1rem' }}>{service.business_name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#aaa' }}>{service.city}</p>
                    </div>
                  </div>

                  {/* DESCRIPCION */}
                  <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.65, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {service.description}
                  </p>

                  {/* PRECIO */}
                  {service.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
                      <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Desde</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>{service.price}</span>
                    </div>
                  )}

                  {/* BOTON WHATSAPP */}
                  
                    <a href={`https://wa.me/57${(service.whatsapp || service.phone)?.replace(/\D/g, '')}?text=Hola,%20vi%20tu%20servicio%20en%20DMS%20Market%20y%20me%20interesa%20${encodeURIComponent(service.business_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', background: '#25D366', color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(37,211,102,0.3)' }}>
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
        <a href="/auth/register-provider" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.9rem 2.25rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, borderRadius: '999px', boxShadow: '0 4px 20px rgba(201,168,76,0.4)' }}>
          Publicar mi servicio gratis
        </a>
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