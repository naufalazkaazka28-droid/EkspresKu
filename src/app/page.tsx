import Link from "next/link";
import { getActiveUser } from "@/lib/session";
import { dashboardFor } from "@/lib/roles";
import { btnCls, btnGhost, inputCls } from "@/components/ui";

export default async function Home() {
  const user = await getActiveUser();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-xl font-bold text-blue-700">
          Ekspres<span className="text-slate-900">Ku</span>
        </span>
        <div className="flex gap-2">
          {user ? (
            <Link href={dashboardFor(user.role)} className={btnCls}>Ke dashboard</Link>
          ) : (
            <>
              <Link href="/login" className={btnGhost}>Masuk</Link>
              <Link href="/daftar" className={btnCls}>Daftar</Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900 md:text-5xl">Kirim paket, pantau setiap langkahnya.</h1>
        <p className="mt-4 text-slate-600">
          Hitung ongkos kirim, buat nomor resi otomatis, dan lacak posisi paket di peta — dalam satu aplikasi.
        </p>
        <form action="/lacak" className="mx-auto mt-8 flex max-w-xl flex-col gap-2">
          <input name="resi" required placeholder="Masukkan nomor resi" className={inputCls} />
          <input name="kode" required placeholder="Masukkan kode pelacakan" className={inputCls} />
          <button className={`${btnCls} whitespace-nowrap`}>Lacak paket</button>
        </form>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 md:grid-cols-3">
        {[
          ["Pelanggan", "Buat pengiriman, lihat ongkir dan estimasi sebelum konfirmasi, lalu pantau riwayatnya.", "/daftar", "Daftar pelanggan"],
          ["Kurir", "Terima tugas antar, perbarui status, dan catat penerima paket.", "/daftar/kurir", "Gabung sebagai kurir"],
          ["Admin", "Kelola paket, tarif, kurir, pengguna, dan laporan.", "/login", "Masuk admin"],
        ].map(([t, d, href, label]) => (
          <div key={t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{t}</h2>
            <p className="mt-2 text-sm text-slate-600">{d}</p>
            <Link href={href} className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">{label} →</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
