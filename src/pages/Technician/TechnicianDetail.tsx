import { ChevronLeft, Shield, Star, Briefcase, Award, MessageCircle, Phone } from "lucide-react";
import type { Screen } from "@/shared/types";
import type { Technician } from "@/shared/types";
import { technicians } from "@/services/Technician/technician.data";
import { Avatar } from "@/shared/ui";

export function TechnicianDetail({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { tech?: Technician };
}) {
  const tech = data?.tech ?? technicians[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 px-4 pt-6 pb-16">
          <button
            onClick={() => onNavigate("customerHome")}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-4"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar src={tech.avatar} size={80} name={tech.name} />
              {tech.status === "available" && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full" />
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-bold">{tech.name}</h2>
                {tech.verified && <Shield className="w-4 h-4 text-green-400" />}
              </div>
              <p className="text-blue-200 text-sm">{tech.skill}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-bold text-sm">{tech.rating}</span>
                </div>
                <span className="text-blue-200 text-sm">{tech.jobs} công việc</span>
                <span className="text-blue-200 text-sm">{tech.experience}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-8 space-y-4 pb-4">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-border">
            {[
              {
                label: "Đánh giá",
                value: tech.rating.toString(),
                icon: Star,
              },
              {
                label: "Công việc",
                value: tech.jobs.toString(),
                icon: Briefcase,
              },
              {
                label: "Kinh nghiệm",
                value: tech.experience,
                icon: Award,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-2">
                <stat.icon className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-extrabold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-3">Kỹ năng chuyên môn</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Sửa điện dân dụng",
                "Đấu nối bảng điện",
                "Sửa chữa thiết bị điện",
                "Lắp đặt điều hòa",
                "Chống sét lan truyền",
              ].map((s) => (
                <span
                  key={s}
                  className="bg-accent text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-bold text-foreground mb-3">Chứng chỉ</h3>
            <div className="space-y-2">
              {["Chứng chỉ điện công nghiệp – Bộ LĐTBXH", "Chứng nhận an toàn điện – VINASME"].map(
                (cert) => (
                  <div key={cert} className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-foreground">{cert}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground">Đánh giá của khách hàng</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-foreground">{tech.rating}</span>
                <span className="text-xs text-muted-foreground">({tech.jobs} đánh giá)</span>
              </div>
            </div>
            {/* Rating bar */}
            <div className="space-y-1.5 mb-4">
              {[
                [5, 78],
                [4, 15],
                [3, 5],
                [2, 1],
                [1, 1],
              ].map(([star, pct]) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                {
                  name: "Hoàng Văn A",
                  rating: 5,
                  date: "15/06/2026",
                  text: "Thợ đến đúng giờ, làm việc chuyên nghiệp, dọn sạch sau khi xong. Rất hài lòng!",
                },
                {
                  name: "Nguyễn Thị B",
                  rating: 4,
                  date: "10/06/2026",
                  text: "Kỹ thuật tốt, giải thích rõ ràng nguyên nhân hỏng hóc. Sẽ gọi lại.",
                },
                {
                  name: "Lê Minh C",
                  rating: 5,
                  date: "05/06/2026",
                  text: "Nhanh và gọn, giá cả hợp lý.",
                },
              ].map((r) => (
                <div key={r.name} className="border-t border-border pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                        {r.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-border px-4 py-4 flex gap-3">
        <button
          onClick={() => onNavigate("chat")}
          className="w-12 h-12 border-2 border-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-accent transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </button>
        <button className="w-12 h-12 border-2 border-green-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-green-50 transition-colors">
          <Phone className="w-5 h-5 text-green-600" />
        </button>
        <button
          onClick={() => onNavigate("booking", { tech })}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Đặt lịch với {tech.name.split(" ").slice(-1)[0]}
        </button>
      </div>
    </div>
  );
}
