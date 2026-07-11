import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers";

/**
 * Điểm vào "/" (và fallback "*"): người đã đăng nhập về đúng khu theo vai trò
 * (khách/thợ/admin); khách vãng lai chưa đăng nhập thì vào trang duyệt công khai.
 */
export function RootRedirect() {
  const { isAuthenticated, getHomePath } = useAuth();
  return <Navigate to={isAuthenticated ? getHomePath() : "/customer/home"} replace />;
}
