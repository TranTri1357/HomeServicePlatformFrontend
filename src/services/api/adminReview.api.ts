import { get, del, unwrap, type ApiResponse } from "./client";
import type { AdminReviewItem, PagedResult } from "@/shared/types";

export type GetAdminReviewsParams = {
  searchTerm?: string;
  rating?: number;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/reviews — paged review list. Requires Admin/SuperAdmin. */
export async function getReviews(
  params?: GetAdminReviewsParams,
): Promise<PagedResult<AdminReviewItem>> {
  const response = await get<ApiResponse<PagedResult<AdminReviewItem>>>("/admin/reviews", {
    params,
  });
  return unwrap(response);
}

/** DELETE /api/admin/reviews/{id} — remove a review (recomputes tasker rating). */
export async function deleteReview(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/admin/reviews/${id}`);
  return unwrap(response);
}
