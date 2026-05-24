'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPaymentPreference } from '@/lib/actions/subscriptions'
import type { ProviderSubscriptionState, PlanType, BillingCycle } from '@/types'
import { PLAN_LIMITS } from '@/types'

interface Props {
  userId: string
  userName: string
  state: ProviderSubscriptionState
}

const PLANS: { key: PlanType; badge: string }[] = [
  { key: 'basic', badge: 'RECOMENDADO' },
  { key: 'pro', badge: 'MAS POPULAR' },
  { key: 'premium', badge: 'PREMIUM' },
]

export default function SubscriptionClient({ userId, userName, state }: Props) {
  const router = useRouter()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelectPlan = async (planType: PlanType) => {
    setLoading(planType)
    setError(null)
    try {
      const result = await createPaymentPreference(userId, planType, billing)
      if (result.error) {
        setError(result.error)
        setLoading(null)
        return
      }
      if (result.initPoint) {
        window.location.href = result.initPoint
      }
    } catch {
      setError('Error al procesar el pago. Intenta de nuevo.')
      setLoading(null)
    }
  }

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount)

  const getDaysColor = (days: number) => {
    if (days > 30) return '#22c55e'
    if (days > 7) return '#f59e0b'
    return '#ef4444'
  }

  const getStatusLabel = () => {
    switch (state.status) {
      case 'trial': return 'Periodo de Prueba Activo'
      case 'subscribed': return 'Suscripcion Activa'
      case 'trial_expired': return 'Periodo de Prueba Vencido'
      case 'no_plan': return 'Sin Plan Activo'
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', padding: '2rem' }}>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Planes y Suscripcion
          </h1>
          <p style={{ color: '#888', fontSize: '1rem' }}>
            Hola {userName}, gestiona tu plan profesional en DMS Market.
          </p>
        </div>

        {/* Estado actual */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Estado actual</p>
            <p style={{ color: '#d4af37', fontWeight: 600, fontSize: '1rem' }}>{getStatusLabel()}</p>
            {state.subscription && (
              <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                Plan {PLAN_LIMITS[state.subscription.plan_type].label} - vence {new Date(state.subscription.expires_at).toLocaleDateString('es-CO')}
              </p>
            )}
          </div>

          {(state.status === 'trial' || state.status === 'subscribed') && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Dias restantes</p>
              <p style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: getDaysColor(state.daysRemaining),
              }}>
                {state.daysRemaining}
              </p>
              <div style={{
                width: '140px',
                height: '6px',
                backgroundColor: '#222',
                borderRadius: '3px',
                marginTop: '0.5rem',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(100, (state.daysRemaining / (state.status === 'trial' ? 90 : 30)) * 100)}%`,
                  height: '100%',
                  backgroundColor: getDaysColor(state.daysRemaining),
                  borderRadius: '3px',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Alerta plan vencido */}
        {(state.status === 'trial_expired' || state.status === 'no_plan') && (
          <div style={{
            backgroundColor: '#1a0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '10px',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            color: '#fca5a5',
            fontSize: '0.95rem',
          }}>
            Tu suscripcion ha expirado. Renueva tu plan para seguir utilizando funciones premium.
          </div>
        )}

        {/* Toggle billing */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0' }}>
          <button
            onClick={() => setBilling('monthly')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px 0 0 8px',
              border: '1px solid #333',
              backgroundColor: billing === 'monthly' ? '#d4af37' : '#111',
              color: billing === 'monthly' ? '#000' : '#888',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Mensual
          </button>
          <button
            onClick={() => setBilling('annual')}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '0 8px 8px 0',
              border: '1px solid #333',
              borderLeft: 'none',
              backgroundColor: billing === 'annual' ? '#d4af37' : '#111',
              color: billing === 'annual' ? '#000' : '#888',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Anual (20% descuento)
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#1a0a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Planes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}>
          {PLANS.map(({ key, badge }) => {
            const limits = PLAN_LIMITS[key]
            const price = billing === 'annual' ? limits.price_annual : limits.price_monthly
            const isCurrentPlan = state.subscription?.plan_type === key
            const isPro = key === 'pro'

            return (
              <div
                key={key}
                style={{
                  backgroundColor: '#111',
                  border: isPro ? '2px solid #d4af37' : '1px solid #222',
                  borderRadius: '14px',
                  padding: '1.8rem',
                  position: 'relative',
                  transition: 'transform 0.2s',
                }}
              >
                {/* Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: isPro ? '#d4af37' : '#222',
                  color: isPro ? '#000' : '#888',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 14px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.05em',
                }}>
                  {badge}
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem', marginTop: '0.5rem' }}>
                  Plan {limits.label}
                </h3>

                <div style={{ marginBottom: '1.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: '#d4af37' }}>
                    {formatPrice(price)}
                  </span>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>
                    {billing === 'annual' ? ' / ano' : ' / mes'}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <li style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {limits.maxServices >= 999999 ? 'Servicios ilimitados' : `Hasta ${limits.maxServices} servicios`}
                  </li>
                  <li style={{ color: limits.canUsePrioritySearch ? '#ccc' : '#555', fontSize: '0.9rem' }}>
                    {limits.canUsePrioritySearch ? 'Prioridad en busquedas' : 'Sin prioridad en busquedas'}
                  </li>
                  <li style={{ color: limits.canUseAnalytics ? '#ccc' : '#555', fontSize: '0.9rem' }}>
                    {limits.canUseAnalytics ? 'Estadisticas avanzadas' : 'Estadisticas basicas'}
                  </li>
                  <li style={{ color: limits.canUseCampaigns ? '#ccc' : '#555', fontSize: '0.9rem' }}>
                    {limits.canUseCampaigns ? 'Campanas automaticas IA' : 'Sin campanas automaticas'}
                  </li>
                  <li style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {key === 'basic' ? 'Soporte estandar' : key === 'pro' ? 'Soporte prioritario' : 'Soporte VIP'}
                  </li>
                </ul>

                {isCurrentPlan ? (
                  <div style={{
                    width: '100%',
                    padding: '0.7rem',
                    backgroundColor: '#1a2a1a',
                    border: '1px solid #166534',
                    borderRadius: '8px',
                    color: '#4ade80',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}>
                    Plan Actual
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={loading !== null}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: isPro ? '#d4af37' : '#1a1a1a',
                      color: isPro ? '#000' : '#d4af37',
                      border: isPro ? 'none' : '1px solid #d4af37',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: loading !== null ? 'not-allowed' : 'pointer',
                      opacity: loading !== null ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {loading === key ? 'Procesando...' : 'Elegir plan'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
