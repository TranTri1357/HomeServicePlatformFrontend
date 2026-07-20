import type { LucideIcon } from "lucide-react";

export interface Service {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
}

/** Popular service returned by GET /api/Services/popular. */
export interface PopularService {
  serviceId: number;
  name: string;
  totalBookings: number;
  /** Lowest effective tasker price for this service, in VND. */
  startingPrice: number;
  /** Ảnh đã upload (Cloudinary); null thì UI dùng ảnh minh hoạ theo tên. */
  imageUrl: string | null;
}

/** One service in the explorer list — GET /api/Services/explorer. */
export interface ServiceExplorerItem {
  serviceId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalBookings: number;
  startingPrice: number;
  /** Điểm đánh giá TB của các thợ cung cấp dịch vụ; 0 = chưa có đánh giá. */
  avgRating: number;
  /** Backend currently returns null; UI falls back to a placeholder. */
  imageUrl: string | null;
}

/** A tasker suggested on a service detail page. */
export interface ServiceTaskerSuggestion {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  experienceYears: number;
  ratingAvg: number;
  currentPrice: number;
  /**
   * Khu vực hoạt động của thợ (mã hành chính GSO, tra tên qua `services/vnAddress`).
   * Backend chỉ trả mã tỉnh/quận, KHÔNG trả số nhà của thợ. Null khi thợ chưa khai địa chỉ.
   */
  provinceCode: string | null;
  districtCode: string | null;
  /** Khoảng cách đường chim bay tới địa chỉ đặt của khách (km); null khi thiếu tọa độ. */
  distanceKm: number | null;
}

/** Service detail — GET /api/Services/{id}. */
export interface ServiceDetailData {
  serviceId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalBookings: number;
  startingPrice: number;
  imageUrl: string | null;
  suggestedTaskers: ServiceTaskerSuggestion[];
}
