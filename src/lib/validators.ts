import { z, type ZodError } from "zod";

export const noHp = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8\d{7,12}$/, "Nomor HP tidak valid (contoh: 08123456789)");

const teks = (label: string, min = 3) => z.string().trim().min(min, `${label} minimal ${min} karakter`);
const email = z.string().trim().toLowerCase().email("Format email tidak valid");
const password = z.string().min(8, "Kata sandi minimal 8 karakter").max(72, "Kata sandi maksimal 72 karakter");

export const akunBase = z.object({
  nama: teks("Nama"),
  email,
  noHp,
  password,
  konfirmasi: z.string(),
});

export const cocok = (d: { password: string; konfirmasi: string }) => d.password === d.konfirmasi;
export const pesanCocok = { message: "Konfirmasi kata sandi tidak sama", path: ["konfirmasi"] };

export const dataKurir = {
  kendaraan: teks("Kendaraan", 2),
  platNomor: z.string().trim().toUpperCase().min(3, "Plat nomor wajib diisi"),
  wilayahTugas: teks("Wilayah tugas"),
};

export const registerPelangganSchema = akunBase
  .extend({ alamat: z.string().trim().optional() })
  .refine(cocok, pesanCocok);

export const registerKurirSchema = akunBase
  .extend({ alamat: teks("Alamat", 5), ...dataKurir })
  .refine(cocok, pesanCocok);

export const paketSchema = z.object({
  namaPengirim: teks("Nama pengirim"),
  telpPengirim: noHp,
  alamatAsal: teks("Alamat asal", 5),
  namaPenerima: teks("Nama penerima"),
  telpPenerima: noHp,
  alamatTujuan: teks("Alamat tujuan", 5),
  beratKg: z.coerce
    .number({ invalid_type_error: "Berat harus berupa angka" })
    .positive("Berat harus lebih dari 0")
    .max(1000, "Berat maksimal 1000 kg"),
  isiPaket: teks("Isi paket", 2),
  tarifId: z.string().min(1, "Pilih zona tujuan"),
  layananId: z.string().min(1, "Pilih layanan"),
  pelangganId: z.string().optional(),
  biayaTambahan: z.coerce.number().int("Harus bilangan bulat").min(0, "Tidak boleh negatif").default(0),
  keteranganBiaya: z.string().trim().optional(),
});

export function fieldErrors(e: ZodError) {
  const out: Record<string, string> = {};
  for (const i of e.issues) {
    const k = String(i.path[0] ?? "_");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

/** "" -> null, "1,5" -> 1.5, tidak valid -> NaN */
export function angkaOpsional(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}
