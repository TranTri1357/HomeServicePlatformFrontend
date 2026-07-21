import { post, unwrap, type ApiResponse } from "./client";
import type { CheckoutInput, CheckoutResult } from "@/shared/types";


export function isMockGatewayUrl(paymentUrl: string | null): boolean {
  return !!paymentUrl && paymentUrl.startsWith("mock:");
}


export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const response = await post<ApiResponse<CheckoutResult>>("/payments/checkout", input);
  return unwrap(response);
}


export async function confirmMockPayment(paymentId: number, success: boolean): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/payments/mock/confirm", {
    paymentId,
    success,
  });
  return unwrap(response);
}
