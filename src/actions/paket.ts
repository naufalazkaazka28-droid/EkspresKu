"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import type { StatusPaket } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { flash } from "@/lib/flash";
import { fmtTanggal, tanggalWIB } from "@/lib/format";
import { cekCutoff, estimasiTeks, hitungEstimasi, hitungOngkir } from "@/lib/ongkir";
import { STATUS_LABEL, STATUS_LIST, TRANSISI } from "@/lib/status";
import type { FormState, PreviewResult } from "@/lib/types";
import { fieldErrors, paketSchema } from "@/lib/validators";
import type { z } from "zod";

type PaketInput = z.infer<typeof paketSchema>;

async function siapkan(data: PaketInput, bolehBiaya: boolean) {
  const [tarif, layanan] = await Promise.all([
    prisma.tarif.findFirst({ where: { id: data.tarifId, aktif: true } }),
    prisma.layanan.findFirst({ where: { id: data.layananId, aktif: true } }),
  ]);
  if (!tarif) return { error: "Zona tujuan tidak tersedia." } as const;
  if (!layanan) return { error: "Layanan tidak tersedia." } as const;

  const now = new Date();
  const cutoff = cekCutoff(now, layanan);
  if (cutoff) return { error: cutoff } as const;

  const pengali = Number(layanan.pengaliTarif);
  const calc = hitungOngkir({
    berat: data.beratKg,
    tarifPerKg: tarif.tarifPerKg,
    pengali,
    biayaTambahan: bolehBiaya ? data.biayaTambahan : 0,
  });
  return { tarif, layanan, pengali, calc, now, estimasi: hitungEstimasi(now, layanan.estimasiHariMax) } as const;
}

/** Langkah 1 (pelanggan): hitung ongkir & estimasi, tampilkan untuk dikonfirmasi. Belum menyimpan apa pun. */
export async function previewOngkir(formData: FormData): Promise<PreviewResult> {
  const user = await requireRole("PELANGGAN", "ADMIN");
  const parsed = paketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), error: "Periksa kembali isian formulir." };

  const r = await siapkan(parsed.data, user.role === "ADMIN");
  if ("error" in r) return { error: r.error };

  return {
    preview: {
      zona: r.tarif.zona,
      layanan: r.layanan.nama,
      tarifPerKg: r.tarif.tarifPerKg,
      pengali: r.pengali,
      beratDibulatkan: r.calc.beratDibulatkan,
      ongkir: r.calc.ongkir,
      biayaTambahan: r.calc.biayaTambahan,
      total: r.calc.total,
      estimasiTeks: estimasiTeks(r.layanan.estimasiHariMin, r.layanan.estimasiHariMax),
      estimasiTiba: fmtTanggal(r.estimasi),
    },
  };
}

/** Langkah 2 (setelah pelanggan konfirmasi): hitung ulang di server, buat resi, simpan dengan status Diproses. */
export async function buatPaket(formData: FormData): Promise<FormState> {
  const user = await requireRole("PELANGGAN", "ADMIN");
  const parsed = paketSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), error: "Periksa kembali isian formulir." };
  const data = parsed.data;
  const isAdmin = user.role === "ADMIN";

  const r = await siapkan(data, isAdmin);
  if ("error" in r) return { error: r.error };

  const pelangganId = isAdmin ? data.pelangganId || null : user.id;
  const key = tanggalWIB(r.now);
  const trackingToken = randomBytes(32).toString("hex");

  const paket = await prisma.$transaction(async (tx) => {
    const counter = await tx.resiCounter.upsert({
      where: { tanggal: key },
      create: { tanggal: key, terakhir: 1 },
      update: { terakhir: { increment: 1 } },
    });
    const noResi = `EKS-${key}-${String(counter.terakhir).padStart(4, "0")}`;
    const agen = await tx.lokasi.findFirst({ where: { jenis: "AGEN", aktif: true }, orderBy: { nama: "asc" } });

    return tx.paket.create({
      data: {
        noResi,
        trackingToken,
        pelangganId,
        dibuatOlehId: user.id,
        namaPengirim: data.namaPengirim,
        telpPengirim: data.telpPengirim,
        alamatAsal: data.alamatAsal,
        namaPenerima: data.namaPenerima,
        telpPenerima: data.telpPenerima,
        alamatTujuan: data.alamatTujuan,
        tujuanLat: r.tarif.latitude,
        tujuanLng: r.tarif.longitude,
        beratKg: data.beratKg,
        isiPaket: data.isiPaket,
        pengiriman: {
          create: {
            layananId: r.layanan.id,
            tarifId: r.tarif.id,
            tarifPerKgSaat: r.tarif.tarifPerKg,
            pengaliSaat: r.pengali,
            beratDibulatkan: r.calc.beratDibulatkan,
            ongkir: r.calc.ongkir,
            biayaTambahan: r.calc.biayaTambahan,
            keteranganBiaya: isAdmin ? data.keteranganBiaya || null : null,
            totalOngkir: r.calc.total,
            estimasiTiba: r.estimasi,
          },
        },
        pelacakans: {
          create: {
            status: "DIPROSES",
            lokasiId: agen?.id ?? null,
            keterangan: "Paket didaftarkan",
            diubahOlehId: user.id,
          },
        },
      },
    });
  });

  redirect(isAdmin ? `/admin/paket/${paket.id}?s=Paket+berhasil+dibuat` : `/pelanggan/paket/${paket.id}?s=Paket+berhasil+dibuat`);
}

