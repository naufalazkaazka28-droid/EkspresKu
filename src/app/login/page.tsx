import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { Flash } from "@/components/ui";
import { dashboardFor } from "@/lib/roles";
import { getActiveUser } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ daftar?: string }> }) {
  const user = await getActiveUser();
  if (user) redirect(dashboardFor(user.role));
  const { daftar } = await searchParams;

  const pesan =
    daftar === "kurir"
      ? "Pendaftaran berhasil. Akun kurir Anda menunggu persetujuan admin sebelum bisa dipakai masuk."
      : daftar === "pelanggan"
        ? "Pendaftaran berhasil. Silakan masuk."
        : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Ekspres<span className="text-slate-900">Ku</span>
        </Link>
        <h1 className="mb-4 mt-4 text-lg font-semibold">Masuk ke akun</h1>
        <Flash s={pesan} />
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun? <Link href="/daftar" className="font-medium text-blue-700 hover:underline">Daftar pelanggan</Link>
          {" · "}
          <Link href="/daftar/kurir" className="font-medium text-blue-700 hover:underline">Daftar kurir</Link>
        </p>
      </div>
    </div>
  );
}
