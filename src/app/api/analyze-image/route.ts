import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, index } = await req.json()
    if (!imageBase64) return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 })

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType ?? 'image/jpeg'};base64,${imageBase64}` }
              },
              {
                type: 'text',
                text: `Analiza esta imagen de producto para un marketplace colombiano. Responde SOLO con este JSON exacto sin markdown:
{"score":85,"issues":[],"suggestions":[],"isGood":true,"coverRecommended":false}

Donde:
- score: numero del 0 al 100 de calidad visual
- issues: array de problemas encontrados en espanol (maximo 2, solo si hay problemas reales)
- suggestions: array de sugerencias de mejora en espanol (maximo 2)
- isGood: true si score >= 70
- coverRecommended: true si es la mejor imagen para portada

Ejemplos de issues: "Imagen oscura", "Fondo con distracciones", "Imagen borrosa", "Baja resolucion"
Ejemplos de suggestions: "Usa fondo blanco o neutro", "Mejora la iluminacion", "Centra el producto"`
              }
            ]
          }
        ]
      })
    })

    const groqData = await groqRes.json()
    const text = groqData.choices?.[0]?.message?.content ?? ''

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      return NextResponse.json({ ...result, index })
    } catch {
      return NextResponse.json({ score: 75, issues: [], suggestions: [], isGood: true, coverRecommended: index === 0, index })
    }
  } catch (error) {
    console.error('analyze-image error:', error)
    return NextResponse.json({ score: 75, issues: [], suggestions: [], isGood: true, coverRecommended: false })
  }
}
