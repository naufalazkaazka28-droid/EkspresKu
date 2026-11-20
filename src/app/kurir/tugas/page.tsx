import Link from "next/link";
import PaketTable from "@/components/PaketTable";
import { Card, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { listInclude } from "@/lib/queries";
import { requireRole } from "@/lib/session";

const TABS = [
  { k: "aktif", label: "Aktif" },
  { k: "selesai", label: "Selesai" },
  { k: "semua", label: "Semua" },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireRole("KURIR");
  const { tab = "aktif" } = await searchParams;
  const filter =
    tab === "selesai"
      ? { statusTerakhir: "SUDAH_DITERIMA" as const }
      : tab === "semua"
        ? {}
        : { statusTerakhir: { not: "SUDAH_DITERIMA" as const } };

  const rows = await prisma.paket.findMany({
    where: { pengiriman: { is: { kurirId: user.kurir!.id, ...filter } } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: listInclude,
  });

  return (
    <>
      <PageHeader title="Tugas antar" desc="Paket yang ditugaskan admin kepada Anda." />
      <Card
        action={
          <div className="flex gap-1 text-xs">
            {TABS.map((t) => (
              <Link key={t.k} href={`/kurir/tugas?tab=${t.k}`} className={`rounded-full px-3 py-1 ${tab === t.k ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
                {t.label}
              </Link>
            ))}
          </div>
        }
      >
        <PaketTable rows={rows} base="/kurir/tugas" showKurir={false} />
      </Card>
    </>
  );
}
