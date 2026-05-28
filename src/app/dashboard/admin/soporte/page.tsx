'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUS_OPTIONS = ['pendiente', 'en_proceso', 'respondido', 'resuelto', 'cerrado']
const PRIORITY_OPTIONS = ['baja', 'media', 'alta', 'urgente']

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#F59E0B',
  en_proceso: '#3B82F6',
  respondido: '#8B5CF6',
  resuelto: '#10B981',
  cerrado: '#6B7280',
}

const PRIORITY_COLORS: Record<string, string> = {
  baja: '#6B7280',
  media: '#3B82F6',
  alta: '#F59E0B',
  urgente: '#EF4444',
}

export default function SoportePage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [cannedResponses, setCannedResponses] = useState<any[]>([])
  const [showCanned, setShowCanned] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [tab, setTab] = useState<'chat' | 'perfil'>('chat')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
    loadCannedResponses()
    const supabase = createClient()
    const channel = supabase
      .channel('admin_support_v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
        setSelected((prev: any) => {
          if (prev && payload.new.conversation_id === prev.id) {
            setMessages(m => [...m, payload.new])
          }
          return prev
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' })
    })
    const data = await res.json()
    setConversations(data.conversations ?? [])
  }

  async function loadCannedResponses() {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'canned_responses' })
    })
    const data = await res.json()
    setCannedResponses(data.responses ?? [])
  }

  async function selectConversation(conv: any) {
    setSelected(conv)
    setTab('chat')
    setShowCanned(false)
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'messages', conversationId: conv.id })
    })
    const data = await res.json()
    setMessages(data.messages ?? [])
    if (conv.user_id) loadUserProfile(conv.user_id)
  }

  async function loadUserProfile(userId: string) {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'user_profile', userId })
    })
    const data = await res.json()
    setUserProfile(data)
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', conversationId: selected.id, message: reply.trim(), senderType: 'admin' })
    })
    if (selected.status === 'pendiente') updateStatus('en_proceso')
    setReply('')
    setSending(false)
  }

  async function updateStatus(status: string) {
    if (!selected) return
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', conversationId: selected.id, status })
    })
    setSelected((prev: any) => ({ ...prev, status }))
  }

  async function updatePriority(priority: string) {
    if (!selected) return
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_priority', conversationId: selected.id, priority })
    })
    setSelected((prev: any) => ({ ...prev, priority }))
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() }
  }

  const filtered = filterStatus === 'todos' ? conversations : conversations.filter(c => c.status === filterStatus)

  const stats = {
    total: conversations.length,
    pendiente: conversations.filter(c => c.status === 'pendiente').length,
    en_proceso: conversations.filter(c => c.status === 'en_proceso').length,
    urgente: conversations.filter(c => c.priority === 'urgente').length,
    resuelto: conversations.filter(c => c.status === 'resuelto').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B', fontFamily: 'Poppins, sans-serif', display: 'flex', flexDirection: 'column' }}>

      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(212,175,55,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: 0 }}>DMS Market</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>Centro de Soporte</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { label: 'Total', value: stats.total, color: '#fff' },
            { label: 'Pendientes', value: stats.pendiente, color: '#F59E0B' },
            { label: 'En proceso', value: stats.en_proceso, color: '#3B82F6' },
            { label: 'Urgentes', value: stats.urgente, color: '#EF4444' },
            { label: 'Resueltos', value: stats.resuelto, color: '#10B981' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', background: '#151515', border: '1px solid rgba(212,175,55,.1)', borderRadius: 10, padding: '0.5rem 1rem' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: '#666', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', flex: 1, height: 'calc(100vh - 88px)' }}>

        <div style={{ borderRight: '1px solid rgba(212,175,55,.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ width: '100%', background: '#151515', border: '1px solid rgba(212,175,55,.2)', borderRadius: 8, color: '#fff', padding: '0.5rem', fontSize: 12, outline: 'none' }}>
              <option value="todos">Todos los tickets</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div style={{ padding: '0.75rem', flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <p style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: '2rem' }}>Sin tickets</p>
            )}
            {filtered.map(conv => (
              <div key={conv.id} onClick={() => selectConversation(conv)}
                style={{
                  padding: '0.75rem', borderRadius: 10, marginBottom: 6, cursor: 'pointer',
                  background: selected?.id === conv.id ? 'rgba(212,175,55,.08)' : '#111',
                  border: selected?.id === conv.id ? '1px solid rgba(212,175,55,.3)' : '1px solid rgba(255,255,255,.04)',
                  transition: 'all .15s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0 }}>
                    {conv.profiles?.name ?? 'Usuario'}
                  </p>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 999, background: `${PRIORITY_COLORS[conv.priority ?? 'media']}22`, color: PRIORITY_COLORS[conv.priority ?? 'media'], fontWeight: 600 }}>
                    {conv.priority ?? 'media'}
                  </span>
                </div>
                <p style={{ color: '#888', fontSize: 11, margin: '0 0 6px' }}>{conv.subject ?? 'Consulta general'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: `${STATUS_COLORS[conv.status ?? 'pendiente']}22`, color: STATUS_COLORS[conv.status ?? 'pendiente'] }}>
                    {(conv.status ?? 'pendiente').replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 10, color: '#555' }}>
                    {new Date(conv.created_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(212,175,55,.1)' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,.3)" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ color: '#555', fontSize: 13 }}>Selecciona un ticket para responder</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{selected.subject ?? 'Consulta general'}</p>
                  <p style={{ color: '#888', fontSize: 11, margin: '2px 0 0' }}>{selected.profiles?.email ?? ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setTab('chat')}
                    style={{ padding: '0.375rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: tab === 'chat' ? '#D4AF37' : '#1a1a1a', color: tab === 'chat' ? '#000' : '#888' }}>
                    Chat
                  </button>
                  <button onClick={() => setTab('perfil')}
                    style={{ padding: '0.375rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: tab === 'perfil' ? '#D4AF37' : '#1a1a1a', color: tab === 'perfil' ? '#000' : '#888' }}>
                    Perfil
                  </button>
                </div>
              </div>

              {tab === 'chat' ? (
                <>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {messages.map((msg: any) => (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 10, color: '#555', margin: '0 0 3px', textAlign: msg.sender_type === 'admin' ? 'right' : 'left' }}>
                            {msg.sender_type === 'admin' ? 'Asesor DMS' : msg.sender_type === 'bot' ? 'IA' : 'Usuario'}
                          </p>
                          <div style={{
                            maxWidth: 360, padding: '0.5rem 0.875rem', borderRadius: 10,
                            background: msg.sender_type === 'admin' ? 'rgba(212,175,55,.15)' : msg.sender_type === 'bot' ? '#1a1a1a' : '#1e1e1e',
                            color: msg.sender_type === 'admin' ? '#D4AF37' : '#ccc',
                            fontSize: 13, lineHeight: 1.5,
                            border: msg.sender_type === 'admin' ? '1px solid rgba(212,175,55,.25)' : '1px solid rgba(255,255,255,.06)'
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {showCanned && (
                    <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.05)', background: '#0f0f0f' }}>
                      <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Respuestas rapidas</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {cannedResponses.map(cr => (
                          <button key={cr.id} onClick={() => { setReply(cr.content); setShowCanned(false) }}
                            style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: '#151515', border: '1px solid rgba(212,175,55,.15)', borderRadius: 8, color: '#ccc', fontSize: 12, cursor: 'pointer' }}>
                            <span style={{ color: '#D4AF37', fontWeight: 600 }}>{cr.title}</span> — {cr.content.substring(0, 60)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button onClick={() => setShowCanned(!showCanned)}
                      style={{ padding: '0.625rem', background: '#151515', border: '1px solid rgba(212,175,55,.2)', borderRadius: 8, cursor: 'pointer', color: '#D4AF37' }}
                      title="Respuestas rapidas">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    </button>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} onKeyDown={handleKey}
                      placeholder="Escribe tu respuesta... (Enter para enviar)"
                      rows={2}
                      style={{
                        flex: 1, padding: '0.625rem 0.875rem', resize: 'none',
                        background: '#151515', border: '1px solid rgba(212,175,55,.2)',
                        borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      style={{
                        padding: '0.625rem 1.25rem', background: sending || !reply.trim() ? '#222' : '#D4AF37',
                        border: 'none', borderRadius: 10, color: sending || !reply.trim() ? '#555' : '#000',
                        fontSize: 12, fontWeight: 700, cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer'
                      }}>
                      {sending ? '...' : 'Enviar'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                  {!userProfile ? (
                    <p style={{ color: '#555', fontSize: 13 }}>Cargando perfil...</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                        <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Datos del cliente</p>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{userProfile.profile?.name ?? 'Sin nombre'}</p>
                        <p style={{ color: '#888', fontSize: 12, margin: '0 0 4px' }}>{userProfile.profile?.email ?? ''}</p>
                        <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Rol: {userProfile.profile?.role ?? ''}</p>
                      </div>
                      <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                        <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Resumen financiero</p>
                        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>${userProfile.totalSpent?.toLocaleString('es-CO')}</p>
                        <p style={{ color: '#888', fontSize: 12, margin: 0 }}>{userProfile.orders?.length ?? 0} ordenes registradas</p>
                      </div>
                      {userProfile.orders?.length > 0 && (
                        <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                          <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Ultimas ordenes</p>
                          {userProfile.orders.map((o: any) => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                              <span style={{ color: '#ccc', fontSize: 12 }}>{o.status}</span>
                              <span style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600 }}>${o.total?.toLocaleString('es-CO')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {userProfile.tickets?.length > 0 && (
                        <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                          <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Tickets anteriores</p>
                          {userProfile.tickets.map((t: any) => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                              <span style={{ color: '#ccc', fontSize: 12 }}>{t.subject ?? 'Consulta'}</span>
                              <span style={{ fontSize: 11, color: STATUS_COLORS[t.status] ?? '#888' }}>{t.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ overflowY: 'auto', padding: '1rem' }}>
          {!selected ? (
            <p style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: '2rem' }}>Selecciona un ticket</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Estado</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateStatus(s)}
                      style={{
                        padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: selected.status === s ? `${STATUS_COLORS[s]}22` : '#151515',
                        color: selected.status === s ? STATUS_COLORS[s] : '#666',
                        fontSize: 12, fontWeight: selected.status === s ? 700 : 400,
                        borderLeft: selected.status === s ? `3px solid ${STATUS_COLORS[s]}` : '3px solid transparent'
                      }}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Prioridad</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PRIORITY_OPTIONS.map(p => (
                    <button key={p} onClick={() => updatePriority(p)}
                      style={{
                        padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: selected.priority === p ? `${PRIORITY_COLORS[p]}22` : '#151515',
                        color: selected.priority === p ? PRIORITY_COLORS[p] : '#666',
                        fontSize: 12, fontWeight: selected.priority === p ? 700 : 400,
                        borderLeft: selected.priority === p ? `3px solid ${PRIORITY_COLORS[p]}` : '3px solid transparent'
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: '#111', border: '1px solid rgba(212,175,55,.1)', borderRadius: 12, padding: '1rem' }}>
                <p style={{ fontSize: 10, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>Acciones</p>
                <button onClick={() => updateStatus('resuelto')}
                  style={{ width: '100%', padding: '0.625rem', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 8, color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>
                  Marcar resuelto
                </button>
                <button onClick={() => updateStatus('cerrado')}
                  style={{ width: '100%', padding: '0.625rem', background: 'rgba(107,114,128,.1)', border: '1px solid rgba(107,114,128,.2)', borderRadius: 8, color: '#6B7280', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Cerrar ticket
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
