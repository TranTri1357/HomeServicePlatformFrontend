import { get, unwrap, type ApiResponse } from "./client";
import type { Category } from "@/shared/types";

export type GetActiveCategoriesParams = {
  
  limit?: number;
};


export async function getActiveCategories(
  params?: GetActiveCategoriesParams,
): Promise<Category[]> {
  const response = await get<ApiResponse<Category[]>>("/Categories/active", { params });
  return unwrap(response);
}
