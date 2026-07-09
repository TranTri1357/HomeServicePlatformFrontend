import type { AdminComplaint } from "@/shared/types";

export const adminComplaintsList: AdminComplaint[] = [
  { id: "CP001", customer: "Trần Minh Khoa", provider: "Trần Thị Bình",  order: "BK003", type: "Chất lượng", content: "Thợ không hoàn thành đúng yêu cầu, cống vẫn bị tắc.",      date: "23/06/2026", status: "open",       priority: "high"   },
  { id: "CP002", customer: "Lê Văn Phúc",    provider: "Lê Minh Cường",  order: "BK004", type: "Thái độ",   content: "Thợ thiếu lịch sự, nói chuyện cộc lốc với khách.",          date: "20/06/2026", status: "processing", priority: "medium" },
  { id: "CP003", customer: "Nguyễn Thị Lan", provider: "Nguyễn Văn An",  order: "BK001", type: "Giá cả",    content: "Thu phí cao hơn giá đã thỏa thuận 50,000đ.",               date: "18/06/2026", status: "resolved",   priority: "low"    },
  { id: "CP004", customer: "Bùi Thị Thu",    provider: "Vũ Quốc Tuấn",  order: "BK006", type: "Chất lượng", content: "Sản phẩm thay thế không đúng hãng như cam kết.",          date: "13/06/2026", status: "open",       priority: "high"   },
];
