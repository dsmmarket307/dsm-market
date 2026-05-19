import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, category } = await req.json()
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en marketing para marketplaces colombianos. Genera descripciones de productos atractivas en espanol. Estructura: 1 parrafo de introduccion del producto, luego lista de beneficios con emoji al inicio de cada uno usando solo estos emojis: o para beneficios principales. Sin precios, sin asteriscos, sin simbolos de moneda. Texto limpio y profesional.',
          },
          {
            role: 'user',
            content: `Genera una descripcion profesional para este producto:\nNombre: ${name}\nCategoria: ${category ?? 'General'}\n\nEstructura requerida:\n1. Parrafo corto de introduccion\n2. Lista de 4 beneficios clave, cada uno comenzando con el emoji apropiado\n\nSin precios. Sin asteriscos.`,
          },
        ],
      }),
    })

    const groqData = await groqRes.json()

    if (!groqRes.ok) {
      console.error('GROQ ERROR:', groqData)
      return NextResponse.json({ error: 'IA no disponible' }, { status: 500 })
    }

    const description = groqData.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ description })
  } catch (error) {
    console.error('generate-description error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
