export type RoleName = "ADMIN" | "KURIR" | "PELANGGAN";

export function dashboardFor(role: RoleName) {
  return role === "ADMIN" ? "/admin" : role === "KURIR" ? "/kurir" : "/pelanggan";
}
