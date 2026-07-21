import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type {
  AdminCommissionItem,
  CreateCommissionInput,
  UpdateCommissionInput,
  PagedResult,
} from "@/shared/types";

export type GetAdminCommissionsParams = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};


export async function getCommissions(
  params?: GetAdminCommissionsParams,
): Promise<PagedResult<AdminCommissionItem>> {
  const response = await get<ApiResponse<PagedResult<AdminCommissionItem>>>("/admin/commissions", {
    params,
  });
  return unwrap(response);
}


export async function createCommission(input: CreateCommissionInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/admin/commissions", input);
  return unwrap(response);
}


export async function updateCommission(
  id: number,
  input: UpdateCommissionInput,
): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/commissions/${id}`, input);
  return unwrap(response);
}


export async function terminateCommission(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/admin/commissions/${id}`);
  return unwrap(response);
}
