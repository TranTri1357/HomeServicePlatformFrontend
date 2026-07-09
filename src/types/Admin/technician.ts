export interface AdminTechnician {
  id: number;
  name: string;
  email: string;
  phone: string;
  skill: string;
  rating: number;
  jobs: number;
  status: "active" | "pending" | "blocked";
  joined: string;
  verified: boolean;
  revenue: string;
}
