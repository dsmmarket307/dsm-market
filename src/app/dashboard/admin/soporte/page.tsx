'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SoportePage() {
  const supabase = createClient()
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    const channel = supabase
      .channel('admin_conversations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
        if (selected && payload.new.conversation_id === selected.id) {
          setMessages(prev => [...prev, payload.new])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
    setConversations(data ?? [])
  }

  async function selectConversation(conv: any) {
    setSelected(conv)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await supabase.from('chat_messages').insert({
      conversation_id: selected.id,
      sender_type: 'admin',
      message: reply.trim()
    })
    setReply('')
    setSending(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(212,175,55,.15)' }}>
        <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: 0 }}>Admin</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>Panel de Soporte</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, height: 'calc(100vh - 88px)' }}>

        <div style={{ borderRight: '1px solid rgba(212,175,55,.1)', overflowY: 'auto', padding: '1rem' }}>
          <p style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: '1rem' }}>
            Conversaciones ({conversations.length})
          </p>
          {conversations.length === 0 && (
            <p style={{ color: '#555', fontSize: 13 }}>No hay conversaciones aun.</p>
          )}
          {conversations.map(conv => (
            <div key={conv.id} onClick={() => selectConversation(conv)}
              style={{
                padding: '0.875rem 1rem', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                background: selected?.id === conv.id ? 'rgba(212,175,55,.1)' : '#151515',
                border: selected?.id === conv.id ? '1px solid rgba(212,175,55,.3)' : '1px solid rgba(255,255,255,.05)',
                transition: 'all .2s'
              }}>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>
                {conv.profiles?.full_name ?? 'Usuario'}
              </p>
              <p style={{ color: '#888', fontSize: 11, margin: '4px 0 0' }}>
                {new Date(conv.created_at).toLocaleDateString('es-CO')}
              </p>
              <div style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', borderRadius: 999, background: conv.status === 'active' ? 'rgba(76,175,61,.15)' : 'rgba(255,255,255,.05)', fontSize: 10, color: conv.status === 'active' ? '#4CAF7D' : '#888' }}>
                {conv.status === 'active' ? 'Activa' : 'Cerrada'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#555', fontSize: 14 }}>Selecciona una conversacion para responder</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: 0 }}>
                  {selected.profiles?.full_name ?? 'Usuario'}
                </p>
                <p style={{ color: '#888', fontSize: 11, margin: '2px 0 0' }}>
                  Conversacion iniciada {new Date(selected.created_at).toLocaleDateString('es-CO')}
                </p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((msg: any) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#555', margin: '0 0 3px', textAlign: msg.sender_type === 'user' ? 'right' : 'left' }}>
                        {msg.sender_type === 'user' ? 'Usuario' : msg.sender_type === 'admin' ? 'Asesor DMS' : 'IA'}
                      </p>
                      <div style={{
                        maxWidth: '400px', padding: '0.6rem 0.875rem', borderRadius: 10,
                        background: msg.sender_type === 'user' ? '#C9A84C' : msg.sender_type === 'admin' ? 'rgba(212,175,55,.15)' : '#1a1a1a',
                        color: msg.sender_type === 'user' ? '#fff' : msg.sender_type === 'admin' ? '#D4AF37' : '#ccc',
                        fontSize: 13, lineHeight: 1.5,
                        border: msg.sender_type === 'admin' ? '1px solid rgba(212,175,55,.3)' : 'none'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: '0.75rem' }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Escribe tu respuesta..."
                  style={{
                    flex: 1, padding: '0.75rem 1rem',
                    background: '#151515', border: '1px solid rgba(212,175,55,.2)',
                    borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none'
                  }}
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()}
                  style={{
                    padding: '0.75rem 1.5rem', background: sending || !reply.trim() ? '#333' : '#D4AF37',
                    border: 'none', borderRadius: 10, color: sending || !reply.trim() ? '#666' : '#000',
                    fontSize: 13, fontWeight: 700, cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer'
                  }}>
                  {sending ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
