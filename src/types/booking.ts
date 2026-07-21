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


export interface BookingItemInput {
  serviceId: number;
  taskerId?: number | null;
  
  startAt: string;
  
  endAt: string;
  unitPrice: number;
  quantity: number;
}


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


export interface CreateBookingResult {
  bookingId: number;
  message: string;
  isSuccess: boolean;
  finalAmount: number;
}


export interface EmergencyBookingInput {
  serviceId: number;
  latitude: number;
  longitude: number;
  fullName: string;
  phone: string;
  addressLine: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  note?: string;
}


export interface EmergencyTaskerOffer {
  taskerId: number;
  fullName: string;
  price: number;
  distanceKm: number;
}


export interface EmergencyBookingResult {
  bookingId: number;
  serviceName: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  expiresInSeconds: number;
  radiusKm: number;
  taskers: EmergencyTaskerOffer[];
}


export type BookingStatusCode = 0 | 1 | 2 | 3 | 4 | 5 | 6;


export interface CancellationPreview {
  bookingId: number;
  
  canCancel: boolean;
  status: number;
  
  totalPaid: number;
  
  refundPercent: number;
  
  refundAmount: number;
  
  penaltyAmount: number;
  
  depositAtRisk: number;
  
  reason: string;
}


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
  
  hasReview: boolean;
}


export interface MyBooking {
  bookingId: number;
  fullAddress: string;
  subtotalAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  note: string | null;
  createdAt: string;
  status: number;
  
  isPaid: boolean;
  
  hasDispute: boolean;
  
  items: MyBookingItem[];
}
