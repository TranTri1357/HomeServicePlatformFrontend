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

/** Cổng nạp ví giả lập — backend chỉ chấp nhận MoMo (3) hoặc ZaloPay (4). */
export type TopUpMethodCode = 3 | 4;

/** Body của POST /api/customer/wallet/topup. CustomerId lấy từ JWT. */
export interface TopUpInput {
  amount: number;
  method: TopUpMethodCode;
}

/**
 * Body của POST /api/tasker/wallet/withdraw.
 * Demo: không có lệnh chi thật sang ngân hàng — backend chỉ lưu đích đến ĐÃ CHE SỐ
 * (4 số cuối) vào lịch sử giao dịch.
 */
export interface WithdrawInput {
  amount: number;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
}
