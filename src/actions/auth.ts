"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dashboardFor } from "@/lib/roles";
import type { FormState } from "@/lib/types";
import { fieldErrors, registerKurirSchema, registerPelangganSchema } from "@/lib/validators";

export async function login(formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan kata sandi wajib diisi." };

  const user = await prisma.user.findUnique({ where: { email }, include: { kurir: true } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Email atau kata sandi salah." };
  }
  if (!user.aktif) return { error: "Akun Anda dinonaktifkan. Hubungi admin." };
  if (user.role === "KURIR" && !user.kurir?.disetujui) {
    return { error: "Akun kurir Anda masih menunggu persetujuan admin." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: dashboardFor(user.role) });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Gagal masuk. Silakan coba lagi." };
    throw e; // redirect internal Next.js harus dilempar ulang
  }
  return {};
}

export async function registerPelanggan(formData: FormData): Promise<FormState> {
  const parsed = registerPelangganSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), error: "Periksa kembali isian formulir." };
  const d = parsed.data;

  if (await prisma.user.findUnique({ where: { email: d.email } })) {
    return { fieldErrors: { email: "Email sudah terdaftar." }, error: "Periksa kembali isian formulir." };
  }

  await prisma.user.create({
    data: {
      nama: d.nama,
      email: d.email,
      noHp: d.noHp,
      alamat: d.alamat || null,
      password: await bcrypt.hash(d.password, 10),
      role: "PELANGGAN",
    },
  });
  redirect("/login?daftar=pelanggan");
}

export async function registerKurir(formData: FormData): Promise<FormState> {
  const parsed = registerKurirSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), error: "Periksa kembali isian formulir." };
  const d = parsed.data;

  const errs: Record<string, string> = {};
  if (await prisma.user.findUnique({ where: { email: d.email } })) errs.email = "Email sudah terdaftar.";
  if (await prisma.kurir.findUnique({ where: { platNomor: d.platNomor } })) errs.platNomor = "Plat nomor sudah terdaftar.";
  if (Object.keys(errs).length) return { fieldErrors: errs, error: "Periksa kembali isian formulir." };

  await prisma.user.create({
    data: {
      nama: d.nama,
      email: d.email,
      noHp: d.noHp,
      alamat: d.alamat,
      password: await bcrypt.hash(d.password, 10),
      role: "KURIR",
      kurir: {
        create: { kendaraan: d.kendaraan, platNomor: d.platNomor, wilayahTugas: d.wilayahTugas, aktif: true, disetujui: false },
      },
    },
  });
  redirect("/login?daftar=kurir");
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
