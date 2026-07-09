import type { TopTasker } from "@/shared/types";

/** Mock fallback for the "Thợ phổ biến" carousel while the backend is unreachable. */
export const topTaskers: TopTasker[] = [
  {
    taskerId: 1,
    fullName: "Đỗ Văn Long",
    avatarUrl: null,
    ratingAvg: 4.9,
    totalReviews: 152,
    isVerified: true,
    mainSkill: "Quét nhà",
  },
  {
    taskerId: 2,
    fullName: "Nguyễn Thị Hạnh",
    avatarUrl: null,
    ratingAvg: 4.85,
    totalReviews: 201,
    isVerified: true,
    mainSkill: "Giặt giũ",
  },
  {
    taskerId: 3,
    fullName: "Trần Văn Minh",
    avatarUrl: null,
    ratingAvg: 4.8,
    totalReviews: 98,
    isVerified: true,
    mainSkill: "Điện lạnh",
  },
];
