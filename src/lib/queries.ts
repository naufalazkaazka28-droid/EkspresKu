import type { Prisma } from "@prisma/client";
import type { PanelData } from "./types";

export const paketInclude = {
  pelanggan: { select: { nama: true, email: true, noHp: true } },
  pengiriman: {
    include: {
      layanan: true,
      tarif: true,
      kurir: { include: { user: { select: { nama: true, noHp: true } } } },
    },
  },
  pelacakans: {
    orderBy: { waktu: "asc" },
    include: { lokasi: true, diubahOleh: { select: { nama: true } } },
  },
} satisfies Prisma.PaketInclude;

export type PaketLengkap = Prisma.PaketGetPayload<{ include: typeof paketInclude }>;

export const listInclude = {
  pengiriman: {
    include: {
      layanan: true,
      kurir: { include: { user: { select: { nama: true } } } },
    },
  },
} satisfies Prisma.PaketInclude;

export type PaketList = Prisma.PaketGetPayload<{ include: typeof listInclude }>;

export function toPanel(p: PaketLengkap, publik = false): PanelData {
  return {
    noResi: p.noResi,
    status: p.pengiriman?.statusTerakhir ?? "DIPROSES",
    layanan: p.pengiriman?.layanan.nama ?? null,
    estimasiTiba: p.pengiriman?.estimasiTiba ?? null,
    tujuan: p.tujuanLat != null && p.tujuanLng != null ? { lat: p.tujuanLat, lng: p.tujuanLng } : null,
    entries: p.pelacakans.map((e) => ({
      id: e.id,
      status: e.status,
      waktu: e.waktu,
      keterangan: publik ? null : e.keterangan,
      oleh: publik ? null : e.diubahOleh.nama,
      lokasi: !publik && e.lokasi
        ? { nama: e.lokasi.nama, latitude: e.lokasi.latitude, longitude: e.lokasi.longitude }
        : null,
    })),
  };
}
