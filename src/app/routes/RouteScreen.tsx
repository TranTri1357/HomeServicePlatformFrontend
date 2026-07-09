import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { renderScreen } from "@/router/renderScreen";
import { getPathForScreen } from "./screenPaths";

interface RouteScreenProps {
  screen: Screen;
}

export function RouteScreen({ screen }: RouteScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToScreen = useCallback(
    (nextScreen: Screen, data?: object) => {
      navigate(getPathForScreen(nextScreen), { state: data });
    },
    [navigate],
  );

  return renderScreen(screen, location.state as object | undefined, navigateToScreen);
}
