import { get, unwrap, type ApiResponse } from "./client";
import type { TopTasker } from "@/shared/types";

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
