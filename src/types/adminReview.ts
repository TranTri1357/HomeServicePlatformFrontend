
export interface AdminReviewItem {
  reviewId: number;
  customerName: string;
  taskerName: string;
  serviceName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
