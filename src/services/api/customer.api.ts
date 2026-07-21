import { get, put, unwrap, type ApiResponse } from "./client";
import type { CustomerProfileData, UpdateCustomerProfileInput } from "@/shared/types";


export async function getCustomerProfile(): Promise<CustomerProfileData> {
  const response = await get<ApiResponse<CustomerProfileData>>("/customer-profile");
  return unwrap(response);
}


export async function updateCustomerProfile(input: UpdateCustomerProfileInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/customer-profile", input);
  return unwrap(response);
}
