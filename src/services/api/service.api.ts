import { get, unwrap, type ApiResponse } from "./client";
import type {
  PagedResult,
  PopularService,
  Service,
  ServiceDetailData,
  ServiceExplorerItem,
} from "@/shared/types";

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

export type ServiceSortBy = "price_asc" | "price_desc" | "popular";

export type GetServicesExplorerParams = {
  searchTerm?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ServiceSortBy;
  pageIndex?: number;
  pageSize?: number;
};

/**
 * GET /api/Services/explorer
 * Paged list of active services with search / category / price filters and
 * sorting (price_asc | price_desc | popular; defaults to popular).
 */
export async function getServicesExplorer(
  params?: GetServicesExplorerParams,
): Promise<PagedResult<ServiceExplorerItem>> {
  const response = await get<ApiResponse<PagedResult<ServiceExplorerItem>>>("/Services/explorer", {
    params,
  });
  return unwrap(response);
}

/**
 * GET /api/Services/{id}
 * Full detail of a single active service, including suggested taskers.
 */
export async function getServiceDetail(id: number | string): Promise<ServiceDetailData> {
  const response = await get<ApiResponse<ServiceDetailData>>(`/Services/${id}`);
  return unwrap(response);
}
