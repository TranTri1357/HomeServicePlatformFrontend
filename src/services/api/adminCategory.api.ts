import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type {
  AdminCategoryItem,
  AdminCategoryDetail,
  CreateCategoryInput,
  UpdateCategoryInput,
  PagedResult,
} from "@/shared/types";

export type GetAdminCategoriesParams = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/categories — paged category list. Requires Admin/SuperAdmin. */
export async function getCategories(
  params?: GetAdminCategoriesParams,
): Promise<PagedResult<AdminCategoryItem>> {
  const response = await get<ApiResponse<PagedResult<AdminCategoryItem>>>("/admin/categories", {
    params,
  });
  return unwrap(response);
}

/** GET /api/admin/categories/{id} — full detail for editing. */
export async function getCategoryDetail(id: number): Promise<AdminCategoryDetail> {
  const response = await get<ApiResponse<AdminCategoryDetail>>(`/admin/categories/${id}`);
  return unwrap(response);
}

/** POST /api/admin/categories — create a category. Returns the new id. */
export async function createCategory(input: CreateCategoryInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/admin/categories", input);
  return unwrap(response);
}

/** PUT /api/admin/categories/{id} — update a category. */
export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/categories/${id}`, input);
  return unwrap(response);
}

/** DELETE /api/admin/categories/{id} — soft-delete a category. */
export async function deleteCategory(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/admin/categories/${id}`);
  return unwrap(response);
}
