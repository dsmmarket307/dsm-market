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
        max_tokens: 60,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en marketing para marketplaces colombianos. Mejora titulos de productos para que sean mas atractivos, claros y optimizados para ventas. Devuelve SOLO el titulo mejorado, sin explicaciones, sin comillas, sin puntos al final. Maximo 80 caracteres.',
          },
          {
            role: 'user',
            content: `Mejora este titulo de producto para un marketplace colombiano:\nTitulo: ${name}\nCategoria: ${category ?? 'General'}\n\nDevuelve solo el titulo mejorado.`,
          },
        ],
      }),
    })

    const groqData = await groqRes.json()

    if (!groqRes.ok) {
      console.error('GROQ ERROR:', groqData)
      return NextResponse.json({ error: 'IA no disponible' }, { status: 500 })
    }

    const title = groqData.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ title })
  } catch (error) {
    console.error('generate-title error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
