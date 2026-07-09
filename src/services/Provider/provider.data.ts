import type { ProviderJob, ProviderService, District } from "@/shared/types";

export const providerJobs: ProviderJob[] = [
  { id: "JB001", service: "Sửa điện",  customer: "Hoàng Văn E",   address: "123 Lê Lợi, Q.1",      time: "09:00", status: "in_progress", price: "350,000", phone: "0901234567" },
  { id: "JB002", service: "Thông cống",customer: "Nguyễn Thị F",  address: "78 Hai Bà Trưng, Q.3", time: "13:00", status: "upcoming",    price: "180,000", phone: "0912345678" },
  { id: "JB003", service: "Sửa điện",  customer: "Trần Minh G",   address: "45 CMT8, Q.10",         time: "16:00", status: "upcoming",    price: "200,000", phone: "0923456789" },
];

export const providerServices: ProviderService[] = [
  { id: 1, name: "Sửa điện dân dụng",       category: "Điện", price: "150,000", unit: "lượt", image: "photo-1621905251189-08b1489462be", active: true,  bookings: 48, rating: 4.9 },
  { id: 2, name: "Thay bóng đèn & thiết bị", category: "Điện", price: "80,000",  unit: "lượt", image: "photo-1558618666-fcd25c85cd64",    active: true,  bookings: 31, rating: 4.8 },
  { id: 3, name: "Đấu nối bảng điện",        category: "Điện", price: "300,000", unit: "lần",  image: "photo-1621905252472-943a4b1b39e8",  active: false, bookings: 12, rating: 4.7 },
  { id: 4, name: "Lắp đặt điều hòa",         category: "Điện", price: "250,000", unit: "lần",  image: "photo-1585771724684-38269d6639fd",  active: true,  bookings: 27, rating: 5.0 },
];

export const districts: District[] = [
  { id: 1,  name: "Quận 1",    distance: "0 km",   jobs: 48, active: true,  color: "#2563EB" },
  { id: 2,  name: "Quận 3",    distance: "2.1 km", jobs: 35, active: true,  color: "#2563EB" },
  { id: 3,  name: "Quận 4",    distance: "1.8 km", jobs: 22, active: true,  color: "#2563EB" },
  { id: 4,  name: "Quận 5",    distance: "3.2 km", jobs: 19, active: false, color: "#64748B" },
  { id: 5,  name: "Bình Thạnh",distance: "4.0 km", jobs: 41, active: true,  color: "#2563EB" },
  { id: 6,  name: "Phú Nhuận", distance: "3.5 km", jobs: 28, active: true,  color: "#2563EB" },
  { id: 7,  name: "Gò Vấp",    distance: "6.2 km", jobs: 15, active: false, color: "#64748B" },
  { id: 8,  name: "Tân Bình",  distance: "5.4 km", jobs: 20, active: false, color: "#64748B" },
  { id: 9,  name: "Quận 7",    distance: "7.1 km", jobs: 12, active: false, color: "#64748B" },
  { id: 10, name: "Quận 10",   distance: "4.8 km", jobs: 17, active: true,  color: "#2563EB" },
  { id: 11, name: "Quận 11",   distance: "5.3 km", jobs: 9,  active: false, color: "#64748B" },
  { id: 12, name: "Thủ Đức",   distance: "9.5 km", jobs: 8,  active: false, color: "#64748B" },
];

export const districtMapPositions: Record<number, { x: string; y: string }> = {
  1: { x: "50%", y: "48%" }, 3: { x: "44%", y: "40%" }, 4: { x: "50%", y: "60%" },
  5: { x: "36%", y: "50%" }, 6: { x: "50%", y: "34%" }, 7: { x: "54%", y: "68%" },
  8: { x: "38%", y: "30%" }, 9: { x: "42%", y: "28%" }, 10: { x: "37%", y: "43%" },
  11: { x: "31%", y: "50%" }, 12: { x: "64%", y: "24%" },
};