/** Ubah status: admin atau kurir pemilik tugas. Pelacakan + statusTerakhir diperbarui dalam satu transaksi. */
export async function ubahStatus(formData: FormData): Promise<void> {
  const user = await requireRole("ADMIN", "KURIR");
  const paketId = String(formData.get("paketId") ?? "");
  const back = user.role === "ADMIN" ? `/admin/paket/${paketId}` : `/kurir/tugas/${paketId}`;

  const status = String(formData.get("status") ?? "") as StatusPaket;
  const lokasiId = String(formData.get("lokasiId") ?? "") || null;
  const keterangan = String(formData.get("keterangan") ?? "").trim();
  const diterimaOleh = String(formData.get("diterimaOleh") ?? "").trim();

  if (!STATUS_LIST.includes(status)) flash(back, { e: "Status tidak valid." });

  const p = await prisma.pengiriman.findUnique({ where: { paketId } });
  if (!p) flash(back, { e: "Paket tidak ditemukan." });
  if (user.role === "KURIR" && p.kurirId !== user.kurir?.id) flash(back, { e: "Paket ini bukan tugas Anda." });

  if (!TRANSISI[p.statusTerakhir].includes(status)) {
    flash(back, { e: `Status ${STATUS_LABEL[p.statusTerakhir]} tidak bisa langsung menjadi ${STATUS_LABEL[status]}.` });
  }
  if (status === "DALAM_PERJALANAN" && !p.kurirId) flash(back, { e: "Tugaskan kurir terlebih dahulu." });
  if (status === "SUDAH_DITERIMA" && !diterimaOleh) flash(back, { e: "Nama penerima wajib diisi." });
  if (status === "TERTUNDA" && keterangan.length < 3) flash(back, { e: "Alasan penundaan wajib diisi." });

  if (lokasiId && !(await prisma.lokasi.findFirst({ where: { id: lokasiId, aktif: true } }))) {
    flash(back, { e: "Lokasi tidak valid." });
  }

  const catatan = keterangan || (status === "SUDAH_DITERIMA" ? `Diterima oleh ${diterimaOleh}` : null);

  await prisma.$transaction([
    prisma.pelacakan.create({
      data: { paketId, status, lokasiId, keterangan: catatan, diubahOlehId: user.id },
    }),
    prisma.pengiriman.update({
      where: { paketId },
      data: {
        statusTerakhir: status,
        ...(status === "SUDAH_DITERIMA" ? { diterimaOleh, diterimaPada: new Date() } : {}),
      },
    }),
  ]);

  flash(back, { s: "Status berhasil diperbarui." });
}

export async function tugaskanKurir(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const paketId = String(formData.get("paketId") ?? "");
  const kurirId = String(formData.get("kurirId") ?? "");
  const back = `/admin/paket/${paketId}`;

  const p = await prisma.pengiriman.findUnique({ where: { paketId } });
  if (!p) flash(back, { e: "Paket tidak ditemukan." });
  if (p.statusTerakhir === "SUDAH_DITERIMA") flash(back, { e: "Paket sudah selesai." });

  const kurir = await prisma.kurir.findFirst({
    where: { id: kurirId, aktif: true, disetujui: true, user: { aktif: true } },
  });
  if (!kurir) flash(back, { e: "Kurir tidak valid atau tidak aktif." });

  await prisma.pengiriman.update({ where: { paketId }, data: { kurirId } });
  flash(back, { s: "Kurir berhasil ditugaskan." });
}

export async function setBayar(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const paketId = String(formData.get("paketId") ?? "");
  const lunas = formData.get("lunas") === "1";
  await prisma.pengiriman.update({
    where: { paketId },
    data: lunas ? { statusBayar: "LUNAS", dibayarPada: new Date() } : { statusBayar: "BELUM_BAYAR", dibayarPada: null },
  });
  flash(`/admin/paket/${paketId}`, { s: lunas ? "Ditandai lunas." : "Status bayar dikembalikan." });
}

const ubahSchema = paketSchema.pick({
  namaPengirim: true,
  telpPengirim: true,
  alamatAsal: true,
  namaPenerima: true,
  telpPenerima: true,
  alamatTujuan: true,
  isiPaket: true,
});

export async function ubahPaket(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const paketId = String(formData.get("paketId") ?? "");
  const back = `/admin/paket/${paketId}`;
  const parsed = ubahSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) flash(back, { e: parsed.error.issues[0]?.message ?? "Data tidak valid." });
  await prisma.paket.update({ where: { id: paketId }, data: parsed.data });
  flash(back, { s: "Data paket diperbarui." });
}

export async function hapusPaket(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const paketId = String(formData.get("paketId") ?? "");
  await prisma.paket.delete({ where: { id: paketId } });
  flash("/admin/paket", { s: "Paket dihapus." });
}
