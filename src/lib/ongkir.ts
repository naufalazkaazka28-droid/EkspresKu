import { jamWIB } from "./format";

export function hitungOngkir(i: { berat: number; tarifPerKg: number; pengali: number; biayaTambahan?: number }) {
  const beratDibulatkan = Math.max(1, Math.ceil(i.berat));
  const ongkir = Math.round(i.tarifPerKg * beratDibulatkan * i.pengali);
  const biayaTambahan = i.biayaTambahan ?? 0;
  return { beratDibulatkan, ongkir, biayaTambahan, total: ongkir + biayaTambahan };
}

export const hitungEstimasi = (now: Date, hariMax: number) => new Date(now.getTime() + hariMax * 86400000);

export function estimasiTeks(min: number, max: number) {
  if (max === 0) return "Hari yang sama";
  return min === max ? `${max} hari` : `${min}–${max} hari`;
}

/** Layanan same-day hanya menerima order sebelum jam cutoff (WIB). */
export function cekCutoff(now: Date, l: { nama: string; estimasiHariMax: number; jamCutoff: string | null }) {
  if (l.estimasiHariMax !== 0 || !l.jamCutoff) return null;
  return jamWIB(now) > l.jamCutoff
    ? `Layanan ${l.nama} hanya menerima pesanan sebelum pukul ${l.jamCutoff} WIB. Pilih layanan lain.`
    : null;
}
