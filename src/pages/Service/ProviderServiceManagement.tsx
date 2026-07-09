import { useState } from "react";
import {
  Search,
  X,
  Plus,
  Edit3,
  Trash2,
  Star,
  Package,
  ImageIcon,
} from "lucide-react";
import type { Screen } from "@/shared/types";
import { providerServices } from "@/services/Provider/provider.data";
import { TopBar } from "@/shared/ui";

export function ProviderServiceManagement({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState(providerServices);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCat, setNewCat] = useState("Điện");
  const [editId, setEditId] = useState<number | null>(null);

  const filtered = items.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && s.active) ||
      (filter === "inactive" && !s.active);
    return matchSearch && matchFilter;
  });

  const toggleActive = (id: number) =>
    setItems(
      items.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s,
      ),
    );
  const deleteItem = (id: number) =>
    setItems(items.filter((s) => s.id !== id));
  const addService = () => {
    if (!newName.trim() || !newPrice.trim()) return;
    setItems([
      ...items,
      {
        id: Date.now(),
        name: newName,
        category: newCat,
        price: newPrice,
        unit: "lượt",
        image: "photo-1621905251189-08b1489462be",
        active: true,
        bookings: 0,
        rating: 0,
      },
    ]);
    setNewName("");
    setNewPrice("");
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Quản lý dịch vụ"
        onBack={() => onNavigate("providerDashboard")}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        }
      />

      {/* Search + Filter */}
      <div className="bg-white px-4 py-3 border-b border-border space-y-3">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            placeholder="Tìm kiếm dịch vụ của bạn..."
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}
            >
              {f === "all"
                ? `Tất cả (${items.length})`
                : f === "active"
                  ? `Đang bật (${items.filter((s) => s.active).length})`
                  : `Tắt (${items.filter((s) => !s.active).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white border-b border-border px-4 py-3 flex gap-4">
        {[
          {
            label: "Tổng dịch vụ",
            value: items.length,
            color: "text-blue-600",
          },
          {
            label: "Đang hoạt động",
            value: items.filter((s) => s.active).length,
            color: "text-green-600",
          },
          {
            label: "Tổng đặt lịch",
            value: items.reduce((a, s) => a + s.bookings, 0),
            color: "text-purple-600",
          },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 text-center">
            <p
              className={`text-xl font-extrabold ${stat.color}`}
            >
              {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              Không tìm thấy dịch vụ
            </p>
            <p className="text-xs mt-1">
              Thử từ khóa khác hoặc thêm dịch vụ mới
            </p>
          </div>
        )}
        {filtered.map((svc) => (
          <div
            key={svc.id}
            className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-colors ${svc.active ? "border-transparent" : "border-border opacity-75"}`}
          >
            <div className="flex gap-3 p-3">
              <div className="relative flex-shrink-0">
                <img
                  src={`https://images.unsplash.com/${svc.image}?w=100&h=100&fit=crop&auto=format`}
                  alt={svc.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                {!svc.active && (
                  <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Tắt
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">
                      {svc.name}
                    </p>
                    <span className="inline-block bg-accent text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                      {svc.category}
                    </span>
                  </div>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(svc.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${svc.active ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${svc.active ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-blue-600 font-extrabold text-sm">
                    {svc.price}đ
                    <span className="text-muted-foreground font-normal text-xs">
                      /{svc.unit}
                    </span>
                  </span>
                  {svc.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">
                        {svc.rating}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {svc.bookings} đặt lịch
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditId(svc.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold text-foreground transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteItem(svc.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {showAdd && (
        <div
          className="absolute inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Thêm dịch vụ mới
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Tên dịch vụ *
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="VD: Sửa ổ cắm điện"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Giá (đồng) *
                  </label>
                  <input
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(e.target.value)
                    }
                    className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="150,000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Danh mục
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-muted px-3 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[
                      "Điện",
                      "Nước",
                      "Điều hòa",
                      "Dọn dẹp",
                      "Sơn",
                      "Thiết bị",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-blue-400 hover:text-blue-600 transition-colors">
                <ImageIcon className="w-4 h-4" />
                Thêm ảnh dịch vụ
              </button>
            </div>
            <button
              onClick={addService}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Thêm dịch vụ
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId !== null && (
        <div
          className="absolute inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setEditId(null)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Chỉnh sửa dịch vụ
              </h3>
              <button
                onClick={() => setEditId(null)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(() => {
              const svc = items.find((s) => s.id === editId)!;
              return (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Tên dịch vụ
                    </label>
                    <input
                      defaultValue={svc.name}
                      className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Giá
                      </label>
                      <input
                        defaultValue={svc.price}
                        className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Đơn vị
                      </label>
                      <input
                        defaultValue={svc.unit}
                        className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setEditId(null)}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

