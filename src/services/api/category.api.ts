import { get, unwrap, type ApiResponse } from "./client";
import type { Category } from "@/shared/types";

export type GetActiveCategoriesParams = {
  /** Max number of categories to return. Backend validates: 1 ≤ limit ≤ 10. */
  limit?: number;
};

/**
 * GET /api/Categories/active
 * Returns active, non-deleted categories sorted ascending by categoryId.
 * Optional `limit` (1–10) trims the list on the backend.
 */
export async function getActiveCategories(
  params?: GetActiveCategoriesParams,
): Promise<Category[]> {
  const response = await get<ApiResponse<Category[]>>("/Categories/active", { params });
  return unwrap(response);
}
