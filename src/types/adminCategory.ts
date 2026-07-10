/** A row in the admin category list — GET /api/admin/categories. */
export interface AdminCategoryItem {
  categoryId: number;
  iconUrl: string | null;
  name: string;
  totalServices: number;
  totalTaskers: number;
  totalBookings: number;
  isActive: boolean;
}

/** Full category detail for editing — GET /api/admin/categories/{id}. */
export interface AdminCategoryDetail {
  categoryId: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
}

/** Body for POST /api/admin/categories. */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  iconUrl?: string;
}

/** Body for PUT /api/admin/categories/{id}. */
export interface UpdateCategoryInput {
  name: string;
  slug: string;
  iconUrl?: string;
  isActive: boolean;
}
