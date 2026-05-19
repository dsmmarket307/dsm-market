'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'bot'
  text: string
  products?: any[]
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hola! Soy el asistente de DMS Market. Que producto estas buscando hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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
          width: '340px', height: '480px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'sans-serif', overflow: 'hidden',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
            padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
            }}>IA</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>Asistente DMS</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', margin: 0 }}>En linea</p>
            </div>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '0.6rem 0.875rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? '#C9A84C' : '#f5f5f5',
                    color: msg.role === 'user' ? '#fff' : '#111',
                    fontSize: '0.8rem', lineHeight: 1.5,
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

          <div style={{
            padding: '0.75rem', borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: '0.5rem'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Que estas buscando?"
              style={{
                flex: 1, padding: '0.6rem 0.875rem',
                border: '1px solid #ddd', borderRadius: '999px',
                fontSize: '0.8rem', outline: 'none', color: '#111'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: loading || !input.trim() ? '#ddd' : '#C9A84C',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', color: '#fff', flexShrink: 0,
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  )
}
