/** Featured tasker returned by GET /api/Taskers/top. */
export interface TopTasker {
  taskerId: number;
  fullName: string;
  /** Absolute or backend-relative avatar URL. Currently backend returns null. */
  avatarUrl: string | null;
  ratingAvg: number;
  totalReviews: number;
  isVerified: boolean;
  mainSkill: string | null;
}
