import { get, unwrap, type ApiResponse } from "./client";
import type {
  PagedResult,
  PopularService,
  ServiceDetailData,
  ServiceExplorerItem,
} from "@/shared/types";

export type GetPopularServicesParams = {
  
  limit?: number;
};


export async function getPopularServices(
  params?: GetPopularServicesParams,
): Promise<PopularService[]> {
  const response = await get<ApiResponse<PopularService[]>>("/Services/popular", { params });
  return unwrap(response);
}

export type ServiceSortBy = "price_asc" | "price_desc" | "rating" | "popular";

export type GetServicesExplorerParams = {
  searchTerm?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  
  minRating?: number;
  sortBy?: ServiceSortBy;
  pageIndex?: number;
  pageSize?: number;
};


export async function getServicesExplorer(
  params?: GetServicesExplorerParams,
): Promise<PagedResult<ServiceExplorerItem>> {
  const response = await get<ApiResponse<PagedResult<ServiceExplorerItem>>>("/Services/explorer", {
    params,
  });
  return unwrap(response);
}


export async function getServiceDetail(id: number | string): Promise<ServiceDetailData> {
  const response = await get<ApiResponse<ServiceDetailData>>(`/Services/${id}`);
  return unwrap(response);
}
