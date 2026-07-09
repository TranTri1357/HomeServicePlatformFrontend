import { get, unwrap, type ApiResponse } from "./client";
import type { NearbyTasker, TaskerDetail, TaskerQuickInfo, TopTasker } from "@/shared/types";

export type GetTopTaskersParams = {
  /** Number of featured taskers to return. Backend validates 1 ≤ limit ≤ 10 (default 5). */
  limit?: number;
};

/**
 * GET /api/Taskers/top
 * Returns active, verified, non-deleted taskers ordered by ratingAvg desc then
 * totalReviews desc. Optional `limit` (1–10, default 5) caps the list.
 */
export async function getTopTaskers(params?: GetTopTaskersParams): Promise<TopTasker[]> {
  const response = await get<ApiResponse<TopTasker[]>>("/Taskers/top", { params });
  return unwrap(response);
}

export type GetNearbyTaskersParams = {
  serviceId: number;
  lat: number;
  lng: number;
  /** Search radius in km (backend default 10, max 50). */
  radius?: number;
};

/**
 * GET /api/Taskers/nearby
 * Taskers within `radius` km of (lat,lng) who provide `serviceId`.
 */
export async function getNearbyTaskers(params: GetNearbyTaskersParams): Promise<NearbyTasker[]> {
  const response = await get<ApiResponse<NearbyTasker[]>>("/Taskers/nearby", { params });
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}
 * Full public profile of a tasker: bio, skills, review summary and recent reviews.
 */
export async function getTaskerDetail(taskerId: number): Promise<TaskerDetail> {
  const response = await get<ApiResponse<TaskerDetail>>(`/Taskers/${taskerId}`);
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}/service/{serviceId}/quick-info
 * Popup info for a tasker in the context of a specific service.
 */
export async function getTaskerQuickInfo(
  taskerId: number,
  serviceId: number,
): Promise<TaskerQuickInfo> {
  const response = await get<ApiResponse<TaskerQuickInfo>>(
    `/Taskers/${taskerId}/service/${serviceId}/quick-info`,
  );
  return unwrap(response);
}
