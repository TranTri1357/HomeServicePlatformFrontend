export interface AdminReview {
  id: number;
  customer: string;
  provider: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  status: "published" | "flagged";
}
