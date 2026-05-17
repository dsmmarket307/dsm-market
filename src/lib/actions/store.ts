"use server"

import { createClient as createAdmin } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function updateStorePage(formData: FormData, userId: string) {
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  await admin.from("profiles").update({
    store_name: formData.get("store_name"),
    store_description: formData.get("store_description"),
    store_phone: formData.get("store_phone"),
    store_logo_url: formData.get("store_logo_url"),
  }).eq("id", userId)
  revalidatePath("/dashboard/vendor/mi-tienda")
}