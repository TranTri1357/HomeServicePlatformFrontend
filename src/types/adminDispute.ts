
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
  
  rowVersion: number;
}
