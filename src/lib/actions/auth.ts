'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as UserRole) || 'buyer'
  const redirectTo = formData.get('redirectTo') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && data.user.identities && data.user.identities.length > 0) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      role,
    })

    if (profileError && profileError.code !== '23505') {
      return { error: profileError.message }
    }
  }

  revalidatePath('/', 'layout')

  if (role === 'seller') {
    redirect('/dashboard/vendor/verificacion')
  }

  if (role === 'provider') {
    redirect('/dashboard/provider')
  }

  redirect(redirectTo || '/dashboard')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .single()

  revalidatePath('/', 'layout')

  if (profile?.role === 'seller') redirect('/dashboard/vendor')
  if (profile?.role === 'provider') redirect('/dashboard/provider')
  if (profile?.role === 'admin') redirect('/dashboard/admin')

  redirect(redirectTo || '/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/reset-password',
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Las contrasenas no coinciden' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}