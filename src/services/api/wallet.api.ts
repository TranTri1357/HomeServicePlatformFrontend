import { get, post, unwrap, type ApiResponse } from "./client";
import type { TopUpInput, Wallet } from "@/shared/types";


export async function getMyWallet(): Promise<Wallet> {
  const response = await get<ApiResponse<Wallet>>("/customer/wallet");
  return unwrap(response);
}


export async function topUpWallet(input: TopUpInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/customer/wallet/topup", input);
  return unwrap(response);
}
