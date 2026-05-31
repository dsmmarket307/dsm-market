'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { createClient } from '@/lib/supabase/client'

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#1a1a1a', bg3: '#222222', text: '#ffffff', text2: '#999999', text3: '#666666', border: 'rgba(212,175,55,0.12)', borderHover: 'rgba(212,175,55,0.3)' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#e8e8e8', text: '#111111', text2: '#555555', text3: '#888888', border: 'rgba(0,0,0,0.1)',         borderHover: 'rgba(0,0,0,0.25)'        },
}

type Section = 'perfil' | 'apariencia' | 'accesibilidad' | 'notificaciones' | 'rol'

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

  const [displayName, setDisplayName] = useState(name)
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [commission, setCommission] = useState('')
  const [mpKey, setMpKey] = useState('')
  const [resendKey, setResendKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [savingAdmin, setSavingAdmin] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [storeWhatsapp, setStoreWhatsapp] = useState('')
  const [storeInstagram, setStoreInstagram] = useState('')
  const [storeTiktok, setStoreTiktok] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankHolder, setBankHolder] = useState('')
  const [savingVendor, setSavingVendor] = useState(false)

  const [quickTitle, setQuickTitle] = useState('')
  const [quickReply, setQuickReply] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [signature, setSignature] = useState('')
  const [savingSupport, setSavingSupport] = useState(false)

  if (!open) return null

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const handleSaveAdmin = async () => {
    setSavingAdmin(true)
    try {
      await supabase.from('marketplace_config').upsert({
        id: 1,
        ...(commission && { commission_pct: parseFloat(commission) }),
        ...(mpKey      && { mp_public_key:  mpKey      }),
        ...(resendKey  && { resend_api_key: resendKey  }),
        ...(groqKey    && { groq_api_key:   groqKey    }),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingAdmin(false) }
  }

  const handleSaveVendor = async () => {
    setSavingVendor(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({
        ...(storeName     && { store_name:    storeName     }),
        ...(storeWhatsapp && { whatsapp:      storeWhatsapp }),
        ...(storeInstagram && { instagram:    storeInstagram }),
        ...(storeTiktok   && { tiktok:        storeTiktok   }),
        ...(bankName      && { bank_name:     bankName      }),
        ...(bankAccount   && { bank_account:  bankAccount   }),
        ...(bankHolder    && { bank_holder:   bankHolder    }),
      }).eq('id', user.id)
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingVendor(false) }
  }

  const handleSaveSupport = async () => {
    setSavingSupport(true)
    try {
      if (quickTitle && quickReply) {
        await supabase.from('canned_responses').insert({ title: quickTitle, content: quickReply })
        setQuickTitle('')
        setQuickReply('')
      }
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingSupport(false) }
  }

  const handleSavePerfil = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.auth.updateUser({ data: { name: displayName } })
      await supabase.from('profiles').update({
        name: displayName,
        ...(phone && { phone }),
        ...(city  && { city  }),
      }).eq('id', user.id)
      if (newEmail && newEmail !== email) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: newEmail })
        if (emailErr) throw new Error(emailErr.message)
      }
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error('Las contrasenas no coinciden')
        if (newPassword.length < 6) throw new Error('Minimo 6 caracteres')
        const { error: passErr } = await supabase.auth.updateUser({ password: newPassword })
        if (passErr) throw new Error(passErr.message)
      }
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
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

  const sectionTitle = (txt: string) => (
    <p style={{ color: t.text, fontWeight: 700, fontSize: 14, margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${t.border}` }}>{txt}</p>
  )

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'perfil', label: 'Perfil', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { key: 'apariencia', label: 'Apariencia', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
    { key: 'accesibilidad', label: 'Acceso', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
    { key: 'notificaciones', label: 'Notif.', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { key: 'rol', label: role === 'admin' ? 'Admin' : role === 'seller' ? 'Tienda' : role === 'provider' ? 'Servicio' : role === 'support' ? 'Agente' : 'Cuenta', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2, background: value ? accentHex : t.bg3, transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s', left: value ? 22 : 2 }} />
    </button>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label style={labelStyle}>{label}</label>{children}</div>
  )

  const SaveBtn = ({ onClick, loading, label = 'Guardar' }: { onClick: () => void; loading: boolean; label?: string }) => (
    <button onClick={onClick} disabled={loading} style={{ padding: '12px 20px', background: loading ? t.bg3 : accentHex, color: '#0B0B0B', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif", width: '100%' }}>
      {loading ? 'Guardando...' : label}
    </button>
  )

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520, background: t.bg, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 40px rgba(0,0,0,0.4)', fontFamily: "'Poppins',sans-serif" }}>
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
            <button key={s.key} onClick={() => setSection(s.key)} style={{ flex: 1, minWidth: 80, padding: '12px 6px', background: 'transparent', border: 'none', borderBottom: section === s.key ? `2px solid ${accentHex}` : '2px solid transparent', color: section === s.key ? accentHex : t.text2, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: "'Poppins',sans-serif", transition: 'all 0.2s' }}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

          {saved && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontSize: 13 }}>Guardado correctamente</div>}
          {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>{error}</div>}

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
              <Field label="Nombre"><input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre" /></Field>
              <Field label="Telefono"><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+57 300 000 0000" /></Field>
              <Field label="Ciudad"><input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Pereira, Colombia" /></Field>
              <div style={{ height: 1, background: t.border }} />
              <Field label="Nuevo correo"><input style={inputStyle} type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={email} /></Field>
              <Field label="Nueva contrasena"><input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimo 6 caracteres" /></Field>
              <Field label="Confirmar contrasena"><input style={inputStyle} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contrasena" /></Field>
              <SaveBtn onClick={handleSavePerfil} loading={saving} label="Guardar perfil" />
            </div>
          )}

          {/* APARIENCIA */}
          {section === 'apariencia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                {sectionTitle('Tema')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(['dark', 'light'] as const).map(th => (
                    <button key={th} onClick={toggleTheme} style={{ padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: theme === th ? `2px solid ${accentHex}` : `1px solid ${t.border}`, background: theme === th ? `${accentHex}12` : t.bg2, color: theme === th ? accentHex : t.text2, fontSize: 13, fontWeight: 600 }}>
                      {th === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {sectionTitle('Color de acento')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {([{ key: 'gold', hex: '#D4AF37', label: 'Dorado' }, { key: 'blue', hex: '#3B82F6', label: 'Azul' }, { key: 'green', hex: '#10B981', label: 'Verde' }] as const).map(c => (
                    <button key={c.key} onClick={() => setAccentColor(c.key)} style={{ padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: accentColor === c.key ? `2px solid ${c.hex}` : `1px solid ${t.border}`, background: accentColor === c.key ? `${c.hex}15` : t.bg2, color: c.hex, fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex }} />{c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACCESIBILIDAD */}
          {section === 'accesibilidad' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sectionTitle('Tamano de letra')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([{ key: 'small', label: 'Pequeno', size: '12px' }, { key: 'normal', label: 'Normal', size: '14px' }, { key: 'large', label: 'Grande', size: '16px' }, { key: 'xlarge', label: 'Extra grande', size: '18px' }] as const).map(f => (
                  <button key={f.key} onClick={() => setFontSize(f.key)} style={{ padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: fontSize === f.key ? `2px solid ${accentHex}` : `1px solid ${t.border}`, background: fontSize === f.key ? `${accentHex}12` : t.bg2, color: fontSize === f.key ? accentHex : t.text2, fontSize: f.size, fontWeight: fontSize === f.key ? 700 : 400 }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <p style={{ color: t.text2, fontSize: 12, margin: '0 0 8px' }}>Vista previa</p>
                <p style={{ color: t.text, margin: 0, lineHeight: 1.6 }}>El tamano de letra seleccionado se aplica a todo el dashboard automaticamente.</p>
              </div>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {section === 'notificaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: t.text2, fontSize: 13, margin: '0 0 8px' }}>Administra que notificaciones recibes por correo.</p>
              {([
                { key: 'notifEmails',       label: 'Correos transaccionales', desc: 'Ordenes, pagos, confirmaciones'  },
                { key: 'notifPromos',        label: 'Promociones',             desc: 'Ofertas y descuentos especiales' },
                { key: 'notifNovedades',     label: 'Novedades',               desc: 'Nuevos productos y funciones'    },
                { key: 'notifSoporte',       label: 'Mensajes de soporte',     desc: 'Respuestas a tus tickets'        },
                { key: 'notifRecordatorios', label: 'Recordatorios',           desc: 'Entregas, pagos y vencimientos'  },
              ] as const).map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}`, gap: 12 }}>
                  <div>
                    <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{n.label}</p>
                    <p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>{n.desc}</p>
                  </div>
                  <Toggle value={n.key === 'notifEmails' ? notifEmails : n.key === 'notifPromos' ? notifPromos : n.key === 'notifNovedades' ? notifNovedades : n.key === 'notifSoporte' ? notifSoporte : notifRecordatorios} onChange={v => setNotif(n.key, v)} />
                </div>
              ))}
            </div>
          )}

          {/* ROL — ADMIN */}
          {section === 'rol' && role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sectionTitle('Configuracion del marketplace')}
              <Field label="Comision DSM (%)">
                <input style={inputStyle} type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="Ej: 5" />
              </Field>
              <div style={{ height: 1, background: t.border }} />
              {sectionTitle('APIs y claves')}
              <Field label="Mercado Pago Public Key">
                <input style={inputStyle} value={mpKey} onChange={e => setMpKey(e.target.value)} placeholder="APP_USR-..." />
              </Field>
              <Field label="Resend API Key">
                <input style={inputStyle} value={resendKey} onChange={e => setResendKey(e.target.value)} placeholder="re_..." />
              </Field>
              <Field label="Groq API Key">
                <input style={inputStyle} value={groqKey} onChange={e => setGroqKey(e.target.value)} placeholder="gsk_..." />
              </Field>
              <SaveBtn onClick={handleSaveAdmin} loading={savingAdmin} label="Guardar configuracion" />
            </div>
          )}

          {/* ROL — SELLER */}
          {section === 'rol' && role === 'seller' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sectionTitle('Datos de la tienda')}
              <Field label="Nombre de la tienda">
                <input style={inputStyle} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Ej: Moda Premium" />
              </Field>
              <Field label="WhatsApp">
                <input style={inputStyle} value={storeWhatsapp} onChange={e => setStoreWhatsapp(e.target.value)} placeholder="573001234567" />
              </Field>
              <Field label="Instagram">
                <input style={inputStyle} value={storeInstagram} onChange={e => setStoreInstagram(e.target.value)} placeholder="@mitienda" />
              </Field>
              <Field label="TikTok">
                <input style={inputStyle} value={storeTiktok} onChange={e => setStoreTiktok(e.target.value)} placeholder="@mitienda" />
              </Field>
              <div style={{ height: 1, background: t.border }} />
              {sectionTitle('Cuenta bancaria')}
              <Field label="Banco">
                <input style={inputStyle} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bancolombia, Nequi..." />
              </Field>
              <Field label="Numero de cuenta">
                <input style={inputStyle} value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="000-000000-00" />
              </Field>
              <Field label="Titular">
                <input style={inputStyle} value={bankHolder} onChange={e => setBankHolder(e.target.value)} placeholder="Nombre completo" />
              </Field>
              <SaveBtn onClick={handleSaveVendor} loading={savingVendor} label="Guardar tienda" />
            </div>
          )}

          {/* ROL — SUPPORT */}
          {section === 'rol' && role === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sectionTitle('Estado del agente')}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}` }}>
                <div>
                  <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Disponible</p>
                  <p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>Visible como agente activo</p>
                </div>
                <Toggle value={isOnline} onChange={setIsOnline} />
              </div>
              <div style={{ height: 1, background: t.border }} />
              {sectionTitle('Firma de mensajes')}
              <Field label="Firma">
                <input style={inputStyle} value={signature} onChange={e => setSignature(e.target.value)} placeholder="Ej: Soporte DMS Market" />
              </Field>
              <div style={{ height: 1, background: t.border }} />
              {sectionTitle('Nueva respuesta rapida')}
              <Field label="Titulo">
                <input style={inputStyle} value={quickTitle} onChange={e => setQuickTitle(e.target.value)} placeholder="Ej: Saludo inicial" />
              </Field>
              <Field label="Contenido">
                <textarea style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }} value={quickReply} onChange={e => setQuickReply(e.target.value)} placeholder="Hola, bienvenido a soporte DMS..." />
              </Field>
              <SaveBtn onClick={handleSaveSupport} loading={savingSupport} label="Guardar" />
            </div>
          )}

          {/* ROL — BUYER / PROVIDER */}
          {section === 'rol' && (role === 'buyer' || role === 'provider') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sectionTitle('Mi cuenta')}
              <div style={{ padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <p style={{ color: t.text2, fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                  Gestiona tu informacion de perfil desde la pestana <strong style={{ color: accentHex }}>Perfil</strong>.<br />
                  Cambia el aspecto del dashboard en <strong style={{ color: accentHex }}>Apariencia</strong>.<br />
                  Ajusta el tamano de texto en <strong style={{ color: accentHex }}>Acceso</strong>.
                </p>
              </div>
              <div style={{ padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${accentHex}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentHex} strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{name || email}</p>
                  <p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>{role === 'buyer' ? 'Comprador' : 'Proveedor'}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}