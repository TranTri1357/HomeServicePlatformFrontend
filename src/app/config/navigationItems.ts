import {
  BarChart2,
  Briefcase,
  Package,
  Route,
  MessageCircle,
  Home,
  Search,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import type { NavItem } from "@/shared/types";

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { screen: "customerHome",      icon: Home,     label: "Trang chủ" },
  { screen: "serviceList",       icon: Search,   label: "Dịch vụ"   },
  { screen: "bookingManagement", icon: FileText, label: "Lịch đặt"  },
  { screen: "customerProfile",   icon: User,     label: "Hồ sơ"     },
];

export const PROVIDER_NAV_ITEMS: NavItem[] = [
  { screen: "providerDashboard",         icon: BarChart2,     label: "Dashboard" },
  { screen: "providerJobManagement",     icon: Briefcase,     label: "Công việc", badge: 3 },
  { screen: "providerServiceManagement", icon: Package,       label: "Dịch vụ"   },
  { screen: "providerAreaRouting",       icon: Route,         label: "Khu vực"   },
  { screen: "providerSchedule",          icon: Calendar,      label: "Lịch"      },
  { screen: "providerChat",              icon: MessageCircle, label: "Chat"      },
  { screen: "providerProfile",           icon: User,          label: "Hồ sơ"     },
];
