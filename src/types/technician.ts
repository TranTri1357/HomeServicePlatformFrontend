export interface Technician {
  id: number;
  name: string;
  skill: string;
  rating: number;
  jobs: number;
  distance: string;
  price: string;
  status: "available" | "busy" | "offline";
  avatar: string;
  experience: string;
  verified: boolean;
}
