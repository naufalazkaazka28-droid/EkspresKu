import AppShell from "@/components/AppShell";
import { requireRole } from "@/lib/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return <AppShell user={{ nama: user.nama, role: user.role }}>{children}</AppShell>;
}
