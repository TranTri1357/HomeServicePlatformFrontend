import type { BookingStatus } from "@/types/booking";

export interface ProviderJob {
  id: string;
  service: string;
  customer: string;
  address: string;
  time: string;
  status: BookingStatus;
  price: string;
  phone: string;
}

export interface ProviderService {
  id: number;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  active: boolean;
  bookings: number;
  rating: number;
}

export interface District {
  id: number;
  name: string;
  distance: string;
  jobs: number;
  active: boolean;
  color: string;
}

