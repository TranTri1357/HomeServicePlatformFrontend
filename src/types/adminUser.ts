/** A row in the admin user list — GET /api/admin/users. Status: 1 active · 0 blocked. */
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

/** Full user detail — GET /api/admin/users/{id}. */
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
