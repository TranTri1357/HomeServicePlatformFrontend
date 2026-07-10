/** A commission rule — GET /api/admin/commissions. Null service/tasker = áp dụng chung. */
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

/** Body for POST /api/admin/commissions. */
export interface CreateCommissionInput {
  serviceId?: number | null;
  taskerId?: number | null;
  commissionRate: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

/** Body for PUT /api/admin/commissions/{id}. EffectiveFrom is reset to now server-side. */
export interface UpdateCommissionInput {
  serviceId?: number | null;
  taskerId?: number | null;
  commissionRate: number;
  effectiveTo?: string | null;
}
