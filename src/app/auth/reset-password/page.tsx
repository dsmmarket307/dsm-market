'use client'

import { useState } from 'react'
import { resetPassword } from '@/lib/actions/auth'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-10">
        <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: '#C9A84C' }}>
          Seguridad
        </p>
        <h1 className="font-display text-4xl font-light" style={{ color: '#F5F0E8' }}>
          Nueva contraseña
        </h1>
        <div className="w-12 h-px mt-4" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        <p className="mt-4 text-sm" style={{ color: '#8A8580' }}>
          Elige una contraseña segura para tu cuenta.
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
            Nueva contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className="auth-input"
          />
        </div>

        <div>
          <label className="block text-xs tracking-[0.15em] uppercase mb-2" style={{ color: '#8A8580' }}>
            Confirmar nueva contraseña
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            className="auth-input"
          />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-gold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Guardando...
              </span>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}