/** A row in the admin booking list — GET /api/admin/bookings. Status is numeric (0–6). */
export interface AdminBookingItem {
  bookingId: number;
  customerId: number;
  customerName: string;
  status: number;
  finalAmount: number;
  addressLine: string;
  createdAt: string;
  /** Needed for optimistic-concurrency when updating status. */
  rowVersion: number;
}

/** Full booking detail — GET /api/admin/bookings/{id}. */
export interface AdminBookingDetail {
  bookingId: number;
  customerName: string;
  contactName: string;
  contactPhone: string;
  taskerName: string | null;
  status: number;
  subtotalAmount: number;
  discountAmount: number;
  finalAmount: number;
  note: string | null;
  createdAt: string;
  fullAddress: string;
}
