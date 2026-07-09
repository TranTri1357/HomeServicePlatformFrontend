import type { Notification } from "@/shared/types";

export const notifications: Notification[] = [
  { id: 1, type: "booking", title: "Đặt lịch được xác nhận", body: "Thợ Nguyễn Văn An đã nhận yêu cầu sửa điện của bạn",    time: "5 phút trước",  read: false },
  { id: 2, type: "payment", title: "Thanh toán thành công",  body: "Bạn đã thanh toán 240,000đ cho dịch vụ Dọn dẹp",         time: "2 giờ trước",   read: false },
  { id: 3, type: "promo",   title: "Ưu đãi đặc biệt!",      body: "Giảm 20% cho lần đặt lịch tiếp theo. Áp dụng đến 30/06", time: "1 ngày trước",  read: true  },
  { id: 4, type: "system",  title: "Cập nhật ứng dụng",     body: "Phiên bản mới 2.5 đã sẵn sàng với nhiều cải tiến",        time: "2 ngày trước",  read: true  },
  { id: 5, type: "booking", title: "Nhận xét dịch vụ",      body: "Hãy đánh giá dịch vụ Dọn dẹp vừa hoàn thành",            time: "2 ngày trước",  read: true  },
];
