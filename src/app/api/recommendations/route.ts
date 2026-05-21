import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (!user) {
      const { data: products } = await admin
        .from('products')
        .select('id, name, price, original_price, category, badge, rating')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(12)
      const ids = products?.map(p => p.id) ?? []
      const { data: images } = ids.length > 0 ? await admin
        .from('product_images').select('product_id, url, position')
        .in('product_id', ids).order('position', { ascending: true }) : { data: [] }
      return NextResponse.json({ products: products ?? [], images: images ?? [], type: 'recent' })
    }

    const { data: views } = await admin
      .from('user_views')
      .select('category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const catCount: any = {}
    views?.forEach(v => { if (v.category) catCount[v.category] = (catCount[v.category] ?? 0) + 1 })
    const topCats = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([k]) => k)

    let products: any[] = []

    if (topCats.length > 0) {
      const { data } = await admin
        .from('products')
        .select('id, name, price, original_price, category, badge, rating')
        .eq('status', 'approved')
        .in('category', topCats)
        .order('created_at', { ascending: false })
        .limit(12)
      products = data ?? []
    }

    if (products.length < 6) {
      const { data: fallback } = await admin
        .from('products')
        .select('id, name, price, original_price, category, badge, rating')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(12)
      products = fallback ?? []
    }

    const ids = products.map(p => p.id)
    const { data: images } = ids.length > 0 ? await admin
      .from('product_images').select('product_id, url, position')
      .in('product_id', ids).order('position', { ascending: true }) : { data: [] }

    return NextResponse.json({ products, images: images ?? [], type: topCats.length > 0 ? 'personalized' : 'recent', topCats })
  } catch (error) {
    console.error('recommendations error:', error)
    return NextResponse.json({ products: [], images: [], type: 'recent' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: true })

    const { productId, category } = await req.json()
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await admin.from('user_views').insert({ user_id: user.id, product_id: productId, category })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
