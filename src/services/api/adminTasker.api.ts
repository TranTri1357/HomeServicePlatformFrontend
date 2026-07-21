import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminTaskerItem, AdminTaskerDetail, PagedResult } from "@/shared/types";

export type GetAdminTaskersParams = {
  searchTerm?: string;
  status?: number;
  pageIndex?: number;
  pageSize?: number;
};


export async function getTaskers(
  params?: GetAdminTaskersParams,
): Promise<PagedResult<AdminTaskerItem>> {
  const response = await get<ApiResponse<PagedResult<AdminTaskerItem>>>("/admin/taskers", {
    params,
  });
  return unwrap(response);
}


export async function getTaskerDetail(id: number): Promise<AdminTaskerDetail> {
  const response = await get<ApiResponse<AdminTaskerDetail>>(`/admin/taskers/${id}`);
  return unwrap(response);
}


export async function approveTasker(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/approve`, {});
  return unwrap(response);
}


export async function rejectTasker(id: number, reason: string): Promise<boolean> {
  
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/reject`, reason);
  return unwrap(response);
}


export async function toggleTaskerStatus(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/taskers/${id}/toggle-status`, {});
  return unwrap(response);
}
