import type { StatusPaket } from "@prisma/client";
import { STATUS_LABEL, STATUS_WARNA } from "@/lib/status";

export default function StatusBadge({ status }: { status: StatusPaket }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_WARNA[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
