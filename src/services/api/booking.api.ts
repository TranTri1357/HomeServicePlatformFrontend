import { get, post, put, unwrap, type ApiResponse } from "./client";
import type {
  CancellationPreview,
  CreateBookingInput,
  CreateBookingResult,
  CreateDisputeInput,
  CreateReviewInput,
  EmergencyBookingInput,
  EmergencyBookingResult,
  MyBooking,
  PagedResult,
} from "@/shared/types";

export type GetMyBookingsParams = {
  
  status?: number[];
  
  search?: string;
  pageIndex?: number;
  pageSize?: number;
};


export async function getMyBookings(
  params?: GetMyBookingsParams,
): Promise<PagedResult<MyBooking>> {
  const response = await get<ApiResponse<PagedResult<MyBooking>>>(
    "/customer/bookings/my-orders",
    { params },
  );
  return unwrap(response);
}


export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const response = await post<ApiResponse<CreateBookingResult>>("/customer/bookings", input);
  return unwrap(response);
}


export async function createEmergencyBooking(
  input: EmergencyBookingInput,
): Promise<EmergencyBookingResult> {
  const response = await post<ApiResponse<EmergencyBookingResult>>(
    "/customer/bookings/emergency",
    input,
  );
  return unwrap(response);
}


export async function rebroadcastEmergencyBooking(
  bookingId: number,
  radiusKm: number,
): Promise<EmergencyBookingResult> {
  const response = await post<ApiResponse<EmergencyBookingResult>>(
    `/customer/bookings/emergency/${bookingId}/broadcast`,
    {},
    { params: { radiusKm } },
  );
  return unwrap(response);
}


export async function cancelEmergencyBooking(bookingId: number): Promise<boolean> {
  const response = await post<ApiResponse<{ customerId: number; taskerId: number }>>(
    `/customer/bookings/emergency/${bookingId}/cancel`,
    {},
  );
  return Boolean(unwrap(response));
}


export async function getCancellationPreview(bookingId: number): Promise<CancellationPreview> {
  const response = await get<ApiResponse<CancellationPreview>>(
    `/customer/bookings/${bookingId}/cancellation-preview`,
  );
  return unwrap(response);
}


export async function cancelBooking(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}


export async function createReview(
  bookingItemId: number,
  input: CreateReviewInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingItemId}/reviews`, input);
  return unwrap(response);
}


export async function createDispute(
  bookingId: number,
  input: CreateDisputeInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingId}/disputes`, input);
  return unwrap(response);
}
