const TZ = "Asia/Jakarta";

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

/** "2026-11-19" (tanggal menurut WIB) */
export function isoDateWIB(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** "20261119" (tanggal menurut WIB), dipakai untuk nomor resi */
export const tanggalWIB = (d: Date) => isoDateWIB(d).replace(/-/g, "");

/** "HH:mm" menurut WIB */
export function jamWIB(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
}

export const fmtTanggalJam = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(d) + " WIB";

export const fmtTanggal = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: TZ, dateStyle: "medium" }).format(d);

export const awalHariWIB = (iso: string) => new Date(`${iso}T00:00:00+07:00`);
export const akhirHariWIB = (iso: string) => new Date(`${iso}T23:59:59.999+07:00`);

/** "Budi Santoso" -> "B*** S******" (untuk halaman pelacakan publik) */
export function maskNama(nama: string) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0] + "*".repeat(Math.max(w.length - 1, 2)))
    .join(" ");
}
