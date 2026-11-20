"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { flash } from "@/lib/flash";
import { akunBase, cocok, dataKurir, noHp, pesanCocok } from "@/lib/validators";

const adminUserSchema = akunBase
  .extend({
    role: z.enum(["ADMIN", "KURIR", "PELANGGAN"]),
    alamat: z.string().trim().optional(),
    kendaraan: z.string().trim().optional(),
    platNomor: z.string().trim().toUpperCase().optional(),
    wilayahTugas: z.string().trim().optional(),
  })
  .refine(cocok, pesanCocok);

export async function buatUser(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const back = "/admin/pengguna";
  const parsed = adminUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) flash(back, { e: parsed.error.issues[0]?.message ?? "Data tidak valid." });
  const d = parsed.data;

  if (d.role === "KURIR") {
    const k = z.object(dataKurir).safeParse(d);
    if (!k.success) flash(back, { e: k.error.issues[0]?.message ?? "Data kurir tidak lengkap." });
  }

  try {
    await prisma.user.create({
      data: {
        nama: d.nama,
        email: d.email,
        noHp: d.noHp,
        alamat: d.alamat || null,
        role: d.role,
        password: await bcrypt.hash(d.password, 10),
        ...(d.role === "KURIR"
          ? {
              kurir: {
                create: {
                  kendaraan: d.kendaraan ?? "",
                  platNomor: d.platNomor ?? "",
                  wilayahTugas: d.wilayahTugas ?? "",
                  aktif: true,
                  disetujui: true, // dibuat oleh admin = langsung disetujui
                },
              },
            }
          : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      flash(back, { e: "Email atau plat nomor sudah terdaftar." });
    }
    throw e;
  }
  flash(back, { s: "Pengguna dibuat." });
}

export async function toggleUser(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("userId") ?? "");
  if (id === admin.id) flash("/admin/pengguna", { e: "Anda tidak bisa menonaktifkan akun sendiri." });
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) flash("/admin/pengguna", { e: "Pengguna tidak ditemukan." });
  await prisma.user.update({ where: { id }, data: { aktif: !u.aktif } });
  flash("/admin/pengguna", { s: u.aktif ? "Akun dinonaktifkan." : "Akun diaktifkan." });
}

export async function hapusUser(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("userId") ?? "");
  if (id === admin.id) flash("/admin/pengguna", { e: "Anda tidak bisa menghapus akun sendiri." });
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2003" || e.code === "P2014")) {
      flash("/admin/pengguna", { e: "Akun punya riwayat data sehingga tidak bisa dihapus. Nonaktifkan saja." });
    }
    throw e;
  }
  flash("/admin/pengguna", { s: "Akun dihapus." });
}

export async function updateProfil(formData: FormData): Promise<void> {
  const user = await requireRole("ADMIN", "KURIR", "PELANGGAN");
  const nama = String(formData.get("nama") ?? "").trim();
  const hp = String(formData.get("noHp") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  if (nama.length < 3) flash("/profil", { e: "Nama minimal 3 karakter." });
  if (hp && !noHp.safeParse(hp).success) flash("/profil", { e: "Nomor HP tidak valid." });
  await prisma.user.update({ where: { id: user.id }, data: { nama, noHp: hp || null, alamat: alamat || null } });
  flash("/profil", { s: "Profil diperbarui." });
}

export async function gantiPassword(formData: FormData): Promise<void> {
  const user = await requireRole("ADMIN", "KURIR", "PELANGGAN");
  const lama = String(formData.get("lama") ?? "");
  const baru = String(formData.get("baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");
  if (!(await bcrypt.compare(lama, user.password))) flash("/profil", { e: "Kata sandi lama salah." });
  if (baru.length < 8 || baru.length > 72) flash("/profil", { e: "Kata sandi baru 8–72 karakter." });
  if (baru !== konfirmasi) flash("/profil", { e: "Konfirmasi kata sandi tidak sama." });
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(baru, 10) } });
  flash("/profil", { s: "Kata sandi diganti." });
}
