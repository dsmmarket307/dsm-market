type EmailPayload = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DMS Market <no-reply@dmsmarket.com>',
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('[Email] Error:', error)
    }
  } catch (err) {
    console.error('[Email] Fallo silencioso:', err)
  }
}