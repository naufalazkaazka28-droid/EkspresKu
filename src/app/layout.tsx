import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EkspresKu — Ekspedisi Paket",
  description: "Sistem informasi ekspedisi paket: kirim, lacak, dan kelola pengiriman.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
