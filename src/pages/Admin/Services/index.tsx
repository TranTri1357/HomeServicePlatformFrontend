import { useState } from "react";
import { X, Plus, Edit3, Trash2 } from "lucide-react";
import { adminServicesList, adminServiceTypesList } from "@/services/Admin/service.data";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";

export function Services() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    id: number | null;
    label: string;
  }>({ show: false, id: null, label: "" });
  const [showAdd, setShowAdd] = useState(false);
  const perPage = 5;

  const filtered = adminServicesList.filter(
    (s) =>
      (typeFilter === "all" || s.type === typeFilter) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.type.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const types = ["all", ...Array.from(new Set(adminServicesList.map((s) => s.type)))];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý dịch vụ</h1>
          <p className="text-sm text-muted-foreground">Danh sách các dịch vụ trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm dịch vụ
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm dịch vụ..."
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "Tất cả loại" : t}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Tên dịch vụ",
                  "Loại",
                  "Giá cơ bản",
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
              {paged.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">{s.price}đ</td>
                  <td className="px-4 py-3 text-sm text-foreground">{s.providers}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{s.orders}</td>
                  <td className="px-4 py-3">
                    <AdminBadge status={s.status} />
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
                            id: s.id,
                            label: s.name,
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
        <AdminPagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
      </div>

      {showAdd && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Thêm dịch vụ mới</h3>
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
                  Tên dịch vụ *
                </label>
                <input
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="VD: Sửa ổ cắm điện"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Loại dịch vụ
                  </label>
                  <select className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {adminServiceTypesList.map((t) => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Giá cơ bản (đ)
                  </label>
                  <input
                    className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="150,000"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Mô tả ngắn về dịch vụ..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
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
                Thêm dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}
      {confirm.show && (
        <ConfirmModal
          title="Xóa dịch vụ?"
          message={`Dịch vụ "${confirm.label}" sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa"
          onConfirm={() => setConfirm({ show: false, id: null, label: "" })}
          onCancel={() => setConfirm({ show: false, id: null, label: "" })}
        />
      )}
    </div>
  );
}
