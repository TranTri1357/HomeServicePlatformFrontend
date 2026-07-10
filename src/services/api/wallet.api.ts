import { get, post, unwrap, type ApiResponse } from "./client";
import type { Wallet } from "@/shared/types";

/** GET /api/customer/wallet — balance + recent transactions of the current customer. */
export async function getMyWallet(): Promise<Wallet> {
  const response = await get<ApiResponse<Wallet>>("/customer/wallet");
  return unwrap(response);
}

/**
 * POST /api/customer/wallet/topup — add funds to the wallet (demo: credited
 * directly, no real gateway). Returns the new balance.
 */
export async function topUpWallet(amount: number): Promise<number> {
  const response = await post<ApiResponse<number>>("/customer/wallet/topup", { amount });
  return unwrap(response);
}
