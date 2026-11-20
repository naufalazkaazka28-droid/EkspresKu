import Link from "next/link";
import PaketTable from "@/components/PaketTable";
import { Card, PageHeader, Stat, btnCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page() {
  const user = await requireRole("PELANGGAN");
  const [grp, terbaru] = await Promise.all([
    prisma.pengiriman.groupBy({ by: ["statusTerakhir"], where: { paket: { pelangganId: user.id } }, _count: { _all: true } }),
    prisma.paket.findMany({ where: { pelangganId: user.id }, orderBy: { createdAt: "desc" }, take: 5, include: listInclude }),
  ]);
  const n = (s: string) => grp.find((g) => g.statusTerakhir === s)?._count._all ?? 0;
  const total = grp.reduce((a, g) => a + g._count._all, 0);

  return (
    <>
      <PageHeader title={`Halo, ${user.nama}`} desc="Kirim paket baru atau pantau pengiriman Anda.">
        <Link href="/pelanggan/buat" className={btnCls}>+ Buat pengiriman</Link>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total paket" value={total} />
        <Stat label="Diproses" value={n("DIPROSES")} />
        <Stat label="Dalam perjalanan" value={n("DALAM_PERJALANAN") + n("TERTUNDA")} tone="text-blue-700" />
        <Stat label="Sudah diterima" value={n("SUDAH_DITERIMA")} tone="text-emerald-600" />
      </div>
      <Card title="Paket terbaru" className="mt-5" action={<Link href="/pelanggan/riwayat" className="text-sm text-blue-700 hover:underline">Semua riwayat</Link>}>
        <PaketTable rows={terbaru} base="/pelanggan/paket" showKurir={false} />
      </Card>
    </>
  );
}
