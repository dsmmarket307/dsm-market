'use client'

const categories = [
  'Todos', 'Diseno y creatividad', 'Tecnologia y sistemas', 'Clases y tutorias',
  'Belleza y bienestar', 'Reparaciones y mantenimiento', 'Eventos y fotografia',
  'Juridico y contable', 'Salud y medicina', 'Construccion y remodelacion',
  'Delivery y mandados', 'Marketing y publicidad', 'Otros',
]

export default function ServiciosGrid({ services }: { services: any[] }) {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

      <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Categoria:</label>
        <select style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', color: '#111', background: '#fff', outline: 'none', minWidth: '220px' }}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>
          Servicios disponibles <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 400, marginLeft: '0.5rem' }}>({services.length})</span>
        </h2>
        <a href="/auth/register-provider" style={{ fontSize: '0.82rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600, border: '1px solid #C9A84C', padding: '0.4rem 1rem', borderRadius: '999px' }}>+ Publicar mi servicio</a>
      </div>

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1.5rem' }}>No hay servicios disponibles aun.</p>
          <a href="/auth/register-provider" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, borderRadius: '999px' }}>Se el primero en publicar</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {services.map((service: any) => (
            <div key={service.id}
              style={{ border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.25s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>

              <div style={{ position: 'relative', paddingBottom: '60%', background: '#f8f8f8', overflow: 'hidden' }}>
                {service.service_image_url ? (
                  <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1c1c1c, #333)' }}>
                    <span style={{ fontSize: '3rem', color: '#C9A84C', fontWeight: 700 }}>{service.business_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.65rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>{service.category}</div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #e8c96d)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    {service.avatar_url ? (
                      <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.1rem' }}>{service.business_name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#aaa' }}>📍 {service.city}</p>
                  </div>
                </div>

                <p style={{ fontSize: '0.83rem', color: '#555', lineHeight: 1.7, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{service.description}</p>

                {service.price && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5' }}>
                    <span style={{ fontSize: '0.7rem', color: '#aaa' }}>Desde</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111' }}>{service.price}</span>
                  </div>
                )}

                
                  <a href={`https://wa.me/57${(service.whatsapp || service.phone)?.replace(/\D/g, '')}?text=Hola,%20vi%20tu%20servicio%20en%20DMS%20Market%20y%20me%20interesa%20${encodeURIComponent(service.business_name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
  )
}