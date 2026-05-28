import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Segment =
  | "all_buyers"
  | "active_buyers"
  | "sellers"
  | "providers"
  | "all_users";

export const SEGMENT_LABELS: Record<Segment, string> = {
  all_buyers:    "Todos los compradores",
  active_buyers: "Compradores activos",
  sellers:       "Vendedores",
  providers:     "Proveedores",
  all_users:     "Todos los usuarios",
};

export async function getEmailsBySegment(segment: Segment): Promise<string[]> {
  if (segment === "all_buyers" || segment === "active_buyers") {
    const { data, error } = await supabase
      .from("orders")
      .select("buyer_id")
      .not("buyer_id", "is", null);

    if (error || !data?.length) return [];

    const ids = [...new Set(data.map((o: any) => o.buyer_id))];

    const { data: users, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError || !users) return [];

    return users.users
      .filter((u: any) => ids.includes(u.id) && u.email)
      .map((u: any) => u.email as string);
  }

  if (segment === "sellers") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "seller");

    if (!profiles?.length) return [];
    const ids = profiles.map((p: any) => p.id);

    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (!users) return [];

    return users.users
      .filter((u: any) => ids.includes(u.id) && u.email)
      .map((u: any) => u.email as string);
  }

  if (segment === "providers") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "provider");

    if (!profiles?.length) return [];
    const ids = profiles.map((p: any) => p.id);

    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (!users) return [];

    return users.users
      .filter((u: any) => ids.includes(u.id) && u.email)
      .map((u: any) => u.email as string);
  }

  if (segment === "all_users") {
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (!users) return [];
    return users.users.filter((u: any) => u.email).map((u: any) => u.email as string);
  }

  return [];
}
