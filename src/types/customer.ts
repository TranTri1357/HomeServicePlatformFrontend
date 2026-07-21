
export interface CustomerProfileData {
  customerId: number;
  fullName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  totalBookingsCount: number;
  completedBookingsCount: number;
}


export interface UpdateCustomerProfileInput {
  fullName: string;
  phone: string;
}
