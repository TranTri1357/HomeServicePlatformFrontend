import { get, put, unwrap, type ApiResponse } from "./client";
import type { AppNotification, PagedResult } from "@/shared/types";


export async function getMyNotifications(
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResult<AppNotification>> {
  const response = await get<ApiResponse<PagedResult<AppNotification>>>("/customer/notifications", {
    params: { pageNumber, pageSize },
  });
  return unwrap(response);
}


export async function markNotificationRead(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/notifications/${id}/read`, {});
  return unwrap(response);
}


export async function getTaskerNotifications(
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResult<AppNotification>> {
  const response = await get<ApiResponse<PagedResult<AppNotification>>>("/tasker/notifications", {
    params: { pageNumber, pageSize },
  });
  return unwrap(response);
}


export async function markTaskerNotificationRead(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/notifications/${id}/read`, {});
  return unwrap(response);
}
