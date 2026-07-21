
export interface AdminCategoryItem {
  categoryId: number;
  iconUrl: string | null;
  name: string;
  totalServices: number;
  totalTaskers: number;
  totalBookings: number;
  isActive: boolean;
}


export interface AdminCategoryDetail {
  categoryId: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
}


export interface CreateCategoryInput {
  name: string;
  slug: string;
  iconUrl?: string;
}


export interface UpdateCategoryInput {
  name: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
}
