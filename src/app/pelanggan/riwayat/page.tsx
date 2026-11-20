import PaketTable from "@/components/PaketTable";
import { Card, PageHeader, btnCls, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireRole("PELANGGAN");
  const q = (await searchParams).q?.trim();
  const rows = await prisma.paket.findMany({
    where: {
      pelangganId: user.id,
      ...(q ? { OR: [{ noResi: { contains: q, mode: "insensitive" } }, { namaPenerima: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: listInclude,
  });
  return (
    <>
      <PageHeader title="Riwayat pengiriman" />
      <Card>
        <form className="mb-4 flex gap-2">
          <input name="q" defaultValue={q ?? ""} placeholder="Cari resi atau nama penerima" className={inputCls} />
          <button className={btnCls}>Cari</button>
        </form>
        <PaketTable rows={rows} base="/pelanggan/paket" showKurir={false} />
      </Card>
    </>
  );
}
