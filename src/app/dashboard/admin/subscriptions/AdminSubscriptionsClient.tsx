'use client'
import { useState } from 'react'

interface Stat {
  totalProviders: number
  activeSubscriptions: number
  activeTrial: number
  expired: number
  mrr: number
  expiringIn7Days: number
}

interface SummaryRow {
  user_id: string
  user_name: string
  user_email: string
  plan_type: string | null
  billing_cycle: string | null
  provider_status: string
  subscription_expires: string | null
  trial_expires: string | null
  on_trial: boolean | null
}

interface Payment {
  id: string
  user_id: string
  plan: string
  amount: number
  billing_cycle: string
  payment_status: string
  created_at: string
}

interface Props {
  summary: SummaryRow[]
  payments: Payment[]
  stats: Stat
}

const STATUS_LABELS: Record<string, string> = {
  subscribed: 'Suscrito',
  trial: 'En prueba',
  trial_expired: 'Prueba vencida',
  no_plan: 'Sin plan',
}

const STATUS_COLORS: Record<string, string> = {
  subscribed: '#4ade80',
  trial: '#d4af37',
  trial_expired: '#f87171',
  no_plan: '#555',
}

const PLAN_LABELS: Record<string, string> = {
  basic: 'Basico',
  pro: 'Pro',
  premium: 'Premium',
}

export default function AdminSubscriptionsClient({ summary, payments, stats }: Props) {
  const [tab, setTab] = useState<'overview' | 'providers' | 'payments'>('overview')

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CO')
  }

  const statCards = [
    { label: 'Total proveedores', value: stats.totalProviders, color: '#fff' },
    { label: 'Suscritos activos', value: stats.activeSubscriptions, color: '#4ade80' },
    { label: 'En periodo prueba', value: stats.activeTrial, color: '#d4af37' },
    { label: 'Vencidos', value: stats.expired, color: '#f87171' },
    { label: 'MRR estimado', value: formatPrice(stats.mrr), color: '#d4af37' },
    { label: 'Vencen en 7 dias', value: stats.expiringIn7Days, color: '#fb923c' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            Suscripciones SaaS
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>
            Panel de control de suscripciones y proveedores
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #222', paddingBottom: '0' }}>
          {(['overview', 'providers', 'payments'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: tab === t ? '2px solid #d4af37' : '2px solid transparent',
                color: tab === t ? '#d4af37' : '#888',
                fontWeight: tab === t ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginBottom: '-1px',
              }}
            >
              {t === 'overview' ? 'Resumen' : t === 'providers' ? 'Proveedores' : 'Pagos'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {statCards.map((card, i) => (
                <div key={i} style={{
                  backgroundColor: '#111',
                  border: '1px solid #222',
                  borderRadius: '10px',
                  padding: '1.2rem',
                }}>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{card.label}</p>
                  <p style={{ color: card.color, fontSize: '1.6rem', fontWeight: 700 }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#111',
              border: '1px solid #222',
              borderRadius: '10px',
              padding: '1.5rem',
            }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Distribucion de planes</h3>
              {(['basic', 'pro', 'premium'] as const).map(plan => {
                const count = summary.filter(s => s.plan_type === plan && s.provider_status === 'subscribed').length
                const pct = stats.activeSubscriptions > 0 ? Math.round((count / stats.activeSubscriptions) * 100) : 0
                return (
                  <div key={plan} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Plan {PLAN_LABELS[plan]}</span>
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>{count} usuarios ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: '#d4af37',
                        borderRadius: '3px',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Providers */}
        {tab === 'providers' && (
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  {['Nombre', 'Email', 'Estado', 'Plan', 'Vencimiento'].map(h => (
                    <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: '#888', fontSize: '0.8rem', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map(row => (
                  <tr key={row.user_id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '0.8rem 1rem', color: '#fff', fontSize: '0.9rem' }}>{row.user_name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: '#888', fontSize: '0.85rem' }}>{row.user_email}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        backgroundColor: STATUS_COLORS[row.provider_status] + '22',
                        color: STATUS_COLORS[row.provider_status],
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}>
                        {STATUS_LABELS[row.provider_status] || row.provider_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#ccc', fontSize: '0.85rem' }}>
                      {row.plan_type ? PLAN_LABELS[row.plan_type] : '-'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#888', fontSize: '0.85rem' }}>
                      {formatDate(row.subscription_expires || row.trial_expires)}
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>
                      No hay proveedores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments */}
        {tab === 'payments' && (
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '10px',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  {['Plan', 'Monto', 'Ciclo', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: '#888', fontSize: '0.8rem', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '0.8rem 1rem', color: '#fff', fontSize: '0.9rem' }}>
                      {PLAN_LABELS[p.plan] || p.plan}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#d4af37', fontSize: '0.9rem', fontWeight: 600 }}>
                      {formatPrice(p.amount)}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#888', fontSize: '0.85rem' }}>
                      {p.billing_cycle === 'annual' ? 'Anual' : 'Mensual'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{
                        backgroundColor: p.payment_status === 'approved' ? '#4ade8022' : '#f8717122',
                        color: p.payment_status === 'approved' ? '#4ade80' : '#f87171',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}>
                        {p.payment_status === 'approved' ? 'Aprobado' : p.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: '#888', fontSize: '0.85rem' }}>
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>
                      No hay pagos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
