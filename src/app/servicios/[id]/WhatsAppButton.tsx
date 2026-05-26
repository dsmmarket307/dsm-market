'use client'

import { useEffect, useRef } from 'react'

interface Props {
  waUrl: string
  serviceId: string
  providerId: string
  serviceName: string
  category: string
  planType: string
}

export default function WhatsAppButton({ waUrl, serviceId, providerId, serviceName, category, planType }: Props) {

  const tracked = useRef(false)

  async function handleClick() {
    if (!tracked.current) {
      tracked.current = true
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            provider_id: providerId,
            service_name: serviceName,
            category,
            plan_type: planType,
            lead_type: 'whatsapp_click',
            source: 'service_detail',
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            visitor_id: localStorage.getItem('dms_visitor_id') || null,
          }),
        })
      } catch (e) {
        console.error('Lead tracking failed:', e)
      }
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('dms_visitor_id')) {
      localStorage.setItem('dms_visitor_id', crypto.randomUUID())
    }
    tracked.current = false
  }, [serviceId])

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        color: '#fff',
        borderRadius: '14px',
        fontSize: '0.95rem',
        fontWeight: 700,
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        boxShadow: '0 4px 18px rgba(37,211,102,0.35)',
        fontFamily: 'Outfit, sans-serif',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.45)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(37,211,102,0.35)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .515.572l5.736-1.505A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.538-5.373-1.47l-.385-.228-3.985 1.046 1.065-3.888-.251-.4A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Contactar por WhatsApp
    </button>
  )
}
