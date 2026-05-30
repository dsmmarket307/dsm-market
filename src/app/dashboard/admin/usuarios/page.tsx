import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsuariosClient } from './UsuariosClient'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: allProfiles } = await admin
    .from('profiles')
    .select('id, name, full_name, role, phone, celular, city, ciudad, created_at, store_name, blocked')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  authUsers?.users?.forEach((u: any) => { emailMap[u.id] = u.email || '' })

  const { data: ventasData } = await admin
    .from('orders')
    .select('seller_id, total_price, product_id, products(name)')
    .in('status', ['paid', 'delivered', 'released'])

  const { data: comprasData } = await admin
    .from('orders')
    .select('buyer_id, total_price')
    .in('status', ['paid', 'delivered', 'released'])

  const ventasMap: Record<string, { total: number; count: number; productos: Record<string, number> }> = {}
  ;(ventasData || []).forEach((o: any) => {
    if (!o.seller_id) return
    if (!ventasMap[o.seller_id]) ventasMap[o.seller_id] = { total: 0, count: 0, productos: {} }
    ventasMap[o.seller_id].total += Number(o.total_price || 0)
    ventasMap[o.seller_id].count += 1
    const pname = o.products?.name || 'Sin nombre'
    ventasMap[o.seller_id].productos[pname] = (ventasMap[o.seller_id].productos[pname] || 0) + 1
  })

  const comprasMap: Record<string, { total: number; count: number }> = {}
  ;(comprasData || []).forEach((o: any) => {
    if (!o.buyer_id) return
    if (!comprasMap[o.buyer_id]) comprasMap[o.buyer_id] = { total: 0, count: 0 }
    comprasMap[o.buyer_id].total += Number(o.total_price || 0)
    comprasMap[o.buyer_id].count += 1
  })

  const sellers = (allProfiles || []).filter((p: any) => p.role === 'seller')
  const buyers  = (allProfiles || []).filter((p: any) => p.role === 'buyer')

  return (
    <UsuariosClient
      sellers={sellers}
      buyers={buyers}
      emailMap={emailMap}
      ventasMap={ventasMap}
      comprasMap={comprasMap}
      totalVentas={(ventasData || []).length}
      totalCompras={(comprasData || []).length}
    />
  )
}
