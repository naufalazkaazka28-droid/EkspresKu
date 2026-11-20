"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROOTS = ["/admin", "/kurir", "/pelanggan"];

export default function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1">
      {items.map((i) => {
        const active = ROOTS.includes(i.href) ? path === i.href : path === i.href || path.startsWith(i.href + "/");
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
