'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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

const CAT_ICONS: Record<string, string> = {
  'Todas las categorias': 'M4 6h16M4 12h16M4 18h16',
  'Diseno y creatividad': 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z',
  'Tecnologia y sistemas': 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18',
  'Clases y tutorias': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13',
  'Belleza y bienestar': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Reparaciones y mantenimiento': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'Eventos y fotografia': 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
  'Juridico y contable': 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5',
  'Salud y medicina': 'M4.5 12.75l6 6 9-13.5',
  'Construccion y remodelacion': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'Delivery y mandados': 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
  'Marketing y publicidad': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  'Otros': 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
}

interface Props {
  services: RankedService[]
  banners: any[]
  user: any
  profile: any
}

type SortType = 'relevancia' | 'rating' | 'recientes'

function StarRating({ rating, count }: { rating?: number | null; count?: number | null }) {
  const r = rating ?? 0
  if (!r) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>{r.toFixed(1)}</span>
      {count ? <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>({count} resenas)</span> : null}
    </div>
  )
}

function PremiumCard({ service }: { service: RankedService }) {
  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu servicio en DMS Market y me interesa ' + service.business_name)}`
  return (
    <div style={{ minWidth: '280px', maxWidth: '300px', background: '#fff', borderRadius: '14px', border: '1.5px solid #D4AF37', boxShadow: '0 4px 24px rgba(212,175,55,0.15)', overflow: 'hidden', flexShrink: 0, transition: 'all 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,175,55,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(212,175,55,0.15)' }}
    >
      <div style={{ position: 'relative', paddingBottom: '58%', background: '#1a1a1a', overflow: 'hidden' }}>
        {service.service_image_url
          ? <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0f00, #3d2200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#D4AF37' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            </div>
        }
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#fef3c7', color: '#92400e', border: '1px solid #D4AF37', borderRadius: '6px', padding: '3px 8px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#92400e"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
          PREMIUM PARTNER
        </div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: '6px', padding: '2px 7px', fontSize: '0.6rem', fontWeight: 700, color: '#D4AF37' }}>
          Score {Math.round(service.computed_score)}
        </div>
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #D4AF37', background: 'linear-gradient(135deg, #D4AF37, #f0d060)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {service.avatar_url
              ? <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.business_name}</p>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{service.city}</p>
          </div>
        </div>
        <StarRating rating={service.avg_rating} count={service.review_count} />
        <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, margin: '0.5rem 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{service.description}</p>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0 }}>Respuesta</p>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', margin: 0 }}>24h</p>
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0 }}>Proyectos</p>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', margin: 0 }}>{service.sale_count ?? 0}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: 0 }}>Desde</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400e', margin: 0 }}>{service.price ?? 'Consultar'}</p>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#D4AF37', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Ver servicio
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  )
}

function ProCard({ service }: { service: RankedService }) {
  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu servicio en DMS Market y me interesa ' + service.business_name)}`
  return (
    <div style={{ minWidth: '240px', maxWidth: '260px', background: '#fff', borderRadius: '12px', border: '1.5px solid #3b82f6', boxShadow: '0 4px 16px rgba(59,130,246,0.1)', overflow: 'hidden', flexShrink: 0, transition: 'all 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(59,130,246,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.1)' }}
    >
      <div style={{ position: 'relative', paddingBottom: '55%', background: '#0f172a', overflow: 'hidden' }}>
        {service.service_image_url
          ? <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#60a5fa' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            </div>
        }
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#eff6ff', color: '#1e40af', border: '1px solid #3b82f6', borderRadius: '6px', padding: '3px 8px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#1e40af"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
          PRO VERIFICADO
        </div>
      </div>
      <div style={{ padding: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #3b82f6', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {service.avatar_url
              ? <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.business_name}</p>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{service.city}</p>
          </div>
        </div>
        <StarRating rating={service.avg_rating} count={service.review_count} />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5, margin: '0.4rem 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{service.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
          <div>
            <p style={{ fontSize: '0.62rem', color: '#9ca3af', margin: 0 }}>Respuesta</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', margin: 0 }}>24h</p>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
            Ver servicio
          </a>
        </div>
      </div>
    </div>
  )
}

function NormalCard({ service }: { service: RankedService }) {
  const plan = service.plan_type
  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, vi tu servicio en DMS Market y me interesa ' + service.business_name)}`
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'all 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div style={{ position: 'relative', paddingBottom: '55%', background: '#f3f4f6', overflow: 'hidden' }}>
        {service.service_image_url
          ? <img src={service.service_image_url} alt={service.business_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1f2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#6b7280' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            </div>
        }
        {plan === 'basic' && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ecfdf5', color: '#065f46', border: '1px solid #10b981', borderRadius: '5px', padding: '2px 7px', fontSize: '0.58rem', fontWeight: 800 }}>
            ACTIVO
          </div>
        )}
      </div>
      <div style={{ padding: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.4rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #e5e7eb', background: 'linear-gradient(135deg, #D4AF37, #f0d060)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {service.avatar_url
              ? <img src={service.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{service.business_name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.business_name}</p>
            <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: 0 }}>{service.city}</p>
          </div>
        </div>
        <StarRating rating={service.avg_rating} count={service.review_count} />
        <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5, margin: '0.4rem 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{service.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111', margin: 0 }}>{service.price ?? 'Consultar'}</p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ background: '#111', color: '#fff', padding: '6px 12px', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none' }}>
            Ver servicio
          </a>
        </div>
      </div>
    </div>
  )
}

