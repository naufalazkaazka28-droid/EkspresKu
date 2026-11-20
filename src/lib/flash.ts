import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/** Kembali ke halaman dengan pesan sukses (s) atau galat (e). Hanya dipanggil dari Server Action. */
export function flash(path: string, m: { e?: string; s?: string }): never {
  const q = new URLSearchParams();
  if (m.e) q.set("e", m.e);
  if (m.s) q.set("s", m.s);
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}${q.toString()}`);
}
