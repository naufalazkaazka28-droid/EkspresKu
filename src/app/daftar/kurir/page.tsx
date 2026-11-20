import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-xl font-bold text-blue-700">
          Ekspres<span className="text-slate-900">Ku</span>
        </Link>
        <h1 className="mt-4 text-lg font-semibold">Gabung sebagai kurir</h1>
        <p className="mb-4 text-sm text-slate-600">
          Ingin mengirim paket? <Link href="/daftar" className="font-medium text-blue-700 hover:underline">Daftar pelanggan</Link>.
        </p>
        <RegisterForm peran="kurir" />
        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun? <Link href="/login" className="font-medium text-blue-700 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
