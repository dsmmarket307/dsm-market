import { getRankedServices } from '@/lib/ranking'
import { createClient } from '@/lib/supabase/server'
import ServiciosClient from './ServiciosClient'

export const revalidate = 0

export default async function ServiciosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: bannersData } = await supabase
    .from('banners_servicios')
    .select('id, title, subtitle, image_url, link, active, position')
    .eq('active', true)
    .order('position', { ascending: true })

  const services = await getRankedServices()

  return (
    <ServiciosClient
      services={services}
      banners={bannersData ?? []}
      user={user}
      profile={profile}
    />
  )
}


