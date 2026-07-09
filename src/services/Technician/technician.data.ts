import type { Technician } from "@/shared/types";

export const technicians: Technician[] = [
  { id: 1, name: "Nguyễn Văn An",  skill: "Electrical Expert", rating: 4.9, jobs: 312, distance: "0.8 km", price: "150K–200K/h", status: "available", avatar: "photo-1507003211169-0a1dd7228f2d", experience: "5 năm", verified: true  },
  { id: 2, name: "Trần Thị Bình",  skill: "Plumber Master",    rating: 4.8, jobs: 245, distance: "1.2 km", price: "120K–180K/h", status: "available", avatar: "photo-1494790108377-be9c29b29330", experience: "7 năm", verified: true  },
  { id: 3, name: "Lê Minh Cường",  skill: "AC Technician",     rating: 4.7, jobs: 198, distance: "2.1 km", price: "200K–250K/h", status: "busy",      avatar: "photo-1500648767791-00dcc994a43e", experience: "4 năm", verified: false },
  { id: 4, name: "Phạm Hoa",       skill: "Cleaning Expert",   rating: 4.6, jobs: 421, distance: "0.5 km", price: "80K–120K/h",  status: "available", avatar: "photo-1438761681033-6461ffad8d80", experience: "3 năm", verified: true  },
];
