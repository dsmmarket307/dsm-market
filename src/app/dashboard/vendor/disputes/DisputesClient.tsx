'use client'
import { useTheme } from '@/lib/theme-context'

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#1a1a1a', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', gold: '#D4AF37', adminNote: '#1a1700', adminNoteBorder: '#C9A84C' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.12)',        gold: '#B8960C', adminNote: '#fefce8', adminNoteBorder: '#B8960C' },
}

const reasonLabels: Record<string,string> = {
  shipping_problem: 'Problema con envio',
  damaged_product: 'Producto danado',
  malfunction: 'Mal funcionamiento',
  talk_to_advisor: 'Hablar con asesor',
  other: 'Otro',
}

const statusLabels: Record<string,string> = {
  open: 'Abierta',
  in_review: 'En revision',
  resolved: 'Resuelta',
  closed: 'Cerrada',
}

function statusColors(status: string) {
  if (status === 'open')      return { bg: '#fdecea', color: '#c62828' }
  if (status === 'in_review') return { bg: '#fff8e1', color: '#f57f17' }
  return { bg: '#e8f5e9', color: '#2e7d32' }
}

export default function DisputesClient({ disputes }: { disputes: any[] }) {
  const { theme, toggleTheme } = useTheme()
  const T = THEMES[theme]

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', background: T.bg, minHeight: '100vh', fontFamily: "'Poppins',sans-serif", transition: 'background .3s' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.gold, marginBottom: '0.25rem' }}>Vendedor</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: T.text, margin: 0 }}>Disputas de mis productos</h1>
        </div>
        <button onClick={toggleTheme} title="Cambiar tema" style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: T.text2, fontSize: 12 }}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
          {theme === 'dark' ? 'Claro' : 'Oscuro'}
        </button>
      </div>

      {disputes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: `1px solid ${T.border}`, borderRadius: 12 }}>
          <p style={{ color: T.text2, fontSize: '0.875rem' }}>No tienes disputas activas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {disputes.map((dispute: any) => {
            const sc = statusColors(dispute.status)
            return (
              <div key={dispute.id} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: '1.25rem', background: T.bg2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: T.text }}>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: sc.bg, color: sc.color, border: `1px solid ${T.border}`, borderRadius: 6 }}>
                        {statusLabels[dispute.status]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: T.text2, marginBottom: '0.25rem' }}>{dispute.description}</p>
                    <p style={{ fontSize: '0.75rem', color: T.text2 }}>Contacto: {dispute.phone} — {dispute.email}</p>
                    <p style={{ fontSize: '0.75rem', color: T.text2 }}>{new Date(dispute.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>

                {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {dispute.evidence_urls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Evidencia ${i+1}`} style={{ width: 70, height: 70, objectFit: 'cover', border: `1px solid ${T.border}`, borderRadius: 8 }} />
                      </a>
                    ))}
                  </div>
                )}

                {dispute.admin_notes && (
                  <div style={{ padding: '0.75rem', background: T.adminNote, border: `1px solid ${T.adminNoteBorder}`, borderRadius: 8 }}>
                    <p style={{ fontSize: '0.75rem', color: T.gold, fontWeight: 600, marginBottom: '0.25rem' }}>Respuesta del administrador:</p>
                    <p style={{ fontSize: '0.875rem', color: T.text }}>{dispute.admin_notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}