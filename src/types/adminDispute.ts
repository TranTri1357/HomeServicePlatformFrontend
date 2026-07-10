/** A row in the admin dispute list — GET /api/admin/disputes.
 *  Status: 0 chờ xử lý · 1 đã giải quyết (hoàn tiền) · 2 từ chối. */
export interface AdminDisputeItem {
  disputeId: number;
  bookingId: number;
  raisedById: number;
  raisedByName: string;
  reason: string;
  status: number;
  resolutionNote: string | null;
  refundAmount: number | null;
  resolvedAt: string | null;
  createdAt: string;
  /** Needed for optimistic-concurrency when resolving. */
  rowVersion: number;
}
