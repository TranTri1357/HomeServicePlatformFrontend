import { get } from "./client";
import type { Service } from "@/shared/types";

export interface ServiceListParams {
  search?: string;
  category?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

export async function getServices(params?: ServiceListParams): Promise<Service[]> {
  return get<Service[]>("/services", { params });
}

export async function getServiceById(id: number | string): Promise<Service> {
  return get<Service>(`/services/${id}`);
}
