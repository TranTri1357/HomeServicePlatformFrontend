import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { DailySchedule, WeeklyScheduleInput } from "@/shared/types";

/** GET /api/tasker/schedule/daily?date=YYYY-MM-DD — slots + jobs for one day. */
export async function getDailySchedule(date: string): Promise<DailySchedule> {
  const response = await get<ApiResponse<DailySchedule>>("/tasker/schedule/daily", {
    params: { date },
  });
  return unwrap(response);
}

/**
 * PUT /api/tasker/schedule/weekly — replace the whole weekly working-hours set.
 * Send every working day you want (missing days = not working).
 */
export async function updateWeeklySchedule(schedules: WeeklyScheduleInput[]): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/schedule/weekly", schedules);
  return unwrap(response);
}

/** POST /api/tasker/schedule/time-off — request time off for a period. */
export async function createTimeOff(
  startAt: string,
  endAt: string,
  reason?: string,
): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/tasker/schedule/time-off", {
    startAt,
    endAt,
    reason,
  });
  return unwrap(response);
}

/** DELETE /api/tasker/schedule/time-off/{id} — cancel a time-off request. */
export async function deleteTimeOff(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/tasker/schedule/time-off/${id}`);
  return unwrap(response);
}
