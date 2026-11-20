import { simpanLayanan, simpanTarif } from "@/actions/master";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Flash, PageHeader, btnSm, btnCls, inputCls } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const row = "grid items-end gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-7";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; s?: string }> }) {
  await requireRole("ADMIN");
  const { e, s } = await searchParams;
  const [layanans, tarifs] = await Promise.all([
    prisma.layanan.findMany({ orderBy: { estimasiHariMax: "desc" } }),
    prisma.tarif.findMany({ orderBy: { zona: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Layanan & Tarif" desc="Ongkir = tarif per kg × berat (dibulatkan ke atas) × pengali layanan + biaya tambahan. Perubahan hanya berlaku untuk paket baru." />
      <Flash e={e} s={s} />

      <Card title="Jenis layanan" className="mb-5">
        <div className="space-y-2">
          {layanans.map((l) => (
            <form key={l.id} action={simpanLayanan} className={row}>
              <input type="hidden" name="id" value={l.id} />
              <Field label="Nama"><input name="nama" required defaultValue={l.nama} className={inputCls} /></Field>
              <Field label="Pengali"><input name="pengaliTarif" required type="number" step="0.01" defaultValue={Number(l.pengaliTarif)} className={inputCls} /></Field>
              <Field label="Estimasi min (hari)"><input name="estimasiHariMin" required type="number" min="0" defaultValue={l.estimasiHariMin} className={inputCls} /></Field>
              <Field label="Estimasi maks (hari)"><input name="estimasiHariMax" required type="number" min="0" defaultValue={l.estimasiHariMax} className={inputCls} /></Field>
              <Field label="Jam cutoff (HH:mm)"><input name="jamCutoff" placeholder="14:00" defaultValue={l.jamCutoff ?? ""} className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked={l.aktif} /> Aktif</label>
              <SubmitButton className={`${btnCls} ${btnSm}`}>Simpan</SubmitButton>
            </form>
          ))}
          <details className="rounded-lg border border-dashed border-slate-300 p-3">
            <summary className="cursor-pointer text-sm font-medium text-blue-700">+ Tambah layanan</summary>
            <form action={simpanLayanan} className={`${row} mt-3 border-0 p-0`}>
              <Field label="Nama"><input name="nama" required className={inputCls} /></Field>
              <Field label="Pengali"><input name="pengaliTarif" required type="number" step="0.01" defaultValue="1" className={inputCls} /></Field>
              <Field label="Estimasi min"><input name="estimasiHariMin" required type="number" min="0" defaultValue="1" className={inputCls} /></Field>
              <Field label="Estimasi maks"><input name="estimasiHariMax" required type="number" min="0" defaultValue="2" className={inputCls} /></Field>
              <Field label="Jam cutoff"><input name="jamCutoff" placeholder="14:00" className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked /> Aktif</label>
              <SubmitButton className={`${btnCls} ${btnSm}`}>Tambah</SubmitButton>
            </form>
          </details>
        </div>
        <p className="mt-2 text-xs text-slate-500">Jam cutoff hanya berlaku untuk layanan hari yang sama (estimasi maks 0).</p>
      </Card>

      <Card title="Tarif per zona tujuan">
        <div className="space-y-2">
          {tarifs.map((t) => (
            <form key={t.id} action={simpanTarif} className={row}>
              <input type="hidden" name="id" value={t.id} />
              <Field label="Zona / kota"><input name="zona" required defaultValue={t.zona} className={inputCls} /></Field>
              <Field label="Tarif per kg (Rp)"><input name="tarifPerKg" required type="number" min="0" step="500" defaultValue={t.tarifPerKg} className={inputCls} /></Field>
              <Field label="Latitude"><input name="latitude" defaultValue={t.latitude ?? ""} className={inputCls} /></Field>
              <Field label="Longitude"><input name="longitude" defaultValue={t.longitude ?? ""} className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked={t.aktif} /> Aktif</label>
              <span />
              <SubmitButton className={`${btnCls} ${btnSm}`}>Simpan</SubmitButton>
            </form>
          ))}
          <details className="rounded-lg border border-dashed border-slate-300 p-3">
            <summary className="cursor-pointer text-sm font-medium text-blue-700">+ Tambah zona</summary>
            <form action={simpanTarif} className={`${row} mt-3 border-0 p-0`}>
              <Field label="Zona / kota"><input name="zona" required className={inputCls} /></Field>
              <Field label="Tarif per kg (Rp)"><input name="tarifPerKg" required type="number" min="0" step="500" className={inputCls} /></Field>
              <Field label="Latitude"><input name="latitude" className={inputCls} /></Field>
              <Field label="Longitude"><input name="longitude" className={inputCls} /></Field>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="aktif" defaultChecked /> Aktif</label>
              <span />
              <SubmitButton className={`${btnCls} ${btnSm}`}>Tambah</SubmitButton>
            </form>
          </details>
        </div>
        <p className="mt-2 text-xs text-slate-500">Koordinat dipakai untuk pin tujuan di peta pelacakan (opsional).</p>
      </Card>
    </>
  );
}
