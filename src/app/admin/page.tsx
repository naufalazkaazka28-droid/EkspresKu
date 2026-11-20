import Link from "next/link";
import PaketTable from "@/components/PaketTable";
import { Card, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page() {
  await requireRole("ADMIN");
  const [grp, belumTugas, belumBayar, menunggu, terbaru] = await Promise.all([
    prisma.pengiriman.groupBy({ by: ["statusTerakhir"], _count: { _all: true } }),
    prisma.pengiriman.count({ where: { kurirId: null, statusTerakhir: { not: "SUDAH_DITERIMA" } } }),
    prisma.pengiriman.count({ where: { statusBayar: "BELUM_BAYAR" } }),
    prisma.kurir.count({ where: { disetujui: false } }),
    prisma.paket.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: listInclude }),
  ]);
  const n = (s: string) => grp.find((g) => g.statusTerakhir === s)?._count._all ?? 0;

  return (
    <>
      <PageHeader title="Dashboard Admin" desc="Ringkasan operasional hari ini." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Diproses" value={n("DIPROSES")} />
        <Stat label="Dalam perjalanan" value={n("DALAM_PERJALANAN")} tone="text-blue-700" />
        <Stat label="Tertunda" value={n("TERTUNDA")} tone="text-amber-600" />
        <Stat label="Sudah diterima" value={n("SUDAH_DITERIMA")} tone="text-emerald-600" />
        <Stat label="Belum ada kurir" value={belumTugas} tone={belumTugas ? "text-red-600" : undefined} />
        <Stat label="Belum dibayar" value={belumBayar} />
        <Stat label="Kurir menunggu persetujuan" value={menunggu} tone={menunggu ? "text-red-600" : undefined} />
      </div>
      {menunggu > 0 && (
        <p className="mt-3 text-sm">
          <Link href="/admin/kurir" className="font-medium text-blue-700 hover:underline">Tinjau pendaftaran kurir →</Link>
        </p>
      )}
      <Card title="Paket terbaru" className="mt-5" action={<Link href="/admin/paket" className="text-sm text-blue-700 hover:underline">Lihat semua</Link>}>
        <PaketTable rows={terbaru} base="/admin/paket" />
      </Card>
    </>
  );
}
