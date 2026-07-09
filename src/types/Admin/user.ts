export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "blocked";
  joined: string;
  orders: number;
  spent: string;
}
