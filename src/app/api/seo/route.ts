import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, category, description } = await request.json()
    if (!name) return NextResponse.json({ error: "Falta nombre" }, { status: 400 })

    const prompt = `Eres un experto en SEO para marketplaces colombianos. Dado este producto genera exactamente esto en JSON sin texto extra:
{
  "seo_title": "titulo SEO maximo 60 caracteres incluyendo | DMS Market al final",
  "seo_description": "meta descripcion atractiva maximo 155 caracteres mencionando compra rapida y envio",
  "slug": "slug-limpio-sin-espacios-ni-caracteres-especiales"
}

Producto: ${name}
Categoria: ${category ?? ""}
Descripcion: ${description ?? ""}

Responde SOLO el JSON, sin explicaciones ni backticks.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ""

    let seo: any = {}
    try {
      seo = JSON.parse(text.trim())
    } catch {
      const nameSlug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      seo = {
        seo_title: `${name} | DMS Market`,
        seo_description: `Compra ${name} con envio rapido en DMS Market. Calidad garantizada.`,
        slug: nameSlug,
      }
    }

    return NextResponse.json(seo)
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}