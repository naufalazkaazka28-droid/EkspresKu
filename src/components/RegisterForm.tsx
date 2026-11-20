"use client";

import { useState, useTransition } from "react";
import { registerKurir, registerPelanggan } from "@/actions/auth";
import type { FormState } from "@/lib/types";
import { Field, btnCls, inputCls } from "./ui";

export default function RegisterForm({ peran }: { peran: "pelanggan" | "kurir" }) {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();
  const fe = state.fieldErrors ?? {};
  const isKurir = peran === "kurir";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await (isKurir ? registerKurir(fd) : registerPelanggan(fd));
          if (r) setState(r);
        });
      }}
    >
      {state.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" error={fe.nama}>
          <input name="nama" required className={inputCls} />
        </Field>
        <Field label="Nomor HP" error={fe.noHp}>
          <input name="noHp" type="tel" required placeholder="08123456789" className={inputCls} />
        </Field>
      </div>
      <Field label="Email" error={fe.email}>
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </Field>
      <Field label={isKurir ? "Alamat" : "Alamat (opsional)"} error={fe.alamat}>
        <textarea name="alamat" rows={2} required={isKurir} className={inputCls} />
      </Field>

      {isKurir && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kendaraan" error={fe.kendaraan}>
            <input name="kendaraan" required placeholder="Motor / Mobil box" className={inputCls} />
          </Field>
          <Field label="Plat nomor" error={fe.platNomor}>
            <input name="platNomor" required placeholder="S 1234 AB" className={inputCls} />
          </Field>
          <Field label="Wilayah tugas" error={fe.wilayahTugas}>
            <input name="wilayahTugas" required placeholder="Bojonegoro kota" className={inputCls} />
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kata sandi" error={fe.password} hint="Minimal 8 karakter.">
          <input name="password" type="password" required autoComplete="new-password" className={inputCls} />
        </Field>
        <Field label="Ulangi kata sandi" error={fe.konfirmasi}>
          <input name="konfirmasi" type="password" required autoComplete="new-password" className={inputCls} />
        </Field>
      </div>

      {isKurir && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Akun kurir baru perlu disetujui admin sebelum bisa dipakai masuk.
        </p>
      )}

      <button disabled={pending} className={`${btnCls} w-full`}>
        {pending ? "Memproses…" : isKurir ? "Daftar sebagai kurir" : "Daftar"}
      </button>
    </form>
  );
}
