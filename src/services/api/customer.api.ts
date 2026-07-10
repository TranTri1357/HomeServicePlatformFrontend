import { get, put, unwrap, type ApiResponse } from "./client";
import type { CustomerProfileData, UpdateCustomerProfileInput } from "@/shared/types";

/**
 * GET /api/customer-profile — profile of the logged-in customer.
 * Requires the Customer role; the id is taken from the JWT server-side.
 */
export async function getCustomerProfile(): Promise<CustomerProfileData> {
  const response = await get<ApiResponse<CustomerProfileData>>("/customer-profile");
  return unwrap(response);
}

/**
 * PUT /api/customer-profile — update the logged-in customer's name + phone.
 * Requires the Customer role; the id is taken from the JWT server-side.
 */
export async function updateCustomerProfile(input: UpdateCustomerProfileInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/customer-profile", input);
  return unwrap(response);
}
