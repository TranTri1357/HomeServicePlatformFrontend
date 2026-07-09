import { get, unwrap, type ApiResponse } from "./client";
import type { CustomerAddress } from "@/shared/types";

/**
 * GET /api/customer/addresses — the current customer's saved addresses,
 * default first. Requires the Customer role; CustomerId comes from the JWT.
 */
export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const response = await get<ApiResponse<CustomerAddress[]>>("/customer/addresses");
  return unwrap(response);
}
