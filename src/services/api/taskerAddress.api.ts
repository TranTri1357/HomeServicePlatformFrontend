import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { AddressInput, CustomerAddress } from "@/shared/types";




export async function getMyAddresses(): Promise<CustomerAddress[]> {
  const response = await get<ApiResponse<CustomerAddress[]>>("/tasker/addresses");
  return unwrap(response);
}


export async function createAddress(input: AddressInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/tasker/addresses", input);
  return unwrap(response);
}


export async function updateAddress(id: number, input: AddressInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/addresses/${id}`, input);
  return unwrap(response);
}


export async function deleteAddress(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/tasker/addresses/${id}`);
  return unwrap(response);
}


export async function setDefaultAddress(id: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/addresses/${id}/default`, {});
  return unwrap(response);
}
