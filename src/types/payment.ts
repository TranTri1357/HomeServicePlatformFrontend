
export type PaymentMethodCode = 1 | 2 | 3 | 4;


export interface CheckoutInput {
  bookingId: number;
  isDeposit: boolean;
  method: PaymentMethodCode;
}


export interface CheckoutResult {
  paymentId: number;
  
  isPaid: boolean;
  
  paymentUrl: string | null;
}
