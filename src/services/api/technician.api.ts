import { get } from "./client";
import type { Technician } from "@/shared/types";

export interface TechnicianListParams {
  search?: string;
  serviceId?: number | string;
  status?: Technician["status"];
  minRating?: number;
  maxDistanceKm?: number;
}

export async function getTechnicians(params?: TechnicianListParams): Promise<Technician[]> {
  return get<Technician[]>("/technicians", { params });
}

export async function getTechnicianById(id: number | string): Promise<Technician> {
  return get<Technician>(`/technicians/${id}`);
}
