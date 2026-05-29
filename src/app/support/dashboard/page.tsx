'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = ['pendiente', 'en_proceso', 'respondido', 'resuelto', 'cerrado']
const PRIORITY_OPTIONS = ['baja', 'media', 'alta', 'urgente']
const STATUS_COLORS: Record<string, string> = {
  pendiente: '#F59E0B', en_proceso: '#3B82F6', respondido: '#8B5CF6', resuelto: '#10B981', cerrado: '#6B7280',
}
const PRIORITY_COLORS: Record<string, string> = {
  baja: '#6B7280', media: '#3B82F6', alta: '#F59E0B', urgente: '#EF4444',
}

export default function SupportDashboard() {
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
  const [notification, setNotification] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    try {
      const res = await fetch('/api/support/agent')
      const data = await res.json()
      if (res.status === 401) { router.push('/support/login'); return }
      if (res.status === 403) { router.push('/support/login?error=no_access'); return }
      if (data.redirect) { router.push(data.redirect); return }
      if (data.agent) {
        setAgent(data.agent)
        setLoading(false)
        loadConversations()
        loadCannedResponses()
        setupRealtime()
      } else {
        router.push('/support/login?error=no_access')
      }
    } catch {
      router.push('/support/login')
    }
  }

  function setupRealtime() {
    const supabase = createClient()
    supabase.channel('support_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
        loadConversations()
        setNotification('Nuevo ticket recibido')
        setTimeout(() => setNotification(null), 3500)
      })
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
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations() {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    })
    const data = await res.json()
    setConversations(data.conversations ?? [])
  }

  async function loadCannedResponses() {
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'canned_responses' }),
    })
    const data = await res.json()
    setCannedResponses(data.responses ?? [])
  }

  async function selectConversation(conv: any) {
    setSelected(conv)
    setTab('chat')
    setShowCanned(false)
    setUserProfile(null)
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'messages', conversationId: conv.id }),
    })
    const data = await res.json()
    setMessages(data.messages ?? [])
    if (conv.user_id) {
      const res2 = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'user_profile', userId: conv.user_id }),
      })
      const data2 = await res2.json()
      setUserProfile(data2)
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'message', conversationId: selected.id, message: reply.trim(), senderType: 'admin' }),
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
      body: JSON.stringify({ action: 'update_status', conversationId: selected.id, status }),
    })
    setSelected((prev: any) => ({ ...prev, status }))
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, status } : c))
  }

  async function updatePriority(priority: string) {
    if (!selected) return
    await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_priority', conversationId: selected.id, priority }),
    })
    setSelected((prev: any) => ({ ...prev, priority }))
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, priority } : c))
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/support/login')
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#555', fontSize: 13 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {notification && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, background: '#1a1a1a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 10, padding: '0.625rem 1rem', color: '#fff', fontSize: 13 }}>
          {notification}
        </div>
      )}

      <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: 0, fontWeight: 600 }}>DMS Market</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Centro de Soporte</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            {[
              { label: 'Total', value: stats.total, color: '#fff' },
              { label: 'Pendientes', value: stats.pendiente, color: '#F59E0B' },
              { label: 'En proceso', value: stats.en_proceso, color: '#3B82F6' },
              { label: 'Urgentes', value: stats.urgente, color: '#EF4444' },
              { label: 'Resueltos', value: stats.resuelto, color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.25rem 0.625rem' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 9, color: '#555', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>{agent?.display_name}</p>
            <p style={{ fontSize: 10, color: '#D4AF37', margin: 0 }}>{agent?.role === 'support_supervisor' ? 'Supervisor' : 'Agente'}</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '0.375rem 0.75rem', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#666', fontSize: 11, cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 260px', flex: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

        <div style={{ borderRight: '1px solid rgba(212,175,55,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ width: '100%', background: '#111', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, color: '#fff', padding: '0.5rem', fontSize: 11, outline: 'none' }}>
              <option value="todos">Todos los tickets</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem' }}>
            {filtered.length === 0 ? (
              <p style={{ color: '#444', fontSize: 12, textAlign: 'center', marginTop: '2rem' }}>Sin tickets</p>
            ) : filtered.map(conv => (
              <div key={conv.id} onClick={() => selectConversation(conv)}
                style={{ padding: '0.625rem 0.75rem', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: selected?.id === conv.id ? 'rgba(212,175,55,0.07)' : 'transparent', border: selected?.id === conv.id ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0 }}>{conv.profiles?.name ?? 'Usuario'}</p>
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 999, background: `${PRIORITY_COLORS[conv.priority ?? 'media']}22`, color: PRIORITY_COLORS[conv.priority ?? 'media'], fontWeight: 700 }}>{conv.priority ?? 'media'}</span>
                </div>
                <p style={{ color: '#666', fontSize: 11, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.subject ?? 'Consulta general'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 999, background: `${STATUS_COLORS[conv.status ?? 'pendiente']}18`, color: STATUS_COLORS[conv.status ?? 'pendiente'] }}>{(conv.status ?? 'pendiente').replace('_', ' ')}</span>
                  <span style={{ fontSize: 10, color: '#444' }}>{new Date(conv.created_at).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid rgba(212,175,55,0.08)' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#444', fontSize: 13 }}>Selecciona un ticket para comenzar</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>{selected.subject ?? 'Consulta general'}</p>
                  <p style={{ color: '#555', fontSize: 11, margin: '2px 0 0' }}>{selected.profiles?.email ?? ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {(['chat', 'perfil'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '0.3rem 0.75rem', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: tab === t ? '#D4AF37' : '#151515', color: tab === t ? '#000' : '#666' }}>
                      {t === 'chat' ? 'Chat' : 'Perfil'}
                    </button>
                  ))}
                </div>
              </div>

              {tab === 'chat' ? (
                <>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {messages.length === 0 && <p style={{ color: '#444', fontSize: 12, textAlign: 'center', marginTop: '2rem' }}>Sin mensajes</p>}
                    {messages.map((msg: any) => (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 9, color: '#444', margin: '0 0 3px', textAlign: msg.sender_type === 'admin' ? 'right' : 'left' }}>
                            {msg.sender_type === 'admin' ? agent?.display_name ?? 'Asesor' : msg.sender_type === 'bot' ? 'IA' : 'Usuario'}
                          </p>
                          <div style={{ maxWidth: 380, padding: '0.5rem 0.875rem', borderRadius: 12, background: msg.sender_type === 'admin' ? 'rgba(212,175,55,0.12)' : '#161616', color: msg.sender_type === 'admin' ? '#D4AF37' : '#ccc', fontSize: 13, lineHeight: 1.5, border: msg.sender_type === 'admin' ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {showCanned && cannedResponses.length > 0 && (
                    <div style={{ padding: '0.625rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#0a0a0a' }}>
                      <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.5rem', fontWeight: 600 }}>Respuestas rapidas</p>
                      {cannedResponses.map(cr => (
                        <button key={cr.id} onClick={() => { setReply(cr.content); setShowCanned(false) }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.625rem', background: '#111', border: '1px solid rgba(212,175,55,0.1)', borderRadius: 7, color: '#aaa', fontSize: 11, cursor: 'pointer', marginBottom: 3 }}>
                          <span style={{ color: '#D4AF37', fontWeight: 600 }}>{cr.title}</span>{' - '}{cr.content.substring(0, 55)}...
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button onClick={() => setShowCanned(!showCanned)} style={{ padding: '0.5rem', background: '#111', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, cursor: 'pointer', color: '#D4AF37' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </button>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} onKeyDown={handleKey} placeholder="Escribe tu respuesta... (Enter para enviar)" rows={2}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', resize: 'none', background: '#111', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      style={{ padding: '0.5rem 1rem', background: sending || !reply.trim() ? '#111' : '#D4AF37', border: 'none', borderRadius: 10, color: sending || !reply.trim() ? '#444' : '#000', fontSize: 12, fontWeight: 700, cursor: sending || !reply.trim() ? 'not-allowed' : 'pointer' }}>
                      {sending ? '...' : 'Enviar'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                  {!userProfile ? <p style={{ color: '#444', fontSize: 12 }}>Cargando...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                        <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Cliente</p>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{userProfile.profile?.name ?? 'Sin nombre'}</p>
                        <p style={{ color: '#777', fontSize: 12, margin: '0 0 3px' }}>{userProfile.profile?.email ?? ''}</p>
                        <p style={{ color: '#555', fontSize: 11, margin: 0 }}>Rol: <span style={{ color: '#D4AF37' }}>{userProfile.profile?.role ?? ''}</span></p>
                      </div>
                      <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                        <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Resumen</p>
                        <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>${(userProfile.totalSpent ?? 0).toLocaleString('es-CO')}</p>
                        <p style={{ color: '#777', fontSize: 12, margin: 0 }}>{userProfile.orders?.length ?? 0} ordenes</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ overflowY: 'auto', padding: '0.875rem' }}>
          {!selected ? (
            <p style={{ color: '#333', fontSize: 12, textAlign: 'center', marginTop: '3rem' }}>Selecciona un ticket</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Estado</p>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateStatus(s)} style={{ display: 'block', width: '100%', padding: '0.4rem 0.625rem', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: selected.status === s ? `${STATUS_COLORS[s]}18` : 'transparent', color: selected.status === s ? STATUS_COLORS[s] : '#555', fontSize: 12, fontWeight: selected.status === s ? 700 : 400, borderLeft: `3px solid ${selected.status === s ? STATUS_COLORS[s] : 'transparent'}`, marginBottom: 4 }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Prioridad</p>
                {PRIORITY_OPTIONS.map(p => (
                  <button key={p} onClick={() => updatePriority(p)} style={{ display: 'block', width: '100%', padding: '0.4rem 0.625rem', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', background: selected.priority === p ? `${PRIORITY_COLORS[p]}18` : 'transparent', color: selected.priority === p ? PRIORITY_COLORS[p] : '#555', fontSize: 12, fontWeight: selected.priority === p ? 700 : 400, borderLeft: `3px solid ${selected.priority === p ? PRIORITY_COLORS[p] : 'transparent'}`, marginBottom: 4 }}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Acciones</p>
                <button onClick={() => updateStatus('resuelto')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', width: '100%', padding: '0.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: '#10B981', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>
                  Marcar resuelto
                </button>
                <button onClick={() => updateStatus('cerrado')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', width: '100%', padding: '0.5rem', background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.15)', borderRadius: 8, color: '#6B7280', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>
                  Cerrar ticket
                </button>
                <button onClick={() => updatePriority('urgente')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', width: '100%', padding: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Marcar urgente
                </button>
              </div>
              <div style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.08)', borderRadius: 12, padding: '0.875rem' }}>
                <p style={{ fontSize: 9, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 0.625rem', fontWeight: 600 }}>Info</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#444', fontSize: 11 }}>ID</span>
                  <span style={{ color: '#666', fontSize: 10, fontFamily: 'monospace' }}>{selected.id?.slice(0, 8)}...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#444', fontSize: 11 }}>Creado</span>
                  <span style={{ color: '#666', fontSize: 11 }}>{new Date(selected.created_at).toLocaleDateString('es-CO')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#444', fontSize: 11 }}>Mensajes</span>
                  <span style={{ color: '#D4AF37', fontSize: 11, fontWeight: 600 }}>{messages.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } textarea::placeholder { color: #444; }`}</style>
    </div>
  )
}
