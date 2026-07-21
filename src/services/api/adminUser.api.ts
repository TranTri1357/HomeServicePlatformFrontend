import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminUserItem, AdminUserDetail, PagedResult } from "@/shared/types";

export type GetAdminUsersParams = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};


export async function getUsers(params?: GetAdminUsersParams): Promise<PagedResult<AdminUserItem>> {
  const response = await get<ApiResponse<PagedResult<AdminUserItem>>>("/admin/users", { params });
  return unwrap(response);
}


export async function getUserDetail(id: number): Promise<AdminUserDetail> {
  const response = await get<ApiResponse<AdminUserDetail>>(`/admin/users/${id}`);
  return unwrap(response);
}


export async function toggleUserStatus(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/users/${id}/toggle-status`, {});
  return unwrap(response);
}
