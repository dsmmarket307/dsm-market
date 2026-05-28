import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: agents } = await supabase
      .from('support_agents')
      .select('id, user_id, role, support_email, display_name, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    return NextResponse.json({ agents: agents ?? [] })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { userId, role, supportEmail, displayName } = body
      const { data, error } = await supabase
        .from('support_agents')
        .insert({
          user_id: userId,
          role: role ?? 'support_agent',
          support_email: supportEmail ?? null,
          display_name: displayName ?? null,
          is_active: true,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ agent: data })
    }

    if (action === 'deactivate') {
      const { agentId } = body
      const { error } = await supabase
        .from('support_agents')
        .update({ is_active: false })
        .eq('id', agentId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'activate') {
      const { agentId } = body
      const { error } = await supabase
        .from('support_agents')
        .update({ is_active: true })
        .eq('id', agentId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}