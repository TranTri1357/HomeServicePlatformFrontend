import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { AddressInput, CustomerAddress } from "@/shared/types";

/**
 * Địa chỉ hoạt động của thợ — dùng chung bảng Address (Phương án B), endpoint
 * riêng /api/tasker/addresses (UserId ép từ JWT của thợ). Cùng shape với địa chỉ
 * khách nên tái dùng được component quản lý địa chỉ.
 */

/** GET /api/tasker/addresses — các địa chỉ đã lưu của thợ, mặc định trước. */
export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const response = await get<ApiResponse<CustomerAddress[]>>("/tasker/addresses");
  return unwrap(response);
}

/** POST /api/tasker/addresses — thêm địa chỉ mới. Trả về id mới. */
export async function createAddress(input: AddressInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/tasker/addresses", input);
  return unwrap(response);
}

/** PUT /api/tasker/addresses/{id} — cập nhật địa chỉ. */
export async function updateAddress(id: number, input: AddressInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/addresses/${id}`, input);
  return unwrap(response);
}

/** DELETE /api/tasker/addresses/{id} — xóa địa chỉ. */
export async function deleteAddress(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/tasker/addresses/${id}`);
  return unwrap(response);
}

/** PUT /api/tasker/addresses/{id}/default — đặt địa chỉ mặc định. */
export async function setDefaultAddress(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/addresses/${id}/default`, {});
  return unwrap(response);
}
