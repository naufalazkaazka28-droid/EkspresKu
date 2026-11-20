import Link from "next/link";
import { setujuiKurir, toggleKurir } from "@/actions/kurir";
import SubmitButton from "@/components/SubmitButton";
import { Card, Empty, Flash, PageHeader, btnCls, btnGhost, btnSm } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; s?: string }> }) {
  await requireRole("ADMIN");
  const { e, s } = await searchParams;
  const [kurirs, grp] = await Promise.all([
    prisma.kurir.findMany({ include: { user: { select: { nama: true, email: true, noHp: true } } }, orderBy: { user: { nama: "asc" } } }),
    prisma.pengiriman.groupBy({ by: ["kurirId", "statusTerakhir"], where: { kurirId: { not: null } }, _count: { _all: true } }),
  ]);

  const stat = (id: string) => {
    const c = (st: string[]) => grp.filter((g) => g.kurirId === id && st.includes(g.statusTerakhir)).reduce((a, g) => a + g._count._all, 0);
    return { aktif: c(["DIPROSES", "DALAM_PERJALANAN"]), berhasil: c(["SUDAH_DITERIMA"]), tertunda: c(["TERTUNDA"]) };
  };

  const menunggu = kurirs.filter((k) => !k.disetujui);
  const lainnya = kurirs.filter((k) => k.disetujui);

  return (
    <>
      <PageHeader title="Kurir" desc="Setujui pendaftar baru, pantau beban kerja, dan kelola status kurir." />
      <Flash e={e} s={s} />

      {menunggu.length > 0 && (
        <Card title={`Menunggu persetujuan (${menunggu.length})`} className="mb-5 border-amber-300">
          <div className="divide-y divide-slate-100">
            {menunggu.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{k.user.nama}</p>
                  <p className="text-slate-600">{k.user.email} · {k.user.noHp}</p>
                  <p className="text-slate-600">{k.kendaraan} {k.platNomor} · wilayah {k.wilayahTugas}</p>
                </div>
                <form action={setujuiKurir}>
                  <input type="hidden" name="kurirId" value={k.id} />
                  <SubmitButton className={`${btnCls} ${btnSm}`}>Setujui</SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Daftar kurir">
        {lainnya.length === 0 ? (
          <Empty>Belum ada kurir yang disetujui.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Kurir</th><th className="py-2 pr-3">Kendaraan</th><th className="py-2 pr-3">Wilayah</th>
                  <th className="py-2 pr-3">Aktif</th><th className="py-2 pr-3">Berhasil</th><th className="py-2 pr-3">Tertunda</th>
                  <th className="py-2 pr-3">Status</th><th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lainnya.map((k) => {
                  const st = stat(k.id);
                  return (
                    <tr key={k.id}>
                      <td className="py-2 pr-3">
                        <Link href={`/admin/kurir/${k.id}`} className="font-medium text-blue-700 hover:underline">{k.user.nama}</Link>
                        <p className="text-xs text-slate-500">{k.user.noHp}</p>
                      </td>
                      <td className="py-2 pr-3">{k.kendaraan} · {k.platNomor}</td>
                      <td className="py-2 pr-3">{k.wilayahTugas}</td>
                      <td className="py-2 pr-3">{st.aktif}</td>
                      <td className="py-2 pr-3">{st.berhasil}</td>
                      <td className="py-2 pr-3">{st.tertunda}</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${k.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                          {k.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-2">
                        <form action={toggleKurir}>
                          <input type="hidden" name="kurirId" value={k.id} />
                          <SubmitButton className={`${btnGhost} ${btnSm}`}>{k.aktif ? "Nonaktifkan" : "Aktifkan"}</SubmitButton>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
