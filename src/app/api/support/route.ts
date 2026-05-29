import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await req.json()
    const { action } = body

    if (action === 'create') {
      const { subject } = body
      const { data, error } = await service
        .from('conversations')
        .insert({ user_id: user.id, status: 'pendiente', priority: 'media', subject: subject ?? 'Consulta general' })
        .select('id')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ conversationId: data.id })
    }

    if (action === 'message') {
      const { conversationId, message, senderType } = body
      const { error } = await service
        .from('chat_messages')
        .insert({ conversation_id: conversationId, sender_id: user.id, sender_type: senderType ?? 'user', message })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'list') {
      const { data, error } = await service
        .from('conversations')
        .select('*, profiles:user_id(id, name, role)')
        .order('created_at', { ascending: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ conversations: data ?? [] })
    }

    if (action === 'messages') {
      const { conversationId } = body
      const { data } = await service
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      return NextResponse.json({ messages: data ?? [] })
    }

    if (action === 'update_status') {
      const { conversationId, status } = body
      const { error } = await service
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'update_priority') {
      const { conversationId, priority } = body
      const { error } = await service
        .from('conversations')
        .update({ priority })
        .eq('id', conversationId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'canned_responses') {
      const { data } = await service
        .from('canned_responses')
        .select('*')
        .order('created_at', { ascending: true })
      return NextResponse.json({ responses: data ?? [] })
    }

    if (action === 'user_profile') {
      const { userId } = body
      const { data: profile } = await service
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      const { data: orders } = await service
        .from('orders')
        .select('id, total, status, created_at')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
      const { data: tickets } = await service
        .from('conversations')
        .select('id, subject, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
      const totalSpent = (orders ?? []).reduce((sum: number, o: any) => sum + (o.total ?? 0), 0)
      return NextResponse.json({ profile, orders: orders ?? [], tickets: tickets ?? [], totalSpent })
    }

    return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// force-v2
