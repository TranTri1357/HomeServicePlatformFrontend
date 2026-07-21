
export interface TopTasker {
  taskerId: number;
  fullName: string;
  
  avatarUrl: string | null;
  ratingAvg: number;
  totalReviews: number;
  isVerified: boolean;
  mainSkill: string | null;
}


export interface NearbyTasker {
  taskerId: number;
  fullName: string;
  latitude: number;
  longitude: number;
  status: number;
  ratingAvg: number;
  distanceKm: number;
}


export interface TaskerQuickInfo {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  ratingAvg: number;
  isVerified: boolean;
  mainSkill: string | null;
  currentPrice: number;
}


export interface DailyRevenue {
  
  date: string;
  amount: number;
}


export interface TaskerDashboard {
  fullName: string;
  isAvailable: boolean;
  ratingAvg: number;
  totalReviews: number;
  
  todayEarnings: number;
  todayJobsCount: number;
  
  monthEarnings: number;
  
  monthGrossEarnings: number;
  
  monthCommission: number;
  
  weeklyRevenue: DailyRevenue[];
  
  totalJobsCount: number;
  
  todayJobs: TaskerTodayJob[];
}


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


export interface TaskerJobGroupItem {
  bookingItemId: number;
  serviceName: string;
  startAt: string;
  endAt: string;
  totalPrice: number;
  itemStatus: number;
}


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


export interface TaskerJobStats {
  incoming: number;
  active: number;
  history: number;
}


export interface IncomeEntry {
  transactionId: number;
  
  type: number;
  bookingId: number;
  serviceSummary: string;
  
  gross: number;
  
  commission: number;
  
  net: number;
  
  heldAmount: number;
  
  cashReceived: number;
  balanceAfter: number;
  createdAt: string;
}


export interface TaskerIncome {
  balance: number;
  totalEarned: number;
  totalCount: number;
  entries: IncomeEntry[];
}


export interface TaskerServiceOption {
  serviceId: number;
  serviceName: string;
  categoryName: string;
  price: number;
  durationMinutes: number;
}


export interface AvailabilitySlot {
  time: string;
  isFree: boolean;
}


export interface TaskerAvailability {
  
  date: string;
  
  hasSchedule: boolean;
  slots: AvailabilitySlot[];
}


export interface TaskerService {
  taskerServiceId: number;
  serviceId: number;
  serviceName: string;
  categoryName: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  
  imageUrl: string | null;
}


export interface ScheduleTimeSlot {
  
  time: string;
  status: number;
}


export interface ScheduleUpcomingJob {
  bookingItemId: number;
  serviceName: string;
  customerName: string;
  addressLine: string;
  startTime: string;
  endTime: string;
  jobStatus: number;
}


export interface DailySchedule {
  date: string;
  timeSlots: ScheduleTimeSlot[];
  upcomingJobs: ScheduleUpcomingJob[];
}


export interface WeeklyScheduleInput {
  
  dayOfWeek: number;
  startTime: string; 
  endTime: string;
}


export interface TaskerProfileData {
  taskerProfileId: number;
  fullName: string;
  phone: string;
  email: string;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  completedJobsCount: number;
  
  status: number;
  bio: string | null;
  
  rejectionReason: string | null;
}


export interface UpdateTaskerProfileInput {
  fullName: string;
  phone: string;
  bio?: string;
  experienceYears: number;
}


export interface CreateTaskerProfileInput {
  bio: string;
  experienceYears: number;
  latitude: number;
  longitude: number;
  
  verificationImageUrl: string;
}


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


export interface ReviewSummary {
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}


export interface TaskerReview {
  reviewId: number;
  customerName: string;
  customerAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}


export interface TaskerDetail {
  taskerId: number;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  
  totalJobs: number;
  
  skills: string[];
  certificates: string[];
  reviewSummary: ReviewSummary;
  recentReviews: TaskerReview[];
}
