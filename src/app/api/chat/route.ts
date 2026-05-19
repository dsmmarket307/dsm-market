import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
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
          {
            role: 'system',
            content: 'Eres el asistente de DMS Market, un marketplace colombiano. Ayuda a los clientes a encontrar productos. Responde siempre en español, de forma amigable y concisa. Menciona nombre y precio de los productos. No inventes productos.',
          },
          {
            role: 'user',
            content: `El cliente pregunta: "${message}"\n\nProductos disponibles:\n${productContext}\n\nRecomienda estos productos de forma natural.`,
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
