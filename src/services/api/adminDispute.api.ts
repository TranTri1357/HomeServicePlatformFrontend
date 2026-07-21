import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminDisputeItem, PagedResult } from "@/shared/types";

export type GetAdminDisputesParams = {
  status?: number;
  pageIndex?: number;
  pageSize?: number;
};


export async function getDisputes(
  params?: GetAdminDisputesParams,
): Promise<PagedResult<AdminDisputeItem>> {
  const response = await get<ApiResponse<PagedResult<AdminDisputeItem>>>("/admin/disputes", {
    params,
  });
  return unwrap(response);
}


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
