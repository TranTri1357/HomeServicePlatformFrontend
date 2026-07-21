import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { getPathForScreen } from "./screenPaths";


export function useGoBack(fallback: Screen = "customerHome") {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state?.idx as number | undefined) ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(getPathForScreen(fallback), { replace: true });
  }, [navigate, fallback]);
}
