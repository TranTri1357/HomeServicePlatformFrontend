import type { PopularService } from "@/shared/types";

/** Mock fallback for the "Dịch vụ phổ biến" list while the backend is unreachable. */
export const popularServices: PopularService[] = [
  { serviceId: 3, name: "Rửa chén", totalBookings: 2, startingPrice: 90000 },
  { serviceId: 9, name: "Tổng vệ sinh", totalBookings: 1, startingPrice: 850000 },
  { serviceId: 1, name: "Quét nhà", totalBookings: 1, startingPrice: 100000 },
];
