import { get, post, put, unwrap, type ApiResponse } from "./client";
import type {
  CreateTaskerProfileInput,
  NearbyTasker,
  PagedResult,
  TaskerAvailability,
  TaskerDashboard,
  TaskerDetail,
  TaskerIncome,
  TaskerJob,
  TaskerJobGroup,
  TaskerJobStats,
  TaskerProfileData,
  TaskerQuickInfo,
  TaskerServiceOption,
  TopTasker,
  UpdateTaskerProfileInput,
} from "@/shared/types";

export type GetTaskerJobsPagedParams = {
  /** Lọc theo tập trạng thái (theo tab). Bỏ trống = tất cả. */
  status?: number[];
  /** Tìm theo mã đơn (BK123 / 123), tên khách hoặc tên dịch vụ. */
  search?: string;
  pageIndex?: number;
  pageSize?: number;
};

/**
 * GET /api/tasker/profile/{id}/profile — the logged-in tasker's own profile
 * (id = their userId, which equals TaskerProfileId).
 */
export async function getMyTaskerProfile(taskerId: number): Promise<TaskerProfileData> {
  const response = await get<ApiResponse<TaskerProfileData>>(
    `/tasker/profile/${taskerId}/profile`,
  );
  return unwrap(response);
}

/**
 * POST /api/tasker/profile — create the logged-in tasker's profile (Status 0 =
 * chờ duyệt) so an admin can approve it. UserId comes from the JWT.
 */
export async function createTaskerProfile(input: CreateTaskerProfileInput): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/tasker/profile", input);
  return unwrap(response);
}

/** PUT /api/tasker/profile — update the logged-in tasker's account info. */
export async function updateTaskerProfile(input: UpdateTaskerProfileInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/profile", input);
  return unwrap(response);
}

/** GET /api/tasker/dashboard — home stats for the logged-in tasker. */
export async function getTaskerDashboard(): Promise<TaskerDashboard> {
  const response = await get<ApiResponse<TaskerDashboard>>("/tasker/dashboard");
  return unwrap(response);
}

/**
 * GET /api/tasker/wallet — the logged-in tasker's income ledger: balance +
 * per-booking earning history (gross → commission → net). Paged.
 */
export async function getTaskerIncome(page = 1, pageSize = 20): Promise<TaskerIncome> {
  const response = await get<ApiResponse<TaskerIncome>>("/tasker/wallet", {
    params: { page, pageSize },
  });
  return unwrap(response);
}

/**
 * POST /api/tasker/wallet/withdraw — rút tiền khỏi ví thu nhập (demo: trừ thẳng
 * số dư). Trả về số dư mới sau khi rút.
 */
export async function withdrawIncome(amount: number): Promise<number> {
  const response = await post<ApiResponse<number>>("/tasker/wallet/withdraw", { amount });
  return unwrap(response);
}

/** PUT /api/tasker/availability — turn "accepting jobs" on/off. Returns new state. */
export async function setAvailability(isAvailable: boolean): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/availability", { isAvailable });
  return unwrap(response);
}

/** GET /api/tasker/tasker-jobs — the tasker's jobs, optionally filtered by status. */
export async function getTaskerJobs(status?: number): Promise<TaskerJob[]> {
  const response = await get<ApiResponse<TaskerJob[]>>("/tasker/tasker-jobs", {
    params: status != null ? { status } : undefined,
  });
  return unwrap(response);
}

/**
 * GET /api/tasker/tasker-jobs/paged — việc của thợ, gộp theo đơn + LỌC + TÌM + PHÂN TRANG.
 */
export async function getTaskerJobsPaged(
  params?: GetTaskerJobsPagedParams,
): Promise<PagedResult<TaskerJobGroup>> {
  const response = await get<ApiResponse<PagedResult<TaskerJobGroup>>>(
    "/tasker/tasker-jobs/paged",
    { params },
  );
  return unwrap(response);
}

/** GET /api/tasker/tasker-jobs/stats — đếm số đơn theo nhóm trạng thái (badge + số mỗi tab). */
export async function getTaskerJobStats(): Promise<TaskerJobStats> {
  const response = await get<ApiResponse<TaskerJobStats>>("/tasker/tasker-jobs/stats");
  return unwrap(response);
}

