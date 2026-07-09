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

/** One service in the explorer list — GET /api/Services/explorer. */
export interface ServiceExplorerItem {
  serviceId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalBookings: number;
  startingPrice: number;
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
