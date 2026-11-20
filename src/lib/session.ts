import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dashboardFor } from "@/lib/roles";

/** Pengguna yang sedang login DAN masih aktif (dicek ke database, bukan hanya token). */
export const getActiveUser = cache(async () => {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({ where: { id }, include: { kurir: true } });
  if (!user || !user.aktif) return null;
  if (user.role === "KURIR" && !user.kurir?.disetujui) return null;
  return user;
});

export async function requireRole(...roles: Role[]) {
  const user = await getActiveUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect(dashboardFor(user.role));
  return user;
}
