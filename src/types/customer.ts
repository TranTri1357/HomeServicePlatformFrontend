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

/** Request body for PUT /api/customer-profile. Email is not editable. */
export interface UpdateCustomerProfileInput {
  fullName: string;
  phone: string;
}
