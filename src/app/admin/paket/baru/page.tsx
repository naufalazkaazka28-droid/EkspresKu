import PaketForm from "@/components/PaketForm";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function Page() {
  await requireRole("ADMIN");
  const [tarifs, layanans, pelanggan] = await Promise.all([
    prisma.tarif.findMany({ where: { aktif: true }, orderBy: { zona: "asc" } }),
    prisma.layanan.findMany({ where: { aktif: true }, orderBy: { estimasiHariMax: "desc" } }),
    prisma.user.findMany({ where: { role: "PELANGGAN", aktif: true }, orderBy: { nama: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Paket baru" desc="Input paket atas nama pelanggan terdaftar atau pelanggan walk-in." />
      <PaketForm
        adminMode
        tarifs={tarifs.map((t) => ({ id: t.id, zona: t.zona, tarifPerKg: t.tarifPerKg }))}
        layanans={layanans.map((l) => ({ id: l.id, nama: l.nama, estimasiHariMin: l.estimasiHariMin, estimasiHariMax: l.estimasiHariMax }))}
        pelanggan={pelanggan.map((u) => ({ id: u.id, label: `${u.nama} (${u.email})` }))}
      />
    </>
  );
}
