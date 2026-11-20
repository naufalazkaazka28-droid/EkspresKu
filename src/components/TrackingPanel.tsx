import { fmtTanggal, fmtTanggalJam } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/status";
import type { PanelData } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import TrackingMap from "./TrackingMap";
import { Card } from "./ui";

export default function TrackingPanel({ data, tujuanNama }: { data: PanelData; tujuanNama?: string }) {
  // Titik yang sudah dilewati, urut waktu, tanpa titik kembar berurutan
  const visited: { lat: number; lng: number; nama: string }[] = [];
  for (const e of data.entries) {
    if (!e.lokasi) continue;
    const prev = visited[visited.length - 1];
    if (prev && prev.nama === e.lokasi.nama) continue;
    visited.push({ lat: e.lokasi.latitude, lng: e.lokasi.longitude, nama: e.lokasi.nama });
  }
  const tujuan = data.tujuan ? { ...data.tujuan, nama: tujuanNama ?? "Alamat tujuan" } : null;
  const terbaru = [...data.entries].reverse();

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Nomor resi</p>
            <p className="font-mono text-lg font-bold text-slate-900">{data.noResi}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
          {data.layanan && <span>Layanan: <b className="text-slate-800">{data.layanan}</b></span>}
          {data.estimasiTiba && <span>Estimasi tiba: <b className="text-slate-800">{fmtTanggal(data.estimasiTiba)}</b></span>}
        </div>
      </Card>

      {(visited.length > 0 || tujuan) && (
        <Card title="Peta perjalanan">
          <TrackingMap visited={visited} tujuan={tujuan} />
          <p className="mt-2 text-xs text-slate-500">
            Garis merah: lokasi yang sudah dilewati. Garis putus-putus: menuju tujuan. Posisi diperbarui manual oleh petugas.
          </p>
        </Card>
      )}

      <Card title="Riwayat perjalanan">
        <ol className="relative ml-2 space-y-5 border-l-2 border-slate-200 pl-5">
          {terbaru.map((e, i) => (
            <li key={e.id} className="relative">
              <span
                className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                  i === 0 ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <p className={`text-sm font-semibold ${i === 0 ? "text-emerald-700" : "text-slate-700"}`}>{STATUS_LABEL[e.status]}</p>
              {e.lokasi && <p className="text-sm text-slate-700">{e.lokasi.nama}</p>}
              {e.keterangan && <p className="text-sm text-slate-600">{e.keterangan}</p>}
              <p className="text-xs text-slate-500">
                {fmtTanggalJam(e.waktu)}
                {e.oleh ? ` · oleh ${e.oleh}` : ""}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
