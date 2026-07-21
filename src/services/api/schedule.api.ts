import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { DailySchedule, WeeklyScheduleInput } from "@/shared/types";


export async function getDailySchedule(date: string): Promise<DailySchedule> {
  const response = await get<ApiResponse<DailySchedule>>("/tasker/schedule/daily", {
    params: { date },
  });
  return unwrap(response);
}


export async function updateWeeklySchedule(schedules: WeeklyScheduleInput[]): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/schedule/weekly", schedules);
  return unwrap(response);
}


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


export async function deleteTimeOff(id: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/tasker/schedule/time-off/${id}`);
  return unwrap(response);
}
