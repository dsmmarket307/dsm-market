'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const role = user.user_metadata?.role
  if (role !== 'seller') return { error: 'No eres vendedor' }

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('seller_status')
    .eq('id', user.id)
    .single()

  if (profile?.seller_status !== 'approved') return { error: 'Tu perfil no está aprobado aún' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const original_price = formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null
  const category = formData.get('category') as string
  const condition = formData.get('condition') as string
  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const envio_gratis = formData.get('envio_gratis') === 'true'
  const images = formData.getAll('images') as File[]

  if (!name || !price || !category) return { error: 'Completa todos los campos requeridos' }
  if (images.length > 10) return { error: 'Máximo 10 fotos por producto' }

  const { data: product, error: productError } = await admin
    .from('products')
    .insert({ seller_id: user.id, name, description, price, original_price, category, condition, stock, envio_gratis, status: 'pending' })
    .select()
    .single()

  if (productError) return { error: productError.message }

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    if (!image || image.size === 0) continue
    const ext = image.name.split('.').pop()
    const path = `${user.id}/${product.id}/${i}.${ext}`
    const { error: uploadError } = await supabase.storage.from('products').upload(path, image)
    if (uploadError) continue
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
    await admin.from('product_images').insert({ product_id: product.id, url: urlData.publicUrl, position: i })
  }

  revalidatePath('/dashboard/vendor')
  return { success: true }
}

export async function approveProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const role = user.user_metadata?.role
  if (role !== 'admin') return { error: 'No autorizado' }
  const admin = getAdminClient()
  const { error } = await admin.from('products').update({ status: 'approved' }).eq('id', productId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/products')
  return { success: true }
}

export async function rejectProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const role = user.user_metadata?.role
  if (role !== 'admin') return { error: 'No autorizado' }
  const admin = getAdminClient()
  const { error } = await admin.from('products').update({ status: 'rejected' }).eq('id', productId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/products')
  return { success: true }
}

export async function approveVendor(vendorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const role = user.user_metadata?.role
  if (role !== 'admin') return { error: 'No autorizado' }
  const admin = getAdminClient()
  const { error } = await admin.from('profiles').update({ seller_status: 'approved' }).eq('id', vendorId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/vendors')
  return { success: true }
}

export async function rejectVendor(vendorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const role = user.user_metadata?.role
  if (role !== 'admin') return { error: 'No autorizado' }
  const admin = getAdminClient()
  const { error } = await admin.from('profiles').update({ seller_status: 'rejected' }).eq('id', vendorId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/vendors')
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const admin = getAdminClient()
  const { data: product } = await admin.from('products').select('seller_id').eq('id', productId).single()
  if (product?.seller_id !== user.id) return { error: 'No autorizado' }
  await admin.from('product_images').delete().eq('product_id', productId)
  const { error } = await admin.from('products').delete().eq('id', productId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/vendor')
  return { success: true }
}