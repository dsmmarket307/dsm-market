import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, isLoggedIn } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    const supabase = createClient()
    const keywords = message.toLowerCase().split(' ').filter((w: string) => w.length > 3)

    let query = supabase
      .from('products')
      .select('id, name, price, description, category')
      .limit(5)

    if (keywords.length > 0) {
      query = query.or(keywords.map((k: string) => `name.ilike.%${k}%,description.ilike.%${k}%,category.ilike.%${k}%`).join(','))
    }

    const { data: products } = await query

    const productContext = products && products.length > 0
      ? products.map((p: any) =>
          `- ${p.name} | Precio: $${Number(p.price).toLocaleString('es-CO')} COP | Categoria: ${p.category ?? 'General'} | URL: /producto/detalle?id=${p.id}`
        ).join('\n')
      : 'No encontre productos que coincidan.'

    const systemPrompt = isLoggedIn
      ? `Eres el Asistente DMS de DMS Market, un marketplace colombiano. El usuario esta registrado y autenticado.
Puedes ayudarle con:
- Busqueda y recomendacion de productos
- Como comprar paso a paso
- Como vender y publicar productos
- Metodos de pago (PSE, Efecty, Nequi, Daviplata, Visa, Mastercard)
- Envios y transportadoras
- Soporte general del marketplace
Responde siempre en espanol, de forma amigable, concisa y profesional.
No inventes productos que no esten en la lista.`
      : `Eres el Asistente DMS de DMS Market, un marketplace colombiano. El usuario no esta registrado.
Puedes ayudarle con:
- Busqueda y recomendacion de productos
- Preguntas basicas sobre el marketplace
Si pregunta sobre compras, ventas o soporte avanzado, invitale a registrarse en /auth/register.
Responde siempre en espanol, de forma amigable y concisa.
No inventes productos que no esten en la lista.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `El cliente pregunta: "${message}"\n\nProductos disponibles:\n${productContext}\n\nResponde de forma natural.`,
          },
        ],
      }),
    })

    const groqData = await groqRes.json()
    const reply = groqData.choices?.[0]?.message?.content ?? 'Lo siento, intenta de nuevo.'

    return NextResponse.json({ reply, products: products ?? [] })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
