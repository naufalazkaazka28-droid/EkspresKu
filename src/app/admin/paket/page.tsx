import Link from "next/link";
import type { Prisma, StatusPaket } from "@prisma/client";
import PaketTable from "@/components/PaketTable";
import { Card, Flash, PageHeader, btnCls, btnGhost, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";
import { STATUS_LABEL, STATUS_LIST } from "@/lib/status";

type SP = { q?: string; status?: string; bayar?: string; kurir?: string; e?: string; s?: string };

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const q = sp.q?.trim();
  const status = STATUS_LIST.includes(sp.status as StatusPaket) ? (sp.status as StatusPaket) : undefined;
  const bayar = sp.bayar === "LUNAS" || sp.bayar === "BELUM_BAYAR" ? sp.bayar : undefined;

  const where: Prisma.PaketWhereInput = {
    ...(q
      ? {
          OR: [
            { noResi: { contains: q, mode: "insensitive" } },
            { namaPengirim: { contains: q, mode: "insensitive" } },
            { namaPenerima: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    pengiriman: {
      is: {
        ...(status ? { statusTerakhir: status } : {}),
        ...(bayar ? { statusBayar: bayar } : {}),
        ...(sp.kurir === "belum" ? { kurirId: null } : {}),
      },
    },
  };

  const rows = await prisma.paket.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: listInclude });

  return (
    <>
      <PageHeader title="Data Paket" desc="Cari, filter, dan kelola semua paket.">
        <Link href="/admin/paket/baru" className={btnCls}>+ Paket baru</Link>
      </PageHeader>
      <Flash e={sp.e} s={sp.s} />
      <Card>
        <form className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <input name="q" defaultValue={q ?? ""} placeholder="Cari resi / pengirim / penerima" className={`${inputCls} lg:col-span-2`} />
          <select name="status" defaultValue={status ?? ""} className={inputCls}>
            <option value="">Semua status</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select name="bayar" defaultValue={bayar ?? ""} className={inputCls}>
            <option value="">Semua pembayaran</option>
            <option value="BELUM_BAYAR">Belum bayar</option>
            <option value="LUNAS">Lunas</option>
          </select>
          <select name="kurir" defaultValue={sp.kurir ?? ""} className={inputCls}>
            <option value="">Semua kurir</option>
            <option value="belum">Belum ada kurir</option>
          </select>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
            <button className={btnCls}>Terapkan</button>
            <Link href="/admin/paket" className={btnGhost}>Reset</Link>
          </div>
        </form>
        <PaketTable rows={rows} base="/admin/paket" />
        {rows.length === 100 && <p className="mt-3 text-xs text-slate-500">Menampilkan 100 paket terbaru. Persempit pencarian untuk hasil lain.</p>}
      </Card>
    </>
  );
}
