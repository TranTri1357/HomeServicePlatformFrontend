import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { getPathForScreen } from "./screenPaths";

/**
 * Back navigation that returns to the actual previous page (browser history),
 * so a "back" button always goes wherever the user came from. Falls back to a
 * fixed screen only when there is no in-app history to pop — e.g. the user
 * deep-linked or refreshed straight onto this page (react-router marks that
 * first entry with history index 0).
 */
export function useGoBack(fallback: Screen = "customerHome") {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state?.idx as number | undefined) ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(getPathForScreen(fallback), { replace: true });
  }, [navigate, fallback]);
}
