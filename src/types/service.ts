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
}
