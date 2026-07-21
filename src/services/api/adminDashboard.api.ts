import { get, unwrap, type ApiResponse } from "./client";
import type { AdminDashboard } from "@/shared/types";


export async function getDashboard(): Promise<AdminDashboard> {
  const response = await get<ApiResponse<AdminDashboard>>("/admin/dashboard");
  return unwrap(response);
}
