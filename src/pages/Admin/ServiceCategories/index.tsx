import { useState } from "react";
import { X, Plus, Edit3, Trash2 } from "lucide-react";
import { adminServiceTypesList } from "@/services/Admin/service.data";
import { ConfirmModal, AdminSearchBar } from "@/components/Admin";

export function ServiceCategories() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(adminServiceTypesList);
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    id: number;
    label: string;
  } | null>(null);

  const filtered = items.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );
  const toggleActive = (id: number) =>
    setItems(
      items.map((t) =>
        t.id === id ? { ...t, active: !t.active } : t,
      ),
    );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý loại dịch vụ
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các danh mục dịch vụ trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm loại mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm loại dịch vụ..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Icon",
                  "Tên loại dịch vụ",
                  "Số dịch vụ",
                  "Thợ cung cấp",
                  "Lượt đặt",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-2xl">
                    {t.icon}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {t.services}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {t.providers}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {t.orders}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(t.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${t.active ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${t.active ? "translate-x-5" : "translate-x-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            show: true,
                            id: t.id,
                            label: t.name,
                          })
                        }
                        className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                Thêm loại dịch vụ
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Tên loại *
                </label>
                <input
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="VD: Điện lạnh"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Icon (emoji)
                </label>
                <input
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="VD: ❄️"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Mô tả ngắn..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
      {confirm && (
        <ConfirmModal
          title="Xóa loại dịch vụ?"
          message={`Loại "${confirm.label}" và tất cả dịch vụ thuộc loại này sẽ bị xóa.`}
          confirmLabel="Xóa"
          onConfirm={() => setConfirm(null)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
