import {
  Star,
  Edit3,
  Camera,
  Phone,
  MessageCircle,
  MapPin,
  User,
  LogOut,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { technicians } from "@/services/Technician/technician.data";
import { Avatar } from "@/shared/ui";

export function ProviderProfile({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const tech = technicians[0];
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">
            Hồ sơ thợ
          </h2>
          <button className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={tech.avatar}
              size={80}
              name={tech.name}
            />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">
              {tech.name}
            </h3>
            <p className="text-slate-400 text-sm">
              {tech.skill}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm font-semibold">
                  {tech.rating}
                </span>
              </div>
              <span className="text-slate-400 text-sm">
                {tech.jobs} công việc
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-border">
          {[
            ["4.9", "Đánh giá"],
            ["312", "Công việc"],
            ["5 năm", "Kinh nghiệm"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="flex flex-col items-center gap-1 px-3"
            >
              <span className="text-xl font-extrabold text-blue-600">
                {v}
              </span>
              <span className="text-xs text-muted-foreground">
                {l}
              </span>
            </div>
          ))}
        </div>

        {[
          {
            title: "Thông tin cá nhân",
            items: [
              { label: "Họ tên", value: tech.name, icon: User },
              {
                label: "Điện thoại",
                value: "0901 234 567",
                icon: Phone,
              },
              {
                label: "Email",
                value: "an.nguyen@email.com",
                icon: MessageCircle,
              },
            ],
          },
          {
            title: "Khu vực làm việc",
            items: [
              {
                label: "Chính",
                value: "Quận 1, 3, 4, 5 – TP.HCM",
                icon: MapPin,
              },
              {
                label: "Mở rộng",
                value: "Bình Thạnh, Phú Nhuận",
                icon: MapPin,
              },
            ],
          },
        ].map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">
                {section.title}
              </h3>
              <button className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Sửa
              </button>
            </div>
            {section.items.map((item) => (
              <div
                key={item.label}
                className="px-4 py-3 flex items-center gap-3 border-b border-border last:border-0"
              >
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}

        <button className="w-full bg-red-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 hover:bg-red-100 transition-colors">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-semibold text-red-600">
            Đăng xuất
          </span>
        </button>
      </div>
    </div>
  );
}

