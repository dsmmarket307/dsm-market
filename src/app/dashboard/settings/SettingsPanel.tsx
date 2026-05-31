'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/theme-context'
import { createClient } from '@/lib/supabase/client'

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#1a1a1a', bg3: '#222222', text: '#ffffff', text2: '#999999', text3: '#666666', border: 'rgba(212,175,55,0.12)' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#e8e8e8', text: '#111111', text2: '#555555', text3: '#888888', border: 'rgba(0,0,0,0.1)'  },
}

type Section = 'perfil' | 'apariencia' | 'accesibilidad' | 'notificaciones' | 'referidos' | 'calendario' | 'rol'

interface Props { open: boolean; onClose: () => void; role: string; name: string; email: string }

export default function SettingsPanel({ open, onClose, role, name, email }: Props) {
  const { theme, fontSize, accentColor, toggleTheme, setFontSize, setAccentColor, accentHex, notifEmails, notifPromos, notifNovedades, notifSoporte, notifRecordatorios, setNotif } = useTheme()
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

  const [refCode, setRefCode] = useState('')
  const [refLink, setRefLink] = useState('')
  const [refList, setRefList] = useState<any[]>([])
  const [refTotal, setRefTotal] = useState(0)
  const [refEarnings, setRefEarnings] = useState(0)
  const [refCopied, setRefCopied] = useState(false)
  const [loadingRef, setLoadingRef] = useState(false)

  const [calEvents, setCalEvents] = useState<any[]>([])
  const [calLoading, setCalLoading] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventType, setNewEventType] = useState('general')
  const [newEventDesc, setNewEventDesc] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

  useEffect(() => { if (open && section === 'referidos') loadReferidos() }, [open, section])
  useEffect(() => { if (open && section === 'calendario') loadCalendar() }, [open, section, calMonth])

  async function loadReferidos() {
    setLoadingRef(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: existing } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false })
      if (existing && existing.length > 0) {
        setRefList(existing); setRefTotal(existing.length)
        setRefEarnings(existing.reduce((s: number, r: any) => s + Number(r.reward ?? 0), 0))
        const code = existing[0].code
        setRefCode(code); setRefLink(`https://dms-market.vercel.app/auth/register?ref=${code}`)
      } else {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) return
        const code = u.id.slice(0, 8).toUpperCase()
        await supabase.from('referrals').insert({ referrer_id: u.id, code, status: 'pending' })
        setRefCode(code); setRefLink(`https://dms-market.vercel.app/auth/register?ref=${code}`)
        setRefList([]); setRefTotal(0); setRefEarnings(0)
      }
    } catch (e: any) { setError(e.message) } finally { setLoadingRef(false) }
  }

  async function loadCalendar() {
    setCalLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const start = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).toISOString()
      const end   = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0, 23, 59, 59).toISOString()
      const { data } = await supabase.from('calendar_events').select('*').eq('user_id', user.id).gte('event_date', start).lte('event_date', end).order('event_date', { ascending: true })
      setCalEvents(data ?? [])
    } catch (e: any) { setError(e.message) } finally { setCalLoading(false) }
  }

  async function handleSaveEvent() {
    if (!newEventTitle || !newEventDate) return
    setSavingEvent(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('calendar_events').insert({
        user_id: user.id, title: newEventTitle, description: newEventDesc,
        event_type: newEventType, event_date: new Date(newEventDate).toISOString(), role,
      })
      setNewEventTitle(''); setNewEventDate(''); setNewEventDesc(''); setNewEventType('general')
      setShowEventForm(false)
      await loadCalendar()
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingEvent(false) }
  }

  async function handleDeleteEvent(id: string) {
    await supabase.from('calendar_events').delete().eq('id', id)
    setCalEvents(prev => prev.filter(e => e.id !== id))
  }

  function copyRef() { navigator.clipboard.writeText(refLink); setRefCopied(true); setTimeout(() => setRefCopied(false), 2000) }

  if (!open) return null

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const handleSaveAdmin = async () => {
    setSavingAdmin(true)
    try {
      await supabase.from('marketplace_config').upsert({ id: 1, ...(commission && { commission_pct: parseFloat(commission) }), ...(mpKey && { mp_public_key: mpKey }), ...(resendKey && { resend_api_key: resendKey }), ...(groqKey && { groq_api_key: groqKey }), updated_at: new Date().toISOString() }, { onConflict: 'id' })
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingAdmin(false) }
  }

  const handleSaveVendor = async () => {
    setSavingVendor(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ ...(storeName && { store_name: storeName }), ...(storeWhatsapp && { whatsapp: storeWhatsapp }), ...(storeInstagram && { instagram: storeInstagram }), ...(storeTiktok && { tiktok: storeTiktok }), ...(bankName && { bank_name: bankName }), ...(bankAccount && { bank_account: bankAccount }), ...(bankHolder && { bank_holder: bankHolder }) }).eq('id', user.id)
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingVendor(false) }
  }

  const handleSaveSupport = async () => {
    setSavingSupport(true)
    try {
      if (quickTitle && quickReply) { await supabase.from('canned_responses').insert({ title: quickTitle, content: quickReply }); setQuickTitle(''); setQuickReply('') }
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSavingSupport(false) }
  }

  const handleSavePerfil = async () => {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.auth.updateUser({ data: { name: displayName } })
      await supabase.from('profiles').update({ name: displayName, ...(phone && { phone }), ...(city && { city }) }).eq('id', user.id)
      if (newEmail && newEmail !== email) { const { error: e } = await supabase.auth.updateUser({ email: newEmail }); if (e) throw new Error(e.message) }
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error('Las contrasenas no coinciden')
        if (newPassword.length < 6) throw new Error('Minimo 6 caracteres')
        const { error: e } = await supabase.auth.updateUser({ password: newPassword }); if (e) throw new Error(e.message)
      }
      showSaved()
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const inputStyle = { width: '100%', background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', color: t.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Poppins',sans-serif" }
  const labelStyle = { display: 'block', color: t.text2, fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
  const ST = (txt: string) => <p style={{ color: t.text, fontWeight: 700, fontSize: 14, margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${t.border}` }}>{txt}</p>
  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={labelStyle}>{label}</label>{children}</div>
  const SaveBtn = ({ onClick, loading, label = 'Guardar' }: { onClick: () => void; loading: boolean; label?: string }) => (
    <button onClick={onClick} disabled={loading} style={{ padding: '12px 20px', background: loading ? t.bg3 : accentHex, color: '#0B0B0B', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif", width: '100%' }}>
      {loading ? 'Guardando...' : label}
    </button>
  )
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2, background: value ? accentHex : t.bg3, transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, transition: 'left 0.2s', left: value ? 22 : 2 }} />
    </button>
  )

  const eventTypeColors: Record<string, string> = {
    general: accentHex, orden: '#60a5fa', pago: '#10b981', envio: '#a78bfa',
    vencimiento: '#f87171', campana: '#f59e0b', ticket: '#34d399',
  }

  const eventTypeLabels: Record<string, string> = {
    general: 'General', orden: 'Orden', pago: 'Pago', envio: 'Envio',
    vencimiento: 'Vencimiento', campana: 'Campana', ticket: 'Ticket',
  }

  const eventTypesByRole: Record<string, string[]> = {
    buyer:    ['general', 'orden', 'envio', 'pago'],
    seller:   ['general', 'orden', 'pago', 'envio', 'vencimiento', 'campana'],
    admin:    ['general', 'pago', 'campana', 'vencimiento', 'ticket'],
    support:  ['general', 'ticket'],
    provider: ['general', 'vencimiento', 'campana'],
  }

  const availableTypes = eventTypesByRole[role] ?? ['general']

  const monthName = calMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const prevMonth = () => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCalMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate()
  const firstDay    = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay()
  const today       = new Date()

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'perfil',         label: 'Perfil',    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { key: 'apariencia',     label: 'Tema',      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
    { key: 'accesibilidad',  label: 'Texto',     icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
    { key: 'notificaciones', label: 'Notif.',    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { key: 'referidos',      label: 'Referidos', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key: 'calendario',     label: 'Agenda',    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { key: 'rol', label: role === 'admin' ? 'Admin' : role === 'seller' ? 'Tienda' : role === 'provider' ? 'Servicio' : role === 'support' ? 'Agente' : 'Cuenta', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ]

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520, background: t.bg, zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 40px rgba(0,0,0,0.4)', fontFamily: "'Poppins',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Configuracion</h2>
            <p style={{ color: t.text2, fontSize: 12, margin: '2px 0 0' }}>{email}</p>
          </div>
          <button onClick={onClose} style={{ background: t.bg2, border: `1px solid ${t.border}`, color: t.text2, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: `1px solid ${t.border}`, flexShrink: 0, overflowX: 'auto' }}>
          {sections.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{ flex: 1, minWidth: 64, padding: '10px 2px', background: 'transparent', border: 'none', borderBottom: section === s.key ? `2px solid ${accentHex}` : '2px solid transparent', color: section === s.key ? accentHex : t.text2, cursor: 'pointer', fontSize: 10, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: "'Poppins',sans-serif", transition: 'all 0.2s' }}>
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {saved && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10b981', fontSize: 13 }}>Guardado correctamente</div>}
          {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>{error}</div>}

          {/* PERFIL */}
          {section === 'perfil' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${accentHex},${accentHex}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: '#0B0B0B', flexShrink: 0 }}>{(displayName || email)?.charAt(0)?.toUpperCase()}</div>
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
              <div>{ST('Tema')}<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{(['dark','light'] as const).map(th => (<button key={th} onClick={toggleTheme} style={{ padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: theme === th ? `2px solid ${accentHex}` : `1px solid ${t.border}`, background: theme === th ? `${accentHex}12` : t.bg2, color: theme === th ? accentHex : t.text2, fontSize: 13, fontWeight: 600 }}>{th === 'dark' ? 'Modo oscuro' : 'Modo claro'}</button>))}</div></div>
              <div>{ST('Color de acento')}<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>{([{key:'gold',hex:'#D4AF37',label:'Dorado'},{key:'blue',hex:'#3B82F6',label:'Azul'},{key:'green',hex:'#10B981',label:'Verde'}] as const).map(c => (<button key={c.key} onClick={() => setAccentColor(c.key)} style={{ padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: accentColor === c.key ? `2px solid ${c.hex}` : `1px solid ${t.border}`, background: accentColor === c.key ? `${c.hex}15` : t.bg2, color: c.hex, fontSize: 13, fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><div style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex }} />{c.label}</button>))}</div></div>
            </div>
          )}

          {/* ACCESIBILIDAD */}
          {section === 'accesibilidad' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {ST('Tamano de letra')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{([{key:'small',label:'Pequeno',size:'12px'},{key:'normal',label:'Normal',size:'14px'},{key:'large',label:'Grande',size:'16px'},{key:'xlarge',label:'Extra grande',size:'18px'}] as const).map(f => (<button key={f.key} onClick={() => setFontSize(f.key)} style={{ padding: '14px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", border: fontSize === f.key ? `2px solid ${accentHex}` : `1px solid ${t.border}`, background: fontSize === f.key ? `${accentHex}12` : t.bg2, color: fontSize === f.key ? accentHex : t.text2, fontSize: f.size, fontWeight: fontSize === f.key ? 700 : 400 }}>{f.label}</button>))}</div>
              <div style={{ padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}><p style={{ color: t.text2, fontSize: 12, margin: '0 0 8px' }}>Vista previa</p><p style={{ color: t.text, margin: 0, lineHeight: 1.6 }}>El tamano de letra seleccionado se aplica a todo el dashboard automaticamente.</p></div>
            </div>
          )}

          {/* NOTIFICACIONES */}
          {section === 'notificaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: t.text2, fontSize: 13, margin: '0 0 8px' }}>Administra que notificaciones recibes por correo.</p>
              {([{key:'notifEmails',label:'Correos transaccionales',desc:'Ordenes, pagos, confirmaciones'},{key:'notifPromos',label:'Promociones',desc:'Ofertas y descuentos especiales'},{key:'notifNovedades',label:'Novedades',desc:'Nuevos productos y funciones'},{key:'notifSoporte',label:'Mensajes de soporte',desc:'Respuestas a tus tickets'},{key:'notifRecordatorios',label:'Recordatorios',desc:'Entregas, pagos y vencimientos'}] as const).map(n => (
                <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}`, gap: 12 }}>
                  <div><p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{n.label}</p><p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>{n.desc}</p></div>
                  <Toggle value={n.key==='notifEmails'?notifEmails:n.key==='notifPromos'?notifPromos:n.key==='notifNovedades'?notifNovedades:n.key==='notifSoporte'?notifSoporte:notifRecordatorios} onChange={v => setNotif(n.key, v)} />
                </div>
              ))}
            </div>
          )}

          {/* REFERIDOS */}
          {section === 'referidos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ST('Mi programa de referidos')}
              {loadingRef ? <p style={{ color: t.text2, fontSize: 13 }}>Cargando...</p> : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `1px solid ${t.border}`, textAlign: 'center' }}><p style={{ fontSize: 28, fontWeight: 800, color: accentHex, margin: 0 }}>{refTotal}</p><p style={{ fontSize: 11, color: t.text2, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Referidos</p></div>
                    <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `1px solid ${t.border}`, textAlign: 'center' }}><p style={{ fontSize: 28, fontWeight: 800, color: '#10b981', margin: 0 }}>${refEarnings.toLocaleString('es-CO')}</p><p style={{ fontSize: 11, color: t.text2, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>Ganancias</p></div>
                  </div>
                  <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 11, color: t.text2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tu codigo</p>
                    <div style={{ background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: accentHex, letterSpacing: 3 }}>{refCode}</div>
                  </div>
                  <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 11, color: t.text2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Tu enlace</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, background: t.bg3, border: `1px solid ${t.border}`, borderRadius: 8, padding: '10px 12px', fontSize: 11, color: t.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{refLink}</div>
                      <button onClick={copyRef} style={{ padding: '10px 16px', background: refCopied ? '#10b981' : accentHex, color: '#0B0B0B', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{refCopied ? 'Copiado' : 'Copiar'}</button>
                    </div>
                  </div>
                  <div>{ST('Historial')}
                    {refList.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}><p style={{ color: t.text2, fontSize: 13, margin: 0 }}>Aun no tienes referidos. Comparte tu enlace.</p></div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {refList.map((r: any) => (
                          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}` }}>
                            <div><p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Referido #{r.id.slice(0,6).toUpperCase()}</p><p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>{new Date(r.created_at).toLocaleDateString('es-CO')}</p></div>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 600, background: r.status==='completed'?'rgba(16,185,129,0.1)':'rgba(212,175,55,0.1)', color: r.status==='completed'?'#10b981':accentHex }}>{r.status==='completed'?'Completado':'Pendiente'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CALENDARIO */}
          {section === 'calendario' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Nav mes */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={prevMonth} style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: t.text2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <p style={{ color: t.text, fontWeight: 700, fontSize: 14, margin: 0, textTransform: 'capitalize' }}>{monthName}</p>
                <button onClick={nextMonth} style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: t.text2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              {/* Grid calendario */}
              <div style={{ background: t.bg2, borderRadius: 12, padding: 12, border: `1px solid ${t.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                  {['D','L','M','M','J','V','S'].map((d,i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, color: t.text2, fontWeight: 700, padding: '4px 0' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                  {Array.from({ length: firstDay }).map((_,i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_,i) => i+1).map(day => {
                    const dayEvents = calEvents.filter(e => new Date(e.event_date).getDate() === day)
                    const isToday = today.getDate()===day && today.getMonth()===calMonth.getMonth() && today.getFullYear()===calMonth.getFullYear()
                    return (
                      <div key={day} style={{ minHeight: 32, borderRadius: 6, padding: '3px', background: isToday ? `${accentHex}20` : 'transparent', border: isToday ? `1px solid ${accentHex}40` : '1px solid transparent', position: 'relative' }}>
                        <p style={{ fontSize: 11, color: isToday ? accentHex : t.text2, fontWeight: isToday ? 700 : 400, margin: 0, textAlign: 'center' }}>{day}</p>
                        {dayEvents.slice(0,2).map((ev,i) => (
                          <div key={i} style={{ width: '100%', height: 4, borderRadius: 2, background: eventTypeColors[ev.event_type] ?? accentHex, marginTop: 2 }} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Boton agregar */}
              <button onClick={() => setShowEventForm(!showEventForm)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: `${accentHex}15`, border: `1px solid ${accentHex}40`, borderRadius: 10, color: accentHex, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {showEventForm ? 'Cancelar' : 'Agregar evento'}
              </button>

              {/* Form nuevo evento */}
              {showEventForm && (
                <div style={{ background: t.bg2, borderRadius: 12, padding: 16, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ST('Nuevo evento')}
                  <Field label="Titulo"><input style={inputStyle} value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="Ej: Entrega pedido #123" /></Field>
                  <Field label="Fecha y hora"><input style={inputStyle} type="datetime-local" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} /></Field>
                  <Field label="Tipo">
                    <select style={inputStyle} value={newEventType} onChange={e => setNewEventType(e.target.value)}>
                      {availableTypes.map(k => <option key={k} value={k}>{eventTypeLabels[k]}</option>)}
                    </select>
                  </Field>
                  <Field label="Descripcion (opcional)"><input style={inputStyle} value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} placeholder="Notas adicionales..." /></Field>
                  <SaveBtn onClick={handleSaveEvent} loading={savingEvent} label="Guardar evento" />
                </div>
              )}

              {/* Lista eventos del mes */}
              {calLoading ? <p style={{ color: t.text2, fontSize: 13 }}>Cargando...</p> : (
                <div>
                  {ST(`Eventos de ${monthName}`)}
                  {calEvents.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                      <p style={{ color: t.text2, fontSize: 13, margin: 0 }}>Sin eventos este mes.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {calEvents.map((ev: any) => (
                        <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}` }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: eventTypeColors[ev.event_type] ?? accentHex, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                            <p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>
                              {new Date(ev.event_date).toLocaleDateString('es-CO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                              {' · '}<span style={{ color: eventTypeColors[ev.event_type] ?? accentHex }}>{eventTypeLabels[ev.event_type] ?? ev.event_type}</span>
                            </p>
                          </div>
                          <button onClick={() => handleDeleteEvent(ev.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: t.text3, padding: 4, flexShrink: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ROL — ADMIN */}
          {section === 'rol' && role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {ST('Configuracion del marketplace')}
              <Field label="Comision DSM (%)"><input style={inputStyle} type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="Ej: 5" /></Field>
              <div style={{ height: 1, background: t.border }} />
              {ST('APIs y claves')}
              <Field label="Mercado Pago Public Key"><input style={inputStyle} value={mpKey} onChange={e => setMpKey(e.target.value)} placeholder="APP_USR-..." /></Field>
              <Field label="Resend API Key"><input style={inputStyle} value={resendKey} onChange={e => setResendKey(e.target.value)} placeholder="re_..." /></Field>
              <Field label="Groq API Key"><input style={inputStyle} value={groqKey} onChange={e => setGroqKey(e.target.value)} placeholder="gsk_..." /></Field>
              <SaveBtn onClick={handleSaveAdmin} loading={savingAdmin} label="Guardar configuracion" />
            </div>
          )}

          {/* ROL — SELLER */}
          {section === 'rol' && role === 'seller' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ST('Datos de la tienda')}
              <Field label="Nombre de la tienda"><input style={inputStyle} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Ej: Moda Premium" /></Field>
              <Field label="WhatsApp"><input style={inputStyle} value={storeWhatsapp} onChange={e => setStoreWhatsapp(e.target.value)} placeholder="573001234567" /></Field>
              <Field label="Instagram"><input style={inputStyle} value={storeInstagram} onChange={e => setStoreInstagram(e.target.value)} placeholder="@mitienda" /></Field>
              <Field label="TikTok"><input style={inputStyle} value={storeTiktok} onChange={e => setStoreTiktok(e.target.value)} placeholder="@mitienda" /></Field>
              <div style={{ height: 1, background: t.border }} />
              {ST('Cuenta bancaria')}
              <Field label="Banco"><input style={inputStyle} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bancolombia, Nequi..." /></Field>
              <Field label="Numero de cuenta"><input style={inputStyle} value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="000-000000-00" /></Field>
              <Field label="Titular"><input style={inputStyle} value={bankHolder} onChange={e => setBankHolder(e.target.value)} placeholder="Nombre completo" /></Field>
              <SaveBtn onClick={handleSaveVendor} loading={savingVendor} label="Guardar tienda" />
            </div>
          )}

          {/* ROL — SUPPORT */}
          {section === 'rol' && role === 'support' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ST('Estado del agente')}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: t.bg2, borderRadius: 10, border: `1px solid ${t.border}` }}>
                <div><p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>Disponible</p><p style={{ color: t.text2, fontSize: 11, margin: '2px 0 0' }}>Visible como agente activo</p></div>
                <Toggle value={isOnline} onChange={setIsOnline} />
              </div>
              <div style={{ height: 1, background: t.border }} />
              {ST('Firma de mensajes')}
              <Field label="Firma"><input style={inputStyle} value={signature} onChange={e => setSignature(e.target.value)} placeholder="Ej: Soporte DMS Market" /></Field>
              <div style={{ height: 1, background: t.border }} />
              {ST('Nueva respuesta rapida')}
              <Field label="Titulo"><input style={inputStyle} value={quickTitle} onChange={e => setQuickTitle(e.target.value)} placeholder="Ej: Saludo inicial" /></Field>
              <Field label="Contenido"><textarea style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 80 }} value={quickReply} onChange={e => setQuickReply(e.target.value)} placeholder="Hola, bienvenido a soporte DMS..." /></Field>
              <SaveBtn onClick={handleSaveSupport} loading={savingSupport} label="Guardar" />
            </div>
          )}

          {/* ROL — BUYER / PROVIDER */}
          {section === 'rol' && (role === 'buyer' || role === 'provider') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ST('Mi cuenta')}
              <div style={{ padding: 16, background: t.bg2, borderRadius: 12, border: `1px solid ${t.border}` }}>
                <p style={{ color: t.text2, fontSize: 13, margin: 0, lineHeight: 1.7 }}>Gestiona tu informacion desde <strong style={{ color: accentHex }}>Perfil</strong>. Cambia el aspecto en <strong style={{ color: accentHex }}>Tema</strong>. Ajusta texto en <strong style={{ color: accentHex }}>Texto</strong>.</p>
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