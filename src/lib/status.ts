import type { StatusPaket } from "@prisma/client";

export const STATUS_LABEL: Record<StatusPaket, string> = {
  DIPROSES: "Diproses",
  DALAM_PERJALANAN: "Dalam Perjalanan",
  SUDAH_DITERIMA: "Sudah Diterima",
  TERTUNDA: "Tertunda",
};

export const STATUS_WARNA: Record<StatusPaket, string> = {
  DIPROSES: "bg-slate-100 text-slate-700",
  DALAM_PERJALANAN: "bg-blue-100 text-blue-700",
  SUDAH_DITERIMA: "bg-emerald-100 text-emerald-700",
  TERTUNDA: "bg-amber-100 text-amber-800",
};

/** Alur status yang diizinkan (sesuai proposal) */
export const TRANSISI: Record<StatusPaket, StatusPaket[]> = {
  DIPROSES: ["DALAM_PERJALANAN"],
  DALAM_PERJALANAN: ["SUDAH_DITERIMA", "TERTUNDA"],
  TERTUNDA: ["DALAM_PERJALANAN"],
  SUDAH_DITERIMA: [],
};

export const STATUS_LIST = Object.keys(STATUS_LABEL) as StatusPaket[];
