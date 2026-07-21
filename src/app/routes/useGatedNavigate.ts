import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { CUSTOMER_PROTECTED_SCREENS } from "@/shared/constants";
import { useAuth, useAuthGate } from "@/app/providers";
import { getPathForScreen } from "./screenPaths";


export function useGatedNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthGate();

  return useCallback(
    (nextScreen: Screen, data?: object) => {
      const path = getPathForScreen(nextScreen);
      if (!isAuthenticated && CUSTOMER_PROTECTED_SCREENS.includes(nextScreen)) {
        
        
        requireAuth(path, data);
        return;
      }
      navigate(path, { state: data });
    },
    [navigate, isAuthenticated, requireAuth],
  );
}
