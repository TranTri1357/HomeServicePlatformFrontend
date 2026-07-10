/** A row in the admin service list — GET /api/admin/services. */
export interface AdminServiceItem {
  serviceId: number;
  name: string;
  categoryName: string;
  totalTaskers: number;
  totalBookings: number;
  isActive: boolean;
}

/** Full service detail for editing — GET /api/admin/services/{id}. */
export interface AdminServiceDetail {
  serviceId: number;
  categoryId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
}

/** Body for POST /api/admin/services. */
export interface CreateServiceInput {
  categoryId: number;
  name: string;
  description?: string;
  durationMinutes: number;
}

/** Body for PUT /api/admin/services/{id}. */
export interface UpdateServiceInput {
  categoryId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  isActive: boolean;
}
