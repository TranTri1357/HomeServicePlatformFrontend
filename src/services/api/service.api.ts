import { get, unwrap, type ApiResponse } from "./client";
import type { PopularService, Service } from "@/shared/types";

export type ServiceListParams = {
  search?: string;
  category?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
};

export async function getServices(params?: ServiceListParams): Promise<Service[]> {
  return get<Service[]>("/services", { params });
}

export async function getServiceById(id: number | string): Promise<Service> {
  return get<Service>(`/services/${id}`);
}

export type GetPopularServicesParams = {
  /** Number of popular services to return. Backend validates 1 ≤ limit ≤ 10 (default 5). */
  limit?: number;
};

/**
 * GET /api/Services/popular
 * Active, non-deleted services ordered by totalBookings desc. `startingPrice`
 * is the lowest effective tasker price for each service.
 */
export async function getPopularServices(
  params?: GetPopularServicesParams,
): Promise<PopularService[]> {
  const response = await get<ApiResponse<PopularService[]>>("/Services/popular", { params });
  return unwrap(response);
}