function HorizontalSlider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }
  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        {children}
      </div>
      <button onClick={() => scroll(-1)} style={{ position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button onClick={() => scroll(1)} style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  )
}

export default function ServiciosClient({ services, banners, user, profile }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorias')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortType>('relevancia')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [levelFilter, setLevelFilter] = useState({ premium: true, pro: true, basic: true })

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
      return matchCat && matchSearch
    })
    if (sortBy === 'rating') result = [...result].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    else if (sortBy === 'recientes') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return result
  }, [services, selectedCategory, search, sortBy])

  const premium = filtered.filter(s => s.plan_type === 'premium')
  const pro = filtered.filter(s => s.plan_type === 'pro')
  const basic = filtered.filter(s => s.plan_type === 'basic')
  const free = filtered.filter(s => !s.plan_type)
  const allNormal = [...basic, ...free]

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    services.forEach(s => { counts[s.category] = (counts[s.category] ?? 0) + 1 })
    return counts
  }, [services])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#111' }}>

      {/* NAV */}
      <nav style={{ position: 'relative', zIndex: 10, background: '#0B0B0B', borderBottom: '1px solid rgba(212,175,55,0.15)', padding: '0 clamp(1rem, 4vw, 2rem)', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
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
          <a href="/" style={{ fontSize: '0.85rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Productos</a>
          {user ? (
            <a href={getDashboardUrl()} style={{ fontSize: '0.85rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Mi panel</a>
          ) : (
            <>
              <a href="/auth/login" style={{ fontSize: '0.85rem', color: '#D1D1D1', textDecoration: 'none', padding: '0.5rem 0.75rem' }}>Ingresar</a>
              <a href="/auth/register" style={{ fontSize: '0.85rem', background: '#D4AF37', color: '#0B0B0B', padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>Registrarse</a>
            </>
          )}
        </div>
      </nav>

      {/* CARRUSEL */}
      {banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(220px, 35vw, 420px)', overflow: 'hidden', background: '#111' }}>
          {banners.map((banner, i) => (
            <div key={banner.id} style={{ position: 'absolute', inset: 0, transition: 'opacity 0.8s ease', opacity: i === currentSlide ? 1 : 0, overflow: 'hidden' }}>
              {banner.image_url && <img src={banner.image_url} alt={banner.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)' }} />
            </div>
          ))}
          {banners.length > 1 && (
            <>
              <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                {banners.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? '24px' : '7px', height: '7px', borderRadius: '4px', background: i === currentSlide ? '#D4AF37' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />))}
              </div>
              <button onClick={() => setCurrentSlide(p => (p - 1 + banners.length) % banners.length)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8249;</button>
              <button onClick={() => setCurrentSlide(p => (p + 1) % banners.length)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>&#8250;</button>
            </>
          )}
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* SIDEBAR */}
        <aside style={{ position: 'sticky', top: '16px' }}>

          {/* Categorias */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CATEGORIAS</p>
            </div>
            <div style={{ padding: '0.4rem' }}>
              {CATEGORIES.map(cat => {
                const count = cat === 'Todas las categorias' ? services.length : (catCounts[cat] ?? 0)
                const isActive = selectedCategory === cat
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', border: 'none', borderRadius: '7px', background: isActive ? '#fef9ec' : 'transparent', color: isActive ? '#92400e' : '#374151', fontWeight: isActive ? 600 : 400, fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', gap: '0.4rem', marginBottom: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#D4AF37' : '#9ca3af'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d={CAT_ICONS[cat] ?? CAT_ICONS['Otros']} />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: isActive ? '#D4AF37' : '#f3f4f6', color: isActive ? '#fff' : '#9ca3af', padding: '1px 5px', borderRadius: '999px', flexShrink: 0 }}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtrar por */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FILTRAR POR</p>
            </div>
            <div style={{ padding: '0.875rem 1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Ordenar</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
                style={{ width: '100%', fontSize: '0.78rem', border: '1px solid #e5e7eb', borderRadius: '7px', padding: '0.4rem 0.6rem', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}>
                <option value="relevancia">Relevancia</option>
                <option value="rating">Mejor rating</option>
                <option value="recientes">Mas recientes</option>
              </select>
            </div>
          </div>

          {/* Nivel proveedor */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIVEL DEL PROVEEDOR</p>
            </div>
            <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'premium', label: 'Premium Partner', color: '#92400e', bg: '#fef3c7', count: services.filter(s => s.plan_type === 'premium').length },
                { key: 'pro', label: 'Pro Verificado', color: '#1e40af', bg: '#eff6ff', count: services.filter(s => s.plan_type === 'pro').length },
                { key: 'basic', label: 'Proveedor Activo', color: '#065f46', bg: '#ecfdf5', count: services.filter(s => s.plan_type === 'basic').length },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={levelFilter[item.key as keyof typeof levelFilter]}
                      onChange={e => setLevelFilter(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      style={{ accentColor: '#D4AF37', width: '14px', height: '14px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#374151' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', background: item.bg, color: item.color, padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>{item.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* CTA publicar */}
          <div style={{ background: 'linear-gradient(135deg, #0B0B0B, #1a1200)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>Publica tu servicio</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>3 meses gratis</p>
            <button onClick={handlePublicar}
              style={{ width: '100%', padding: '0.6rem', background: '#D4AF37', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>
              Comenzar gratis
            </button>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <div>

          {/* SECCION PREMIUM */}
          {premium.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PROVEEDORES PREMIUM DESTACADOS</h2>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>Los mejores proveedores, con mayor calidad y servicio garantizado</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600, whiteSpace: 'nowrap' }}>Ver todos los Premium</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: '20px', paddingRight: '20px' }}>
                <HorizontalSlider>
                  {premium.map(s => <PremiumCard key={s.id} service={s} />)}
                </HorizontalSlider>
              </div>
            </div>
          )}

          {/* SECCION PRO */}
          {pro.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PROVEEDORES VERIFICADOS</h2>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>Proveedores verificados con excelente reputacion</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, whiteSpace: 'nowrap' }}>Ver todos los verificados</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: '20px', paddingRight: '20px' }}>
                <HorizontalSlider>
                  {pro.map(s => <ProCard key={s.id} service={s} />)}
                </HorizontalSlider>
              </div>
            </div>
          )}

          {/* SECCION TODOS */}
          {allNormal.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TODOS LOS SERVICIOS</h2>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>Descubre todos los servicios disponibles en DMS Market</p>
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortType)}
                  style={{ fontSize: '0.78rem', border: '1px solid #e5e7eb', borderRadius: '7px', padding: '0.35rem 0.6rem', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none' }}>
                  <option value="relevancia">Ordenar: Relevancia</option>
                  <option value="rating">Mejor rating</option>
                  <option value="recientes">Mas recientes</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {allNormal.map(s => <NormalCard key={s.id} service={s} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ color: '#374151', fontWeight: 600, marginBottom: '0.5rem' }}>No hay servicios disponibles</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Intenta con otra categoria o busqueda</p>
              <button onClick={() => { setSelectedCategory('Todas las categorias'); setSearch('') }}
                style={{ background: '#D4AF37', color: '#fff', padding: '0.625rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                Ver todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BENEFICIOS */}
      <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)', marginTop: '1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { title: 'Proveedores Verificados', desc: 'Todos nuestros proveedores pasan por un proceso de verificacion', color: '#3b82f6', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
            { title: 'Pago Seguro', desc: 'Tu dinero esta protegido con nuestro sistema de seguridad', color: '#10b981', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { title: 'Calidad Garantizada', desc: 'Trabajos de calidad o te devolvemos tu dinero', color: '#D4AF37', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { title: 'Soporte 24/7', desc: 'Estamos aqui para ayudarte en todo momento', color: '#8b5cf6', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: b.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>{b.title}</p>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
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
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>Conectamos profesionales con clientes en toda Colombia.</p>
            </div>
            {[
              { title: 'Navegacion', links: [{ label: 'Inicio', href: '/' }, { label: 'Productos', href: '/' }, { label: 'Servicios', href: '/servicios' }, { label: 'Publicar servicio', href: '/auth/register-provider' }] },
              { title: 'Ayuda', links: [{ label: 'Centro de ayuda', href: '/soporte' }, { label: 'Como funciona', href: '/soporte' }, { label: 'Soporte', href: '/soporte' }] },
              { title: 'Legal', links: [{ label: 'Privacidad', href: '/politicas#privacidad' }, { label: 'Terminos', href: '/politicas#terminos' }, { label: 'Devoluciones', href: '/politicas#devoluciones' }] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{col.title}</p>
                {col.links.map(link => (<a key={link.label} href={link.href} style={{ display: 'block', fontSize: '0.78rem', color: '#9ca3af', textDecoration: 'none', marginBottom: '0.4rem' }}>{link.label}</a>))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0 }}>2025 DMS Market. Colombia. Todos los derechos reservados.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="/politicas#privacidad" style={{ fontSize: '0.72rem', color: '#6b7280', textDecoration: 'none' }}>Privacidad</a>
              <a href="/politicas#terminos" style={{ fontSize: '0.72rem', color: '#6b7280', textDecoration: 'none' }}>Terminos</a>
              <a href="/auth/login" style={{ fontSize: '0.72rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
