import type { ReactNode } from "react";
import { fmtTanggal, fmtTanggalJam, rupiah } from "@/lib/format";
import type { PaketLengkap } from "@/lib/queries";
import { BayarBadge, Card } from "./ui";

export default function PaketInfo({ p, phones = true }: { p: PaketLengkap; phones?: boolean }) {
  const g = p.pengiriman;
  const rows: [string, ReactNode][] = [
    ["Tanggal masuk", fmtTanggalJam(p.tanggalMasuk)],
    ["Pengirim", phones ? <>{p.namaPengirim} · <a href={`tel:${p.telpPengirim}`} className="text-blue-700 underline">{p.telpPengirim}</a></> : p.namaPengirim],
    ["Alamat asal", p.alamatAsal],
    ["Penerima", phones ? <>{p.namaPenerima} · <a href={`tel:${p.telpPenerima}`} className="text-blue-700 underline">{p.telpPenerima}</a></> : p.namaPenerima],
    ["Alamat tujuan", p.alamatTujuan],
    ["Isi paket", p.isiPaket],
    ["Berat", `${Number(p.beratKg)} kg${g ? ` (dihitung ${g.beratDibulatkan} kg)` : ""}`],
  ];
  if (g) {
    rows.push(
      ["Layanan", `${g.layanan.nama} (estimasi tiba ${fmtTanggal(g.estimasiTiba)})`],
      ["Zona tujuan", `${g.tarif.zona} · ${rupiah(g.tarifPerKgSaat)}/kg × ${Number(g.pengaliSaat)}`],
      ["Ongkos kirim", rupiah(g.ongkir)],
      ["Biaya tambahan", g.biayaTambahan ? `${rupiah(g.biayaTambahan)}${g.keteranganBiaya ? ` (${g.keteranganBiaya})` : ""}` : "—"],
      ["Total", <b key="t">{rupiah(g.totalOngkir)}</b>],
      ["Pembayaran", <BayarBadge key="b" lunas={g.statusBayar === "LUNAS"} />],
      ["Kurir", g.kurir ? `${g.kurir.user.nama} · ${g.kurir.kendaraan} ${g.kurir.platNomor}` : "Belum ditugaskan"],
    );
    if (g.diterimaOleh) rows.push(["Diterima oleh", `${g.diterimaOleh}${g.diterimaPada ? ` (${fmtTanggalJam(g.diterimaPada)})` : ""}`]);
  }
  return (
    <Card title="Detail paket">
      <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
