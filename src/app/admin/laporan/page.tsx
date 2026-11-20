import type { Prisma, StatusPaket } from "@prisma/client";
import PrintButton from "@/components/PrintButton";
import StatusBadge from "@/components/StatusBadge";
import { BayarBadge, Card, Empty, PageHeader, Stat, btnCls, inputCls } from "@/components/ui";
import { akhirHariWIB, awalHariWIB, fmtTanggal, isoDateWIB, rupiah } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { STATUS_LABEL, STATUS_LIST } from "@/lib/status";

type SP = { dari?: string; sampai?: string; kurirId?: string; layananId?: string; status?: string };
const RE = /^\d{4}-\d{2}-\d{2}$/;

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 shrink-0 truncate text-slate-600">{label}</span>
      <div className="h-5 flex-1 rounded bg-slate-100">
        <div className={`h-5 rounded ${color}`} style={{ width: `${max ? Math.max((value / max) * 100, value ? 2 : 0) : 0}%` }} />
      </div>
      <span className="w-10 text-right font-medium">{value}</span>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const sekarang = new Date();
  const dari = sp.dari && RE.test(sp.dari) ? sp.dari : isoDateWIB(new Date(sekarang.getTime() - 29 * 86400000));
  const sampai = sp.sampai && RE.test(sp.sampai) ? sp.sampai : isoDateWIB(sekarang);
  const status = STATUS_LIST.includes(sp.status as StatusPaket) ? (sp.status as StatusPaket) : undefined;

  const where: Prisma.PengirimanWhereInput = {
    paket: { tanggalMasuk: { gte: awalHariWIB(dari), lte: akhirHariWIB(sampai) } },
    ...(sp.kurirId ? { kurirId: sp.kurirId } : {}),
    ...(sp.layananId ? { layananId: sp.layananId } : {}),
    ...(status ? { statusTerakhir: status } : {}),
  };

  const [grpStatus, grpLayanan, pendapatan, rows, kurirs, layanans] = await Promise.all([
    prisma.pengiriman.groupBy({ by: ["statusTerakhir"], where, _count: { _all: true } }),
    prisma.pengiriman.groupBy({ by: ["layananId"], where, _count: { _all: true } }),
    prisma.pengiriman.aggregate({ where: { ...where, statusBayar: "LUNAS" }, _sum: { totalOngkir: true } }),
    prisma.pengiriman.findMany({
      where,
      take: 200,
      orderBy: { paket: { tanggalMasuk: "desc" } },
      include: { paket: true, layanan: true, kurir: { include: { user: { select: { nama: true } } } } },
    }),
    prisma.kurir.findMany({ where: { disetujui: true }, include: { user: { select: { nama: true } } }, orderBy: { user: { nama: "asc" } } }),
    prisma.layanan.findMany({ orderBy: { nama: "asc" } }),
  ]);

  const nStatus = (s: StatusPaket) => grpStatus.find((g) => g.statusTerakhir === s)?._count._all ?? 0;
  const total = grpStatus.reduce((a, g) => a + g._count._all, 0);
  const maxStatus = Math.max(0, ...STATUS_LIST.map(nStatus));
  const maxLayanan = Math.max(0, ...grpLayanan.map((g) => g._count._all));
  const warna: Record<StatusPaket, string> = {
    DIPROSES: "bg-slate-400", DALAM_PERJALANAN: "bg-blue-500", SUDAH_DITERIMA: "bg-emerald-500", TERTUNDA: "bg-amber-500",
  };

  return (
    <>
      <PageHeader title="Laporan" desc={`Periode ${fmtTanggal(awalHariWIB(dari))} – ${fmtTanggal(awalHariWIB(sampai))}`}>
        <PrintButton />
      </PageHeader>

      <form className="no-print mb-5 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <label className="text-xs text-slate-500">Dari<input type="date" name="dari" defaultValue={dari} className={inputCls} /></label>
        <label className="text-xs text-slate-500">Sampai<input type="date" name="sampai" defaultValue={sampai} className={inputCls} /></label>
        <label className="text-xs text-slate-500">Kurir
          <select name="kurirId" defaultValue={sp.kurirId ?? ""} className={inputCls}>
            <option value="">Semua</option>
            {kurirs.map((k) => <option key={k.id} value={k.id}>{k.user.nama}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">Layanan
          <select name="layananId" defaultValue={sp.layananId ?? ""} className={inputCls}>
            <option value="">Semua</option>
            {layanans.map((l) => <option key={l.id} value={l.id}>{l.nama}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">Status
          <select name="status" defaultValue={status ?? ""} className={inputCls}>
            <option value="">Semua</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </label>
        <div className="flex items-end"><button className={`${btnCls} w-full`}>Terapkan</button></div>
      </form>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Jumlah paket" value={total} />
        <Stat label="Pengiriman berhasil" value={nStatus("SUDAH_DITERIMA")} tone="text-emerald-600" />
        <Stat label="Paket tertunda" value={nStatus("TERTUNDA")} tone="text-amber-600" />
        <Stat label="Pendapatan (lunas)" value={rupiah(pendapatan._sum.totalOngkir ?? 0)} tone="text-blue-700" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card title="Paket per status">
          <div className="space-y-2">
            {STATUS_LIST.map((s) => <Bar key={s} label={STATUS_LABEL[s]} value={nStatus(s)} max={maxStatus} color={warna[s]} />)}
          </div>
        </Card>
        <Card title="Paket per layanan">
          <div className="space-y-2">
            {layanans.map((l) => (
              <Bar key={l.id} label={l.nama} value={grpLayanan.find((g) => g.layananId === l.id)?._count._all ?? 0} max={maxLayanan} color="bg-blue-500" />
            ))}
          </div>
        </Card>
      </div>

      <Card title="Rincian paket" className="mt-5">
        {rows.length === 0 ? (
          <Empty>Tidak ada data pada periode ini.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Resi</th><th className="py-2 pr-3">Tanggal</th><th className="py-2 pr-3">Layanan</th>
                  <th className="py-2 pr-3">Kurir</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Bayar</th><th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3 font-mono">{r.paket.noResi}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{fmtTanggal(r.paket.tanggalMasuk)}</td>
                    <td className="py-2 pr-3">{r.layanan.nama}</td>
                    <td className="py-2 pr-3">{r.kurir?.user.nama ?? "—"}</td>
                    <td className="py-2 pr-3"><StatusBadge status={r.statusTerakhir} /></td>
                    <td className="py-2 pr-3"><BayarBadge lunas={r.statusBayar === "LUNAS"} /></td>
                    <td className="py-2 text-right">{rupiah(r.totalOngkir)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rows.length === 200 && <p className="mt-3 text-xs text-slate-500">Tabel menampilkan 200 paket terbaru; angka ringkasan di atas mencakup seluruh data pada filter.</p>}
      </Card>
    </>
  );
}
