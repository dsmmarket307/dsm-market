'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function MiTiendaPage() {
  const supabase = createClient()
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

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .mt-root{background:#0f0f0f;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .mt-inner{max-width:700px;margin:0 auto;}
    .mt-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .mt-card{background:#151515;border-radius:16px;padding:1.75rem;border:1px solid rgba(255,255,255,.06);margin-bottom:1rem;}
    .mt-label{display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-family:'Poppins',sans-serif;}
    .mt-input{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.08);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#fff;background:#0f0f0f;box-sizing:border-box;transition:border-color .2s;}
    .mt-input:focus{border-color:#D4AF37;}
    .mt-btn{width:100%;padding:14px;background:#D4AF37;color:#0B0B0B;border:none;cursor:pointer;font-size:14px;text-transform:uppercase;font-weight:700;border-radius:12px;font-family:'Poppins',sans-serif;transition:background .2s;}
    .mt-btn:hover{background:#e8c84a;}
    .mt-preview{display:flex;align-items:center;gap:1rem;padding:1rem;background:#0f0f0f;border-radius:12px;border:1px solid rgba(212,175,55,.12);margin-bottom:1rem;}
  `

  if (loading) return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#D4AF37", fontFamily: "sans-serif" }}>Cargando...</p>
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <div className="mt-root">
        <div className="mt-inner">

          <div className="mt-header">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#D4AF37", marginBottom: 4 }}>Vendedor</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>Mi Tienda</h1>
          </div>

          {/* PREVIEW */}
          <div className="mt-card">
            <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#D4AF37", marginBottom: 12 }}>Vista previa</p>
            <div className="mt-preview">
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#D4AF37", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {logoPreview
                  ? <img src={logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
                  : <span style={{ color: "#0B0B0B", fontWeight: 700, fontSize: 20 }}>{(form.store_name || "T").charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>{form.store_name || "Nombre de tu tienda"}</p>
                <p style={{ color: "#999", fontSize: 12, margin: "4px 0 0" }}>{form.store_description || "Descripcion de tu tienda"}</p>
                {form.store_phone && <p style={{ color: "#D4AF37", fontSize: 12, margin: "4px 0 0" }}>{form.store_phone}</p>}
              </div>
            </div>
            {user?.id && (
              <a href={`/tienda/${user.id}`} target="_blank"
                style={{ display: "block", textAlign: "center", padding: "10px", border: "1px solid rgba(212,175,55,.3)", borderRadius: 10, color: "#D4AF37", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Ver mi tienda publica →
              </a>
            )}
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSave}>
            <div className="mt-card">
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>Informacion de la tienda</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <label className="mt-label">Logo de la tienda</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#0f0f0f", border: "2px dashed rgba(212,175,55,.3)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
                      onClick={() => document.getElementById("logo-input")?.click()}>
                      {logoPreview
                        ? <img src={logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
                        : <span style={{ fontSize: "1.5rem", color: "#D4AF37" }}>+</span>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: "0.85rem", color: "#cccccc", marginBottom: "0.25rem" }}>Sube el logo de tu tienda</p>
                      <p style={{ fontSize: "0.75rem", color: "#666" }}>JPG o PNG — max 2MB</p>
                    </div>
                    <input id="logo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                  </div>
                </div>

                <div>
                  <label className="mt-label">Nombre de la tienda *</label>
                  <input required value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))} placeholder="Ej: Moda Premium Colombia" className="mt-input" />
                </div>

                <div>
                  <label className="mt-label">Descripcion corta</label>
                  <input value={form.store_description} onChange={e => setForm(p => ({ ...p, store_description: e.target.value }))} placeholder="Ej: Ropa deportiva de alta calidad" className="mt-input" />
                </div>

                <div>
                  <label className="mt-label">Celular de contacto</label>
                  <input value={form.store_phone} onChange={e => setForm(p => ({ ...p, store_phone: e.target.value }))} placeholder="Ej: 3001234567" className="mt-input" />
                </div>

              </div>
            </div>
            <button type="submit" disabled={saving} className="mt-btn">
              {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar tienda"}
            </button>
          </form>

        </div>
      </div>
    </>
  )
}