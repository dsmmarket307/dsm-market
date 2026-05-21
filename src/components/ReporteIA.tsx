'use client'

import { useState } from 'react'

interface Props {
  type: 'vendor' | 'admin'
}

function Icon({ name }: { name: string }) {
  const icons: any = {
    ia: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D4AF37" strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    ventas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    netos: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/><path d="M16 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 10h2M16 14h2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    comision: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    ticket: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6m16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6m16 0H4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    conversion: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 7 22 7 22 13" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    semana: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#fb923c" strokeWidth="1.5"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    vendedores: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#a78bfa" strokeWidth="1.5"/><path d="M9 22V12h6v10" stroke="#a78bfa" strokeWidth="1.5"/></svg>,
    compradores: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#38bdf8" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    nuevos: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#1D9E75" strokeWidth="1.5"/><line x1="19" y1="8" x2="19" y2="14" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/><line x1="22" y1="11" x2="16" y2="11" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    grafica: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    resumen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    estrategia: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D4AF37" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke="#D4AF37" strokeWidth="1.5"/><line x1="12" y1="2" x2="12" y2="8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    tareas: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    meta: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D4AF37" strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke="#D4AF37" strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill="#D4AF37"/></svg>,
    contabilidad: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#1D9E75" strokeWidth="1.5"/><polyline points="14 2 14 8 20 8" stroke="#1D9E75" strokeWidth="1.5"/><line x1="16" y1="13" x2="8" y2="13" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    insight: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-1 3H9l-1-3C6.5 13.5 5 11.5 5 9a7 7 0 0 1 7-7z" stroke="#6366f1" strokeWidth="1.5"/><path d="M9 21h6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    descargar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    actualizar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  }
  return icons[name] ?? null
}

export default function ReporteIA({ type }: Props) {
  const [reporte, setReporte] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawReporte, setRawReporte] = useState('')

  async function generarReporte() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (data.error) { setError('No se pudo generar el reporte.'); setLoading(false); return }
      setRawReporte(data.reporte)
      setMetrics(data.metrics)
      parseReporte(data.reporte)
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    }
    setLoading(false)
  }

  function parseReporte(texto: string) {
    const lines = texto.split('\n').filter(l => l.trim())
    let resumen = '', estrategias: string[] = [], tareas: string[] = [], meta = ''
    let section = ''
    for (const line of lines) {
      const l = line.trim()
      if (l.match(/resumen/i)) { section = 'resumen'; continue }
      if (l.match(/estrategia/i)) { section = 'estrategia'; continue }
      if (l.match(/tarea/i)) { section = 'tareas'; continue }
      if (l.match(/meta/i)) { section = 'meta'; continue }
      if (section === 'resumen' && !resumen && l.length > 10) resumen = l
      else if (section === 'estrategia' && l.length > 5) estrategias.push(l.replace(/^[-•*\d.]\s*/, ''))
      else if (section === 'tareas' && l.length > 5) tareas.push(l.replace(/^[-•*\d.]\s*/, ''))
      else if (section === 'meta' && !meta && l.length > 5) meta = l
    }
    if (!resumen) resumen = lines[0] ?? ''
    if (estrategias.length === 0) estrategias = lines.slice(1, 5).map(l => l.replace(/^[-•*\d.]\s*/, ''))
    if (tareas.length === 0) tareas = lines.slice(-5).map(l => l.replace(/^[-•*\d.]\s*/, ''))
    setReporte({ resumen, estrategias: estrategias.slice(0, 4), tareas: tareas.slice(0, 4), meta })
  }

  function descargarTXT() {
    const fecha = new Date().toLocaleDateString('es-CO')
    const titulo = type === 'vendor' ? 'Reporte Vendedor DMS Market' : 'Reporte Ejecutivo DMS Market'
    const blob = new Blob([`DMS MARKET\n${titulo}\nFecha: ${fecha}\n${'='.repeat(60)}\n\n${rawReporte}`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-dms-${type}-${fecha.replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const vendorCards = metrics && type === 'vendor' ? [
    { label: 'Ventas Totales', value: '$' + (metrics.totalVentas ?? 0).toLocaleString('es-CO'), color: '#1D9E75', sub: 'COP bruto', icon: 'ventas' },
    { label: 'Ingresos Netos', value: '$' + (metrics.ingresosNetos ?? 0).toLocaleString('es-CO'), color: '#D4AF37', sub: 'despues comision', icon: 'netos' },
    { label: 'Comision (5%)', value: '$' + (metrics.comisionPlataforma ?? 0).toLocaleString('es-CO'), color: '#a78bfa', sub: 'plataforma', icon: 'comision' },
    { label: 'Ticket Promedio', value: '$' + (metrics.ticketPromedio ?? 0).toLocaleString('es-CO'), color: '#38bdf8', sub: 'por orden', icon: 'ticket' },
    { label: 'Conversion', value: (metrics.tasaConversion ?? 0) + '%', color: (metrics.tasaConversion ?? 0) > 70 ? '#1D9E75' : '#f59e0b', sub: 'ordenes entregadas', icon: 'conversion' },
    { label: 'Esta Semana', value: '$' + (metrics.ventasSemana ?? 0).toLocaleString('es-CO'), color: '#fb923c', sub: (metrics.ordenesSemana ?? 0) + ' ordenes', icon: 'semana' },
  ] : []

  const adminCards = metrics && type === 'admin' ? [
    { label: 'Ventas Totales', value: '$' + (metrics.totalVentas ?? 0).toLocaleString('es-CO'), color: '#1D9E75', sub: 'marketplace', icon: 'ventas' },
    { label: 'Comisiones (5%)', value: '$' + (metrics.comisiones ?? 0).toLocaleString('es-CO'), color: '#D4AF37', sub: 'ganadas', icon: 'comision' },
    { label: 'Vendedores', value: metrics.vendedores ?? 0, color: '#a78bfa', sub: 'activos', icon: 'vendedores' },
    { label: 'Compradores', value: metrics.compradores ?? 0, color: '#38bdf8', sub: 'registrados', icon: 'compradores' },
    { label: 'Ticket Promedio', value: '$' + (metrics.ticketPromedio ?? 0).toLocaleString('es-CO'), color: '#fb923c', sub: 'por orden', icon: 'ticket' },
    { label: 'Nuevos/Semana', value: metrics.usuariosNuevosSemana ?? 0, color: '#1D9E75', sub: 'usuarios nuevos', icon: 'nuevos' },
  ] : []

  const cards = type === 'vendor' ? vendorCards : adminCards
  const topCats = metrics?.topCategorias ?? []
  const maxCat = topCats.length > 0 ? Math.max(...topCats.map((c: any) => c[1])) : 1
  const barColors = ['#D4AF37', '#1D9E75', '#a78bfa', '#38bdf8', '#fb923c']

  return (
    <div style={{ background: '#0B0B0B', borderRadius: 20, padding: '1.75rem', border: '1px solid rgba(212,175,55,.15)', marginBottom: '1.25rem', fontFamily: 'Poppins, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="ia" />
          </div>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: 0 }}>Inteligencia Artificial</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>
              {type === 'vendor' ? 'Centro de Inteligencia del Vendedor' : 'Centro de Inteligencia del Marketplace'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {reporte && (
            <button onClick={descargarTXT} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, color: '#ccc', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="descargar" /> Descargar
            </button>
          )}
          <button onClick={generarReporte} disabled={loading} style={{ padding: '10px 20px', background: loading ? '#222' : '#D4AF37', border: 'none', borderRadius: 10, color: loading ? '#555' : '#000', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="actualizar" /> {loading ? 'Analizando...' : reporte ? 'Actualizar' : 'Generar Reporte IA'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}

      {!reporte && !loading && (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed rgba(212,175,55,.15)', borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="ia" /></div>
          <p style={{ color: '#888', fontSize: 14, margin: '0 0 4px' }}>Analisis profundo con Inteligencia Artificial</p>
          <p style={{ color: '#555', fontSize: 12 }}>Contabilidad, estrategia, metas y tareas semanales personalizadas</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#D4AF37', fontSize: 14, marginBottom: 8 }}>Analizando datos...</p>
          <p style={{ color: '#555', fontSize: 12 }}>Generando contabilidad, estrategia y tareas semanales</p>
        </div>
      )}

      {reporte && metrics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
            {cards.map((card: any) => (
              <div key={card.label} style={{ background: '#151515', borderRadius: 14, padding: '1rem', border: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon name={card.icon} />
                  <p style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>{card.label}</p>
                </div>
                <p style={{ fontSize: 19, fontWeight: 700, color: card.color, margin: '0 0 2px' }}>{card.value}</p>
                <p style={{ fontSize: 10, color: '#555', margin: '0 0 8px' }}>{card.sub}</p>
                <svg viewBox="0 0 60 20" style={{ width: '100%', opacity: 0.5 }}>
                  <polyline points="0,15 10,10 20,13 30,7 40,11 50,5 60,8" fill="none" stroke={card.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1.5rem' }}>
            <div style={{ background: '#151515', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <Icon name="grafica" />
                <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>
                  {type === 'vendor' ? 'Mis Categorias' : 'Top Categorias'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topCats.slice(0, 5).map((cat: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <p style={{ fontSize: 13, color: '#ccc', margin: 0, fontWeight: 500 }}>{cat[0]}</p>
                      <p style={{ fontSize: 12, color: barColors[i], fontWeight: 700, margin: 0 }}>{cat[1]} productos</p>
                    </div>
                    <div style={{ height: 5, background: '#0f0f0f', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: Math.round((cat[1] / maxCat) * 100) + '%', background: barColors[i], borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#151515', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,.05)', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <Icon name="resumen" />
                  <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Resumen Inteligente</p>
                </div>
                <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7, margin: 0 }}>{reporte.resumen}</p>
              </div>
              {reporte.meta && (
                <div style={{ background: 'rgba(212,175,55,.06)', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(212,175,55,.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                    <Icon name="meta" />
                    <p style={{ fontSize: 11, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Meta del Mes</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{reporte.meta}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: '1.5rem' }}>
            <div style={{ background: '#151515', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <Icon name="estrategia" />
                <p style={{ fontSize: 11, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Estrategias</p>
              </div>
              {reporte.estrategias.map((e: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', flexShrink: 0, marginTop: 5 }} />
                  <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5, margin: 0 }}>{e}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#151515', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <Icon name="tareas" />
                <p style={{ fontSize: 11, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Tareas Semanales</p>
              </div>
              {reporte.tareas.map((t: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: '1px solid #1D9E75', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: '#1D9E75' }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          {type === 'vendor' && (
            <div style={{ background: '#151515', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(29,158,117,.2)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <Icon name="contabilidad" />
                <p style={{ fontSize: 11, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>Contabilidad</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                {[
                  { label: 'Ingresos Brutos', value: '$' + (metrics.totalVentas ?? 0).toLocaleString('es-CO'), color: '#fff' },
                  { label: 'Comision DMS (5%)', value: '- $' + (metrics.comisionPlataforma ?? 0).toLocaleString('es-CO'), color: '#ef4444' },
                  { label: 'Ingresos Netos', value: '$' + (metrics.ingresosNetos ?? 0).toLocaleString('es-CO'), color: '#1D9E75' },
                  { label: 'Saldo por Cobrar', value: '$' + (metrics.saldoPendiente ?? 0).toLocaleString('es-CO'), color: '#D4AF37' },
                  { label: 'Saldo Liberado', value: '$' + (metrics.saldoLiberado ?? 0).toLocaleString('es-CO'), color: '#a78bfa' },
                  { label: 'Proyeccion Mensual', value: '$' + ((metrics.ventasSemana ?? 0) * 4).toLocaleString('es-CO'), color: '#38bdf8' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#0f0f0f', borderRadius: 8 }}>
                    <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: item.color, fontWeight: 700, margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(99,102,241,.08)', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="insight" />
            </div>
            <div>
              <p style={{ fontSize: 13, color: '#fff', fontWeight: 600, margin: '0 0 4px' }}>Insight de IA</p>
              <p style={{ fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5 }}>
                {topCats.length > 0
                  ? `La categoria ${topCats[0][0]} lidera tus publicaciones. Sigue ampliando tu catalogo en esta y otras categorias para atraer mas compradores.`
                  : 'Agrega mas productos para recibir insights personalizados de crecimiento.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
