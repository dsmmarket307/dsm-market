import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (!service) notFound()

  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vi tu servicio: " + service.business_name)}`

  return (
    <main style={{ background: "#0B0B0B", minHeight: "100vh", color: "#fff", padding: "2rem", fontFamily: "sans-serif" }}>
      <a href="/servicios" style={{ color: "#D4AF37", textDecoration: "none" }}>← Volver</a>
      <h1 style={{ marginTop: "1rem" }}>{service.business_name}</h1>
      <p style={{ color: "#aaa" }}>{service.city} · {service.category}</p>
      <p style={{ color: "#aaa", marginTop: "1rem" }}>{service.description}</p>
      <p style={{ color: "#D4AF37", fontWeight: 700, marginTop: "1rem" }}>{service.price}</p>
      <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", background: "#25D366", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700 }}>
        Contactar por WhatsApp
      </a>
    </main>
  )
}