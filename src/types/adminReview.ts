/** A row in the admin review list — GET /api/admin/reviews. */
export interface AdminReviewItem {
  reviewId: number;
  customerName: string;
  taskerName: string;
  serviceName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
