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


export interface AdminDashboard {
  
  todayRevenue: number;
  todayBookings: number;
  totalCustomers: number;
  totalTaskers: number;
  activeTaskers: number;
  pendingTaskers: number;
  totalBookings: number;
  
  totalRevenue: number;
  
  todayPlatformRevenue: number;
  
  totalPlatformRevenue: number;
  openDisputes: number;
  weeklyRevenue: AdminDailyRevenue[];
  bookingsByStatus: AdminStatusCount[];
  recentBookings: AdminRecentBooking[];
}
