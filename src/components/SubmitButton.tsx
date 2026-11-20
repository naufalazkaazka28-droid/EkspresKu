"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { btnCls } from "./ui";

export default function SubmitButton({
  children,
  className,
  pendingText = "Memproses…",
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className ?? btnCls}>
      {pending ? pendingText : children}
    </button>
  );
}
