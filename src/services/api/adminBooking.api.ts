import { get, put, unwrap, type ApiResponse } from "./client";
import type { AdminBookingItem, AdminBookingDetail, PagedResult } from "@/shared/types";

export type GetAdminBookingsParams = {
  customerId?: number;
  status?: number;
  fromDate?: string;
  toDate?: string;
  pageIndex?: number;
  pageSize?: number;
};


export async function getBookings(
  params?: GetAdminBookingsParams,
): Promise<PagedResult<AdminBookingItem>> {
  const response = await get<ApiResponse<PagedResult<AdminBookingItem>>>("/admin/bookings", {
    params,
  });
  return unwrap(response);
}


export async function getBookingDetail(id: number): Promise<AdminBookingDetail> {
  const response = await get<ApiResponse<AdminBookingDetail>>(`/admin/bookings/${id}`);
  return unwrap(response);
}


export async function updateBookingStatus(
  id: number,
  newStatus: number,
  currentRowVersion: number,
): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/bookings/${id}/status`, {
    newStatus,
    currentRowVersion,
  });
  return unwrap(response);
}
