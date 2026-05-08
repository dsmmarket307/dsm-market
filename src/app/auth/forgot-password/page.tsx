'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/actions/auth'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await forgotPassword(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mb-6">
          <div
            className="w-16 h-16 mx-auto flex items-center justify-center text-3xl"
            style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
          >
            ✉
          </div>
        </div>
        <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C9A84C' }}>
          Correo enviado
        </p>
        <h2 className="font-display text-3xl font-light mb-4" style={{ color: '#F5F0E8' }}>
          Revisa tu bandeja
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: '#8A8580' }}>
          Si ese correo existe en nuestra plataforma, recibirás instrucciones para restablecer tu contraseña.
        </p>
        <div className="w-8 h-px mx-auto mb-8" style={{ background: '#C9A84C' }} />
        <Link href="/auth/login" className="btn-ghost" style={{ display: 'block' }}>
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C9A84C' }}>
          Acceso
        </p>
        <h1 className="font-display text-4xl font-light" style={{ color: '#F5F0E8' }}>
          Recuperar contraseña
        </h1>
        <div className="w-12 h-px mt-4" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        <p className="mt-4 text-sm leading-relaxed" style={{ color: '#8A8580' }}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 text-sm"
          style={{
            background: 'rgba(224,82,82,0.08)',
            border: '1px solid rgba(224,82,82,0.3)',
            color: '#E05252',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase mb-2" style={{ color: '#8A8580' }}>
            Correo electrónico
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="auth-input"
          />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Enviando...
              </span>
            ) : (
              'Enviar enlace'
            )}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <Link href="/auth/login" className="btn-ghost" style={{ display: 'block', textAlign: 'center' }}>
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}