'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { notifyNuevoProducto } from '@/lib/notifications'

function getAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function generateSEO(name: string, category: string, description: string) {
  try {
    const prompt = `Eres un experto en SEO para marketplaces colombianos. Dado este producto genera exactamente esto en JSON sin texto extra:
{
  "seo_title": "titulo SEO maximo 60 caracteres incluyendo | DMS Market al final",
  "seo_description": "meta descripcion atractiva maximo 155 caracteres mencionando compra rapida y envio",
  "slug": "slug-limpio-sin-espacios-ni-caracteres-especiales"
}

Producto: ${name}
Categoria: ${category}
Descripcion: ${description ?? ""}

Responde SOLO el JSON, sin explicaciones ni backticks.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    })
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ""
    return JSON.parse(text.trim())
  } catch {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    return {
      seo_title: `${name} | DMS Market`,
      seo_description: `Compra ${name} con envio rapido en DMS Market. Calidad garantizada.`,
      slug,
    }
  }
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

  if (profile?.seller_status !== 'approved') return { error: 'Tu perfil no esta aprobado aun' }

  const name        = formData.get('name') as string
  const description = formData.get('description') as string
  const price       = parseFloat(formData.get('price') as string)
  const original_price = formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null
  const category    = formData.get('category') as string
  const condition   = formData.get('condition') as string
  const stock       = formData.get('stock') ? parseInt(formData.get('stock') as string) : null
  const envio_gratis = formData.get('envio_gratis') === 'true'
  const variantesRaw = formData.get('variantes') as string
  const variantes   = variantesRaw ? JSON.parse(variantesRaw) : null
  const images      = formData.getAll('images') as File[]

  if (!name || !price || !category) return { error: 'Completa todos los campos requeridos' }
  if (images.length > 10) return { error: 'Maximo 10 fotos por producto' }

  const seo = await generateSEO(name, category, description)

  const { data: product, error: productError } = await admin
    .from('products')
    .insert({
      seller_id: user.id, name, description, price, original_price,
      category, condition, stock, envio_gratis, variantes, status: 'pending',
      seo_title: seo.seo_title ?? null,
      seo_description: seo.seo_description ?? null,
      slug: seo.slug ?? null,
    })
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

  notifyNuevoProducto(name, user.user_metadata?.name ?? 'Vendedor', price).catch(() => {})

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