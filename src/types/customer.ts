/** Customer profile — GET /api/customer-profile. */
export interface CustomerProfileData {
  customerId: number;
  fullName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  totalBookingsCount: number;
  completedBookingsCount: number;
}
