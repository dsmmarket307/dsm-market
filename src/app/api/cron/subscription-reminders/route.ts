import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const now = new Date()
  const results = { checked: 0, reminders_sent: 0, expired_updated: 0, errors: [] as string[] }

  const { data: trials, error: trialsError } = await supabase
    .from('trial_periods')
    .select('user_id, expires_at, active')
    .eq('active', true)

  if (trialsError) {
    return NextResponse.json({ error: trialsError.message }, { status: 500 })
  }

  for (const trial of trials || []) {
    results.checked++
    const expiresAt = new Date(trial.expires_at)
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (now > expiresAt) {
      await supabase
        .from('trial_periods')
        .update({ active: false })
        .eq('user_id', trial.user_id)
      results.expired_updated++
      await sendReminderIfNeeded(supabase, trial.user_id, 'expired', results)
      continue
    }

    if (daysLeft <= 1) {
      await sendReminderIfNeeded(supabase, trial.user_id, '1_day', results)
    } else if (daysLeft <= 7) {
      await sendReminderIfNeeded(supabase, trial.user_id, '7_days', results)
    } else if (daysLeft <= 15) {
      await sendReminderIfNeeded(supabase, trial.user_id, '15_days', results)
    } else if (daysLeft <= 30) {
      await sendReminderIfNeeded(supabase, trial.user_id, '30_days', results)
    }
  }

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, expires_at, plan_type')
    .eq('status', 'active')

  for (const sub of subscriptions || []) {
    results.checked++
    const expiresAt = new Date(sub.expires_at)
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (now > expiresAt) {
      await supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('user_id', sub.user_id)
        .eq('status', 'active')
      results.expired_updated++
      await sendReminderIfNeeded(supabase, sub.user_id, 'expired', results)
      continue
    }

    if (daysLeft <= 1) {
      await sendReminderIfNeeded(supabase, sub.user_id, '1_day', results)
    } else if (daysLeft <= 7) {
      await sendReminderIfNeeded(supabase, sub.user_id, '7_days', results)
    } else if (daysLeft <= 15) {
      await sendReminderIfNeeded(supabase, sub.user_id, '15_days', results)
    } else if (daysLeft <= 30) {
      await sendReminderIfNeeded(supabase, sub.user_id, '30_days', results)
    }
  }

  return NextResponse.json({ success: true, ...results }, { status: 200 })
}

async function sendReminderIfNeeded(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T> ? T : never,
  userId: string,
  reminderType: string,
  results: { reminders_sent: number; errors: string[] }
) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('subscription_reminders')
    .select('id')
    .eq('user_id', userId)
    .eq('reminder_type', reminderType)
    .gte('sent_at', today)
    .single()

  if (existing) return

  const { data: userData } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  const { data: authData } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!authData) return

  const { data: emailData } = await supabase.auth.admin.getUserById(userId)
  const email = emailData?.user?.email
  if (!email) return

  const subject = getEmailSubject(reminderType)
  const body = getEmailBody(reminderType, userData?.name || 'Proveedor')

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'DMS Market <noreply@dmsmarket.com>',
      to: email,
      subject,
      html: body,
    }),
  })

  if (emailRes.ok) {
    await supabase.from('subscription_reminders').insert({
      user_id: userId,
      reminder_type: reminderType,
    })
    results.reminders_sent++
  } else {
    results.errors.push(`Email failed for user ${userId}`)
  }
}

function getEmailSubject(type: string): string {
  switch (type) {
    case '30_days': return 'Tu periodo de prueba vence en 30 dias - DMS Market'
    case '15_days': return 'Tu periodo de prueba vence en 15 dias - DMS Market'
    case '7_days': return 'Tu periodo de prueba vence en 7 dias - DMS Market'
    case '1_day': return 'Tu periodo de prueba vence manana - DMS Market'
    case 'expired': return 'Tu periodo de prueba ha vencido - DMS Market'
    default: return 'Recordatorio de suscripcion - DMS Market'
  }
}

function getEmailBody(type: string, name: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const link = `${baseUrl}/dashboard/provider/suscripcion`

  const messages: Record<string, string> = {
    '30_days': `Tu periodo de prueba gratuito vence en 30 dias. Elige un plan para continuar sin interrupciones.`,
    '15_days': `Tu periodo de prueba gratuito vence en 15 dias. No pierdas acceso a tus servicios publicados.`,
    '7_days': `Solo 7 dias restantes de tu periodo de prueba. Activa tu plan ahora.`,
    '1_day': `Tu periodo de prueba vence manana. Activa tu plan hoy para no perder acceso.`,
    'expired': `Tu periodo de prueba ha vencido. Tus servicios han sido pausados temporalmente. Reactiva tu cuenta eligiendo un plan.`,
  }

  const message = messages[type] || 'Recuerda renovar tu suscripcion.'

  return `
    <!DOCTYPE html>
    <html>
      <body style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:2rem;">
        <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #222;border-radius:12px;padding:2rem;">
          <h2 style="color:#d4af37;margin-bottom:1rem;">DMS Market</h2>
          <p style="color:#ccc;margin-bottom:1rem;">Hola ${name},</p>
          <p style="color:#ccc;margin-bottom:1.5rem;">${message}</p>
          <a href="${link}" style="display:inline-block;background:#d4af37;color:#000;padding:0.75rem 1.5rem;border-radius:8px;font-weight:700;text-decoration:none;">
            Ver planes
          </a>
          <p style="color:#555;font-size:0.8rem;margin-top:2rem;">DMS Market - Marketplace profesional</p>
        </div>
      </body>
    </html>
  `
}
