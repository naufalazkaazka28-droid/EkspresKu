import type { Role } from "@prisma/client";
import { buatUser, hapusUser, toggleUser } from "@/actions/user";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Flash, PageHeader, btnDanger, btnGhost, btnSm, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import Link from "next/link";

const ROLES: Role[] = ["ADMIN", "KURIR", "PELANGGAN"];

export default async function Page({ searchParams }: { searchParams: Promise<{ role?: string; e?: string; s?: string }> }) {
  const me = await requireRole("ADMIN");
  const sp = await searchParams;
  const role = ROLES.includes(sp.role as Role) ? (sp.role as Role) : undefined;
  const users = await prisma.user.findMany({
    where: role ? { role } : {},
    orderBy: [{ role: "asc" }, { nama: "asc" }],
    select: { id: true, nama: true, email: true, noHp: true, role: true, aktif: true },
  });

  return (
    <>
      <PageHeader title="Pengguna" desc="Kelola akun admin, kurir, dan pelanggan." />
      <Flash e={sp.e} s={sp.s} />

      <Card title="Tambah pengguna" className="mb-5">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-blue-700">Buka formulir</summary>
          <form action={buatUser} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nama"><input name="nama" required className={inputCls} /></Field>
            <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
            <Field label="Nomor HP"><input name="noHp" type="tel" required className={inputCls} /></Field>
            <Field label="Peran">
              <select name="role" defaultValue="PELANGGAN" className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Kata sandi"><input name="password" type="password" required className={inputCls} /></Field>
            <Field label="Ulangi kata sandi"><input name="konfirmasi" type="password" required className={inputCls} /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Alamat (opsional)"><input name="alamat" className={inputCls} /></Field></div>
            <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">Khusus peran KURIR, isi data berikut (akun kurir buatan admin langsung disetujui):</p>
            <Field label="Kendaraan"><input name="kendaraan" className={inputCls} /></Field>
            <Field label="Plat nomor"><input name="platNomor" className={inputCls} /></Field>
            <Field label="Wilayah tugas"><input name="wilayahTugas" className={inputCls} /></Field>
            <div className="sm:col-span-2 lg:col-span-3"><SubmitButton>Buat akun</SubmitButton></div>
          </form>
        </details>
      </Card>

      <Card
        title="Daftar akun"
        action={
          <div className="flex gap-1 text-xs">
            <Link href="/admin/pengguna" className={`rounded-full px-3 py-1 ${!role ? "bg-blue-600 text-white" : "bg-slate-100"}`}>Semua</Link>
            {ROLES.map((r) => (
              <Link key={r} href={`/admin/pengguna?role=${r}`} className={`rounded-full px-3 py-1 ${role === r ? "bg-blue-600 text-white" : "bg-slate-100"}`}>{r}</Link>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2 pr-3">Nama</th><th className="py-2 pr-3">Email</th><th className="py-2 pr-3">HP</th><th className="py-2 pr-3">Peran</th><th className="py-2 pr-3">Status</th><th className="py-2" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 pr-3 font-medium">{u.nama}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3">{u.noHp ?? "—"}</td>
                  <td className="py-2 pr-3">{u.role}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{u.aktif ? "Aktif" : "Nonaktif"}</span>
                  </td>
                  <td className="py-2">
                    {u.id !== me.id && (
                      <div className="flex gap-1">
                        <form action={toggleUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton className={`${btnGhost} ${btnSm}`}>{u.aktif ? "Nonaktifkan" : "Aktifkan"}</SubmitButton>
                        </form>
                        <form action={hapusUser}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton className={`${btnDanger} ${btnSm}`}>Hapus</SubmitButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
