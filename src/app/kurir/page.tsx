import Link from "next/link";
import PaketTable from "@/components/PaketTable";
import { Card, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page() {
  const user = await requireRole("KURIR");
  const kurirId = user.kurir!.id;
  const [grp, aktif] = await Promise.all([
    prisma.pengiriman.groupBy({ by: ["statusTerakhir"], where: { kurirId }, _count: { _all: true } }),
    prisma.paket.findMany({
      where: { pengiriman: { is: { kurirId, statusTerakhir: { in: ["DIPROSES", "DALAM_PERJALANAN", "TERTUNDA"] } } } },
      orderBy: { createdAt: "asc" },
      include: listInclude,
    }),
  ]);
  const n = (s: string) => grp.find((g) => g.statusTerakhir === s)?._count._all ?? 0;

  return (
    <>
      <PageHeader title={`Halo, ${user.nama}`} desc={`${user.kurir!.kendaraan} ${user.kurir!.platNomor} · wilayah ${user.kurir!.wilayahTugas}`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Perlu diambil" value={n("DIPROSES")} />
        <Stat label="Dalam perjalanan" value={n("DALAM_PERJALANAN")} tone="text-blue-700" />
        <Stat label="Tertunda" value={n("TERTUNDA")} tone="text-amber-600" />
        <Stat label="Berhasil diantar" value={n("SUDAH_DITERIMA")} tone="text-emerald-600" />
      </div>
      <Card title="Tugas aktif" className="mt-5" action={<Link href="/kurir/tugas" className="text-sm text-blue-700 hover:underline">Semua tugas</Link>}>
        <PaketTable rows={aktif} base="/kurir/tugas" showKurir={false} />
      </Card>
    </>
  );
}
