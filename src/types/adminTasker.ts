/** A row in the admin tasker list — GET /api/admin/taskers. Status: 0 pending · 1 active · 2 blocked. */
export interface AdminTaskerItem {
  taskerId: number;
  fullName: string;
  phone: string;
  skills: string[];
  ratingAvg: number;
  totalJobs: number;
  status: number;
  joinedDate: string;
}

/** Full tasker detail (admin) — GET /api/admin/taskers/{id}. */
export interface AdminTaskerDetail {
  taskerId: number;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  experienceYears: number;
  isVerified: boolean;
  verifiedAt: string | null;
  /** Ảnh giấy tờ (CCCD/chứng chỉ) thợ nộp — null với hồ sơ tạo trước khi có tính năng này. */
  verificationImageUrl: string | null;
  /** Lý do lần từ chối gần nhất — null nếu chưa từng bị từ chối. */
  rejectionReason: string | null;
  ratingAvg: number;
  totalReviews: number;
  /** 0 pending · 1 active · 2 blocked (nghề). */
  taskerStatus: number;
  /** 1 active · 0 locked (tài khoản đăng nhập). */
  userStatus: number;
  joinedDate: string;
  skills: string[];
}
