import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type {
  AdminServiceItem,
  AdminServiceDetail,
  CreateServiceInput,
  UpdateServiceInput,
  PagedResult,
} from "@/shared/types";

export type GetAdminServicesParams = {
  searchTerm?: string;
  pageIndex?: number;
  pageSize?: number;
};

/** GET /api/admin/services — paged service list. Requires Admin/SuperAdmin. */
export async function getServices(
  params?: GetAdminServicesParams,
): Promise<PagedResult<AdminServiceItem>> {
  const response = await get<ApiResponse<PagedResult<AdminServiceItem>>>("/admin/services", {
    params,
  });
  return unwrap(response);
}

/** GET /api/admin/services/{id} — full detail for editing. */
export async function getServiceDetail(id: number): Promise<AdminServiceDetail> {
  const response = await get<ApiResponse<AdminServiceDetail>>(`/admin/services/${id}`);
  return unwrap(response);
}

/** POST /api/admin/services — create a service. Returns the new id. */
export async function createService(input: CreateServiceInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/admin/services", input);
  return unwrap(response);
}

/** PUT /api/admin/services/{id} — update a service. */
export async function updateService(id: number, input: UpdateServiceInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/admin/services/${id}`, input);
  return unwrap(response);
}

/** DELETE /api/admin/services/{id} — soft-delete a service. */
export async function deleteService(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/admin/services/${id}`);
  return unwrap(response);
}
