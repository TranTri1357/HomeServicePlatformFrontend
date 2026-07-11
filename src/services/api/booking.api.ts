import { get, post, put, unwrap, type ApiResponse } from "./client";
import type {
  CreateBookingInput,
  CreateBookingResult,
  CreateDisputeInput,
  CreateReviewInput,
  EmergencyBookingInput,
  EmergencyBookingResult,
  MyBooking,
} from "@/shared/types";

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
 * POST /api/customer/bookings/emergency — call one nearby available tasker directly.
 * CustomerId comes from the JWT. Pays cash on completion (no upfront payment).
 */
export async function createEmergencyBooking(
  input: EmergencyBookingInput,
): Promise<EmergencyBookingResult> {
  const response = await post<ApiResponse<EmergencyBookingResult>>(
    "/customer/bookings/emergency",
    input,
  );
  return unwrap(response);
}

/**
 * POST /api/customer/bookings/emergency/{id}/cancel — customer cancels a pending
 * emergency request (timed out / chose another tasker). Notifies the tasker.
 */
export async function cancelEmergencyBooking(bookingId: number): Promise<boolean> {
  const response = await post<ApiResponse<{ customerId: number; taskerId: number }>>(
    `/customer/bookings/emergency/${bookingId}/cancel`,
    {},
  );
  return Boolean(unwrap(response));
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

/**
 * POST /api/bookings/{bookingItemId}/reviews — review a completed job.
 * Requires the Customer role; CustomerId comes from the JWT. The booking item
 * must belong to the customer and its booking must be Completed. Returns the
 * new review id.
 */
export async function createReview(
  bookingItemId: number,
  input: CreateReviewInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingItemId}/reviews`, input);
  return unwrap(response);
}

/**
 * POST /api/bookings/{bookingId}/disputes — file a complaint about a booking.
 * Requires the Customer role; CustomerId comes from the JWT. Reason must be
 * 10–1000 chars. Returns the new dispute id.
 */
export async function createDispute(
  bookingId: number,
  input: CreateDisputeInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingId}/disputes`, input);
  return unwrap(response);
}
