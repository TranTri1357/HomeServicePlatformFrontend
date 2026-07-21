import { get, post, put, del, unwrap, type ApiResponse } from "./client";
import type { TaskerService } from "@/shared/types";


export async function getMyTaskerServices(): Promise<TaskerService[]> {
  const response = await get<ApiResponse<TaskerService[]>>("/tasker-services");
  return unwrap(response);
}


export async function addTaskerService(serviceId: number, price: number): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/tasker-services", { serviceId, price });
  return unwrap(response);
}


export async function updateTaskerServicePrice(
  serviceId: number,
  newPrice: number,
): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>("/tasker-services/update-price", {
    serviceId,
    newPrice,
  });
  return unwrap(response);
}


export async function removeTaskerService(serviceId: number): Promise<boolean> {
  const response = await del<ApiResponse<boolean>>(`/tasker-services/services/${serviceId}`);
  return unwrap(response);
}
