import PaketForm from "@/components/PaketForm";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function Page() {
  const user = await requireRole("PELANGGAN");
  const [tarifs, layanans] = await Promise.all([
    prisma.tarif.findMany({ where: { aktif: true }, orderBy: { zona: "asc" } }),
    prisma.layanan.findMany({ where: { aktif: true }, orderBy: { estimasiHariMax: "desc" } }),
  ]);
  return (
    <>
      <PageHeader title="Buat pengiriman" desc="Isi data paket, lihat ongkos kirim dan estimasi sampai, lalu konfirmasi untuk mendapatkan nomor resi." />
      <PaketForm
        tarifs={tarifs.map((t) => ({ id: t.id, zona: t.zona, tarifPerKg: t.tarifPerKg }))}
        layanans={layanans.map((l) => ({ id: l.id, nama: l.nama, estimasiHariMin: l.estimasiHariMin, estimasiHariMax: l.estimasiHariMax }))}
        defaults={{ namaPengirim: user.nama, telpPengirim: user.noHp ?? "", alamatAsal: user.alamat ?? "" }}
      />
    </>
  );
}
