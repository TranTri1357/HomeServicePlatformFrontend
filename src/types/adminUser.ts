
export interface AdminUserItem {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  status: number;
}

export interface AdminUserAddress {
  addressId: number;
  addressLine: string;
  isDefault: boolean;
}


export interface AdminUserDetail {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  status: number;
  createdAt: string;
  lastLoginAt: string | null;
  walletBalance: number;
  roles: string[];
  addresses: AdminUserAddress[];
}
