"use client";

import { useState, useTransition } from "react";
import { login } from "@/actions/auth";
import type { FormState } from "@/lib/types";
import { Field, btnCls, inputCls } from "./ui";

export default function LoginForm() {
  const [state, setState] = useState<FormState>({});
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => setState(await login(fd)));
      }}
    >
      {state.error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>}
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </Field>
      <Field label="Kata sandi">
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </Field>
      <button disabled={pending} className={`${btnCls} w-full`}>
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
