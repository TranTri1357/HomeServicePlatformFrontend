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

/** Body for POST /api/customer/bookings/emergency — direct request to one nearby tasker. */
export interface EmergencyBookingInput {
  serviceId: number;
  taskerId: number;
  latitude: number;
  longitude: number;
  fullName: string;
  phone: string;
  addressLine: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  unitPrice: number;
  note?: string;
}

/** Response of POST /api/customer/bookings/emergency. */
export interface EmergencyBookingResult {
  bookingId: number;
  taskerId: number;
  serviceName: string;
  addressLine: string;
  amount: number;
  distanceKm: number;
  expiresInSeconds: number;
}

/**
 * Numeric booking status (matches backend BookingStatus enum):
 * 0 Pending · 1 Accepted · 2 OnTheWay · 3 InProgress · 4 Completed · 5 Cancelled · 6 Refund
 */
export type BookingStatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** One service line inside a booking (a booking may have several). */
export interface MyBookingItem {
  bookingItemId: number;
  serviceName: string;
  taskerId: number | null;
  taskerName: string | null;
  startAt: string;
  endAt: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: number;
  /** True once this item has been reviewed — hides the review button. */
  hasReview: boolean;
}

/** One row of GET /api/customer/bookings/my-orders. */
export interface MyBooking {
  bookingId: number;
  fullAddress: string;
  subtotalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  note: string | null;
  createdAt: string;
  status: number;
  /** True once a successful payment exists — hides the pay button. */
  isPaid: boolean;
  /** True once a complaint has been filed — hides the complaint button. */
  hasDispute: boolean;
  /** All service line items of this booking (1..n). */
  items: MyBookingItem[];
}
