import type { StatusCfg } from "@/types/navigation";
import type { BookingStatus } from "@/types/booking";

export const STATUS_CONFIG: Record<BookingStatus, StatusCfg> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  accepted: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  in_progress: {
    label: "Đang thực hiện",
    color: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  upcoming: { label: "Sắp tới", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
};
