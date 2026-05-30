'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark:  { bg: '#0a0a0a', bg2: '#111111', bg3: '#1a1a1a', text: '#ffffff', text2: '#888888', text3: '#cccccc', border: '#222222', gold: '#d4af37' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#e8e8e8', text: '#111111', text2: '#666666', text3: '#444444', border: '#dddddd', gold: '#B8960C' },
}

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
  subscribed:    'Suscrito',
  trial:         'En prueba',
  trial_expired: 'Prueba vencida',
  no_plan:       'Sin plan',
}

const STATUS_COLORS: Record<string, string> = {
  subscribed:    '#4ade80',
  trial:         '#d4af37',
  trial_expired: '#f87171',
  no_plan:       '#555555',
}

const PLAN_LABELS: Record<string, string> = {
  basic:   'Basico',
  pro:     'Pro',
  premium: 'Premium',
}

export default function AdminSubscriptionsClient({ summary, payments, stats }: Props) {
  const { theme } = useTheme()
  const t = THEMES[theme]
  const [tab, setTab] = useState<'overview' | 'providers' | 'payments'>('overview')

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-CO')
  }

  const statCards = [
    { label: 'Total proveedores',  value: stats.totalProviders,       color: t.text  },
    { label: 'Suscritos activos',  value: stats.activeSubscriptions,  color: '#4ade80' },
    { label: 'En periodo prueba',  value: stats.activeTrial,          color: t.gold  },
    { label: 'Vencidos',           value: stats.expired,              color: '#f87171' },
    { label: 'MRR estimado',       value: formatPrice(stats.mrr),     color: t.gold  },
    { label: 'Vencen en 7 dias',   value: stats.expiringIn7Days,      color: '#fb923c' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: t.bg, color: t.text, padding: '2rem', fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `2px solid ${t.gold}` }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: t.gold, marginBottom: '0.25rem' }}>Administrador</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem', color: t.text }}>Suscripciones SaaS</h1>
          <p style={{ color: t.text2, fontSize: '0.95rem', margin: 0 }}>Panel de control de suscripciones y proveedores</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: `1px solid ${t.border}`, paddingBottom: '0' }}>
          {(['overview', 'providers', 'payments'] as const).map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: tab === tabKey ? `2px solid ${t.gold}` : '2px solid transparent',
                color: tab === tabKey ? t.gold : t.text2,
                fontWeight: tab === tabKey ? 700 : 400,
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginBottom: '-1px',
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              {tabKey === 'overview' ? 'Resumen' : tabKey === 'providers' ? 'Proveedores' : 'Pagos'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {statCards.map((card, i) => (
                <div key={i} style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.2rem' }}>
                  <p style={{ color: t.text2, fontSize: '0.8rem', marginBottom: '0.5rem' }}>{card.label}</p>
                  <p style={{ color: card.color, fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600, color: t.text }}>Distribucion de planes</h3>
              {(['basic', 'pro', 'premium'] as const).map(plan => {
                const count = summary.filter(s => s.plan_type === plan && s.provider_status === 'subscribed').length
                const pct = stats.activeSubscriptions > 0 ? Math.round((count / stats.activeSubscriptions) * 100) : 0
                return (
                  <div key={plan} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: t.text3, fontSize: '0.9rem' }}>Plan {PLAN_LABELS[plan]}</span>
                      <span style={{ color: t.text2, fontSize: '0.9rem' }}>{count} usuarios ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: t.bg3, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: t.gold, borderRadius: '3px', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Providers */}
        {tab === 'providers' && (
          <div style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Nombre', 'Email', 'Estado', 'Plan', 'Vencimiento'].map(h => (
                    <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: t.text2, fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.map(row => (
                  <tr key={row.user_id} style={{ borderBottom: `1px solid ${t.bg3}` }}>
                    <td style={{ padding: '0.8rem 1rem', color: t.text,  fontSize: '0.9rem'  }}>{row.user_name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: t.text2, fontSize: '0.85rem' }}>{row.user_email}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{ backgroundColor: STATUS_COLORS[row.provider_status] + '22', color: STATUS_COLORS[row.provider_status], padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {STATUS_LABELS[row.provider_status] || row.provider_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: t.text3, fontSize: '0.85rem' }}>{row.plan_type ? PLAN_LABELS[row.plan_type] : '-'}</td>
                    <td style={{ padding: '0.8rem 1rem', color: t.text2, fontSize: '0.85rem' }}>{formatDate(row.subscription_expires || row.trial_expires)}</td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: t.text2 }}>No hay proveedores registrados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments */}
        {tab === 'payments' && (
          <div style={{ backgroundColor: t.bg2, border: `1px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {['Plan', 'Monto', 'Ciclo', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '0.8rem 1rem', textAlign: 'left', color: t.text2, fontSize: '0.8rem', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${t.bg3}` }}>
                    <td style={{ padding: '0.8rem 1rem', color: t.text,  fontSize: '0.9rem'  }}>{PLAN_LABELS[p.plan] || p.plan}</td>
                    <td style={{ padding: '0.8rem 1rem', color: t.gold,  fontSize: '0.9rem', fontWeight: 600 }}>{formatPrice(p.amount)}</td>
                    <td style={{ padding: '0.8rem 1rem', color: t.text2, fontSize: '0.85rem' }}>{p.billing_cycle === 'annual' ? 'Anual' : 'Mensual'}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{ backgroundColor: p.payment_status === 'approved' ? '#4ade8022' : '#f8717122', color: p.payment_status === 'approved' ? '#4ade80' : '#f87171', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {p.payment_status === 'approved' ? 'Aprobado' : p.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: t.text2, fontSize: '0.85rem' }}>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: t.text2 }}>No hay pagos registrados</td>
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
