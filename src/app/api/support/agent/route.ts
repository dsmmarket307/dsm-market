import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'no_auth' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return NextResponse.json({ redirect: '/dashboard/admin/soporte' })
    }

    if (profile?.role !== 'support_agent' && profile?.role !== 'support_supervisor') {
      return NextResponse.json({ error: 'no_access', debug: 'wrong_role', role: profile?.role }, { status: 403 })
    }

    const { data: agentData, error: agentError } = await supabase
      .from('support_agents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!agentData) {
      return NextResponse.json({ error: 'no_access', debug: 'no_agent_record', agentError: agentError?.message }, { status: 403 })
    }

    return NextResponse.json({
      agent: {
        ...agentData,
        display_name: agentData.display_name ?? profile?.name ?? 'Agente',
        support_email: agentData.support_email ?? '',
        role: profile?.role,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'error', detail: e?.message }, { status: 500 })
  }
}
