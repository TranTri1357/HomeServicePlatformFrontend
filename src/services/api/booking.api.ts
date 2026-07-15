import { get, post, put, unwrap, type ApiResponse } from "./client";
import type {
  CancellationPreview,
  CreateBookingInput,
  CreateBookingResult,
  CreateDisputeInput,
  CreateReviewInput,
  EmergencyBookingInput,
  EmergencyBookingResult,
  MyBooking,
  PagedResult,
} from "@/shared/types";

export type GetMyBookingsParams = {
  /** Lọc theo tập trạng thái (theo tab). Bỏ trống = tất cả. */
  status?: number[];
  /** Tìm theo mã đơn (BK123 / 123) hoặc tên dịch vụ. */
  search?: string;
  pageIndex?: number;
  pageSize?: number;
};

/**
 * GET /api/customer/bookings/my-orders — đơn của khách, LỌC + PHÂN TRANG ở server.
 */
export async function getMyBookings(
  params?: GetMyBookingsParams,
): Promise<PagedResult<MyBooking>> {
  const response = await get<ApiResponse<PagedResult<MyBooking>>>(
    "/customer/bookings/my-orders",
    { params },
  );
  return unwrap(response);
}

/**
 * POST /api/customer/bookings — create a booking.
 * Requires the Customer role; CustomerId is read from the JWT server-side,
 * so it must NOT be sent in the body.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const response = await post<ApiResponse<CreateBookingResult>>("/customer/bookings", input);
  return unwrap(response);
}

/**
 * POST /api/customer/bookings/emergency — BROADCAST: tạo 1 đơn treo mở rồi bắn yêu cầu tới mọi thợ
 * rảnh trong bán kính đầu (5km). CustomerId lấy từ JWT. Thanh toán tiền mặt khi hoàn thành; giá chốt
 * theo thợ nào nhận trước. Trả về danh sách thợ đã được bắn ở vòng này (có thể rỗng).
 */
export async function createEmergencyBooking(
  input: EmergencyBookingInput,
): Promise<EmergencyBookingResult> {
  const response = await post<ApiResponse<EmergencyBookingResult>>(
    "/customer/bookings/emergency",
    input,
  );
  return unwrap(response);
}

/**
 * POST /api/customer/bookings/emergency/{id}/broadcast?radiusKm= — nới bán kính quét cho đơn khẩn
 * chưa ai nhận (5→10→15km). Gia hạn cửa sổ 30s và bắn yêu cầu tới các thợ trong vòng mới.
 */
export async function rebroadcastEmergencyBooking(
  bookingId: number,
  radiusKm: number,
): Promise<EmergencyBookingResult> {
  const response = await post<ApiResponse<EmergencyBookingResult>>(
    `/customer/bookings/emergency/${bookingId}/broadcast`,
    {},
    { params: { radiusKm } },
  );
  return unwrap(response);
}

/**
 * POST /api/customer/bookings/emergency/{id}/cancel — customer cancels a pending
 * emergency request (timed out / chose another tasker). Notifies the tasker.
 */
export async function cancelEmergencyBooking(bookingId: number): Promise<boolean> {
  const response = await post<ApiResponse<{ customerId: number; taskerId: number }>>(
    `/customer/bookings/emergency/${bookingId}/cancel`,
    {},
  );
  return Boolean(unwrap(response));
}

/**
 * GET /api/customer/bookings/{id}/cancellation-preview — xem trước số tiền được hoàn
 * / phí hủy theo chính sách, TRƯỚC khi khách xác nhận hủy (không thay đổi dữ liệu).
 */
export async function getCancellationPreview(bookingId: number): Promise<CancellationPreview> {
  const response = await get<ApiResponse<CancellationPreview>>(
    `/customer/bookings/${bookingId}/cancellation-preview`,
  );
  return unwrap(response);
}

/**
 * PUT /api/customer/bookings/{id}/cancel — the customer cancels their own booking.
 * Cho phép hủy khi đơn Pending / Accepted / OnTheWay; hệ thống hoàn tiền theo chính
 * sách. BookingId từ route, CustomerId từ JWT, nên chỉ gửi cancelReason.
 */
export async function cancelBooking(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/customer/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}

/**
 * POST /api/bookings/{bookingItemId}/reviews — review a completed job.
 * Requires the Customer role; CustomerId comes from the JWT. The booking item
 * must belong to the customer and its booking must be Completed. Returns the
 * new review id.
 */
export async function createReview(
  bookingItemId: number,
  input: CreateReviewInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingItemId}/reviews`, input);
  return unwrap(response);
}

/**
 * POST /api/bookings/{bookingId}/disputes — file a complaint about a booking.
 * Requires the Customer role; CustomerId comes from the JWT. Reason must be
 * 10–1000 chars. Returns the new dispute id.
 */
export async function createDispute(
  bookingId: number,
  input: CreateDisputeInput,
): Promise<number> {
  const response = await post<ApiResponse<number>>(`/bookings/${bookingId}/disputes`, input);
  return unwrap(response);
}
