import { get, put, unwrap, type ApiResponse } from "./client";
import type { AppNotification, PagedResult } from "@/shared/types";

/**
 * GET /api/customer/notifications — the current customer's notifications
 * (newest first, paged). Requires the Customer role; id comes from the JWT.
 */
export async function getMyNotifications(
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResult<AppNotification>> {
  const response = await get<ApiResponse<PagedResult<AppNotification>>>("/customer/notifications", {
    params: { pageNumber, pageSize },
  });
  return unwrap(response);
}

/** PUT /api/customer/notifications/{id}/read — mark one notification as read. */
export async function markNotificationRead(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/notifications/${id}/read`, {});
  return unwrap(response);
}

/**
 * GET /api/tasker/notifications — the current tasker's notifications
 * (newest first, paged). Requires the Tasker role; id comes from the JWT.
 */
export async function getTaskerNotifications(
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResult<AppNotification>> {
  const response = await get<ApiResponse<PagedResult<AppNotification>>>("/tasker/notifications", {
    params: { pageNumber, pageSize },
  });
  return unwrap(response);
}

/** PUT /api/tasker/notifications/{id}/read — mark one tasker notification as read. */
export async function markTaskerNotificationRead(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/notifications/${id}/read`, {});
  return unwrap(response);
}
