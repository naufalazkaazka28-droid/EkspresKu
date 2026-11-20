import { gantiPassword, updateProfil } from "@/actions/user";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Flash, PageHeader, inputCls } from "@/components/ui";
import { requireRole } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; s?: string }> }) {
  const user = await requireRole("ADMIN", "KURIR", "PELANGGAN");
  const { e, s } = await searchParams;
  return (
    <>
      <PageHeader title="Profil" desc={`${user.email} · ${user.role.toLowerCase()}`} />
      <Flash e={e} s={s} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Data diri">
          <form action={updateProfil} className="space-y-3">
            <Field label="Nama"><input name="nama" required defaultValue={user.nama} className={inputCls} /></Field>
            <Field label="Nomor HP"><input name="noHp" type="tel" defaultValue={user.noHp ?? ""} className={inputCls} /></Field>
            <Field label="Alamat"><textarea name="alamat" rows={2} defaultValue={user.alamat ?? ""} className={inputCls} /></Field>
            <SubmitButton>Simpan</SubmitButton>
          </form>
        </Card>
        <Card title="Ganti kata sandi">
          <form action={gantiPassword} className="space-y-3">
            <Field label="Kata sandi lama"><input name="lama" type="password" required autoComplete="current-password" className={inputCls} /></Field>
            <Field label="Kata sandi baru" hint="Minimal 8 karakter."><input name="baru" type="password" required autoComplete="new-password" className={inputCls} /></Field>
            <Field label="Ulangi kata sandi baru"><input name="konfirmasi" type="password" required autoComplete="new-password" className={inputCls} /></Field>
            <SubmitButton>Ganti kata sandi</SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
