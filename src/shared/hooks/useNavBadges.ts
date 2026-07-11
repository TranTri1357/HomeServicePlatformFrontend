import { useApi } from "./useApi";
import { notificationApi, taskerApi, bookingApi } from "@/services/api";

export type NavRole = "customer" | "provider";

/** True when the current user has at least one unread notification. */
export function useHasUnreadNotifications(role: NavRole): boolean {
  const { data } = useApi(() =>
    role === "provider"
      ? notificationApi.getTaskerNotifications(1, 20)
      : notificationApi.getMyNotifications(1, 20),
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
export function useNavBadges(role: NavRole): NavBadges {
  const isProvider = role === "provider";
  const notifDot = useHasUnreadNotifications(role);

  const { data: jobs = [] } = useApi(() => taskerApi.getTaskerJobs(), {
    immediate: isProvider,
    initialData: [],
  });
  const { data: bookings = [] } = useApi(() => bookingApi.getMyBookings(), {
    immediate: !isProvider,
    initialData: [],
  });

  // "Active" = still in progress (status 0..3), i.e. work that needs attention.
  // Provider jobs come as one row per service item, so count DISTINCT bookings
  // to match the grouped "orders" display; customer bookings are already 1 row each.
  const jobBadge = isProvider
    ? new Set(jobs.filter((j) => j.jobStatus <= 3).map((j) => j.bookingId)).size
    : bookings.filter((b) => b.status <= 3).length;

  return { notifDot, jobBadge };
}
