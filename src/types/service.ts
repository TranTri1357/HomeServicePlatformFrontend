import type { LucideIcon } from "lucide-react";

export interface Service {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
}
