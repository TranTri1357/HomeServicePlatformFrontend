import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { CUSTOMER_PROTECTED_SCREENS } from "@/shared/constants";
import { useAuth, useAuthGate } from "@/app/providers";
import { getPathForScreen } from "./screenPaths";

/**
 * Điều hướng có "cổng đăng nhập": nếu là khách vãng lai bấm sang màn cần đăng
 * nhập (đặt lịch, chat, ví...) thì mở popup nhắc đăng nhập thay vì đá thẳng ra
 * /auth. Dùng chung cho cả nội dung trang (RouteScreen) lẫn thanh điều hướng.
 * Với người đã đăng nhập (khách/thợ/admin) thì điều hướng như bình thường.
 */
export function useGatedNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthGate();

  return useCallback(
    (nextScreen: Screen, data?: object) => {
      const path = getPathForScreen(nextScreen);
      if (!isAuthenticated && CUSTOMER_PROTECTED_SCREENS.includes(nextScreen)) {
        // Giữ lại `data` (vd: serviceId) để sau khi đăng nhập quay lại đúng màn
        // với đầy đủ tham số, tránh lỗi "Không xác định được dịch vụ cần đặt".
        requireAuth(path, data);
        return;
      }
      navigate(path, { state: data });
    },
    [navigate, isAuthenticated, requireAuth],
  );
}
