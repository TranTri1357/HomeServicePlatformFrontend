import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { AddressInput, CustomerAddress } from "@/shared/types";

/**
 * GET /api/customer/addresses — the current customer's saved addresses,
 * default first. Requires the Customer role; CustomerId comes from the JWT.
 */
export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const response = await get<ApiResponse<CustomerAddress[]>>("/customer/addresses");
  return unwrap(response);
}

/** POST /api/customer/addresses — add a new address. Returns the new id. */
export async function createAddress(input: AddressInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/customer/addresses", input);
  return unwrap(response);
}

/** PUT /api/customer/addresses/{id} — update an address. */
export async function updateAddress(id: number, input: AddressInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/addresses/${id}`, input);
  return unwrap(response);
}

/** DELETE /api/customer/addresses/{id} — remove an address. */
export async function deleteAddress(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/customer/addresses/${id}`);
  return unwrap(response);
}

/** PUT /api/customer/addresses/{id}/default — mark an address as the default. */
export async function setDefaultAddress(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/addresses/${id}/default`, {});
  return unwrap(response);
}
