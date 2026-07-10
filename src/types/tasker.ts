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

/** One day of revenue in the tasker dashboard. */
export interface DailyRevenue {
  /** ISO date (day). */
  date: string;
  amount: number;
}

/** Tasker home dashboard stats — GET /api/tasker/dashboard. */
export interface TaskerDashboard {
  fullName: string;
  isAvailable: boolean;
  ratingAvg: number;
  totalReviews: number;
  todayEarnings: number;
  todayJobsCount: number;
  monthEarnings: number;
  /** 7 days, oldest → newest. */
  weeklyRevenue: DailyRevenue[];
}

/** A service the tasker offers — GET /api/tasker-services. */
export interface TaskerService {
  taskerServiceId: number;
  serviceId: number;
  serviceName: string;
  categoryName: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

/** A one-hour slot in the tasker's day. Status: 0 trống · 1 đã đặt · 2 nghỉ. */
export interface ScheduleTimeSlot {
  /** "HH:mm:ss". */
  time: string;
  status: number;
}

/** A job on a given day in the schedule. */
export interface ScheduleUpcomingJob {
  bookingItemId: number;
  serviceName: string;
  customerName: string;
  addressLine: string;
  startTime: string;
  endTime: string;
  jobStatus: number;
}

/** Daily schedule — GET /api/tasker/schedule/daily?date=. */
export interface DailySchedule {
  date: string;
  timeSlots: ScheduleTimeSlot[];
  upcomingJobs: ScheduleUpcomingJob[];
}

/** One weekly working-hours row — body of PUT /api/tasker/schedule/weekly. */
export interface WeeklyScheduleInput {
  /** .NET DayOfWeek: 0 = Chủ nhật … 6 = Thứ 7. */
  dayOfWeek: number;
  startTime: string; // "HH:mm:ss"
  endTime: string;
}

/** The logged-in tasker's own profile — GET /api/tasker/profile/{id}/profile. */
export interface TaskerProfileData {
  taskerProfileId: number;
  fullName: string;
  phone: string;
  email: string;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  completedJobsCount: number;
  /** 1 = đang nhận việc · 0 = tạm nghỉ. */
  status: number;
}

/** One job of a tasker — GET /api/tasker/tasker-jobs. JobStatus uses BookingStatus codes. */
export interface TaskerJob {
  bookingItemId: number;
  bookingId: number;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  startAt: string;
  endAt: string;
  fullAddress: string;
  totalPrice: number;
  jobStatus: number;
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
