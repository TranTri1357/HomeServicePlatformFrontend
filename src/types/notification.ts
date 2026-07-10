export interface Notification {
  id: number;
  type: "booking" | "payment" | "promo" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

/** A notification row from GET /api/customer/notifications. */
export interface AppNotification {
  notificationId: number;
  /** Numeric backend type code. */
  type: number;
  /** JSON string, typically { title, body, ... }. */
  payload: string | null;
  isRead: boolean;
  createdAt: string;
}
