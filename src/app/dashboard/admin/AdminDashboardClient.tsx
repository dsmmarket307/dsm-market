'use client'
import Link from 'next/link'
import ReporteIA from '@/components/ReporteIA'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark: {
    bg: '#0a0a0a', bg2: '#111111', bg3: '#151515',
    border: 'rgba(212,175,55,0.1)', border2: 'rgba(212,175,55,0.15)',
    text: '#ffffff', text2: '#666666', text3: '#555555',
    gold: '#D4AF37', green: '#4CAF7D', purple: '#a78bfa',
    cardBg: '#111111', metricBg: '#111111',
    badgeBg: 'rgba(245,158,11,0.15)', badgeColor: '#f59e0b', badgeBorder: 'rgba(245,158,11,0.3)',
    statusBg: '#111111', statusBorder: 'rgba(212,175,55,0.15)',
  },
  light: {
    bg: '#f0f0f0', bg2: '#ffffff', bg3: '#e8e8e8',
    border: 'rgba(0,0,0,0.1)', border2: 'rgba(0,0,0,0.15)',
    text: '#111111', text2: '#555555', text3: '#777777',
    gold: '#B8960C', green: '#059669', purple: '#7c3aed',
    cardBg: '#ffffff', metricBg: '#ffffff',
    badgeBg: 'rgba(180,120,0,0.1)', badgeColor: '#B8960C', badgeBorder: 'rgba(180,120,0,0.3)',
    statusBg: '#ffffff', statusBorder: 'rgba(0,0,0,0.15)',
  },
}

interface Props {
  pendingVendors: number
  pendingProducts: number
  pendingServices: number
  totalRevenue: number
}

export default function AdminDashboardClient({ pendingVendors, pendingProducts, pendingServices, totalRevenue }: Props) {
  const { theme, toggleTheme } = useTheme()
  const T = THEMES[theme]

  const menuItems = [
    { href: '/dashboard/admin/vendors', label: 'Vendedores', desc: 'Aprobar o rechazar perfiles de vendedores', color: T.gold, badge: pendingVendors, green: false },
    { href: '/dashboard/admin/products', label: 'Productos', desc: 'Aprobar o rechazar productos de vendedores', color: T.gold, badge: pendingProducts, green: false },
    { href: '/dashboard/admin/services', label: 'Servicios', desc: 'Aprobar o rechazar servicios de proveedores', color: T.gold, badge: pendingServices, green: false },
    { href: '/dashboard/admin/orders', label: 'Ordenes y Pagos', desc: 'Ver y gestionar ordenes del marketplace', color: T.gold, badge: 0, green: false },
    { href: '/dashboard/admin/disputes', label: 'Disputas', desc: 'Resolver disputas entre compradores y vendedores', color: T.gold, badge: 0, green: false },
    { href: '/crm', label: 'CRM Dropi', desc: 'Gestion de pedidos y productos Dropi', color: T.gold, badge: 0, green: false },
    { href: '/dashboard/admin/ai-business', label: 'Centro IA', desc: 'Estrategias, metas y proyecciones con IA', color: T.purple, badge: 0, green: false },
    { href: '/dashboard/admin/soporte', label: 'Soporte', desc: 'Responder conversaciones en tiempo real', color: T.green, badge: 0, green: true },
  ]

  const metrics = [
    { label: 'Vendedores pendientes', value: pendingVendors, color: T.gold, alert: pendingVendors > 0 },
    { label: 'Productos pendientes', value: pendingProducts, color: T.gold, alert: pendingProducts > 0 },
    { label: 'Servicios pendientes', value: pendingServices, color: T.gold, alert: pendingServices > 0 },
    { label: 'Comisiones ganadas', value: '$' + totalRevenue.toLocaleString('es-CO'), color: T.green, alert: false },
  ]

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${T.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: T.gold, marginBottom: '0.375rem', fontWeight: 600 }}>Panel de Control</p>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: T.text, margin: 0 }}>Administrador</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={toggleTheme}
              style={{ padding: '0.5rem 1rem', background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 10, color: T.text, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: T.statusBg, border: `1px solid ${T.statusBorder}`, borderRadius: 10, padding: '0.5rem 1rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
              <span style={{ fontSize: '0.75rem', color: T.text2, fontWeight: 500 }}>Sistema activo</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {metrics.map((item, i) => (
            <div key={i} style={{ background: T.metricBg, border: `1px solid ${T.border}`, borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: theme === 'dark' ? 'rgba(212,175,55,0.08)' : 'rgba(180,120,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                {item.alert && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />}
              </div>
              <p style={{ fontSize: '0.7rem', color: T.text2, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: T.text3, marginBottom: '1rem', fontWeight: 600 }}>Accesos rapidos</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ background: T.cardBg, border: `1px solid ${item.green ? (theme === 'dark' ? 'rgba(76,175,61,0.15)' : 'rgba(5,150,105,0.2)') : T.border}`, borderRadius: 16, padding: '1.75rem', display: 'block', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: item.green ? (theme === 'dark' ? 'rgba(76,175,61,0.08)' : 'rgba(5,150,105,0.08)') : (theme === 'dark' ? 'rgba(212,175,55,0.08)' : 'rgba(180,120,0,0.08)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                {item.badge > 0 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: T.badgeBg, color: T.badgeColor, border: `1px solid ${T.badgeBorder}`, borderRadius: 999, padding: '2px 8px' }}>
                    {item.badge} pendientes
                  </span>
                )}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: T.text, marginBottom: '0.375rem' }}>{item.label}</p>
              <p style={{ fontSize: '0.8rem', color: T.text2, lineHeight: 1.5, marginBottom: '1.25rem' }}>{item.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.78rem', color: item.color, fontWeight: 600 }}>Abrir</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          ))}
        </div>

        <ReporteIA type="admin" />
      </div>
    </div>
  )
}


