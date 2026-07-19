export interface AdminDailyRevenue {
  date: string;
  amount: number;
}

export interface AdminStatusCount {
  status: number;
  count: number;
}

export interface AdminRecentBooking {
  bookingId: number;
  customerName: string;
  finalAmount: number;
  status: number;
  createdAt: string;
}

/** Admin dashboard stats — GET /api/admin/dashboard. */
export interface AdminDashboard {
  /** GMV hôm nay — tổng tiền khách trả, KHÔNG phải tiền của sàn. */
  todayRevenue: number;
  todayBookings: number;
  totalCustomers: number;
  totalTaskers: number;
  activeTaskers: number;
  pendingTaskers: number;
  totalBookings: number;
  /** GMV luỹ kế — phần lớn khoản này thuộc về thợ. */
  totalRevenue: number;
  /** Doanh thu THẬT của sàn hôm nay (hoa hồng + phí hủy), đọc từ ví doanh thu. */
  todayPlatformRevenue: number;
  /** Doanh thu THẬT của sàn luỹ kế. */
  totalPlatformRevenue: number;
  openDisputes: number;
  weeklyRevenue: AdminDailyRevenue[];
  bookingsByStatus: AdminStatusCount[];
  recentBookings: AdminRecentBooking[];
}
