"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { flash } from "@/lib/flash";

export async function setujuiKurir(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const id = String(formData.get("kurirId") ?? "");
  await prisma.kurir.update({ where: { id }, data: { disetujui: true, aktif: true } });
  flash("/admin/kurir", { s: "Kurir disetujui. Akun sudah bisa dipakai masuk." });
}

export async function toggleKurir(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const id = String(formData.get("kurirId") ?? "");
  const k = await prisma.kurir.findUnique({ where: { id } });
  if (!k) flash("/admin/kurir", { e: "Kurir tidak ditemukan." });
  const aktif = !k.aktif;
  await prisma.$transaction([
    prisma.kurir.update({ where: { id }, data: { aktif } }),
    prisma.user.update({ where: { id: k.userId }, data: { aktif } }),
  ]);
  flash("/admin/kurir", { s: aktif ? "Kurir diaktifkan." : "Kurir dinonaktifkan." });
}

export async function ubahKurir(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const id = String(formData.get("kurirId") ?? "");
  const back = `/admin/kurir/${id}`;
  const kendaraan = String(formData.get("kendaraan") ?? "").trim();
  const platNomor = String(formData.get("platNomor") ?? "").trim().toUpperCase();
  const wilayahTugas = String(formData.get("wilayahTugas") ?? "").trim();
  if (kendaraan.length < 2 || platNomor.length < 3 || wilayahTugas.length < 3) {
    flash(back, { e: "Kendaraan, plat nomor, dan wilayah tugas wajib diisi." });
  }
  try {
    await prisma.kurir.update({ where: { id }, data: { kendaraan, platNomor, wilayahTugas } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") flash(back, { e: "Plat nomor sudah dipakai kurir lain." });
    throw e;
  }
  flash(back, { s: "Data kurir diperbarui." });
}
