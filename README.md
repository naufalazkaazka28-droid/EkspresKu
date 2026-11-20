# EkspresKu — Aplikasi Ekspedisi Paket

EkspresKu merupakan aplikasi berbasis web untuk membantu pengelolaan pengiriman paket, mulai dari pencatatan data pengiriman, perhitungan ongkos kirim, penugasan kurir, hingga pelacakan status paket.

**Teknologi yang digunakan:**
- Next.js (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Auth.js
- Tailwind CSS
- Leaflet / OpenStreetMap
- Vercel

## Fitur Aplikasi

### 1. Pelanggan
- Melakukan pendaftaran akun.
- Membuat pengiriman paket.
- Melihat perhitungan ongkos kirim dan estimasi waktu.
- Mendapatkan nomor resi otomatis.
- Melihat riwayat pengiriman.
- Melacak posisi dan status paket.
- Mengelola profil pengguna.

### 2. Kurir
- Melakukan pendaftaran akun.
- Menunggu persetujuan admin.
- Melihat daftar tugas pengiriman.
- Memperbarui status paket.
- Mengelola profil kurir.

### 3. Admin
- Melihat dashboard pengiriman.
- Mengelola data paket.
- Menambahkan dan menugaskan kurir.
- Mengelola status pembayaran.
- Mengatur layanan dan tarif pengiriman.
- Mengelola lokasi atau hub.
- Mengelola akun pengguna.
- Melihat dan mencetak laporan pengiriman.

### 4. Pelacakan Publik
- Melacak paket melalui nomor resi.
- Menggunakan kode pelacakan untuk keamanan.
- Melihat status dan informasi pengiriman.
- Tidak menampilkan catatan internal kepada publik.

## Cara Menjalankan Aplikasi

1. Pastikan Node.js dan PostgreSQL sudah terpasang.
2. Instal seluruh dependency:

   `npm install`

3. Salin file `.env.example` menjadi `.env`.
4. Isi konfigurasi database dan autentikasi.
5. Jalankan migrasi database:

   `npx prisma migrate dev --name init`

6. Isi data awal aplikasi:

   `npm run db:seed`

7. Jalankan aplikasi:

   `npm run dev`

8. Buka browser melalui:

   `http://localhost:3000`

## Konfigurasi Environment Variables

Aplikasi membutuhkan beberapa variabel lingkungan berikut:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Gunakan nilai konfigurasi sendiri dan jangan membagikan file `.env` kepada publik.

## Deploy ke Vercel

1. Upload project ke GitHub.
2. Buka Vercel dan hubungkan akun GitHub.
3. Import repository EkspresKu.
4. Hubungkan database PostgreSQL.
5. Tambahkan Environment Variables sesuai konfigurasi aplikasi.
6. Jalankan migrasi database produksi menggunakan:

   `npx prisma migrate deploy`

7. Jalankan seed untuk membuat atau memperbarui akun admin:

   `npm run db:seed`

8. Lakukan deployment melalui Vercel.

Proses build aplikasi sudah mencakup `prisma generate`.

## Catatan Sistem

- Seluruh waktu disimpan menggunakan UTC dan ditampilkan dalam zona waktu WIB.
- Nomor resi dibuat berdasarkan tanggal pengiriman.
- Kode pelacakan publik menggunakan kode acak 256-bit.
- Perhitungan ongkos kirim dilakukan kembali di server saat konfirmasi.
- Riwayat perubahan status paket disimpan dalam database.
- Perubahan status dan pembaruan status terakhir dilakukan dalam satu transaksi.
- Hak akses dibedakan berdasarkan peran admin, kurir, dan pelanggan.
- Pengguna nonaktif tidak dapat mengakses sistem.

## Batasan Pengembangan

Beberapa fitur yang belum tersedia:
- Ekspor laporan PDF dan Excel secara langsung.
- Pembatasan percobaan login (rate limiting).
- Reset kata sandi melalui email.
- Unggah foto bukti penerimaan paket.
- Paginasi penuh pada seluruh daftar data.

## Developer

**Project:** EkspresKu  
**Kategori:** Aplikasi Ekspedisi Paket  
**Platform:** Web Application  
**Framework:** Next.js

