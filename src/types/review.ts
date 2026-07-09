/** Request body for POST /api/bookings/{bookingItemId}/reviews. */
export interface CreateReviewInput {
  /** 1–5 stars. */
  rating: number;
  /** Optional comment, max 500 chars. */
  comment?: string;
}
