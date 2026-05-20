import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { action, conversationId, message, senderType } = await req.json()

    if (action === 'create') {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: user.id, status: 'active' })
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ conversationId: data.id })
    }

    if (action === 'message') {
      const { error } = await supabase
        .from('chat_messages')
        .insert({ conversation_id: conversationId, sender_type: senderType ?? 'user', message })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'list') {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
      return NextResponse.json({ conversations: data ?? [] })
    }

    if (action === 'messages') {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      return NextResponse.json({ messages: data ?? [] })
    }

    return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
