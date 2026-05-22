'use client'

import { useState } from 'react'
import Link from 'next/link'

const SECCIONES = [
  { id: 'metas', label: 'Metas del Mes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, color: '#D4AF37' },
  { id: 'estrategias', label: 'Estrategias', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, color: '#D4AF37' },
  { id: 'contenido', label: 'Calendario Contenido', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, color: '#D4AF37' },
  { id: 'marketing', label: 'Marketing IA', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, color: '#4CAF7D' },
  { id: 'proyecciones', label: 'Proyecciones', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, color: '#a78bfa' },
]

export default function AIBusinessPage() {
  const [activeSection, setActiveSection] = useState('metas')
  const [resultados, setResultados] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [metrics, setMetrics] = useState<any>(null)

  async function generar(section: string) {
    setLoading(prev => ({ ...prev, [section]: true }))
    try {
      const res = await fetch('/api/ai-business-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section })
      })
      const data = await res.json()
      setResultados(prev => ({ ...prev, [section]: data.resultado }))
      if (data.metrics) setMetrics(data.metrics)
    } catch {
      setResultados(prev => ({ ...prev, [section]: 'Error al generar. Intenta de nuevo.' }))
    }
    setLoading(prev => ({ ...prev, [section]: false }))
  }

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
  }

  const seccionActiva = SECCIONES.find(s => s.id === activeSection)

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/admin" style={{ color: '#555', textDecoration: 'none', fontSize: '0.8rem' }}>
            Dashboard
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: '#D4AF37', fontSize: '0.8rem', fontWeight: 600 }}>Centro Inteligente IA</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', margin: '0 0 0.5rem', fontWeight: 600 }}>Inteligencia Artificial</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Centro Inteligente DMS</h1>
          <p style={{ fontSize: '0.875rem', color: '#555', margin: 0 }}>Estrategias, metas y proyecciones generadas automaticamente con IA basadas en datos reales del marketplace.</p>
        </div>

        {metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { label: 'Ventas Totales', value: '$' + (metrics.totalVentas ?? 0).toLocaleString('es-CO'), color: '#1D9E75' },
              { label: 'Comisiones', value: '$' + (metrics.comisiones ?? 0).toLocaleString('es-CO'), color: '#D4AF37' },
              { label: 'Vendedores', value: metrics.vendedores ?? 0, color: '#a78bfa' },
              { label: 'Compradores', value: metrics.compradores ?? 0, color: '#38bdf8' },
              { label: 'Ordenes', value: metrics.totalOrdenes ?? 0, color: '#fb923c' },
              { label: 'Nuevos/Semana', value: metrics.usuariosNuevosSemana ?? 0, color: '#1D9E75' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#111', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px', fontWeight: 600 }}>{m.label}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: m.color, margin: 0 }}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: activeSection === s.id ? s.color : '#111',
                color: activeSection === s.id ? '#000' : '#666',
                fontSize: '0.8rem', fontWeight: activeSection === s.id ? 700 : 500,
                transition: 'all .2s'
              }}>
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#111', borderRadius: '16px', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: seccionActiva?.color }}>{seccionActiva?.icon}</div>
              <div>
                <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, fontWeight: 600 }}>IA Business Manager</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>{seccionActiva?.label}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {resultados[activeSection] && (
                <button onClick={() => copiar(resultados[activeSection])}
                  style={{ padding: '0.6rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#888', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copiar
                </button>
              )}
              <button onClick={() => generar(activeSection)} disabled={loading[activeSection]}
                style={{ padding: '0.6rem 1.25rem', background: loading[activeSection] ? '#222' : seccionActiva?.color, border: 'none', borderRadius: '8px', color: loading[activeSection] ? '#555' : '#000', fontSize: '0.8rem', fontWeight: 700, cursor: loading[activeSection] ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                {loading[activeSection] ? 'Generando...' : resultados[activeSection] ? 'Regenerar' : 'Generar con IA'}
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {!resultados[activeSection] && !loading[activeSection] && (
              <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed rgba(212,175,55,.15)', borderRadius: '12px' }}>
                <div style={{ color: seccionActiva?.color, display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{seccionActiva?.icon}</div>
                <p style={{ color: '#555', fontSize: '0.875rem', margin: '0 0 4px' }}>Haz clic en "Generar con IA" para obtener {seccionActiva?.label}</p>
                <p style={{ color: '#333', fontSize: '0.75rem', margin: 0 }}>Basado en datos reales del marketplace</p>
              </div>
            )}

            {loading[activeSection] && (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: '#D4AF37', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Analizando datos del marketplace...</p>
                <p style={{ color: '#333', fontSize: '0.75rem' }}>La IA esta procesando tu informacion</p>
              </div>
            )}

            {resultados[activeSection] && !loading[activeSection] && (
              <div style={{ background: '#0f0f0f', borderRadius: '10px', padding: '1.5rem', border: '1px solid rgba(255,255,255,.04)' }}>
                <pre style={{ color: '#ccc', fontSize: '0.875rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                  {resultados[activeSection]}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => SECCIONES.forEach(s => generar(s.id))}
            style={{ padding: '0.75rem 1.5rem', background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.2)', borderRadius: '10px', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            Generar todo con IA
          </button>
          <button onClick={() => {
            const todo = SECCIONES.map(s => `=== ${s.label.toUpperCase()} ===\n${resultados[s.id] ?? 'No generado'}`).join('\n\n')
            const blob = new Blob([todo], { type: 'text/plain;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'plan-negocio-dms-' + new Date().toLocaleDateString('es-CO').replace(/\//g, '-') + '.txt'
            a.click()
          }} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: '10px', color: '#666', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Descargar plan completo
          </button>
        </div>

      </div>
    </div>
  )
}
