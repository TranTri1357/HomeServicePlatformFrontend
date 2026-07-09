/** Service category returned by GET /api/Categories/active. */
export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  /** Backend-relative image path, e.g. "/images/categories/home-cleaning.png". */
  iconUrl: string;
}
