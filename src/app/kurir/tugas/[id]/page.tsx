import Link from "next/link";
import { notFound } from "next/navigation";
import PaketInfo from "@/components/PaketInfo";
import TrackingPanel from "@/components/TrackingPanel";
import UpdateStatusForm from "@/components/UpdateStatusForm";
import { Flash, PageHeader, btnGhost } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { paketInclude, toPanel } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string; s?: string }>;
}) {
  const user = await requireRole("KURIR");
  const { id } = await params;
  const { e, s } = await searchParams;

  const [p, lokasis] = await Promise.all([
    prisma.paket.findUnique({ where: { id }, include: paketInclude }),
    prisma.lokasi.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);
  // Kurir hanya boleh melihat paket miliknya sendiri
  if (!p || !p.pengiriman || p.pengiriman.kurirId !== user.kurir!.id) notFound();

  return (
    <>
      <PageHeader title={p.noResi}>
        <Link href="/kurir/tugas" className={btnGhost}>← Kembali</Link>
      </PageHeader>
      <Flash e={e} s={s} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
          <PaketInfo p={p} />
          <TrackingPanel data={toPanel(p)} tujuanNama={p.pengiriman.tarif.zona} />
        </div>
        <div className="order-1 lg:order-2">
          <UpdateStatusForm paketId={p.id} current={p.pengiriman.statusTerakhir} lokasis={lokasis} />
        </div>
      </div>
    </>
  );
}
