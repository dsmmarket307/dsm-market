'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/lib/theme-context"

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#151515', bg3: '#0B0B0B', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', borderFaint: 'rgba(255,255,255,0.06)', gold: '#D4AF37', inputBg: '#0f0f0f', inputBorder: 'rgba(255,255,255,0.08)', previewBg: '#0f0f0f' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#ffffff',  text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.12)',        borderFaint: 'rgba(0,0,0,0.07)',         gold: '#B8960C', inputBg: '#ffffff', inputBorder: 'rgba(0,0,0,0.15)',    previewBg: '#f0f0f0' },
}

export default function MiTiendaPage() {
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()
  const T = THEMES[theme]

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ store_name: "", store_description: "", store_phone: "" })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/auth/login"; return }
      setUser(user)
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) {
        setProfile(profile)
        setForm({
          store_name: profile.store_name ?? "",
          store_description: profile.store_description ?? "",
          store_phone: profile.store_phone ?? profile.celular ?? "",
        })
        if (profile.store_logo_url) setLogoPreview(profile.store_logo_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    let logoUrl = profile?.store_logo_url ?? null

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const fileName = `${user.id}-store-logo.${ext}`
      const { error: uploadError } = await supabase.storage.from("avatares").upload(fileName, logoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("avatares").getPublicUrl(fileName)
        logoUrl = urlData.publicUrl
      }
    }

    await supabase.from("profiles").update({
      store_name: form.store_name,
      store_description: form.store_description,
      store_phone: form.store_phone,
      store_logo_url: logoUrl,
    }).eq("id", user.id)

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const inputStyle = { width: '100%', padding: '11px 14px', border: `1px solid ${T.inputBorder}`, borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Poppins',sans-serif", color: T.text, background: T.inputBg, boxSizing: 'border-box' as const, transition: 'border-color .2s' }
  const labelStyle = { display: 'block', fontSize: 11, color: T.text2, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: 8, fontFamily: "'Poppins',sans-serif" }
  const cardStyle = { background: T.bg2, borderRadius: 16, padding: '1.75rem', border: `1px solid ${T.borderFaint}`, marginBottom: '1rem' }

  if (loading) return (
    <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: T.gold, fontFamily: "'Poppins',sans-serif" }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Poppins',sans-serif", padding: '2rem', transition: 'background .3s' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: T.bg3, borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.5rem', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: T.gold, marginBottom: 4 }}>Vendedor</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, margin: 0 }}>Mi Tienda</h1>
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

        {/* PREVIEW */}
        <div style={cardStyle}>
          <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, marginBottom: 12 }}>Vista previa</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: T.previewBg, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.gold, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {logoPreview
                ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                : <span style={{ color: '#0B0B0B', fontWeight: 700, fontSize: 20 }}>{(form.store_name || 'T').charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <p style={{ color: T.text, fontWeight: 700, fontSize: 16, margin: 0 }}>{form.store_name || 'Nombre de tu tienda'}</p>
              <p style={{ color: T.text2, fontSize: 12, margin: '4px 0 0' }}>{form.store_description || 'Descripcion de tu tienda'}</p>
              {form.store_phone && <p style={{ color: T.gold, fontSize: 12, margin: '4px 0 0' }}>{form.store_phone}</p>}
            </div>
          </div>
          {user?.id && (
            <a href={`/tienda/${user.id}`} target="_blank"
              style={{ display: 'block', textAlign: 'center', padding: '10px', border: `1px solid ${T.border}`, borderRadius: 10, color: T.gold, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              Ver mi tienda publica
            </a>
          )}
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSave}>
          <div style={cardStyle}>
            <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: T.gold, marginBottom: 16 }}>Informacion de la tienda</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={labelStyle}>Logo de la tienda</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.inputBg, border: `2px dashed ${T.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => document.getElementById('logo-input')?.click()}>
                    {logoPreview
                      ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                      : <span style={{ fontSize: '1.5rem', color: T.gold }}>+</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: T.text, marginBottom: '0.25rem' }}>Sube el logo de tu tienda</p>
                    <p style={{ fontSize: '0.75rem', color: T.text2 }}>JPG o PNG - max 2MB</p>
                  </div>
                  <input id="logo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nombre de la tienda *</label>
                <input required value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} placeholder="Ej: Moda Premium Colombia" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Descripcion corta</label>
                <input value={form.store_description} onChange={e => setForm(p => ({ ...p, store_description: e.target.value }))} placeholder="Ej: Ropa deportiva de alta calidad" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Celular de contacto</label>
                <input value={form.store_phone} onChange={e => setForm(p => ({ ...p, store_phone: e.target.value }))} placeholder="Ej: 3001234567" style={inputStyle} />
              </div>

            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: 14, background: T.gold, color: '#0B0B0B', border: 'none', cursor: 'pointer', fontSize: 14, textTransform: 'uppercase', fontWeight: 700, borderRadius: 12, fontFamily: "'Poppins',sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar tienda'}
          </button>
        </form>

      </div>
    </div>
  )
}