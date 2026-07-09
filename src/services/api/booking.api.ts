import { post, get } from "./client";
import type { Booking } from "@/shared/types";

export interface CreateBookingPayload {
  serviceId: number | string;
  technicianId?: number | string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  note?: string;
}

export async function getMyBookings(): Promise<Booking[]> {
  return get<Booking[]>("/bookings/me");
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return post<Booking>("/bookings", payload);
}
