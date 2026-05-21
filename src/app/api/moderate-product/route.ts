import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json()
    if (!title) return NextResponse.json({ status: 'safe', reason: '' })

    const prompt = `Eres un moderador de contenido para DMS Market, un marketplace colombiano. Analiza este producto y responde SOLO con un JSON sin markdown.

Titulo: "${title}"
Descripcion: "${description ?? ''}"

Detecta: spam, fraude, estafas, productos prohibidos (armas, drogas, cuentas hackeadas), contenido ofensivo, promesas falsas.

Responde SOLO con este JSON exacto:
{"status":"safe","reason":""}

Valores posibles de status:
- safe: producto normal y legitimo
- warning: contenido sospechoso pero no definitivamente malo
- blocked: claramente spam, fraude, ilegal o prohibido
- pending_review: dudoso, requiere revision humana

El campo reason debe ser una frase corta en espanol explicando el motivo. Si es safe, reason queda vacio.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const groqData = await groqRes.json()
    const text = groqData.choices?.[0]?.message?.content ?? ''

    try {
      const clean = text.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)
      const status = ['safe', 'warning', 'blocked', 'pending_review'].includes(result.status) ? result.status : 'safe'
      return NextResponse.json({ status, reason: result.reason ?? '' })
    } catch {
      return NextResponse.json({ status: 'safe', reason: '' })
    }
  } catch (error) {
    console.error('moderate-product error:', error)
    return NextResponse.json({ status: 'safe', reason: '' })
  }
}
