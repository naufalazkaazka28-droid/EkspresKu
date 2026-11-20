import type { StatusPaket } from "@prisma/client";
import { ubahStatus } from "@/actions/paket";
import { STATUS_LABEL, TRANSISI } from "@/lib/status";
import SubmitButton from "./SubmitButton";
import { Card, Field, inputCls } from "./ui";

export default function UpdateStatusForm({
  paketId,
  current,
  lokasis,
}: {
  paketId: string;
  current: StatusPaket;
  lokasis: { id: string; nama: string }[];
}) {
  const opsi = TRANSISI[current];
  return (
    <Card title="Perbarui status">
      {opsi.length === 0 ? (
        <p className="text-sm text-slate-600">Paket sudah diterima. Status tidak bisa diubah lagi.</p>
      ) : (
        <form action={ubahStatus} className="space-y-3">
          <input type="hidden" name="paketId" value={paketId} />
          <Field label="Status baru">
            <select name="status" required className={inputCls}>
              {opsi.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lokasi saat ini (opsional)" hint="Dipakai untuk menggambar posisi paket di peta.">
            <select name="lokasiId" className={inputCls} defaultValue="">
              <option value="">— Tidak dipilih —</option>
              {lokasis.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nama penerima" hint="Wajib bila status menjadi Sudah Diterima.">
            <input name="diterimaOleh" className={inputCls} />
          </Field>
          <Field label="Keterangan / alasan" hint="Wajib bila status menjadi Tertunda.">
            <textarea name="keterangan" rows={2} className={inputCls} />
          </Field>
          <SubmitButton>Simpan status</SubmitButton>
        </form>
      )}
    </Card>
  );
}
