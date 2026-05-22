import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json()

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
            role: 'user',
            content: `El nombre del archivo es: "${fileName}". Que tipo de producto es? Responde SOLO con 3 palabras clave en espanol separadas por coma. Sin explicacion.`
          }
        ]
      })
    })

    const groqData = await groqRes.json()
    const keywords = groqData.choices?.[0]?.message?.content?.toLowerCase() ?? ''
    const words = keywords.split(/[,\s]+/).filter((w: string) => w.length > 2)

    const { data: products } = await admin
      .from('products')
      .select('id, name, category')

    const matches = products?.filter((p: any) => {
      const name = (p.name + ' ' + p.category).toLowerCase()
      return words.some((w: string) => name.includes(w))
    }).map((p: any) => p.id) ?? []

    return NextResponse.json({ ids: matches, keywords: words })
  } catch (error) {
    console.error('search-by-image error:', error)
    return NextResponse.json({ ids: [], keywords: [] })
  }
}
