import { revenueChartData } from "@/services/Admin/dashboard.data";
import { adminOrdersList } from "@/services/Admin/order.data";
import { adminProvidersList } from "@/services/Admin/technician.data";

export function useDashboard() {
  const maxRev = Math.max(...revenueChartData.map((d) => d.value));
  const pendingProviders = adminProvidersList.filter((p) => p.status === "pending");
  const recentOrders = adminOrdersList.slice(0, 4);
  return { revenueChartData, maxRev, pendingProviders, recentOrders };
}
