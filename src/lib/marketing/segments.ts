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
  let roles: string[] = [];

  if (segment === "all_buyers")    roles = ["buyer"];
  if (segment === "active_buyers") roles = ["buyer"];
  if (segment === "sellers")       roles = ["seller"];
  if (segment === "providers")     roles = ["provider"];
  if (segment === "all_users")     roles = ["buyer", "seller", "provider"];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, role")
    .in("role", roles);

  if (error || !profiles?.length) return [];

  const ids = profiles.map((p: any) => p.id);

  const { data: users, error: authError } = await supabase.auth.admin.listUsers();
  if (authError || !users) return [];

  return users.users
    .filter((u: any) => ids.includes(u.id) && u.email)
    .map((u: any) => u.email as string);
}
