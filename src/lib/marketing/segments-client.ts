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
