import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminUserItem, AdminUserDetail, PagedResult } from "@/shared/types";

export type GetAdminUsersParams = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/users — paged user list. Requires Admin/SuperAdmin. */
export async function getUsers(params?: GetAdminUsersParams): Promise<PagedResult<AdminUserItem>> {
  const response = await get<ApiResponse<PagedResult<AdminUserItem>>>("/admin/users", { params });
  return unwrap(response);
}

/** GET /api/admin/users/{id} — full detail (roles, wallet, addresses...). */
export async function getUserDetail(id: number): Promise<AdminUserDetail> {
  const response = await get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`);
  return unwrap(response);
}

/** PUT /api/admin/users/{id}/toggle-status — lock/unlock an account. */
export async function toggleUserStatus(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/users/${id}/toggle-status`, {});
  return unwrap(response);
}
