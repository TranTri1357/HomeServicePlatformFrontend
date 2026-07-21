export interface Notification {
  id: number;
  type: "booking" | "payment" | "promo" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}


export interface AppNotification {
  notificationId: number;
  
  type: number;
  
  payload: string | null;
  isRead: boolean;
  createdAt: string;
}
