
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


export interface AdminTaskerDetail {
  taskerId: number;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  experienceYears: number;
  isVerified: boolean;
  verifiedAt: string | null;
  
  verificationImageUrl: string | null;
  
  rejectionReason: string | null;
  ratingAvg: number;
  totalReviews: number;
  
  taskerStatus: number;
  
  userStatus: number;
  joinedDate: string;
  skills: string[];
}
