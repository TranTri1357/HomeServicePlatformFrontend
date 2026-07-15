import { useApi } from "./useApi";
import { notificationApi, taskerApi, bookingApi } from "@/services/api";

export type NavRole = "customer" | "provider";

/** True when the current user has at least one unread notification. */
export function useHasUnreadNotifications(role: NavRole, enabled = true): boolean {
  const { data } = useApi(
    () =>
      role === "provider"
        ? notificationApi.getTaskerNotifications(1, 20)
        : notificationApi.getMyNotifications(1, 20),
    { immediate: enabled },
  );
  return Boolean(data?.items.some((n) => !n.isRead));
}

export interface NavBadges {
  /** Show a red dot on the notification bell. */
  notifDot: boolean;
  /** Count of active (not completed/cancelled) orders — the nav "orders" badge. */
  jobBadge: number;
}

/**
 * Live badge data for the top/bottom navigation: unread-notification dot and
 * the count of ongoing orders (jobs for a tasker, bookings for a customer).
 * Fetched once in the persistent layout so both nav bars share it.
 */
export function useNavBadges(role: NavRole, enabled = true): NavBadges {
  const isProvider = role === "provider";
  const notifDot = useHasUnreadNotifications(role, enabled);

  // Thợ: đếm đơn đang xử lý = incoming (chờ nhận) + active (đang làm), lấy từ endpoint thống kê nhẹ.
  const { data: jobStats } = useApi(() => taskerApi.getTaskerJobStats(), {
    immediate: enabled && isProvider,
  });
  // Khách: chỉ cần SỐ đơn đang hoạt động (status 0..3): hỏi server pageSize nhỏ, lấy totalCount.
  const { data: activeBookings } = useApi(
    () => bookingApi.getMyBookings({ status: [0, 1, 2, 3], pageSize: 1 }),
    { immediate: enabled && !isProvider },
  );

  const jobBadge = isProvider
    ? (jobStats?.incoming ?? 0) + (jobStats?.active ?? 0)
    : (activeBookings?.totalCount ?? 0);

  return { notifDot, jobBadge };
}
