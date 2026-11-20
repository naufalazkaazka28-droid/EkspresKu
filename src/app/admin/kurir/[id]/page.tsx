import Link from "next/link";
import { notFound } from "next/navigation";
import { ubahKurir } from "@/actions/kurir";
import PaketTable from "@/components/PaketTable";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Flash, PageHeader, btnGhost, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string; s?: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const { e, s } = await searchParams;
  const k = await prisma.kurir.findUnique({ where: { id }, include: { user: { select: { nama: true, email: true, noHp: true } } } });
  if (!k) notFound();
  const pakets = await prisma.paket.findMany({
    where: { pengiriman: { is: { kurirId: id } } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: listInclude,
  });

  return (
    <>
      <PageHeader title={k.user.nama} desc={`${k.user.email} · ${k.user.noHp ?? "-"}`}>
        <Link href="/admin/kurir" className={btnGhost}>← Kembali</Link>
      </PageHeader>
      <Flash e={e} s={s} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Data kurir">
          <form action={ubahKurir} className="space-y-3">
            <input type="hidden" name="kurirId" value={k.id} />
            <Field label="Kendaraan"><input name="kendaraan" required defaultValue={k.kendaraan} className={inputCls} /></Field>
            <Field label="Plat nomor"><input name="platNomor" required defaultValue={k.platNomor} className={inputCls} /></Field>
            <Field label="Wilayah tugas"><input name="wilayahTugas" required defaultValue={k.wilayahTugas} className={inputCls} /></Field>
            <SubmitButton>Simpan</SubmitButton>
          </form>
        </Card>
        <Card title="Paket yang ditangani" className="lg:col-span-2">
          <PaketTable rows={pakets} base="/admin/paket" showKurir={false} />
        </Card>
      </div>
    </>
  );
}
