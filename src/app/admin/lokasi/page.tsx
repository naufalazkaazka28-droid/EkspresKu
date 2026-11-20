import type { JenisLokasi } from "@prisma/client";
import { simpanLokasi } from "@/actions/master";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Flash, PageHeader, btnCls, btnSm, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const row = "grid items-end gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-7";
const JENIS: JenisLokasi[] = ["AGEN", "HUB", "TRANSIT"];

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; s?: string }> }) {
  await requireRole("ADMIN");
  const { e, s } = await searchParams;
  const lokasis = await prisma.lokasi.findMany({ orderBy: [{ jenis: "asc" }, { nama: "asc" }] });

  return (
    <>
      <PageHeader title="Lokasi" desc="Titik agen, hub, dan transit untuk riwayat dan peta pelacakan. Lokasi AGEN pertama (urut nama) menjadi titik awal setiap paket baru." />
      <Flash e={e} s={s} />
      <Card>
        <div className="space-y-2">
          {lokasis.map((l) => (
            <form key={l.id} action={simpanLokasi} className={row}>
              <input type="hidden" name="id" value={l.id} />
              <Field label="Nama"><input name="nama" required defaultValue={l.nama} className={inputCls} /></Field>
              <Field label="Kota"><input name="kota" required defaultValue={l.kota} className={inputCls} /></Field>
              <Field label="Jenis">
                <select name="jenis" defaultValue={l.jenis} className={inputCls}>
                  {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </Field>
              <Field label="Latitude"><input name="latitude" required defaultValue={l.latitude} className={inputCls} /></Field>
              <Field label="Longitude"><input name="longitude" required defaultValue={l.longitude} className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked={l.aktif} /> Aktif</label>
              <SubmitButton className={`${btnCls} ${btnSm}`}>Simpan</SubmitButton>
            </form>
          ))}
          <details className="rounded-lg border border-dashed border-slate-300 p-3">
            <summary className="cursor-pointer text-sm font-medium text-blue-700">+ Tambah lokasi</summary>
            <form action={simpanLokasi} className={`${row} mt-3 border-0 p-0`}>
              <Field label="Nama"><input name="nama" required className={inputCls} /></Field>
              <Field label="Kota"><input name="kota" required className={inputCls} /></Field>
              <Field label="Jenis">
                <select name="jenis" defaultValue="HUB" className={inputCls}>
                  {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </Field>
              <Field label="Latitude"><input name="latitude" required placeholder="-7.15" className={inputCls} /></Field>
              <Field label="Longitude"><input name="longitude" required placeholder="111.88" className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked /> Aktif</label>
              <SubmitButton className={`${btnCls} ${btnSm}`}>Tambah</SubmitButton>
            </form>
          </details>
        </div>
        <p className="mt-2 text-xs text-slate-500">Tips: klik kanan lokasi di openstreetmap.org → &quot;Show address&quot; / salin koordinat.</p>
      </Card>
    </>
  );
}
