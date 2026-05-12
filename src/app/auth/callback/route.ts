import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const meta = data.user.user_metadata
        const role = (meta?.role as string) ?? 'buyer'
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: meta?.name ?? data.user.email?.split('@')[0] ?? 'Usuario',
          role,
        })
        if (role === 'seller') return NextResponse.redirect(`${origin}/dashboard/vendor`)
        if (role === 'provider') return NextResponse.redirect(`${origin}/dashboard/provider`)
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      const role = existingProfile.role
      if (role === 'seller') return NextResponse.redirect(`${origin}/dashboard/vendor`)
      if (role === 'provider') return NextResponse.redirect(`${origin}/dashboard/provider`)
      if (role === 'admin') return NextResponse.redirect(`${origin}/dashboard/admin`)

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}