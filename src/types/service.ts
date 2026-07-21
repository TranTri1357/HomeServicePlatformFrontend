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


export interface PopularService {
  serviceId: number;
  name: string;
  totalBookings: number;
  
  startingPrice: number;
  
  imageUrl: string | null;
}


export interface ServiceExplorerItem {
  serviceId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalBookings: number;
  startingPrice: number;
  
  avgRating: number;
  
  imageUrl: string | null;
}


export interface ServiceTaskerSuggestion {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  experienceYears: number;
  ratingAvg: number;
  currentPrice: number;
  
  provinceCode: string | null;
  districtCode: string | null;
  
  distanceKm: number | null;
}


export interface ServiceDetailData {
  serviceId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  totalBookings: number;
  startingPrice: number;
  imageUrl: string | null;
  suggestedTaskers: ServiceTaskerSuggestion[];
}
