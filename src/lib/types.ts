import type { StatusPaket } from "@prisma/client";

export type FormState = { error?: string; fieldErrors?: Record<string, string> };

export type Preview = {
  zona: string;
  layanan: string;
  tarifPerKg: number;
  pengali: number;
  beratDibulatkan: number;
  ongkir: number;
  biayaTambahan: number;
  total: number;
  estimasiTeks: string;
  estimasiTiba: string;
};

export type PreviewResult = FormState & { preview?: Preview };

export type PanelData = {
  noResi: string;
  status: StatusPaket;
  layanan: string | null;
  estimasiTiba: Date | null;
  tujuan: { lat: number; lng: number } | null;
  entries: {
    id: string;
    status: StatusPaket;
    waktu: Date;
    keterangan: string | null;
    oleh: string | null;
    lokasi: { nama: string; latitude: number; longitude: number } | null;
  }[];
};
