
export interface AdminServiceItem {
  serviceId: number;
  name: string;
  categoryName: string;
  totalTaskers: number;
  totalBookings: number;
  isActive: boolean;
  imageUrl: string | null;
}


export interface AdminServiceDetail {
  serviceId: number;
  categoryId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
  imageUrl: string | null;
}


export interface CreateServiceInput {
  categoryId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  imageUrl?: string;
}


export interface UpdateServiceInput {
  categoryId: number;
  name: string;
  description?: string;
  durationMinutes: number;
  isActive: boolean;
  imageUrl?: string;
}
