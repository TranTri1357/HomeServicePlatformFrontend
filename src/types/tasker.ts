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

/** A tasker pin on the map — GET /api/Taskers/nearby. Status: 1 online, 2 busy. */
export interface NearbyTasker {
  taskerId: number;
  latitude: number;
  longitude: number;
  status: number;
  ratingAvg: number;
  distanceKm: number;
}

/** Quick popup info for a tasker+service — GET /api/Taskers/{id}/service/{serviceId}/quick-info. */
export interface TaskerQuickInfo {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  ratingAvg: number;
  isVerified: boolean;
  mainSkill: string | null;
  currentPrice: number;
}

/** Star-count breakdown for a tasker's reviews. */
export interface ReviewSummary {
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

/** A single recent review — part of TaskerDetail. */
export interface TaskerReview {
  reviewId: number;
  customerName: string;
  customerAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** Full tasker profile — GET /api/Taskers/{id}. */
export interface TaskerDetail {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  /** Total completed jobs. */
  totalJobs: number;
  /** Service names the tasker provides. */
  skills: string[];
  certificates: string[];
  reviewSummary: ReviewSummary;
  recentReviews: TaskerReview[];
}
