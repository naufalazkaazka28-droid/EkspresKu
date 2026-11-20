import Link from "next/link";
import { notFound } from "next/navigation";
import PaketInfo from "@/components/PaketInfo";
import TrackingPanel from "@/components/TrackingPanel";
import { Card, Flash, PageHeader, btnGhost } from "@/components/ui";
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
  const user = await requireRole("PELANGGAN");
  const { id } = await params;
  const { e, s } = await searchParams;
  const p = await prisma.paket.findUnique({ where: { id }, include: paketInclude });
  // Pelanggan hanya boleh melihat paket miliknya sendiri
  if (!p || !p.pengiriman || p.pelangganId !== user.id) notFound();

  return (
    <>
      <PageHeader title={p.noResi} desc="Untuk pelacakan publik, gunakan resi beserta kode pelacakan.">
        <Link href="/pelanggan/riwayat" className={btnGhost}>← Riwayat</Link>
      </PageHeader>
      <Flash e={e} s={s} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <PaketInfo p={p} />
          <Card title="Kode pelacakan">
            <p className="break-all font-mono text-sm text-slate-800">{p.trackingToken}</p>
            <p className="mt-2 text-xs text-slate-500">Simpan secara pribadi. Siapa pun yang memiliki kode ini dan nomor resi dapat melihat status paket.</p>
          </Card>
        </div>
        <div className="lg:col-span-2"><TrackingPanel data={toPanel(p)} tujuanNama={p.pengiriman.tarif.zona} /></div>
      </div>
    </>
  );
}
