'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProviderDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [service, setService] = useState<any>(null)
  const [trial, setTrial] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: svc } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .single()

      const { data: tr } = await supabase
        .from('trial_periods')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      const { data: leadsData } = await supabase
        .from('service_leads')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      setService(svc)
      setTrial(tr)
      setSubscription(sub)
      setLeads(leadsData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <p style={{ color: '#d4af37', fontSize: '1rem', fontFamily: 'sans-serif' }}>Cargando panel...</p>
    </div>
  )

  const now = new Date()

  const getTrialDays = () => {
    if (!trial) return 0
    const exp = new Date(trial.expires_at)
    return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const getSubDays = () => {
    if (!subscription) return 0
    const exp = new Date(subscription.expires_at)
    return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const isTrialActive = trial && trial.active && now < new Date(trial.expires_at)
  const isSubscribed = !!subscription
  const trialDays = getTrialDays()
  const subDays = getSubDays()

  const planLabel: Record<string, string> = { basic: 'Basico', pro: 'Pro', premium: 'Premium' }
  const statusColor: Record<string, string> = { pending: '#f59e0b', approved: '#4ade80', rejected: '#f87171' }
  const statusLabel: Record<string, string> = { pending: 'En revision', approved: 'Activo', rejected: 'Rechazado' }

  const getDaysColor = (days: number) => {
    if (days > 30) return '#4ade80'
    if (days > 7) return '#f59e0b'
    return '#f87171'
  }

  const now30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const now7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const leadsTotal = leads.length
  const leads30 = leads.filter(l => new Date(l.created_at) >= now30).length
  const leads7 = leads.filter(l => new Date(l.created_at) >= now7).length
  const leadsMobile = leads.filter(l => l.device === 'mobile').length
  const leadsDesktop = leads.filter(l => l.device === 'desktop').length

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('es-CO', { weekday: 'short' })
    const count = leads.filter(l => {
      const ld = new Date(l.created_at)
      return ld.toDateString() === d.toDateString()
    }).length
    return { label, count }
  })

  const maxBar = Math.max(...last7Days.map(d => d.count), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4af37', marginBottom: '0.4rem', fontWeight: 600 }}>
            Panel del proveedor
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            {service ? service.business_name : 'Mi Panel'}
          </h1>
          {service && (
            <p style={{ color: '#555', fontSize: '0.9rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>
              {service.category} — {service.city}
            </p>
          )}
        </div>

        {/* Cards estado */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Estado servicio</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: service ? (statusColor[service.status] ?? '#555') : '#555', flexShrink: 0 }} />
              <p style={{ fontSize: '1rem', fontWeight: 700, color: service ? (statusColor[service.status] ?? '#555') : '#555', margin: 0 }}>
                {service ? (statusLabel[service.status] ?? service.status) : 'Sin servicio'}
              </p>
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Plan activo</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#d4af37', margin: 0 }}>
              {isSubscribed ? planLabel[subscription.plan_type] ?? subscription.plan_type : isTrialActive ? 'Prueba gratuita' : 'Sin plan'}
            </p>
          </div>

          <div style={{ background: '#111', border: `1px solid ${getDaysColor(isSubscribed ? subDays : trialDays)}33`, borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Dias restantes</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: getDaysColor(isSubscribed ? subDays : trialDays), margin: 0 }}>
              {isSubscribed ? subDays : isTrialActive ? trialDays : 0}
            </p>
            <div style={{ height: '4px', background: '#222', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, ((isSubscribed ? subDays : trialDays) / (isSubscribed ? 30 : 90)) * 100)}%`, height: '100%', background: getDaysColor(isSubscribed ? subDays : trialDays), borderRadius: '2px' }} />
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #d4af3733', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>Contactos totales</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#d4af37', margin: 0 }}>{leadsTotal}</p>
          </div>
        </div>

        {/* ANALYTICS LEADS */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            <p style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 700, margin: 0 }}>Analytics de contactos</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Ultimos 7 dias', value: leads7, color: '#4ade80' },
              { label: 'Ultimos 30 dias', value: leads30, color: '#60a5fa' },
              { label: 'Desde movil', value: leadsMobile, color: '#f59e0b' },
              { label: 'Desde desktop', value: leadsDesktop, color: '#a78bfa' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#0a0a0a', borderRadius: '10px', padding: '1rem', border: '1px solid #1a1a1a' }}>
                <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>{stat.label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Grafico barras 7 dias */}
          <div>
            <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Contactos ultimos 7 dias</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
              {last7Days.map((day, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600 }}>{day.count > 0 ? day.count : ''}</span>
                  <div style={{ width: '100%', background: day.count > 0 ? '#d4af37' : '#1a1a1a', borderRadius: '4px 4px 0 0', height: `${Math.max(4, (day.count / maxBar) * 60)}px`, transition: 'height 0.3s' }} />
                  <span style={{ fontSize: '0.6rem', color: '#444' }}>{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimos leads */}
          {leads.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Ultimos contactos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {leads.slice(0, 5).map((lead, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4af37' }} />
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>{lead.device === 'mobile' ? 'Movil' : 'Desktop'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#444' }}>{lead.source}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#555' }}>
                      {new Date(lead.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {leads.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#333' }}>
              <p style={{ fontSize: '0.875rem' }}>Aun no tienes contactos registrados.</p>
              <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Cuando alguien toque "Contactar por WhatsApp" aparecera aqui.</p>
            </div>
          )}
        </div>

        {/* Alertas */}
        {!isSubscribed && !isTrialActive && (
          <div style={{ background: '#1a0808', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: '#fca5a5', fontSize: '0.9rem', margin: 0 }}>Tu suscripcion ha expirado. Renueva tu plan para seguir utilizando funciones premium.</p>
            <Link href="/dashboard/provider/suscripcion" style={{ background: '#d4af37', color: '#000', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver planes</Link>
          </div>
        )}

        {isTrialActive && trialDays <= 15 && !isSubscribed && (
          <div style={{ background: '#1a1200', border: '1px solid #92400e', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: '#fcd34d', fontSize: '0.9rem', margin: 0 }}>Tu periodo de prueba vence en {trialDays} dias.</p>
            <Link href="/dashboard/provider/suscripcion" style={{ background: '#d4af37', color: '#000', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ver planes</Link>
          </div>
        )}

        {service?.status === 'pending' && (
          <div style={{ background: '#111800', border: '1px solid #854d0e', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
            <p style={{ color: '#fcd34d', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Tu servicio esta en revision</p>
            <p style={{ color: '#a16207', fontSize: '0.85rem', margin: 0 }}>El equipo de DMS Market lo revisara en las proximas 24 horas.</p>
          </div>
        )}

        {service?.status === 'rejected' && (
          <div style={{ background: '#1a0808', border: '1px solid #7f1d1d', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
            <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Tu servicio fue rechazado</p>
            <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>Por favor edita tu servicio y vuelve a enviarlo para revision.</p>
          </div>
        )}

        {/* Contenido servicio */}
        {service ? (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', overflow: 'hidden', marginBottom: '2rem' }}>
            {service.service_image_url && (
              <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                <img src={service.service_image_url} alt={service.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '0.2rem' }}>{service.category}</p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{service.business_name}</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href="/dashboard/provider/edit" style={{ fontSize: '0.85rem', background: '#1a1a1a', color: '#d4af37', padding: '0.5rem 1.2rem', border: '1px solid #d4af37', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                  {service.status === 'approved' && (
                    <Link href="/servicios" style={{ fontSize: '0.85rem', background: '#d4af37', color: '#000', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>Ver en catalogo</Link>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.7, marginBottom: '1.2rem' }}>{service.description}</p>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {service.price && <div><p style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.2rem' }}>Precio</p><p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{service.price}</p></div>}
                {service.phone && <div><p style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.2rem' }}>Celular</p><p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{service.phone}</p></div>}
                {service.city && <div><p style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.2rem' }}>Ciudad</p><p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{service.city}</p></div>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '14px', padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#555', fontSize: '1rem', marginBottom: '1rem' }}>No tienes un servicio registrado aun</p>
            <Link href="/auth/register-provider" style={{ background: '#d4af37', color: '#000', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>Registrar mi servicio</Link>
          </div>
        )}

        {/* Accesos rapidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link href="/dashboard/provider/suscripcion" style={{ background: '#111', border: '1px solid #d4af3733', borderRadius: '12px', padding: '1.2rem', textDecoration: 'none', display: 'block' }}>
            <p style={{ color: '#d4af37', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>Mi suscripcion</p>
            <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>Ver planes y estado actual</p>
          </Link>
          <Link href="/dashboard/provider/edit" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.2rem', textDecoration: 'none', display: 'block' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>Mi servicio</p>
            <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>Gestionar informacion del servicio</p>
          </Link>
          <Link href="/servicios" style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '1.2rem', textDecoration: 'none', display: 'block' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>Catalogo</p>
            <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>Ver todos los servicios publicados</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