// ── Job status transitions (PUT /api/tasker/bookings/{bookingId}/…) ──────────
// The route id is the BOOKING id (accept/advance/complete the whole booking).

/** Accept a pending booking (Pending → Accepted). */
export async function acceptJob(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/accept`, {});
  return unwrap(response);
}

/** Start heading to the customer (Accepted → OnTheWay). */
export async function startMoving(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/start-moving`, {});
  return unwrap(response);
}

/** Start the work (OnTheWay → InProgress). */
export async function startWorking(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(
    `/tasker/bookings/${bookingId}/start-working`,
    {},
  );
  return unwrap(response);
}

/** Mark the work complete (InProgress → Completed). */
export async function completeWork(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(
    `/tasker/bookings/${bookingId}/complete-work`,
    {},
  );
  return unwrap(response);
}

/** Cancel/decline a booking with a reason. */
export async function cancelJob(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}

/** Decline an emergency request (tasker rejects or the 30s window expires). */
export async function declineEmergencyJob(bookingId: number): Promise<boolean> {
  const response = await post<ApiResponse<{ customerId: number; taskerId: number }>>(
    `/tasker/bookings/emergency/${bookingId}/decline`,
    {},
  );
  return Boolean(unwrap(response));
}

export type GetTopTaskersParams = {
  /** Number of featured taskers to return. Backend validates 1 ≤ limit ≤ 10 (default 5). */
  limit?: number;
};

/**
 * GET /api/Taskers/top
 * Returns active, verified, non-deleted taskers ordered by ratingAvg desc then
 * totalReviews desc. Optional `limit` (1–10, default 5) caps the list.
 */
export async function getTopTaskers(params?: GetTopTaskersParams): Promise<TopTasker[]> {
  const response = await get<ApiResponse<TopTasker[]>>("/Taskers/top", { params });
  return unwrap(response);
}

export type GetNearbyTaskersParams = {
  serviceId: number;
  lat: number;
  lng: number;
  /** Search radius in km (backend default 10, max 50). */
  radius?: number;
};

/**
 * GET /api/Taskers/nearby
 * Taskers within `radius` km of (lat,lng) who provide `serviceId`.
 */
export async function getNearbyTaskers(params: GetNearbyTaskersParams): Promise<NearbyTasker[]> {
  const response = await get<ApiResponse<NearbyTasker[]>>("/Taskers/nearby", { params });
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}
 * Full public profile of a tasker: bio, skills, review summary and recent reviews.
 */
export async function getTaskerDetail(taskerId: number): Promise<TaskerDetail> {
  const response = await get<ApiResponse<TaskerDetail>>(`/Taskers/${taskerId}`);
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}/services
 * Services (with the tasker's current price + duration) the tasker offers, for
 * the customer to pick when booking. Public.
 */
export async function getTaskerServiceOptions(taskerId: number): Promise<TaskerServiceOption[]> {
  const response = await get<ApiResponse<TaskerServiceOption[]>>(`/Taskers/${taskerId}/services`);
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}/availability?date=yyyy-MM-dd
 * The tasker's free/busy hourly slots for a day (based on their working schedule,
 * time-offs and existing bookings/holds). Public.
 */
export async function getTaskerAvailability(
  taskerId: number,
  date: string,
): Promise<TaskerAvailability> {
  const response = await get<ApiResponse<TaskerAvailability>>(
    `/Taskers/${taskerId}/availability`,
    { params: { date } },
  );
  return unwrap(response);
}

/**
 * GET /api/Taskers/{id}/service/{serviceId}/quick-info
 * Popup info for a tasker in the context of a specific service.
 */
export async function getTaskerQuickInfo(
  taskerId: number,
  serviceId: number,
): Promise<TaskerQuickInfo> {
  const response = await get<ApiResponse<TaskerQuickInfo>>(
    `/Taskers/${taskerId}/service/${serviceId}/quick-info`,
  );
  return unwrap(response);
}
