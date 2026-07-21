import { useApi } from "./useApi";
import { notificationApi, taskerApi, bookingApi } from "@/services/api";

export type NavRole = "customer" | "provider";


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
  
  notifDot: boolean;
  
  jobBadge: number;
}


export function useNavBadges(role: NavRole, enabled = true): NavBadges {
  const isProvider = role === "provider";
  const notifDot = useHasUnreadNotifications(role, enabled);

  
  const { data: jobStats } = useApi(() => taskerApi.getTaskerJobStats(), {
    immediate: enabled && isProvider,
  });
  
  const { data: activeBookings } = useApi(
    () => bookingApi.getMyBookings({ status: [0, 1, 2, 3], pageSize: 1 }),
    { immediate: enabled && !isProvider },
  );

  const jobBadge = isProvider
    ? (jobStats?.incoming ?? 0) + (jobStats?.active ?? 0)
    : (activeBookings?.totalCount ?? 0);

  return { notifDot, jobBadge };
}
