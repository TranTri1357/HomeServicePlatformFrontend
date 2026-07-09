import { get, unwrap, type ApiResponse } from "./client";
import type { CustomerProfileData } from "@/shared/types";

/**
 * GET /api/customer-profile — profile of the logged-in customer.
 * Requires the Customer role; the id is taken from the JWT server-side.
 */
export async function getCustomerProfile(): Promise<CustomerProfileData> {
  const response = await get<ApiResponse<CustomerProfileData>>("/customer-profile");
  return unwrap(response);
}
