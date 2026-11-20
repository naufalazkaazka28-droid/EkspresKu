import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/actions/auth";
import { dashboardFor, type RoleName } from "@/lib/roles";
import NavLinks from "./NavLinks";

const NAV: Record<RoleName, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/paket", label: "Data Paket" },
    { href: "/admin/layanan-tarif", label: "Layanan & Tarif" },
    { href: "/admin/lokasi", label: "Lokasi" },
    { href: "/admin/kurir", label: "Kurir" },
    { href: "/admin/pengguna", label: "Pengguna" },
    { href: "/admin/laporan", label: "Laporan" },
    { href: "/lacak", label: "Lacak" },
    { href: "/profil", label: "Profil" },
  ],
  KURIR: [
    { href: "/kurir", label: "Dashboard" },
    { href: "/kurir/tugas", label: "Tugas Antar" },
    { href: "/lacak", label: "Lacak" },
    { href: "/profil", label: "Profil" },
  ],
  PELANGGAN: [
    { href: "/pelanggan", label: "Dashboard" },
    { href: "/pelanggan/buat", label: "Buat Pengiriman" },
    { href: "/pelanggan/riwayat", label: "Riwayat" },
    { href: "/lacak", label: "Lacak" },
    { href: "/profil", label: "Profil" },
  ],
};

const LABEL: Record<RoleName, string> = { ADMIN: "Admin", KURIR: "Kurir", PELANGGAN: "Pelanggan" };

export default function AppShell({ user, children }: { user: { nama: string; role: RoleName }; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href={dashboardFor(user.role)} className="text-lg font-bold text-blue-700">
              Ekspres<span className="text-slate-900">Ku</span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-slate-600 sm:inline">
                {user.nama} · <span className="font-medium">{LABEL[user.role]}</span>
              </span>
              <form action={logout}>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">Keluar</button>
              </form>
            </div>
          </div>
          <div className="mt-2">
            <NavLinks items={NAV[user.role]} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
