import { get, post, put, unwrap, type ApiResponse } from "./client";
import type { CreateBookingInput, CreateBookingResult, MyBooking } from "@/shared/types";

/** GET /api/customer/bookings/my-orders — the current customer's bookings. */
export async function getMyBookings(): Promise<MyBooking[]> {
  const response = await get<ApiResponse<MyBooking[]>>("/customer/bookings/my-orders");
  return unwrap(response);
}

/**
 * POST /api/customer/bookings — create a booking.
 * Requires the Customer role; CustomerId is read from the JWT server-side,
 * so it must NOT be sent in the body.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const response = await post<ApiResponse<CreateBookingResult>>("/customer/bookings", input);
  return unwrap(response);
}

/**
 * PUT /api/tasker/bookings/{id}/cancel — cancel a booking with a reason.
 * NOTE: the backend restricts this endpoint to the Tasker role, so calling it
 * with a Customer token returns 403.
 */
export async function cancelBooking(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}
