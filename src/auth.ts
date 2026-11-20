import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const email = String(c?.email ?? "").toLowerCase().trim();
        const password = String(c?.password ?? "");
        if (!email || !password) return null;
        const u = await prisma.user.findUnique({ where: { email }, include: { kurir: true } });
        if (!u || !u.aktif) return null;
        if (u.role === "KURIR" && !u.kurir?.disetujui) return null;
        if (!(await bcrypt.compare(password, u.password))) return null;
        return { id: u.id, name: u.nama, email: u.email, role: u.role } as { id: string; name: string; email: string };
      },
    }),
  ],
});
