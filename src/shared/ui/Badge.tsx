import { STATUS_CONFIG } from "@/shared/constants";
import type { BookingStatus } from "@/shared/types";

interface BadgeProps {
  status: BookingStatus;
}

export function Badge({ status }: BadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
