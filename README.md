# EkspresKu — Aplikasi Ekspedisi Paket

Next.js (App Router) · TypeScript · Prisma · PostgreSQL · Auth.js · Tailwind CSS · Leaflet/OpenStreetMap · Vercel

## Fitur
- **Pelanggan**: daftar sendiri, buat pengiriman (hitung ongkir + estimasi → konfirmasi → resi otomatis, status *Diproses*), riwayat, lacak, profil.
- **Kurir**: daftar sendiri (menunggu persetujuan admin), lihat tugas milik sendiri, perbarui status (Dalam Perjalanan / Sudah Diterima / Tertunda + alasan), profil.
- **Admin**: dashboard, CRUD paket (termasuk pelanggan walk-in), penugasan kurir, status bayar, layanan & tarif, lokasi (hub), kurir (setujui/nonaktifkan/statistik), pengguna, laporan (filter + cetak).
- **Publik**: `/lacak` — lacak dengan nomor resi dan kode pelacakan acak; detail lokasi dan catatan internal tidak ditampilkan.

## Menjalankan di komputer
1. `npm install`
2. Buat database PostgreSQL (Neon / Supabase), salin `.env.example` → `.env`, isi `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `SEED_ADMIN_EMAIL`, dan `SEED_ADMIN_PASSWORD` dengan nilai sendiri. Kata sandi admin minimal 12 karakter.
3. `npx prisma migrate dev --name init`
4. `npm run db:seed` (admin dan data master; akun demo tidak dibuat)
5. `npm run dev` → http://localhost:3000

Seed memakai email dan kata sandi admin dari environment; jalankan kembali seed dengan kredensial baru untuk merotasi kata sandi admin.

## Deploy ke Vercel
1. Push ke GitHub, import repo di Vercel.
2. Isi Environment Variables: `DATABASE_URL` (pooled), `DIRECT_URL`, `AUTH_SECRET`, `SEED_ADMIN_EMAIL`, dan `SEED_ADMIN_PASSWORD`.
3. Jalankan migrasi ke database produksi dari komputer lokal: `npx prisma migrate deploy` (dengan `.env` mengarah ke DB produksi), lalu `npm run db:seed` untuk membuat atau merotasi akun admin.
4. Deploy. `npm run build` sudah menjalankan `prisma generate`.

## Catatan desain
- Semua waktu disimpan UTC; tampilan, nomor resi harian, dan filter laporan memakai **WIB**.
- Pelacakan publik memerlukan nomor resi dan kode acak 256-bit. Kode ditampilkan di halaman detail paket pelanggan/admin; perlakukan seperti kata sandi dan bagikan hanya kepada pihak terkait.
- Ongkir dihitung ulang **di server** saat konfirmasi; tarif/pengali disimpan sebagai snapshot di `Pengiriman`.
- Perubahan status = insert `Pelacakan` + update `statusTerakhir` dalam satu transaksi. Alur: Diproses → Dalam Perjalanan → Sudah Diterima, cabang Tertunda.
- Hak akses dicek di middleware, di layout/halaman, dan di setiap Server Action (kurir hanya paketnya sendiri, pelanggan hanya miliknya).
- Pengguna nonaktif langsung ditolak pada permintaan berikutnya (dicek ke database, bukan hanya token).

## Belum termasuk
Ekspor PDF/Excel (gunakan tombol Cetak), pembatasan percobaan login (rate limiting), reset kata sandi lewat email, unggah foto bukti terima, paginasi penuh (daftar dibatasi 100–200 baris).
