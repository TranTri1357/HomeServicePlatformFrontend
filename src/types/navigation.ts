import type { LucideIcon } from "lucide-react";

// ─── App-level navigation ─────────────────────────────────────────────────────
export type Screen =
  | "auth"
  | "customerHome"
  | "serviceList"
  | "serviceDetail"
  | "technicianMap"
  | "booking"
  | "emergencyBooking"
  | "payment"
  | "mockGateway"
  | "chat"
  | "customerProfile"
  | "customerWallet"
  | "customerAddresses"
  | "bookingManagement"
  | "notifications"
  | "providerDashboard"
  | "providerJobSheet"
  | "providerSchedule"
  | "providerChat"
  | "providerProfile"
  | "providerNotifications"
  | "providerJobManagement"
  | "providerIncome"
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
