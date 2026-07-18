import { get, post, unwrap, type ApiResponse } from "./client";
import type { TopUpInput, Wallet } from "@/shared/types";

/** GET /api/customer/wallet — balance + recent transactions of the current customer. */
export async function getMyWallet(): Promise<Wallet> {
  const response = await get<ApiResponse<Wallet>>("/customer/wallet");
  return unwrap(response);
}

/**
 * POST /api/customer/wallet/topup — nạp tiền vào ví. Trả về số dư mới.
 *
 * Trải nghiệm hai bước nằm hoàn toàn ở phía giao diện: người dùng chọn cổng, màn QR giả lập
 * (dùng lại đúng màn của luồng thanh toán đơn) hiện lên, và chỉ khi bấm "Tôi đã thanh toán"
 * thì endpoint này mới được gọi ĐÚNG MỘT LẦN. Backend không giữ phiên chờ nào.
 */
export async function topUpWallet(input: TopUpInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/customer/wallet/topup", input);
  return unwrap(response);
}
