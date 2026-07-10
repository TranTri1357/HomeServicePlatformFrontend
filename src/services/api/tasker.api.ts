import { get, put, unwrap, type ApiResponse } from "./client";
import type {
  NearbyTasker,
  TaskerDashboard,
  TaskerDetail,
  TaskerJob,
  TaskerProfileData,
  TaskerQuickInfo,
  TopTasker,
} from "@/shared/types";

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

/** GET /api/tasker/dashboard — home stats for the logged-in tasker. */
export async function getTaskerDashboard(): Promise<TaskerDashboard> {
  const response = await get<ApiResponse<TaskerDashboard>>("/tasker/dashboard");
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
