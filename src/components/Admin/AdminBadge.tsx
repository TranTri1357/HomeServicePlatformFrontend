const ADMIN_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-green-100 text-green-700" },
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
  blocked: { label: "Bị khóa", color: "bg-red-100 text-red-700" },
  published: { label: "Đã đăng", color: "bg-green-100 text-green-700" },
  flagged: { label: "Vi phạm", color: "bg-red-100 text-red-700" },
  inactive: { label: "Tắt", color: "bg-gray-100 text-gray-600" },
  open: { label: "Mới", color: "bg-red-100 text-red-700" },
  processing: { label: "Đang xử lý", color: "bg-amber-100 text-amber-700" },
  resolved: { label: "Đã giải quyết", color: "bg-green-100 text-green-700" },
  high: { label: "Cao", color: "bg-red-100 text-red-700" },
  medium: { label: "Trung bình", color: "bg-amber-100 text-amber-700" },
  low: { label: "Thấp", color: "bg-gray-100 text-gray-600" },
};

interface AdminBadgeProps {
  status: string;
}

export function AdminBadge({ status }: AdminBadgeProps) {
  const cfg = ADMIN_STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}
