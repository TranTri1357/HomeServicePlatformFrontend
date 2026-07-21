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
  WithdrawInput,
  ServiceTaskerSuggestion,
} from "@/shared/types";

export type GetTaskerJobsPagedParams = {
  
  status?: number[];
  
  search?: string;
  pageIndex?: number;
  pageSize?: number;
};


export async function getMyTaskerProfile(taskerId: number): Promise<TaskerProfileData> {
  const response = await get<ApiResponse<TaskerProfileData>>(
    `/tasker/profile/${taskerId}/profile`,
  );
  return unwrap(response);
}


export async function createTaskerProfile(input: CreateTaskerProfileInput): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/tasker/profile", input);
  return unwrap(response);
}


export async function updateTaskerProfile(input: UpdateTaskerProfileInput): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/profile", input);
  return unwrap(response);
}


export async function getTaskerDashboard(): Promise<TaskerDashboard> {
  const response = await get<ApiResponse<TaskerDashboard>>("/tasker/dashboard");
  return unwrap(response);
}


export async function getTaskerIncome(page = 1, pageSize = 20): Promise<TaskerIncome> {
  const response = await get<ApiResponse<TaskerIncome>>("/tasker/wallet", {
    params: { page, pageSize },
  });
  return unwrap(response);
}


export async function withdrawIncome(input: WithdrawInput): Promise<number> {
  const response = await post<ApiResponse<number>>("/tasker/wallet/withdraw", input);
  return unwrap(response);
}


export async function setAvailability(isAvailable: boolean): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker/availability", { isAvailable });
  return unwrap(response);
}


export async function getTaskerJobs(status?: number): Promise<TaskerJob[]> {
  const response = await get<ApiResponse<TaskerJob[]>>("/tasker/tasker-jobs", {
    params: status != null ? { status } : undefined,
  });
  return unwrap(response);
}


export async function getTaskerJobsPaged(
  params?: GetTaskerJobsPagedParams,
): Promise<PagedResult<TaskerJobGroup>> {
  const response = await get<ApiResponse<PagedResult<TaskerJobGroup>>>(
    "/tasker/tasker-jobs/paged",
    { params },
  );
  return unwrap(response);
}


export async function getTaskerJobStats(): Promise<TaskerJobStats> {
  const response = await get<ApiResponse<TaskerJobStats>>("/tasker/tasker-jobs/stats");
  return unwrap(response);
}





export async function acceptJob(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/accept`, {});
  return unwrap(response);
}


export async function startMoving(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/start-moving`, {});
  return unwrap(response);
}


export async function startWorking(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(
    `/tasker/bookings/${bookingId}/start-working`,
    {},
  );
  return unwrap(response);
}


export async function completeWork(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(
    `/tasker/bookings/${bookingId}/complete-work`,
    {},
  );
  return unwrap(response);
}


export async function cancelJob(bookingId: number, cancelReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/cancel`, {
    cancelReason,
  });
  return unwrap(response);
}


export async function declineJob(bookingId: number, declineReason: string): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/tasker/bookings/${bookingId}/decline`, {
    declineReason,
  });
  return unwrap(response);
}


export async function declineEmergencyJob(bookingId: number, timedOut = false): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>(
    `/tasker/bookings/emergency/${bookingId}/decline?timedOut=${timedOut}`,
    {},
  );
  return Boolean(unwrap(response));
}

export type GetTopTaskersParams = {
  
  limit?: number;
};


export async function getTopTaskers(params?: GetTopTaskersParams): Promise<TopTasker[]> {
  const response = await get<ApiResponse<TopTasker[]>>("/Taskers/top", { params });
  return unwrap(response);
}


export type TaskerAreaParams = {
  
  provinceCode?: string | null;
  lat?: number | null;
  lng?: number | null;
};


export async function getTaskersByService(
  serviceId: number,
  pageIndex = 1,
  pageSize = 5,
  area?: TaskerAreaParams,
): Promise<PagedResult<ServiceTaskerSuggestion>> {
  const response = await get<ApiResponse<PagedResult<ServiceTaskerSuggestion>>>(
    `/Taskers/by-service/${serviceId}`,
    {
      params: {
        pageIndex,
        pageSize,
        provinceCode: area?.provinceCode ?? undefined,
        lat: area?.lat ?? undefined,
        lng: area?.lng ?? undefined,
      },
    },
  );
  return unwrap(response);
}


export async function getServiceTaskerCard(
  serviceId: number,
  taskerId: number,
  area?: Pick<TaskerAreaParams, "lat" | "lng">,
): Promise<ServiceTaskerSuggestion | null> {
  const response = await get<ApiResponse<ServiceTaskerSuggestion | null>>(
    `/Taskers/by-service/${serviceId}/tasker/${taskerId}`,
    { params: { lat: area?.lat ?? undefined, lng: area?.lng ?? undefined } },
  );
  return unwrap(response);
}

export type GetNearbyTaskersParams = {
  serviceId: number;
  lat: number;
  lng: number;
  
  radius?: number;
};


export async function getNearbyTaskers(params: GetNearbyTaskersParams): Promise<NearbyTasker[]> {
  const response = await get<ApiResponse<NearbyTasker[]>>("/Taskers/nearby", { params });
  return unwrap(response);
}


export async function getTaskerDetail(taskerId: number): Promise<TaskerDetail> {
  const response = await get<ApiResponse<TaskerDetail>>(`/Taskers/${taskerId}`);
  return unwrap(response);
}


export async function getTaskerServiceOptions(taskerId: number): Promise<TaskerServiceOption[]> {
  const response = await get<ApiResponse<TaskerServiceOption[]>>(`/Taskers/${taskerId}/services`);
  return unwrap(response);
}


export async function getTaskerAvailability(
  taskerId: number,
  date: string,
  lat?: number,
  lng?: number,
): Promise<TaskerAvailability> {
  const params: Record<string, string | number> = { date };
  if (lat != null && lng != null) {
    params.lat = lat;
    params.lng = lng;
  }
  const response = await get<ApiResponse<TaskerAvailability>>(
    `/Taskers/${taskerId}/availability`,
    { params },
  );
  return unwrap(response);
}


export async function getTaskerQuickInfo(
  taskerId: number,
  serviceId: number,
): Promise<TaskerQuickInfo> {
  const response = await get<ApiResponse<TaskerQuickInfo>>(
    `/Taskers/${taskerId}/service/${serviceId}/quick-info`,
  );
  return unwrap(response);
}
