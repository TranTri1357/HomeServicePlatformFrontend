/** A single wallet ledger entry. Type: 1 TopUp · 2 Payment · 3 Refund. */
export interface WalletTransaction {
  transactionId: number;
  type: number;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

/** Customer wallet — GET /api/customer/wallet. */
export interface Wallet {
  walletId: number;
  balance: number;
  recentTransactions: WalletTransaction[];
}
