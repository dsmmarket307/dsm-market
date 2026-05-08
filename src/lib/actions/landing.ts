"use server"

import { createClient as createAdmin } from "@supabase/supabase-js"

export async function registerBetaSeller(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const business_type = formData.get("business_type") as string

  if (!name || !email || !phone || !business_type) {
    return { error: "Completa todos los campos" }
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await admin
    .from("beta_sellers")
    .insert({ name, email, phone, business_type })

  if (error) return { error: error.message }

  return { success: true }
}
