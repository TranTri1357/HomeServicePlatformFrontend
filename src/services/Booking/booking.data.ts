import type { Booking } from "@/shared/types";

export const bookings: Booking[] = [
  { id: "BK001", service: "Electrical Repair", tech: "Nguyễn Văn An",  date: "20/06/2026", time: "09:00", status: "in_progress", price: "350,000", address: "123 Lê Lợi, Q.1, TP.HCM"       },
  { id: "BK002", service: "Cleaning",          tech: "Phạm Hoa",       date: "18/06/2026", time: "14:00", status: "completed",   price: "240,000", address: "45 Nguyễn Trãi, Q.5, TP.HCM"  },
  { id: "BK003", service: "Plumbing",          tech: "Trần Thị Bình",  date: "22/06/2026", time: "10:00", status: "pending",     price: "180,000", address: "78 Đinh Tiên Hoàng, Bình Thạnh" },
  { id: "BK004", service: "Air Conditioner",   tech: "Lê Minh Cường",  date: "25/06/2026", time: "13:00", status: "accepted",    price: "420,000", address: "210 CMT8, Q.3, TP.HCM"         },
];
