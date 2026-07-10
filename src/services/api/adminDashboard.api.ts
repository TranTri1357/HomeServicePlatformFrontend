import { get, unwrap, type ApiResponse } from "./client";
import type { AdminDashboard } from "@/shared/types";

/** GET /api/admin/dashboard — system overview stats. Requires Admin/SuperAdmin. */
export async function getDashboard(): Promise<AdminDashboard> {
  const response = await get<ApiResponse<AdminDashboard>>("/admin/dashboard");
  return unwrap(response);
}
