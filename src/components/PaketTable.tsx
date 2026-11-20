import Link from "next/link";
import { fmtTanggal } from "@/lib/format";
import type { PaketList } from "@/lib/queries";
import StatusBadge from "./StatusBadge";
import { BayarBadge, Empty } from "./ui";

export default function PaketTable({ rows, base, showKurir = true }: { rows: PaketList[]; base: string; showKurir?: boolean }) {
  if (!rows.length) return <Empty>Belum ada data paket.</Empty>;
  return (
    <>
      {/* Tampilan HP: kartu */}
      <div className="space-y-2 md:hidden">
        {rows.map((r) => (
          <Link key={r.id} href={`${base}/${r.id}`} className="block rounded-lg border border-slate-200 p-3 active:bg-slate-50">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-blue-700">{r.noResi}</span>
              {r.pengiriman && <StatusBadge status={r.pengiriman.statusTerakhir} />}
            </div>
            <p className="mt-1 text-sm text-slate-700">
              {r.namaPengirim} → {r.namaPenerima}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fmtTanggal(r.tanggalMasuk)} · {r.pengiriman?.layanan.nama ?? "—"}
              {showKurir && r.pengiriman?.kurir ? ` · ${r.pengiriman.kurir.user.nama}` : ""}
            </p>
          </Link>
        ))}
      </div>

      {/* Tampilan layar lebar: tabel */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-3">Resi</th>
              <th className="py-2 pr-3">Tanggal</th>
              <th className="py-2 pr-3">Pengirim → Penerima</th>
              <th className="py-2 pr-3">Layanan</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Bayar</th>
              {showKurir && <th className="py-2 pr-3">Kurir</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="py-2 pr-3">
                  <Link href={`${base}/${r.id}`} className="font-mono font-medium text-blue-700 hover:underline">
                    {r.noResi}
                  </Link>
                </td>
                <td className="whitespace-nowrap py-2 pr-3">{fmtTanggal(r.tanggalMasuk)}</td>
                <td className="py-2 pr-3">
                  {r.namaPengirim} → {r.namaPenerima}
                </td>
                <td className="py-2 pr-3">{r.pengiriman?.layanan.nama ?? "—"}</td>
                <td className="py-2 pr-3">{r.pengiriman && <StatusBadge status={r.pengiriman.statusTerakhir} />}</td>
                <td className="py-2 pr-3">{r.pengiriman && <BayarBadge lunas={r.pengiriman.statusBayar === "LUNAS"} />}</td>
                {showKurir && <td className="py-2 pr-3">{r.pengiriman?.kurir?.user.nama ?? <span className="text-slate-400">—</span>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
