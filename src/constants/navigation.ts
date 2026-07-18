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

/**
 * Customer screens that require login. Guests get bounced to the login prompt
 * when they try to reach these (route guard + in-app navigation gate).
 * The browse screens (home, services, service detail, technician map/detail)
 * are intentionally NOT here — they are public.
 */
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
