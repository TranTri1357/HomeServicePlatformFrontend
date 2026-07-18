import { Bell, AlertCircle } from "lucide-react";
import type { Screen, AppNotification } from "@/shared/types";
import { notificationApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatDateVn, notify } from "@/shared/lib";

/** Pull a human title/body out of the notification's JSON payload. */
function parsePayload(payload: string | null): { title: string; body: string } {
  if (!payload) return { title: "Thông báo", body: "" };
  try {
    const obj = JSON.parse(payload) as Record<string, unknown>;
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim()) return v;
      }
      return "";
    };
    const title = pick("title", "Title", "heading", "Heading") || "Thông báo";
    const body = pick("body", "Body", "message", "Message", "content", "Content");
    return { title, body };
  } catch {
    // Not JSON — show the raw string as the body.
    return { title: "Thông báo", body: payload };
  }
}

export function Notifications({
  variant = "customer",
}: {
  variant?: "customer" | "provider";
}) {
  const isProvider = variant === "provider";
  // Pick the endpoints matching the current role (same UI, different route).
  const fetchList = isProvider
    ? notificationApi.getTaskerNotifications
    : notificationApi.getMyNotifications;
  const markRead = isProvider
    ? notificationApi.markTaskerNotificationRead
    : notificationApi.markNotificationRead;
  const backTarget: Screen = isProvider ? "providerDashboard" : "customerHome";
  const goBack = useGoBack(backTarget);

  // Backend giới hạn pageSize tối đa 20 mỗi lần tải.
  const { data: paged, loading, error, refetch } = useApi(() => fetchList(1, 20));

  const items: AppNotification[] = paged?.items ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  const markOne = async (n: AppNotification) => {
    if (n.isRead) return;
    try {
      await markRead(n.notificationId);
      void refetch();
    } catch (err) {
      notify.error(err);
    }
  };

  const markAll = async () => {
    const unread = items.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markRead(n.notificationId)));
      notify.success("Đã đánh dấu tất cả là đã đọc");
      void refetch();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Thông báo"
        onBack={goBack}
        actions={
          hasUnread ? (
            <button onClick={markAll} className="text-blue-600 text-xs font-semibold">
              Đọc tất cả
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <Bell className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">Chưa có thông báo nào.</p>
          </div>
        ) : (
          items.map((n) => {
            const { title, body } = parsePayload(n.payload);
            return (
              <button
                key={n.notificationId}
                onClick={() => markOne(n)}
                className={`w-full flex items-start gap-3 px-4 py-4 border-b border-border hover:bg-muted transition-colors ${!n.isRead ? "bg-blue-50/40" : "bg-white"}`}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm text-foreground ${!n.isRead ? "font-bold" : "font-semibold"}`}
                    >
                      {title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {body && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                    {formatDateVn(n.createdAt)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
