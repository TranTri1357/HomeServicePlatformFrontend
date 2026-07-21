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


export async function getCategories(
  params?: GetAdminCategoriesParams,
): Promise<PagedResult<AdminCategoryItem>> {
  const response = await get<ApiResponse<PagedResult<AdminCategoryItem>>>("/admin/categories", {
    params,
  });
  return unwrap(response);
}


export async function getCategoryDetail(id: number): Promise<AdminCategoryDetail> {
  const response = await get<ApiResponse<AdminCategoryDetail>>(`/admin/categories/${id}`);
  return unwrap(response);
}


export async function createCategory(input: CreateCategoryInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/admin/categories", input);
  return unwrap(response);
}


export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/categories/${id}`, input);
  return unwrap(response);
}


export async function deleteCategory(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/admin/categories/${id}`);
  return unwrap(response);
}
