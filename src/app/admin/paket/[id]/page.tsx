import Link from "next/link";
import { notFound } from "next/navigation";
import { hapusPaket, setBayar, tugaskanKurir, ubahPaket } from "@/actions/paket";
import PaketInfo from "@/components/PaketInfo";
import SubmitButton from "@/components/SubmitButton";
import TrackingPanel from "@/components/TrackingPanel";
import UpdateStatusForm from "@/components/UpdateStatusForm";
import { Card, Field, Flash, PageHeader, btnDanger, btnGhost, inputCls } from "@/components/ui";
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
  await requireRole("ADMIN");
  const { id } = await params;
  const { e, s } = await searchParams;

  const [p, kurirs, lokasis] = await Promise.all([
    prisma.paket.findUnique({ where: { id }, include: paketInclude }),
    prisma.kurir.findMany({
      where: { aktif: true, disetujui: true, user: { aktif: true } },
      include: { user: { select: { nama: true } } },
      orderBy: { user: { nama: "asc" } },
    }),
    prisma.lokasi.findMany({ where: { aktif: true }, orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);
  if (!p || !p.pengiriman) notFound();
  const g = p.pengiriman;
  const lunas = g.statusBayar === "LUNAS";

  return (
    <>
      <PageHeader title={p.noResi} desc={p.pelanggan ? `Pelanggan: ${p.pelanggan.nama}` : "Pelanggan walk-in"}>
        <Link href="/admin/paket" className={btnGhost}>← Kembali</Link>
      </PageHeader>
      <Flash e={e} s={s} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PaketInfo p={p} />
          <Card title="Kode pelacakan">
            <p className="break-all font-mono text-sm text-slate-800">{p.trackingToken}</p>
            <p className="mt-2 text-xs text-slate-500">Bagikan hanya kepada pihak yang berhak melacak paket ini.</p>
          </Card>
          <TrackingPanel data={toPanel(p)} tujuanNama={g.tarif.zona} />
        </div>

        <div className="space-y-4">
          <Card title="Kurir">
            {g.statusTerakhir === "SUDAH_DITERIMA" ? (
              <p className="text-sm text-slate-600">Paket sudah selesai.</p>
            ) : (
              <form action={tugaskanKurir} className="space-y-3">
                <input type="hidden" name="paketId" value={p.id} />
                <Field label="Tugaskan ke">
                  <select name="kurirId" required defaultValue={g.kurirId ?? ""} className={inputCls}>
                    <option value="" disabled>— Pilih kurir —</option>
                    {kurirs.map((k) => (
                      <option key={k.id} value={k.id}>{k.user.nama} · {k.wilayahTugas}</option>
                    ))}
                  </select>
                </Field>
                <SubmitButton>Simpan penugasan</SubmitButton>
              </form>
            )}
          </Card>

          <Card title="Pembayaran">
            <form action={setBayar}>
              <input type="hidden" name="paketId" value={p.id} />
              <input type="hidden" name="lunas" value={lunas ? "0" : "1"} />
              <SubmitButton className={btnGhost}>{lunas ? "Batalkan status lunas" : "Tandai lunas"}</SubmitButton>
            </form>
          </Card>

          <UpdateStatusForm paketId={p.id} current={g.statusTerakhir} lokasis={lokasis} />

          <Card title="Ubah data paket">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-blue-700">Buka formulir</summary>
              <form action={ubahPaket} className="mt-3 space-y-3">
                <input type="hidden" name="paketId" value={p.id} />
                <Field label="Nama pengirim"><input name="namaPengirim" required defaultValue={p.namaPengirim} className={inputCls} /></Field>
                <Field label="HP pengirim"><input name="telpPengirim" required defaultValue={p.telpPengirim} className={inputCls} /></Field>
                <Field label="Alamat asal"><textarea name="alamatAsal" required rows={2} defaultValue={p.alamatAsal} className={inputCls} /></Field>
                <Field label="Nama penerima"><input name="namaPenerima" required defaultValue={p.namaPenerima} className={inputCls} /></Field>
                <Field label="HP penerima"><input name="telpPenerima" required defaultValue={p.telpPenerima} className={inputCls} /></Field>
                <Field label="Alamat tujuan"><textarea name="alamatTujuan" required rows={2} defaultValue={p.alamatTujuan} className={inputCls} /></Field>
                <Field label="Isi paket"><input name="isiPaket" required defaultValue={p.isiPaket} className={inputCls} /></Field>
                <p className="text-xs text-slate-500">Berat, zona, dan layanan tidak bisa diubah karena memengaruhi ongkir. Buat paket baru bila perlu.</p>
                <SubmitButton>Simpan perubahan</SubmitButton>
              </form>
            </details>
          </Card>

          <Card title="Hapus paket">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-red-600">Hapus paket ini…</summary>
              <form action={hapusPaket} className="mt-3 space-y-2">
                <input type="hidden" name="paketId" value={p.id} />
                <p className="text-sm text-slate-600">Paket beserta seluruh riwayat pelacakannya dihapus permanen.</p>
                <SubmitButton className={btnDanger}>Ya, hapus permanen</SubmitButton>
              </form>
            </details>
          </Card>
        </div>
      </div>
    </>
  );
}
