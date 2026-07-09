export type BookingStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "upcoming";

export interface Booking {
  id: string;
  service: string;
  tech: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: string;
  address: string;
}
