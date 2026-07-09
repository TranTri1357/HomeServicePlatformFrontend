import { post, unwrap, type ApiResponse } from "./client";
import type { CheckoutInput, CheckoutResult } from "@/shared/types";

/** A "mock:xxx" marker means the checkout should open the in-app mock gateway. */
export function isMockGatewayUrl(paymentUrl: string | null): boolean {
  return !!paymentUrl && paymentUrl.startsWith("mock:");
}

/**
 * POST /api/payments/checkout — start payment for a booking.
 * Requires the Customer role; CustomerId is read from the JWT server-side.
 * Wallet (1) settles instantly (isPaid=true); Cash (2) stays pending until
 * the tasker collects it. Third-party gateways would return a paymentUrl.
 */
export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const response = await post<ApiResponse<CheckoutResult>>("/payments/checkout", input);
  return unwrap(response);
}

/**
 * POST /api/payments/mock/confirm — confirm/cancel a simulated gateway payment.
 * Plays the role of the gateway's IPN callback: the in-app mock gateway screen
 * calls this when the user taps "Đã thanh toán" (success=true) or "Hủy"
 * (success=false). Requires the Customer role; CustomerId comes from the JWT.
 */
export async function confirmMockPayment(paymentId: number, success: boolean): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/payments/mock/confirm", {
    paymentId,
    success,
  });
  return unwrap(response);
}
