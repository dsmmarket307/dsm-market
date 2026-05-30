'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { createClient } from '@/lib/supabase/client'

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#1a1a1a', bg3: '#222222', text: '#ffffff', text2: '#999999', text3: '#666666', border: 'rgba(212,175,55,0.12)', borderHover: 'rgba(212,175,55,0.3)' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#e8e8e8', text: '#111111', text2: '#555555', text3: '#888888', border: 'rgba(0,0,0,0.1)',         borderHover: 'rgba(0,0,0,0.25)'        },
}

type Section = 'perfil' | 'apariencia' | 'accesibilidad' | 'notificaciones'

interface Props {
  open: boolean
  onClose: () => void
  role: string
  name: string
  email: string
}

export default function SettingsPanel({ open, onClose, role, name, email }: Props) {
  const { theme, fontSize, accentColor, toggleTheme, setFontSize, setAccentColor, accentHex, notifEmails, notifPromos, notifNovedades, notifSoporte, notifRecordatorios, setNotif, savePreferences } = useTheme()
  const t = THEMES[theme]
  const supabase = createClient()

  const [section, setSection] = useState<Section>('perfil')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Perfil form
  const [displayName, setDisplayName] = useState(name)
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!open) return null

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSavePerfil = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Actualizar metadata
      await supabase.auth.updateUser({
        data: { name: displayName }
      })

      // Actualizar profile
      await supabase.from('profiles').update({
        name: displayName,
        ...(phone && { phone }),
        ...(city  && { city  }),
      }).eq('id', user.id)

      // Cambiar email
      if (newEmail && newEmail !== email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: newEmail })
        if (emailErr) throw new Error(emailErr.message)
      }

      // Cambiar password
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error('Las contrasenas no coinciden')
        if (newPassword.length < 6) throw new Error('Minimo 6 caracteres')
        const { error: passErr } = await supabase.auth.updateUser({ password: newPassword })
        if (passErr) throw new Error(passErr.message)
      }

      showSaved()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', background: t.bg3, border: `1px solid ${t.border}`,
    borderRadius: 8, padding: '10px 14px', color: t.text, fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Poppins',sans-serif",
  }

  const labelStyle = {
    display: 'block', color: t.text2, fontSize: 11, fontWeight: 600,
    marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px',
  }

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    {
      key: 'perfil', label: 'Perfil',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      key: 'apariencia', label: 'Apariencia',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    },
    {
      key: 'accesibilidad', label: 'Accesibilidad',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    },
    {
      key: 'notificaciones', label: 'Notificaciones',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    },
  ]

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2,
        background: value ? accentHex : t.bg3, transition: 'background 0.2s', position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, transition: 'left 0.2s',
        left: value ? 22 : 2,
      }} />
    </button>
  )

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520,
        background: t.bg, zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.4)', fontFamily: "'Poppins',sans-serif",
        overflowY: 'auto',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Configuracion</h2>
            <p style={{ color: t.text2, fontSize: 12, margin: '2px 0 0' }}>{email}</p>
          </div>
          <button onClick={onClose} style={{ background: t.bg2, border: `1px solid ${t.border}`, color: t.text2, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {sections.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{
              flex: 1, minWidth: 100, padding: '12px 8px', background: 'transparent', border: 'none',
              borderBottom: section === s.key ? `2px solid ${accentHex}` : '2px solid transparent',
              color: section === s.key ? accentHex : t.text2, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: "'Poppins',sans-serif",
              transition: 'all 0.2s',
            }}>
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

          {/* Feedback */}
          {saved && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontSize: 13 }}>
              Guardado correctamente
            </div>
          )}
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* PERFIL */}
          {section === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${accentHex},${accentHex}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#0B0B0B', flexShrink: 0 }}>
                  {(displayName || email)?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p style={{ color: t.text, fontWeight: 600, fontSize: 15, margin: 0 }}>{displayName || email}</p>
                  <span style={{ fontSize: 11, color: accentHex, background: `${accentHex}18`, padding: '2px 8px', borderRadius: 999 }}>{role}</span>
                </div>
              </div>

              <div><label style={labelStyle}>Nombre</label><input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre" /></div>
              <div><label style={labelStyle}>Telefono</label><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+57 300 000 0000" /></div>
              <div><label style={labelStyle}>Ciudad</label><input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Pereira, Colombia" /></div>

              <div style={{ height: 1, background: t.border, margin: '4px 0' }} />

              <div><label style={labelStyle}>Nuevo correo</label><input style={inputStyle} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={email} /></div>
              <div><label style={labelStyle}>Nueva contrasena</label><input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimo 6 caracteres" /></div>
              <div><label style={labelStyle}>Confirmar contrasena</label><input style={inputStyle} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contrasena" /></div>

              <button onClick={handleSavePerfil} disabled={saving} style={{ padding: '12px', background: saving ? t.bg3 : accentHex, color: '#0B0B0B', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}>
                {saving ? 'Guardando...' : 'Guardar perfil'}
              </button>
            </div>
          )}

          {/* APARIENCIA */}
          {section === 'apariencia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p style={{ color: t.text, fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>Tema</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['dark', 'light'] as const).map(th => (
                    <button key={th} onClick={toggleTheme} style={{
                      padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
                      border: theme === th ? `2px solid ${accentHex}` : `1px solid ${t.border}`,
                      background: theme === th ? `${accentHex}12` : t.bg2,
                      color: theme === th ? accentHex : t.text2, fontSize: 13, fontWeight: 600,
                    }}>
                      {th === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ color: t.text, fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>Color de acento</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {([
                    { key: 'gold',  hex: '#D4AF37', label: 'Dorado' },
                    { key: 'blue',  hex: '#3B82F6', label: 'Azul'   },
                    { key: 'green', hex: '#10B981', label: 'Verde'  },
                  ] as const).map(c => (
                    <button key={c.key} onClick={() => setAccentColor(c.key)} style={{
                      padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
                      border: accentColor === c.key ? `2px solid ${c.hex}` : `1px solid ${t.border}`,
                      background: accentColor === c.key ? `${c.hex}15` : t.bg2,
                      color: c.hex, fontSize: 13, fontWeight: 600,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACCESIBILIDAD */}
          {section === 'accesibilidad' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <p style={{ color: t.text, fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>Tamano de letra</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { key: 'small',  label: 'Pequeno',     size: '12px' },
                    { key: 'normal', label: 'Normal',       size: '14px' },
                    { key: 'large',  label: 'Grande',       size: '16px' },
                    { key: 'xlarge', label: 'Extra grande', size: '18px' },
                  ] as const).map(f => (
                    <button key={f.key} onClick={() => setFontSize(f.key)} style={{
                      padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
                      border: fontSize === f.key ? `2px solid ${accentHex}` : `1px solid ${t.border}`,
                      background: fontSize === f.key ? `${accentHex}12` : t.bg2,
                      color: fontSize === f.key ? accentHex : t.text2,
                      fontSize: f.size, fontWeight: fontSize === f.key ? 700 : 400,
                    }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <p style={{ color: t.text2, fontSize: 12, margin: '0 0 8px' }}>Vista previa</p>
                <p style={{ color: t.text, margin: 0, lineHeight: 1.6 }}>
                  El tamano de letra seleccionado se aplica a todo el dashboard automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {section === 'notificaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: t.text2, fontSize: 13, margin: '0 0 8px' }}>Administra que notificaciones recibes por correo.</p>
              {([
                { key: 'notifEmails',        label: 'Correos transaccionales', desc: 'Ordenes, pagos, confirmaciones'     },
                { key: 'notifPromos',         label: 'Promociones',             desc: 'Ofertas y descuentos especiales'    },
                { key: 'notifNovedades',      label: 'Novedades',               desc: 'Nuevos productos y funciones'       },
                { key: 'notifSoporte',        label: 'Mensajes de soporte',     desc: 'Respuestas a tus tickets'           },
                { key: 'notifRecordatorios',  label: 'Recordatorios',           desc: 'Entregas, pagos y vencimientos'     },
              ] as const).map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}`, gap: 12 }}>
                  <div>
                    <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{n.label}</p>
                    <p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>{n.desc}</p>
                  </div>
                  <Toggle
                    value={
                      n.key === 'notifEmails'       ? notifEmails       :
                      n.key === 'notifPromos'        ? notifPromos        :
                      n.key === 'notifNovedades'     ? notifNovedades     :
                      n.key === 'notifSoporte'       ? notifSoporte       :
                      notifRecordatorios
                    }
                    onChange={v => setNotif(n.key, v)}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
