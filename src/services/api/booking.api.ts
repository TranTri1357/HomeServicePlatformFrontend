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
 * PUT /api/customer/bookings/{id}/cancel — the customer cancels their own booking.
 * Requires the Customer role; only Pending bookings can be cancelled. BookingId
 * comes from the route and CustomerId from the JWT, so only cancelReason is sent.
 */
export async function cancelBooking(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}
