'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  role: 'user' | 'bot' | 'admin'
  text: string
  products?: any[]
}

const SUPPORT_TRIGGERS = ['asesor', 'soporte humano', 'hablar con alguien', 'ayuda humana', 'quiero hablar con un asesor', 'hablar con asesor']

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hola! Soy el Asistente DMS. En que te puedo ayudar hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [asesorMode, setAsesorMode] = useState(false)
  const [asesorMsg, setAsesorMsg] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user)
    })
  }, [])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (!conversationId) return
    const supabase = createClient()
    const channel = supabase
      .channel('chat_' + conversationId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'conversation_id=eq.' + conversationId,
      }, (payload: any) => {
        if (payload.new.sender_type === 'admin') {
          setMessages(prev => [...prev, { role: 'admin', text: payload.new.message }])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function createConversation() {
    if (conversationId) return conversationId
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create' })
    })
    const data = await res.json()
    if (data.conversationId) {
      setConversationId(data.conversationId)
      return data.conversationId
    }
    return null
  }

  async function saveUserMessage(convId: string, message: string) {
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', conversationId: convId, message })
    })
  }

  async function activateAsesor() {
    setAsesorMsg(true)
    setAsesorMode(true)
    const convId = await createConversation()
    setMessages(prev => [...prev, { role: 'bot', text: 'Un asesor de DMS Market se unira a la conversacion pronto. Por favor espera.' }])
    if (convId) await saveUserMessage(convId, 'Usuario solicito asesor humano')
  }

  function isSupportTrigger(text: string) {
    return SUPPORT_TRIGGERS.some(t => text.toLowerCase().includes(t))
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])

    if (isSupportTrigger(text) && user && !asesorMode) {
      await activateAsesor()
      return
    }

    if (asesorMode) {
      const convId = conversationId ?? await createConversation()
      if (convId) await saveUserMessage(convId, text)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, isLoggedIn: !!user }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply, products: data.products }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error de conexion. Intenta de nuevo.' }])
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(201,168,76,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem',
        }}
        title="Asistente DMS Market"
      >
        {open ? 'X' : 'Chat'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 999,
          width: '340px', height: '500px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'sans-serif', overflow: 'hidden',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{
            background: asesorMode ? 'linear-gradient(135deg, #2e7d32, #4CAF7D)' : 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            transition: 'background 0.3s'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              {asesorMode ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#2e7d32"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#C9A84C"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="18" cy="6" r="3" fill="#4CAF7D"/>
                  <path d="M16.5 6l1 1 2-2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>
                {asesorMode ? 'Soporte DMS' : 'Asistente DMS'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', margin: 0 }}>
                  {asesorMode ? 'Asesor conectado' : 'En linea'}
                </p>
              </div>
            </div>
            {user && !asesorMode && (
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.85)', textAlign: 'right' }}>
                <p style={{ margin: 0 }}>Usuario</p>
                <p style={{ margin: 0, fontWeight: 600 }}>verificado</p>
              </div>
            )}
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'admin' && (
                  <div style={{ fontSize: '0.65rem', color: '#2e7d32', textAlign: 'left', marginBottom: '2px', fontWeight: 600 }}>
                    Asesor DMS
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '0.6rem 0.875rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#C9A84C' : msg.role === 'admin' ? '#e8f5e9' : '#f5f5f5',
                    color: msg.role === 'user' ? '#fff' : msg.role === 'admin' ? '#2e7d32' : '#111',
                    fontSize: '0.8rem', lineHeight: 1.5,
                    border: msg.role === 'admin' ? '1px solid #c8e6c9' : 'none'
                  }}>
                    {msg.text}
                  </div>
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {msg.products.slice(0, 3).map((p: any) => (
                      <a key={p.id} href={'/producto/detalle?id=' + p.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.5rem 0.75rem', background: '#fffbf0',
                          border: '1px solid #f0e0b0', borderRadius: '8px',
                          textDecoration: 'none', fontSize: '0.75rem',
                        }}>
                        <span style={{ color: '#111', fontWeight: 500 }}>{p.name}</span>
                        <span style={{ color: '#C9A84C', fontWeight: 700 }}>${Number(p.price).toLocaleString('es-CO')}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.6rem 0.875rem', background: '#f5f5f5',
                  borderRadius: '16px 16px 16px 4px', fontSize: '0.8rem', color: '#888'
                }}>
                  Buscando...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {user && !asesorMode && (
            <div style={{ padding: '0 0.75rem 0.5rem' }}>
              <button onClick={activateAsesor} disabled={asesorMsg}
                style={{
                  width: '100%', padding: '0.5rem',
                  background: asesorMsg ? '#f5f5f5' : '#fff',
                  border: '1px solid #C9A84C', borderRadius: '8px',
                  color: asesorMsg ? '#aaa' : '#C9A84C',
                  fontSize: '0.75rem', fontWeight: 600, cursor: asesorMsg ? 'default' : 'pointer'
                }}>
                {asesorMsg ? 'Asesor notificado' : 'Hablar con asesor DMS'}
              </button>
            </div>
          )}

          <div style={{
            padding: '0.75rem', borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: '0.5rem'
          }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={asesorMode ? 'Escribe al asesor...' : user ? 'Como puedo ayudarte?' : 'Que estas buscando?'}
              style={{
                flex: 1, padding: '0.6rem 0.875rem',
                border: '1px solid #ddd', borderRadius: '999px',
                fontSize: '0.8rem', outline: 'none', color: '#111'
              }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: loading || !input.trim() ? '#ddd' : asesorMode ? '#2e7d32' : '#C9A84C',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', color: '#fff', flexShrink: 0,
              }}>
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
