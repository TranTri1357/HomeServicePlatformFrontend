import { useState } from "react";
import {
  ChevronLeft,
  Heart,
  Share2,
  BookOpen,
  CheckCircle,
  Check,
  Star,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import type { Service } from "@/shared/types";
import { services } from "@/services/Service/service.data";
import { technicians } from "@/services/Technician/technician.data";
import { Stars, Avatar } from "@/shared/ui";

export function ServiceDetail({
  onNavigate,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  data?: { service?: Service };
}) {
  const svc = data?.service ?? services[0];
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="relative flex-shrink-0">
        <img
          src={`https://images.unsplash.com/${svc.image}?w=800&h=280&fit=crop&auto=format`}
          alt={svc.name}
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => onNavigate("serviceList")}
          className="absolute top-4 left-4 w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center">
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-white text-2xl font-bold">
            {svc.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span className="text-white/90 text-sm">
              {svc.reviews} lượt đặt
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background">
        {/* Price highlight */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-border">
          <div>
            <span className="text-blue-600 text-2xl font-extrabold">
              {svc.price}đ
            </span>
            <span className="text-muted-foreground text-sm">
              /lượt
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Còn chỗ hôm nay
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-white">
          {["about", "pricing", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-muted-foreground"}`}
            >
              {t === "about"
                ? "Về dịch vụ"
                : t === "pricing"
                  ? "Bảng giá"
                  : "Đánh giá"}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "about" && (
            <>
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-2">
                  Mô tả dịch vụ
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dịch vụ {svc.name} chuyên nghiệp với đội ngũ
                  thợ có chứng chỉ và kinh nghiệm. Chúng tôi cam
                  kết chất lượng cao nhất, đúng giờ và bảo hành
                  3 tháng sau khi hoàn thành.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 space-y-3">
                <h3 className="font-bold text-foreground">
                  Bao gồm
                </h3>
                {[
                  "Kiểm tra và chẩn đoán miễn phí",
                  "Thợ có chứng chỉ chuyên môn",
                  "Bảo hành 3 tháng",
                  "Vật tư chính hãng",
                  "Dọn dẹp sau khi sửa",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              {/* Nearby Techs */}
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-bold text-foreground mb-3">
                  Thợ có sẵn
                </h3>
                <div className="space-y-3">
                  {technicians
                    .filter((t) => t.status === "available")
                    .slice(0, 2)
                    .map((tech) => (
                      <button
                        key={tech.id}
                        onClick={() =>
                          onNavigate("technicianDetail", {
                            tech,
                          })
                        }
                        className="w-full flex items-center gap-3 p-3 bg-muted rounded-xl hover:bg-accent transition-colors"
                      >
                        <div className="relative">
                          <Avatar
                            src={tech.avatar}
                            size={44}
                            name={tech.name}
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm text-foreground">
                            {tech.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tech.experience} kinh nghiệm ·{" "}
                            {tech.distance}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold">
                            {tech.rating}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "pricing" && (
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-blue-600 px-4 py-3">
                <h3 className="font-bold text-white">
                  Bảng giá dịch vụ
                </h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: "Kiểm tra cơ bản", price: "50,000" },
                  { name: "Sửa chữa nhỏ", price: "150,000" },
                  { name: "Sửa chữa lớn", price: "350,000" },
                  {
                    name: "Thay thế thiết bị",
                    price: "500,000+",
                  },
                  {
                    name: "Bảo trì định kỳ",
                    price: "200,000/lần",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center px-4 py-3"
                  >
                    <span className="text-sm text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {item.price}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-3">
              {[
                {
                  name: "Hoàng Văn A",
                  rating: 5,
                  date: "15/06/2026",
                  text: "Thợ đến đúng giờ, làm việc nhanh và sạch sẽ. Rất hài lòng!",
                },
                {
                  name: "Nguyễn Thị B",
                  rating: 4,
                  date: "10/06/2026",
                  text: "Dịch vụ tốt, giá hợp lý. Sẽ đặt lại lần sau.",
                },
                {
                  name: "Lê Minh C",
                  rating: 5,
                  date: "05/06/2026",
                  text: "Excellent! Professional and quick.",
                },
              ].map((r) => (
                <div
                  key={r.name}
                  className="bg-white rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">
                        {r.name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.date}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Stars rating={r.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {r.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-border px-4 py-4 flex gap-3">
        <button
          onClick={() => onNavigate("technicianMap")}
          className="flex-1 py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-accent transition-colors"
        >
          Tìm thợ gần đây
        </button>
        <button
          onClick={() =>
            onNavigate("booking", { service: svc })
          }
          className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
}

