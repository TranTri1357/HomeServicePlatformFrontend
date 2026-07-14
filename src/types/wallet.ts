/** A single wallet ledger entry. Type: 1 TopUp · 2 Payment · 3 Refund · 6 Adjustment. */
export interface WalletTransaction {
  transactionId: number;
  type: number;
  amount: number;
  balanceAfter: number;
  /** Đơn liên quan (nếu có) — để hiển thị "đơn nào". */
  bookingId?: number | null;
  /** Mô tả rõ lý do + số đơn, hiển thị trực tiếp lên lịch sử. */
  description: string;
  createdAt: string;
}

/** Customer wallet — GET /api/customer/wallet. */
export interface Wallet {
  walletId: number;
  balance: number;
  recentTransactions: WalletTransaction[];
}
