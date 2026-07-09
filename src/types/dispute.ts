/** Request body for POST /api/bookings/{bookingId}/disputes. */
export interface CreateDisputeInput {
  /** Complaint reason, 10–1000 chars. */
  reason: string;
}
