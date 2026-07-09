export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "upcoming";

export interface Booking {
  id: string;
  service: string;
  tech: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: string;
  address: string;
}

/** One line item when creating a booking — POST /api/customer/bookings. */
export interface BookingItemInput {
  serviceId: number;
  taskerId?: number | null;
  /** ISO 8601; must be in the future. */
  startAt: string;
  /** ISO 8601; must be after startAt. */
  endAt: string;
  unitPrice: number;
  quantity: number;
}

/** Request body for POST /api/customer/bookings. CustomerId comes from the JWT. */
export interface CreateBookingInput {
  note?: string;
  fullName: string;
  phone: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  addressLine: string;
  latitude?: number;
  longitude?: number;
  discountAmount?: number;
  bookingItems: BookingItemInput[];
}

/** Response of POST /api/customer/bookings. */
export interface CreateBookingResult {
  bookingId: number;
  message: string;
  isSuccess: boolean;
  finalAmount: number;
}

/**
 * Numeric booking status (matches backend BookingStatus enum):
 * 0 Pending · 1 Accepted · 2 OnTheWay · 3 InProgress · 4 Completed · 5 Cancelled · 6 Refund
 */
export type BookingStatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** One row of GET /api/customer/bookings/my-orders. */
export interface MyBooking {
  bookingId: number;
  /** First booking item's id — needed to submit a review. Null if no items. */
  bookingItemId: number | null;
  serviceName: string;
  taskerId: number | null;
  taskerName: string | null;
  startAt: string;
  endAt: string;
  fullAddress: string;
  finalAmount: number;
  status: number;
}
