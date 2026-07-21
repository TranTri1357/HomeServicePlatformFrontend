
export interface WalletTransaction {
  transactionId: number;
  type: number;
  amount: number;
  balanceAfter: number;
  
  bookingId?: number | null;
  
  description: string;
  createdAt: string;
}


export interface Wallet {
  walletId: number;
  balance: number;
  recentTransactions: WalletTransaction[];
}


export type TopUpMethodCode = 3 | 4;


export interface TopUpInput {
  amount: number;
  method: TopUpMethodCode;
}


export interface WithdrawInput {
  amount: number;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
}
