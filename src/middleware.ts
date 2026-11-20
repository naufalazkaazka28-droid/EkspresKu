import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { dashboardFor, type RoleName } from "./lib/roles";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const role = (req.auth.user as { role?: RoleName } | undefined)?.role;
  if (!role) return NextResponse.redirect(new URL("/login", req.nextUrl));

  const need: RoleName | null = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/kurir")
      ? "KURIR"
      : pathname.startsWith("/pelanggan")
        ? "PELANGGAN"
        : null;

  if (need && role !== need) {
    return NextResponse.redirect(new URL(dashboardFor(role), req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/kurir/:path*", "/pelanggan/:path*", "/profil/:path*"],
};
