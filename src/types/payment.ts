/**
 * Payment method codes (matches backend PaymentMethod enum).
 * 1 Wallet · 2 Cash · 3 Momo · 4 ZaloPay. MoMo/ZaloPay run through a simulated
 * gateway (no real merchant credentials) for demo purposes.
 */
export type PaymentMethodCode = 1 | 2 | 3 | 4;

/**
 * Request body for POST /api/payments/checkout. CustomerId comes from the JWT.
 * Số tiền do SERVER tự tính từ Booking.FinalAmount (chống giả mạo) — client KHÔNG
 * gửi amount. `isDeposit=true` => chỉ thu cọc 30%, phần còn lại trả khi hoàn thành.
 */
export interface CheckoutInput {
  bookingId: number;
  isDeposit: boolean;
  method: PaymentMethodCode;
}

/** Response of POST /api/payments/checkout. */
export interface CheckoutResult {
  paymentId: number;
  /** true when paid instantly (wallet); false when pending (cash / gateway). */
  isPaid: boolean;
  /**
   * Gateway redirect URL. Real gateways return an http(s) URL; the simulated
   * MoMo/ZaloPay gateways return a "mock:momo" / "mock:zalopay" marker so the
   * app opens the in-app mock gateway screen instead of navigating away.
   */
  paymentUrl: string | null;
}
