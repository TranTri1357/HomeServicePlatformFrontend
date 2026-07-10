import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminDisputeItem, PagedResult } from "@/shared/types";

export type GetAdminDisputesParams = {
  status?: number;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/disputes — paged dispute list. Requires Admin/SuperAdmin. */
export async function getDisputes(
  params?: GetAdminDisputesParams,
): Promise<PagedResult<AdminDisputeItem>> {
  const response = await get<ApiResponse<PagedResult<AdminDisputeItem>>>("/admin/disputes", {
    params,
  });
  return unwrap(response);
}

/**
 * PUT /api/admin/disputes/{id}/resolve — settle a dispute.
 * newStatus: 1 = đồng ý hoàn tiền · 2 = từ chối. `currentRowVersion` guards
 * against two admins resolving the same case at once.
 */
export async function resolveDispute(
  id: number,
  newStatus: number,
  resolutionNote: string,
  refundAmount: number | null,
  currentRowVersion: number,
): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/disputes/${id}/resolve`, {
    newStatus,
    resolutionNote,
    refundAmount,
    currentRowVersion,
  });
  return unwrap(response);
}
