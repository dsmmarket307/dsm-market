import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const page = searchParams.get('page') ?? '1'

  const token = process.env.DROPI_TOKEN
  if (!token) return NextResponse.json({ error: 'Token no configurado' }, { status: 500 })

  try {
    const url = `https://app.dropi.co/api/v1/products?search=${encodeURIComponent(q)}&page=${page}&per_page=20`
    const res = await fetch(url, {
      headers: {
        'dropi-integration-key': token,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Dropi respondió ${res.status}: ${text}` }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json({ productos: data.data ?? data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error conectando con Dropi' }, { status: 500 })
  }
}