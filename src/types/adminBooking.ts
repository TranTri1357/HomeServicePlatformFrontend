
export interface AdminBookingItem {
  bookingId: number;
  customerId: number;
  customerName: string;
  status: number;
  finalAmount: number;
  addressLine: string;
  createdAt: string;
  
  rowVersion: number;
}


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
