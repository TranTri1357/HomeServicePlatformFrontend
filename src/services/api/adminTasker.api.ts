import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminTaskerItem, AdminTaskerDetail, PagedResult } from "@/shared/types";

export type GetAdminTaskersParams = {
  searchTerm?: string;
  status?: number;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/taskers — paged tasker list. Requires Admin/SuperAdmin. */
export async function getTaskers(
  params?: GetAdminTaskersParams,
): Promise<PagedResult<AdminTaskerItem>> {
  const response = await get<ApiResponse<PagedResult<AdminTaskerItem>>>("/admin/taskers", {
    params,
  });
  return unwrap(response);
}

/** GET /api/admin/taskers/{id} — full detail. */
export async function getTaskerDetail(id: number): Promise<AdminTaskerDetail> {
  const response = await get<ApiResponse<AdminTaskerDetail>>(`/admin/taskers/${id}`);
  return unwrap(response);
}

/** PUT /api/admin/taskers/{id}/approve — approve a pending profile. */
export async function approveTasker(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/approve`, {});
  return unwrap(response);
}

/** PUT /api/admin/taskers/{id}/reject — reject a pending profile with a reason. */
export async function rejectTasker(id: number, reason: string): Promise<boolean> {
  // Endpoint binds [FromBody] string? — send the reason as a raw JSON string.
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/reject`, reason);
  return unwrap(response);
}

/** PUT /api/admin/taskers/{id}/toggle-status — lock/unlock an active/blocked profile. */
export async function toggleTaskerStatus(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/toggle-status`, {});
  return unwrap(response);
}
