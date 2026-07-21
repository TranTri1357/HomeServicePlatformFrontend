
export interface AdminCommissionItem {
  commissionId: number;
  serviceId: number | null;
  serviceName: string | null;
  taskerId: number | null;
  taskerName: string | null;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}


export interface CreateCommissionInput {
  serviceId?: number | null;
  taskerId?: number | null;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}


export interface UpdateCommissionInput {
  serviceId?: number | null;
  taskerId?: number | null;
  commissionRate: number;
  effectiveTo?: string | null;
}
