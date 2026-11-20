"use client";

import { useState, useTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { buatPaket, previewOngkir } from "@/actions/paket";
import type { FormState, Preview } from "@/lib/types";
import { rupiah } from "@/lib/format";
import { Card, Field, btnCls, btnGhost, inputCls } from "./ui";

type Values = {
  namaPengirim: string;
  telpPengirim: string;
  alamatAsal: string;
  namaPenerima: string;
  telpPenerima: string;
  alamatTujuan: string;
  beratKg: string;
  isiPaket: string;
  tarifId: string;
  layananId: string;
  pelangganId: string;
  biayaTambahan: string;
  keteranganBiaya: string;
};

const KOSONG: Values = {
  namaPengirim: "", telpPengirim: "", alamatAsal: "", namaPenerima: "", telpPenerima: "", alamatTujuan: "",
  beratKg: "", isiPaket: "", tarifId: "", layananId: "", pelangganId: "", biayaTambahan: "0", keteranganBiaya: "",
};

type Props = {
  tarifs: { id: string; zona: string; tarifPerKg: number }[];
  layanans: { id: string; nama: string; estimasiHariMin: number; estimasiHariMax: number }[];
  defaults?: Partial<Values>;
  adminMode?: boolean;
  pelanggan?: { id: string; label: string }[];
};

export default function PaketForm({ tarifs, layanans, defaults, adminMode, pelanggan = [] }: Props) {
  const [v, setV] = useState<Values>({ ...KOSONG, ...defaults });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();
  const fe = state.fieldErrors ?? {};

  const set = (k: keyof Values) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setV({ ...v, [k]: e.target.value });
    setPreview(null); // data berubah, hitungan harus diulang
    setState({});
  };

  const toFormData = () => {
    const fd = new FormData();
    (Object.keys(v) as (keyof Values)[]).forEach((k) => fd.append(k, v[k]));
    return fd;
  };

  function hitung(e: FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await previewOngkir(toFormData());
      setState({ error: r.error, fieldErrors: r.fieldErrors });
      setPreview(r.preview ?? null);
    });
  }

  function konfirmasi() {
    start(async () => {
      const r = await buatPaket(toFormData());
      if (r) setState(r); // jika sukses, server melakukan redirect
    });
  }

  return (
    <form onSubmit={hitung} className="space-y-4">
      {state.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}

      {adminMode && (
        <Card title="Pemilik paket (admin)">
          <Field label="Pelanggan terdaftar" hint="Kosongkan untuk pelanggan walk-in tanpa akun.">
            <select value={v.pelangganId} onChange={set("pelangganId")} className={inputCls}>
              <option value="">— Walk-in (tanpa akun) —</option>
              {pelanggan.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Data pengirim">
          <div className="space-y-3">
            <Field label="Nama pengirim" error={fe.namaPengirim}>
              <input required value={v.namaPengirim} onChange={set("namaPengirim")} className={inputCls} />
            </Field>
            <Field label="Nomor HP pengirim" error={fe.telpPengirim}>
              <input required type="tel" value={v.telpPengirim} onChange={set("telpPengirim")} className={inputCls} />
            </Field>
            <Field label="Alamat asal" error={fe.alamatAsal}>
              <textarea required rows={2} value={v.alamatAsal} onChange={set("alamatAsal")} className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="Data penerima">
          <div className="space-y-3">
            <Field label="Nama penerima" error={fe.namaPenerima}>
              <input required value={v.namaPenerima} onChange={set("namaPenerima")} className={inputCls} />
            </Field>
            <Field label="Nomor HP penerima" error={fe.telpPenerima}>
              <input required type="tel" value={v.telpPenerima} onChange={set("telpPenerima")} className={inputCls} />
            </Field>
            <Field label="Alamat tujuan" error={fe.alamatTujuan}>
              <textarea required rows={2} value={v.alamatTujuan} onChange={set("alamatTujuan")} className={inputCls} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="Paket dan layanan">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Isi paket" error={fe.isiPaket}>
            <input required value={v.isiPaket} onChange={set("isiPaket")} className={inputCls} />
          </Field>
          <Field label="Berat (kg)" error={fe.beratKg} hint="Dibulatkan ke atas per kg saat dihitung.">
            <input required type="number" min="0.01" step="0.01" value={v.beratKg} onChange={set("beratKg")} className={inputCls} />
          </Field>
          <Field label="Zona tujuan" error={fe.tarifId}>
            <select required value={v.tarifId} onChange={set("tarifId")} className={inputCls}>
              <option value="">— Pilih zona —</option>
              {tarifs.map((t) => (
                <option key={t.id} value={t.id}>{t.zona}</option>
              ))}
            </select>
          </Field>
          <Field label="Jenis layanan" error={fe.layananId}>
            <select required value={v.layananId} onChange={set("layananId")} className={inputCls}>
              <option value="">— Pilih layanan —</option>
              {layanans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama} ({l.estimasiHariMax === 0 ? "hari yang sama" : l.estimasiHariMin === l.estimasiHariMax ? `${l.estimasiHariMax} hari` : `${l.estimasiHariMin}–${l.estimasiHariMax} hari`})
                </option>
              ))}
            </select>
          </Field>
          {adminMode && (
            <>
              <Field label="Biaya tambahan (Rp)" error={fe.biayaTambahan}>
                <input type="number" min="0" step="500" value={v.biayaTambahan} onChange={set("biayaTambahan")} className={inputCls} />
              </Field>
              <Field label="Keterangan biaya tambahan">
                <input value={v.keteranganBiaya} onChange={set("keteranganBiaya")} placeholder="Contoh: packing kayu" className={inputCls} />
              </Field>
            </>
          )}
        </div>
      </Card>

      {!preview && (
        <button disabled={pending} className={btnCls}>
          {pending ? "Menghitung…" : "Hitung ongkos kirim"}
        </button>
      )}

      {preview && (
        <Card title="Ringkasan biaya — mohon periksa sebelum konfirmasi" className="border-blue-300 bg-blue-50/40">
          <dl className="grid gap-y-2 text-sm sm:grid-cols-2">
            <dt className="text-slate-600">Zona tujuan</dt>
            <dd className="font-medium">{preview.zona}</dd>
            <dt className="text-slate-600">Layanan</dt>
            <dd className="font-medium">{preview.layanan}</dd>
            <dt className="text-slate-600">Perhitungan</dt>
            <dd>
              {rupiah(preview.tarifPerKg)}/kg × {preview.beratDibulatkan} kg × {preview.pengali}
            </dd>
            <dt className="text-slate-600">Ongkos kirim</dt>
            <dd>{rupiah(preview.ongkir)}</dd>
            {preview.biayaTambahan > 0 && (
              <>
                <dt className="text-slate-600">Biaya tambahan</dt>
                <dd>{rupiah(preview.biayaTambahan)}</dd>
              </>
            )}
            <dt className="font-semibold text-slate-800">Total</dt>
            <dd className="text-lg font-bold text-blue-700">{rupiah(preview.total)}</dd>
            <dt className="text-slate-600">Estimasi sampai</dt>
            <dd>
              {preview.estimasiTeks} (± {preview.estimasiTiba})
            </dd>
          </dl>
          <p className="mt-3 text-xs text-slate-500">
            Setelah dikonfirmasi, sistem membuat nomor resi otomatis dan paket tersimpan dengan status Diproses.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={konfirmasi} disabled={pending} className={btnCls}>
              {pending ? "Menyimpan…" : "Konfirmasi & buat resi"}
            </button>
            <button type="button" onClick={() => setPreview(null)} disabled={pending} className={btnGhost}>
              Ubah data
            </button>
          </div>
        </Card>
      )}
    </form>
  );
}
