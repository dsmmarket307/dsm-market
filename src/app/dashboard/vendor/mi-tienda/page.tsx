import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { updateStorePage } from "@/lib/actions/store"

export default async function MiTiendaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  if (user.user_metadata?.role !== "seller") redirect("/dashboard")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single()

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .mt-root{background:#0f0f0f;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .mt-inner{max-width:700px;margin:0 auto;}
    .mt-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .mt-card{background:#151515;border-radius:16px;padding:1.75rem;border:1px solid rgba(255,255,255,.06);margin-bottom:1rem;}
    .mt-label{display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-family:'Poppins',sans-serif;}
    .mt-input{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.08);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#fff;background:#0f0f0f;box-sizing:border-box;transition:border-color .2s;}
    .mt-input:focus{border-color:#D4AF37;}
    .mt-btn{width:100%;padding:14px;background:#D4AF37;color:#0B0B0B;border:none;cursor:pointer;font-size:14px;text-transform:uppercase;font-weight:700;border-radius:12px;font-family:'Poppins',sans-serif;}
    .mt-btn:hover{background:#e8c84a;}
    .mt-preview{display:flex;align-items:center;gap:1rem;padding:1rem;background:#0f0f0f;border-radius:12px;border:1px solid rgba(212,175,55,.12);margin-bottom:1rem;}
  `

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
                {profile?.store_logo_url
                  ? <img src={profile.store_logo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo" />
                  : <span style={{ color: "#0B0B0B", fontWeight: 700, fontSize: 20 }}>{(profile?.store_name || profile?.name || "T").charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>{profile?.store_name || "Nombre de tu tienda"}</p>
                <p style={{ color: "#999", fontSize: 12, margin: "4px 0 0" }}>{profile?.store_description || "Descripcion de tu tienda"}</p>
                {profile?.store_phone && <p style={{ color: "#D4AF37", fontSize: 12, margin: "4px 0 0" }}>{profile.store_phone}</p>}
              </div>
            </div>
            <a href={`/tienda/${user.id}`} target="_blank"
              style={{ display: "block", textAlign: "center", padding: "10px", border: "1px solid rgba(212,175,55,.3)", borderRadius: 10, color: "#D4AF37", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              Ver mi tienda publica →
            </a>
          </div>

          {/* FORMULARIO */}
          <form action={async (formData: FormData) => { "use server"; await updateStorePage(formData, user.id) }}>
            <div className="mt-card">
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#D4AF37", marginBottom: 16 }}>Informacion de la tienda</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="mt-label">Nombre de la tienda *</label>
                  <input name="store_name" required defaultValue={profile?.store_name ?? ""} placeholder="Ej: Moda Premium Colombia" className="mt-input" />
                </div>
                <div>
                  <label className="mt-label">Descripcion corta</label>
                  <input name="store_description" defaultValue={profile?.store_description ?? ""} placeholder="Ej: Ropa deportiva de alta calidad" className="mt-input" />
                </div>
                <div>
                  <label className="mt-label">Celular de contacto</label>
                  <input name="store_phone" defaultValue={profile?.store_phone ?? profile?.celular ?? ""} placeholder="Ej: 3001234567" className="mt-input" />
                </div>
                <div>
                  <label className="mt-label">URL del logo (opcional)</label>
                  <input name="store_logo_url" defaultValue={profile?.store_logo_url ?? ""} placeholder="https://..." className="mt-input" />
                  <p style={{ fontSize: 11, color: "#666", marginTop: 6 }}>Sube tu logo a Supabase Storage y pega el link aqui</p>
                </div>
              </div>
            </div>
            <button type="submit" className="mt-btn">Guardar tienda</button>
          </form>
        </div>
      </div>
    </>
  )
}