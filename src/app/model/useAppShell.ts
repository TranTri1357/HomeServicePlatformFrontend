import { useCallback, useMemo, useState } from "react";
import type { Screen, UserMode } from "@/shared/types";
import { PROVIDER_SCREENS } from "@/shared/constants";
import { CUSTOMER_NAV_ITEMS, PROVIDER_NAV_ITEMS } from "@/app/config";

type AppMode = "auth" | UserMode;

export function useAppShell() {
  const [mode, setMode] = useState<AppMode>("auth");
  const [screen, setScreen] = useState<Screen>("customerHome");
  const [screenData, setScreenData] = useState<object | undefined>(undefined);

  const navigate = useCallback((nextScreen: Screen, data?: object) => {
    setScreen(nextScreen);
    setScreenData(data);
  }, []);

  const login = useCallback((userMode: UserMode) => {
    setMode(userMode);
    if (userMode === "customer") setScreen("customerHome");
    else if (userMode === "provider") setScreen("providerDashboard");
    else if (userMode === "admin") setScreen("adminDashboard");
  }, []);

  const showAuth = useCallback(() => {
    setMode("auth");
    setScreen("customerHome");
    setScreenData(undefined);
  }, []);

  const logout = showAuth;

  const isCustomer = mode === "customer";
  const isProviderScreen = (PROVIDER_SCREENS as readonly string[]).includes(screen);
  const currentNavItems = useMemo(
    () => (isCustomer ? CUSTOMER_NAV_ITEMS : PROVIDER_NAV_ITEMS),
    [isCustomer],
  );

  const switchMode = useCallback(() => {
    const next: UserMode = isCustomer ? "provider" : "customer";
    setMode(next);
    navigate(next === "customer" ? "customerHome" : "providerDashboard");
  }, [isCustomer, navigate]);

  return {
    mode,
    screen,
    screenData,
    isCustomer,
    isProviderScreen,
    currentNavItems,
    navigate,
    login,
    logout,
    showAuth,
    switchMode,
  };
}
