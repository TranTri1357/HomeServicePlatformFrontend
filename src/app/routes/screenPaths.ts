import type { Screen } from "@/shared/types";

export const SCREEN_PATHS: Record<Screen, string> = {
  auth: "/auth",
  customerHome: "/customer/home",
  serviceList: "/customer/services",
  serviceDetail: "/customer/service/detail",
  technicianMap: "/customer/technicians",
  technicianDetail: "/customer/technician/detail",
  booking: "/customer/booking",
  emergencyBooking: "/customer/emergency",
  payment: "/customer/payment",
  mockGateway: "/customer/payment/gateway",
  chat: "/customer/chat",
  customerProfile: "/customer/profile",
  customerWallet: "/customer/wallet",
  customerAddresses: "/customer/addresses",
  bookingManagement: "/customer/bookings",
  notifications: "/customer/notifications",
  providerDashboard: "/provider/dashboard",
  providerJobSheet: "/provider/job/detail",
  providerSchedule: "/provider/schedule",
  providerChat: "/provider/chat",
  providerProfile: "/provider/profile",
  providerNotifications: "/provider/notifications",
  providerJobManagement: "/provider/jobs",
  providerIncome: "/provider/income",
  providerServiceManagement: "/provider/services",
  providerAreaRouting: "/provider/area",
  adminDashboard: "/admin/dashboard",
  adminOrders: "/admin/orders",
  adminProviders: "/admin/providers",
  adminServices: "/admin/services",
  adminServiceTypes: "/admin/service-types",
  adminAccounts: "/admin/accounts",
  adminReviews: "/admin/reviews",
  adminCommissions: "/admin/commissions",
  adminComplaints: "/admin/complaints",
};

export function getPathForScreen(screen: Screen) {
  return SCREEN_PATHS[screen] ?? "/customer/home";
}

export function getScreenForPath(pathname: string): Screen {
  const entry = Object.entries(SCREEN_PATHS).find(([, path]) => path === pathname);
  return (entry?.[0] as Screen | undefined) ?? "customerHome";
}
