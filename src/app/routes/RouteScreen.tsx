import { useLocation } from "react-router-dom";
import type { Screen } from "@/shared/types";
import { renderScreen } from "@/router/renderScreen";
import { useGatedNavigate } from "./useGatedNavigate";

interface RouteScreenProps {
  screen: Screen;
}

export function RouteScreen({ screen }: RouteScreenProps) {
  const location = useLocation();
  const navigateToScreen = useGatedNavigate();

  return renderScreen(screen, location.state as object | undefined, navigateToScreen);
}
