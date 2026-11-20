-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KURIR', 'PELANGGAN');

-- CreateEnum
CREATE TYPE "StatusPaket" AS ENUM ('DIPROSES', 'DALAM_PERJALANAN', 'SUDAH_DITERIMA', 'TERTUNDA');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('BELUM_BAYAR', 'LUNAS');

-- CreateEnum
CREATE TYPE "JenisLokasi" AS ENUM ('AGEN', 'HUB', 'TRANSIT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PELANGGAN',
    "noHp" TEXT,
    "alamat" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurirs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kendaraan" TEXT NOT NULL,
    "platNomor" TEXT NOT NULL,
    "wilayahTugas" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "disetujui" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kurirs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layanans" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pengaliTarif" DECIMAL(5,2) NOT NULL,
    "estimasiHariMin" INTEGER NOT NULL,
    "estimasiHariMax" INTEGER NOT NULL,
    "jamCutoff" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "layanans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifs" (
    "id" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "tarifPerKg" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tarifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lokasis" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "jenis" "JenisLokasi" NOT NULL DEFAULT 'HUB',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lokasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pakets" (
    "id" TEXT NOT NULL,
    "noResi" TEXT NOT NULL,
    "pelangganId" TEXT,
    "dibuatOlehId" TEXT NOT NULL,
    "namaPengirim" TEXT NOT NULL,
    "telpPengirim" TEXT NOT NULL,
    "alamatAsal" TEXT NOT NULL,
    "asalLat" DOUBLE PRECISION,
    "asalLng" DOUBLE PRECISION,
    "namaPenerima" TEXT NOT NULL,
    "telpPenerima" TEXT NOT NULL,
    "alamatTujuan" TEXT NOT NULL,
    "tujuanLat" DOUBLE PRECISION,
    "tujuanLng" DOUBLE PRECISION,
    "beratKg" DECIMAL(8,2) NOT NULL,
    "isiPaket" TEXT NOT NULL,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pakets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengirimans" (
    "id" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "tarifId" TEXT NOT NULL,
    "kurirId" TEXT,
    "tarifPerKgSaat" INTEGER NOT NULL,
    "pengaliSaat" DECIMAL(5,2) NOT NULL,
    "beratDibulatkan" INTEGER NOT NULL,
    "ongkir" INTEGER NOT NULL,
    "biayaTambahan" INTEGER NOT NULL DEFAULT 0,
    "keteranganBiaya" TEXT,
    "totalOngkir" INTEGER NOT NULL,
    "estimasiTiba" TIMESTAMP(3) NOT NULL,
    "statusBayar" "StatusBayar" NOT NULL DEFAULT 'BELUM_BAYAR',
    "dibayarPada" TIMESTAMP(3),
    "statusTerakhir" "StatusPaket" NOT NULL DEFAULT 'DIPROSES',
    "diterimaOleh" TEXT,
    "diterimaPada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengirimans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelacakans" (
    "id" TEXT NOT NULL,
    "paketId" TEXT NOT NULL,
    "status" "StatusPaket" NOT NULL,
    "lokasiId" TEXT,
    "keterangan" TEXT,
    "diubahOlehId" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pelacakans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resi_counters" (
    "tanggal" TEXT NOT NULL,
    "terakhir" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "resi_counters_pkey" PRIMARY KEY ("tanggal")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "kurirs_userId_key" ON "kurirs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kurirs_platNomor_key" ON "kurirs"("platNomor");

-- CreateIndex
CREATE UNIQUE INDEX "layanans_nama_key" ON "layanans"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "tarifs_zona_key" ON "tarifs"("zona");

-- CreateIndex
CREATE UNIQUE INDEX "pakets_noResi_key" ON "pakets"("noResi");

-- CreateIndex
CREATE INDEX "pakets_pelangganId_idx" ON "pakets"("pelangganId");

-- CreateIndex
CREATE INDEX "pakets_namaPengirim_idx" ON "pakets"("namaPengirim");

-- CreateIndex
CREATE INDEX "pakets_namaPenerima_idx" ON "pakets"("namaPenerima");

-- CreateIndex
CREATE INDEX "pakets_tanggalMasuk_idx" ON "pakets"("tanggalMasuk");

-- CreateIndex
CREATE UNIQUE INDEX "pengirimans_paketId_key" ON "pengirimans"("paketId");

-- CreateIndex
CREATE INDEX "pengirimans_kurirId_idx" ON "pengirimans"("kurirId");

-- CreateIndex
CREATE INDEX "pengirimans_statusTerakhir_idx" ON "pengirimans"("statusTerakhir");

-- CreateIndex
CREATE INDEX "pengirimans_statusBayar_idx" ON "pengirimans"("statusBayar");

-- CreateIndex
CREATE INDEX "pengirimans_layananId_idx" ON "pengirimans"("layananId");

-- CreateIndex
CREATE INDEX "pelacakans_paketId_waktu_idx" ON "pelacakans"("paketId", "waktu");

-- AddForeignKey
ALTER TABLE "kurirs" ADD CONSTRAINT "kurirs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pakets" ADD CONSTRAINT "pakets_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pakets" ADD CONSTRAINT "pakets_dibuatOlehId_fkey" FOREIGN KEY ("dibuatOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "pakets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "layanans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_tarifId_fkey" FOREIGN KEY ("tarifId") REFERENCES "tarifs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengirimans" ADD CONSTRAINT "pengirimans_kurirId_fkey" FOREIGN KEY ("kurirId") REFERENCES "kurirs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelacakans" ADD CONSTRAINT "pelacakans_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "pakets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelacakans" ADD CONSTRAINT "pelacakans_lokasiId_fkey" FOREIGN KEY ("lokasiId") REFERENCES "lokasis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelacakans" ADD CONSTRAINT "pelacakans_diubahOlehId_fkey" FOREIGN KEY ("diubahOlehId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
