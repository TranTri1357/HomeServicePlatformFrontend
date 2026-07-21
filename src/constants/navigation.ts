import type { Screen } from "@/types/navigation";

export const NO_BOTTOM_NAV_SCREENS: Screen[] = [
  "booking",
  "payment",
  "serviceDetail",
  "technicianDetail",
  "technicianMap",
  "notifications",
  "auth",
  "providerIncome",
];


export const CUSTOMER_PROTECTED_SCREENS: Screen[] = [
  "booking",
  "emergencyBooking",
  "payment",
  "mockGateway",
  "chat",
  "customerProfile",
  "customerWallet",
  "customerAddresses",
  "bookingManagement",
  "notifications",
];

export const PROVIDER_SCREENS: Screen[] = [
  "providerDashboard",
  "providerSchedule",
  "providerChat",
  "providerProfile",
  "providerJobManagement",
  "providerServiceManagement",
  "providerIncome",
];
