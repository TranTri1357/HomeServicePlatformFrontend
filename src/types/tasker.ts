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
  fullName: string;
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
  /** Thực nhận hôm nay (sau hoa hồng). */
  todayEarnings: number;
  todayJobsCount: number;
  /** Thực nhận tháng này (sau hoa hồng). */
  monthEarnings: number;
  /** Doanh thu gộp tháng này (trước hoa hồng). */
  monthGrossEarnings: number;
  /** Tổng hoa hồng đã trừ trong tháng. */
  monthCommission: number;
  /** 7 days, oldest → newest (thực nhận). */
  weeklyRevenue: DailyRevenue[];
  /** Tổng số ĐƠN đã chốt của thợ (nhãn "X việc"). */
  totalJobsCount: number;
  /** Xem nhanh các việc có lịch hôm nay. */
  todayJobs: TaskerTodayJob[];
}

/** Một việc có lịch hôm nay (xem nhanh ở trang chủ thợ). */
export interface TaskerTodayJob {
  bookingItemId: number;
  bookingId: number;
  serviceName: string;
  customerName: string;
  startAt: string;
  totalPrice: number;
  jobStatus: number;
  fullAddress: string;
}

/** Một hạng mục (dịch vụ) trong đơn của thợ — phần tử của TaskerJobGroup. */
export interface TaskerJobGroupItem {
  bookingItemId: number;
  serviceName: string;
  startAt: string;
  endAt: string;
  totalPrice: number;
  itemStatus: number;
}

/** Một đơn gom các hạng mục của thợ — GET /api/tasker/tasker-jobs/paged (đã gộp ở server). */
export interface TaskerJobGroup {
  bookingId: number;
  customerName: string;
  customerPhone: string;
  fullAddress: string;
  jobStatus: number;
  startAt: string;
  total: number;
  items: TaskerJobGroupItem[];
}

/** Đếm số đơn theo nhóm trạng thái — GET /api/tasker/tasker-jobs/stats. */
export interface TaskerJobStats {
  incoming: number;
  active: number;
  history: number;
}

/** Một dòng giao dịch ví của thợ (thu nhập, rút tiền, điều chỉnh...). */
export interface IncomeEntry {
  transactionId: number;
  /** Loại giao dịch: 4=Thu nhập, 5=Rút tiền, 6=Điều chỉnh... */
  type: number;
  bookingId: number;
  serviceSummary: string;
  /** Giá gộp (trước hoa hồng). */
  gross: number;
  /** Hoa hồng THẬT sàn đã khấu (= held − net). */
  commission: number;
  /** Thực nhận vào ví (= held − hoa hồng). */
  net: number;
  /** Tiền hệ thống đã giữ cho đơn (cọc/trả hết). */
  heldAmount: number;
  /** Tiền mặt thợ thu trực tiếp từ khách (= gross − held). */
  cashReceived: number;
  balanceAfter: number;
  createdAt: string;
}

/** Ví/thu nhập của thợ — GET /api/tasker/wallet. */
export interface TaskerIncome {
  balance: number;
  totalEarned: number;
  totalCount: number;
  entries: IncomeEntry[];
}

/** A service a tasker offers, for the customer booking flow — GET /api/Taskers/{id}/services. */
export interface TaskerServiceOption {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  price: number;
  durationMinutes: number;
}

/** One hourly availability slot of a tasker in a day. `time` is "HH:mm:ss". */
export interface AvailabilitySlot {
  time: string;
  isFree: boolean;
}

/** A tasker's free/busy hours in a day — GET /api/Taskers/{id}/availability?date=. */
export interface TaskerAvailability {
  /** ISO date "yyyy-MM-dd". */
  date: string;
  /** false = thợ không đặt lịch làm việc ngày này. */
  hasSchedule: boolean;
  slots: AvailabilitySlot[];
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
  /** Ảnh dịch vụ đã upload (Cloudinary); null thì UI hiện icon mặc định. */
  imageUrl: string | null;
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
  /** 0 = chờ duyệt · 1 = đang nhận việc · 2 = bị khóa · 3 = tạm nghỉ. */
  status: number;
  bio: string | null;
}

/** Body for PUT /api/tasker/profile — the tasker updates their own account. */
export interface UpdateTaskerProfileInput {
  fullName: string;
  phone: string;
  bio?: string;
  experienceYears: number;
}

/** Body for POST /api/tasker/profile — the tasker creates a profile for admin approval. */
export interface CreateTaskerProfileInput {
  bio: string;
  experienceYears: number;
  latitude: number;
  longitude: number;
  /** URL ảnh giấy tờ (CCCD/chứng chỉ) đã tải lên — backend bắt buộc, thiếu là không tạo hồ sơ. */
  verificationImageUrl: string;
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
