import {
  BarChart2,
  Briefcase,
  Package,
  Route,
  Home,
  Search,
  Calendar,
  User,
  FileText,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/shared/types";

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { screen: "customerHome", icon: Home, label: "Trang chủ" },
  { screen: "serviceList", icon: Search, label: "Dịch vụ" },
  { screen: "bookingManagement", icon: FileText, label: "Lịch đặt" },
  { screen: "customerProfile", icon: User, label: "Hồ sơ" },
];

/** Reduced navigation shown to guests (chưa đăng nhập): chỉ các mục công khai. */
export const GUEST_NAV_ITEMS: NavItem[] = [
  { screen: "customerHome", icon: Home, label: "Trang chủ" },
  { screen: "serviceList", icon: Search, label: "Dịch vụ" },
];

export const PROVIDER_NAV_ITEMS: NavItem[] = [
  { screen: "providerDashboard", icon: BarChart2, label: "Dashboard" },
  { screen: "providerJobManagement", icon: Briefcase, label: "Công việc" },
  { screen: "providerServiceManagement", icon: Package, label: "Dịch vụ" },
  { screen: "providerAreaRouting", icon: Route, label: "Khu vực" },
  { screen: "providerSchedule", icon: Calendar, label: "Lịch" },
  { screen: "providerIncome", icon: Wallet, label: "Ví" },
  { screen: "providerProfile", icon: User, label: "Hồ sơ" },
];
