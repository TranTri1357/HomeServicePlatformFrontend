import { ApiError } from "@/services/api";


export function getErrorMessage(err: unknown, fallback = "Đã có lỗi xảy ra"): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
