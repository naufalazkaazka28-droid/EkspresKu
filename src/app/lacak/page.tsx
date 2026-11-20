import Link from "next/link";
import TrackingPanel from "@/components/TrackingPanel";
import { btnCls, inputCls } from "@/components/ui";
import { maskNama } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { paketInclude, toPanel } from "@/lib/queries";

export const metadata = { title: "Lacak Paket — EkspresKu", referrer: "no-referrer" };

export default async function Page({ searchParams }: { searchParams: Promise<{ resi?: string; kode?: string }> }) {
  const { resi, kode } = await searchParams;
  const q = resi?.trim().toUpperCase();
  const token = kode?.trim();
  const paket = q && token && /^[0-9a-f]{64}$/i.test(token)
    ? await prisma.paket.findFirst({ where: { noResi: q, trackingToken: token }, include: paketInclude })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-xl font-bold text-blue-700">
        Ekspres<span className="text-slate-900">Ku</span>
      </Link>
      <h1 className="mb-4 mt-4 text-2xl font-bold text-slate-900">Lacak paket</h1>

      <form className="mb-6 flex flex-col gap-2">
        <input name="resi" defaultValue={q ?? ""} required placeholder="Nomor resi" className={inputCls} />
        <input name="kode" required placeholder="Kode pelacakan" className={inputCls} />
        <button className={`${btnCls} whitespace-nowrap`}>Lacak</button>
      </form>

      {q && !paket && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Nomor resi atau kode pelacakan salah. Periksa kembali data yang dimasukkan.
        </div>
      )}

      {paket && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <span className="text-slate-500">Pengirim:</span> {maskNama(paket.namaPengirim)}
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-slate-500">Penerima:</span> {maskNama(paket.namaPenerima)}
          </div>
          <TrackingPanel data={toPanel(paket, true)} tujuanNama={paket.pengiriman?.tarif.zona} />
        </div>
      )}
    </div>
  );
}
