"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { flash } from "@/lib/flash";
import { angkaOpsional } from "@/lib/validators";

const isUnique = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function simpanLayanan(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const back = "/admin/layanan-tarif";
  const id = str(formData, "id");
  const nama = str(formData, "nama");
  const pengali = angkaOpsional(formData.get("pengaliTarif"));
  const min = angkaOpsional(formData.get("estimasiHariMin"));
  const max = angkaOpsional(formData.get("estimasiHariMax"));
  const cutoff = str(formData, "jamCutoff");

  if (nama.length < 2) flash(back, { e: "Nama layanan wajib diisi." });
  if (pengali === null || Number.isNaN(pengali) || pengali <= 0 || pengali > 99) flash(back, { e: "Pengali tarif tidak valid." });
  if (min === null || max === null || !Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
    flash(back, { e: "Estimasi hari tidak valid (maksimal harus ≥ minimal)." });
  }
  if (cutoff && !/^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff)) flash(back, { e: "Jam cutoff harus berformat HH:mm." });

  const data = {
    nama,
    pengaliTarif: pengali,
    estimasiHariMin: min,
    estimasiHariMax: max,
    jamCutoff: cutoff || null,
    aktif: formData.get("aktif") === "on",
  };
  try {
    if (id) await prisma.layanan.update({ where: { id }, data });
    else await prisma.layanan.create({ data });
  } catch (e) {
    if (isUnique(e)) flash(back, { e: "Nama layanan sudah ada." });
    throw e;
  }
  flash(back, { s: "Layanan disimpan." });
}

export async function simpanTarif(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const back = "/admin/layanan-tarif";
  const id = str(formData, "id");
  const zona = str(formData, "zona");
  const tarif = angkaOpsional(formData.get("tarifPerKg"));
  const lat = angkaOpsional(formData.get("latitude"));
  const lng = angkaOpsional(formData.get("longitude"));

  if (zona.length < 2) flash(back, { e: "Nama zona wajib diisi." });
  if (tarif === null || Number.isNaN(tarif) || !Number.isInteger(tarif) || tarif < 0) flash(back, { e: "Tarif per kg harus bilangan bulat ≥ 0." });
  if ((lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) || (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180))) {
    flash(back, { e: "Koordinat tidak valid." });
  }
  if ((lat === null) !== (lng === null)) flash(back, { e: "Isi latitude dan longitude sekaligus, atau kosongkan keduanya." });

  const data = { zona, tarifPerKg: tarif, latitude: lat, longitude: lng, aktif: formData.get("aktif") === "on" };
  try {
    if (id) await prisma.tarif.update({ where: { id }, data });
    else await prisma.tarif.create({ data });
  } catch (e) {
    if (isUnique(e)) flash(back, { e: "Nama zona sudah ada." });
    throw e;
  }
  flash(back, { s: "Tarif disimpan." });
}

export async function simpanLokasi(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const back = "/admin/lokasi";
  const id = str(formData, "id");
  const nama = str(formData, "nama");
  const kota = str(formData, "kota");
  const jenis = str(formData, "jenis");
  const lat = angkaOpsional(formData.get("latitude"));
  const lng = angkaOpsional(formData.get("longitude"));

  if (nama.length < 2 || kota.length < 2) flash(back, { e: "Nama dan kota wajib diisi." });
  if (jenis !== "AGEN" && jenis !== "HUB" && jenis !== "TRANSIT") flash(back, { e: "Jenis lokasi tidak valid." });
  if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    flash(back, { e: "Latitude/longitude tidak valid." });
  }

  const data = { nama, kota, jenis: jenis as "AGEN" | "HUB" | "TRANSIT", latitude: lat, longitude: lng, aktif: formData.get("aktif") === "on" };
  if (id) await prisma.lokasi.update({ where: { id }, data });
  else await prisma.lokasi.create({ data });
  flash(back, { s: "Lokasi disimpan." });
}
