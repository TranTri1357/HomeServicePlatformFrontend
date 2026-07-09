export interface AdminService {
  id: number;
  name: string;
  type: string;
  price: string;
  providers: number;
  orders: number;
  status: "active" | "inactive";
}

export interface AdminServiceType {
  id: number;
  name: string;
  icon: string;
  services: number;
  providers: number;
  orders: number;
  active: boolean;
}
