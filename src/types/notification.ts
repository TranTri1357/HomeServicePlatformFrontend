export interface Notification {
  id: number;
  type: "booking" | "payment" | "promo" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}
