import type { LucideIcon } from "lucide-react";

// ─── App-level navigation ─────────────────────────────────────────────────────
export type Screen =
  | "auth"
  | "customerHome"
  | "serviceList"
  | "serviceDetail"
  | "technicianMap"
  | "booking"
  | "payment"
  | "chat"
  | "customerProfile"
  | "bookingManagement"
  | "notifications"
  | "providerDashboard"
  | "providerJobSheet"
  | "providerSchedule"
  | "providerChat"
  | "providerProfile"
  | "providerJobManagement"
  | "technicianDetail"
  | "providerServiceManagement"
  | "providerAreaRouting"
  | "adminDashboard"
  | "adminOrders"
  | "adminProviders"
  | "adminServices"
  | "adminServiceTypes"
  | "adminAccounts"
  | "adminReviews"
  | "adminCommissions"
  | "adminComplaints";

export type NavigateFn = (screen: Screen, data?: object) => void;

// ─── Shared UI types ──────────────────────────────────────────────────────────
export interface NavItem {
  screen: Screen;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export interface StatusCfg {
  label: string;
  color: string;
  dot: string;
}
