import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPass = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) {
    throw new Error("SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD wajib diatur sebelum menjalankan seed.");
  }
  if (adminPass.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD harus memiliki minimal 12 karakter.");
  }
  const adminPasswordHash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPasswordHash, role: "ADMIN", aktif: true },
    create: { nama: "Administrator", email: adminEmail, noHp: "081234567890", role: "ADMIN", password: adminPasswordHash },
  });

  const layanans = [
    { nama: "Reguler", pengaliTarif: 1.0, estimasiHariMin: 3, estimasiHariMax: 5, jamCutoff: null },
    { nama: "Express", pengaliTarif: 1.5, estimasiHariMin: 1, estimasiHariMax: 2, jamCutoff: null },
    { nama: "Same Day", pengaliTarif: 2.5, estimasiHariMin: 0, estimasiHariMax: 0, jamCutoff: "14:00" },
  ];
  for (const l of layanans) await prisma.layanan.upsert({ where: { nama: l.nama }, update: {}, create: l });

  const tarifs = [
    { zona: "Surabaya", tarifPerKg: 8000, latitude: -7.2575, longitude: 112.7521 },
    { zona: "Gresik", tarifPerKg: 8000, latitude: -7.1539, longitude: 112.6561 },
    { zona: "Malang", tarifPerKg: 10000, latitude: -7.9666, longitude: 112.6326 },
    { zona: "Semarang", tarifPerKg: 12000, latitude: -6.9667, longitude: 110.4167 },
    { zona: "Yogyakarta", tarifPerKg: 12000, latitude: -7.7956, longitude: 110.3695 },
    { zona: "Jakarta", tarifPerKg: 15000, latitude: -6.2088, longitude: 106.8456 },
    { zona: "Bandung", tarifPerKg: 16000, latitude: -6.9175, longitude: 107.6191 },
    { zona: "Denpasar", tarifPerKg: 20000, latitude: -8.6705, longitude: 115.2126 },
  ];
  for (const t of tarifs) await prisma.tarif.upsert({ where: { zona: t.zona }, update: {}, create: t });

  const lokasis = [
    { nama: "Agen Bojonegoro", kota: "Bojonegoro", jenis: "AGEN" as const, latitude: -7.1502, longitude: 111.8816 },
    { nama: "Hub Gresik (Benowo DC)", kota: "Gresik", jenis: "HUB" as const, latitude: -7.2327, longitude: 112.6176 },
    { nama: "Hub Surabaya", kota: "Surabaya", jenis: "HUB" as const, latitude: -7.2575, longitude: 112.7521 },
    { nama: "Transit Semarang", kota: "Semarang", jenis: "TRANSIT" as const, latitude: -6.9667, longitude: 110.4167 },
    { nama: "Hub Jakarta", kota: "Jakarta", jenis: "HUB" as const, latitude: -6.2088, longitude: 106.8456 },
    { nama: "Hub Bandung", kota: "Bandung", jenis: "HUB" as const, latitude: -6.9175, longitude: 107.6191 },
  ];
  for (const l of lokasis) {
    if (!(await prisma.lokasi.findFirst({ where: { nama: l.nama } }))) await prisma.lokasi.create({ data: l });
  }

  console.log(`Seed selesai.\nAdmin: ${adminEmail}`);
}

main().finally(() => prisma.$disconnect());
