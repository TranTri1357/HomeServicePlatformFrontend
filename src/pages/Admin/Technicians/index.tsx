import { useState } from "react";
import { Star, Shield, X, Edit3, Wrench, Plus } from "lucide-react";
import { adminProvidersList } from "@/services/Admin/technician.data";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { useTechnicians } from "@/hooks/Admin/useTechnicians";

export function Technicians() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    filtered,
    paged,
    perPage,
  } = useTechnicians();
  const [selected, setSelected] = useState<(typeof adminProvidersList)[0] | null>(null);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    action: string;
    item: (typeof adminProvidersList)[0] | null;
  }>({ show: false, action: "", item: null });

  const handleAction = (action: string, item: (typeof adminProvidersList)[0]) => {
    setConfirm({ show: true, action, item });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý thợ</h1>
          <p className="text-sm text-muted-foreground">Duyệt hồ sơ và quản lý thợ kỹ thuật</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" />
          Thêm thợ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Tổng thợ",
            value: adminProvidersList.length,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Hoạt động",
            value: adminProvidersList.filter((p) => p.status === "active").length,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Chờ duyệt",
            value: adminProvidersList.filter((p) => p.status === "pending").length,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Bị khóa",
            value: adminProvidersList.filter((p) => p.status === "blocked").length,
            color: "text-red-600",
            bg: "bg-red-100",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
              <Wrench className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, SĐT, kỹ năng..."
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="pending">Chờ duyệt</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Thợ kỹ thuật",
                  "Kỹ năng",
                  "Đánh giá",
                  "Công việc",
                  "Trạng thái",
                  "Ngày tham gia",
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
              {paged.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-xs font-bold">{p.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                          {p.name}
                          {p.verified && <Shield className="w-3 h-3 text-blue-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {p.skill}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{p.rating}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Chưa có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.jobs}</td>
                  <td className="px-4 py-3">
                    <AdminBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected(p)}
                        className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold text-foreground transition-colors"
                      >
                        Chi tiết
                      </button>
                      {p.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction("approve", p)}
                            className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleAction("reject", p)}
                            className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {p.status === "active" && (
                        <button
                          onClick={() => handleAction("block", p)}
                          className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Khóa
                        </button>
                      )}
                      {p.status === "blocked" && (
                        <button
                          onClick={() => handleAction("unblock", p)}
                          className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Mở khóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex justify-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-foreground">Chi tiết thợ</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selected.name[0]}
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.skill}</p>
                  <AdminBadge status={selected.status} />
                </div>
              </div>
              {[
                { label: "Email", value: selected.email },
                { label: "Điện thoại", value: selected.phone },
                {
                  label: "Đánh giá",
                  value: selected.rating > 0 ? `${selected.rating} ⭐` : "Chưa có",
                },
                {
                  label: "Công việc đã làm",
                  value: `${selected.jobs} công việc`,
                },
                {
                  label: "Doanh thu",
                  value: `${selected.revenue}đ`,
                },
                {
                  label: "Ngày tham gia",
                  value: selected.joined,
                },
                {
                  label: "Xác minh",
                  value: selected.verified ? "✅ Đã xác minh" : "❌ Chưa xác minh",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
                {selected.status === "pending" && (
                  <button
                    onClick={() => {
                      setSelected(null);
                      handleAction("approve", selected);
                    }}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    Duyệt hồ sơ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm.show && confirm.item && (
        <ConfirmModal
          title={
            confirm.action === "approve"
              ? "Duyệt hồ sơ thợ?"
              : confirm.action === "reject"
                ? "Từ chối hồ sơ?"
                : confirm.action === "block"
                  ? "Khóa tài khoản?"
                  : "Mở khóa tài khoản?"
          }
          message={`${confirm.action === "approve" ? "Thợ" : "Tài khoản của"} ${confirm.item.name} ${confirm.action === "approve" ? "sẽ được duyệt và bắt đầu nhận việc." : confirm.action === "reject" ? "sẽ bị từ chối và không thể hoạt động." : confirm.action === "block" ? "sẽ bị khóa và không thể nhận việc." : "sẽ được mở khóa."}`}
          confirmLabel={
            confirm.action === "approve"
              ? "Duyệt"
              : confirm.action === "reject"
                ? "Từ chối"
                : confirm.action === "block"
                  ? "Khóa"
                  : "Mở khóa"
          }
          danger={confirm.action !== "approve" && confirm.action !== "unblock"}
          onConfirm={() => setConfirm({ show: false, action: "", item: null })}
          onCancel={() => setConfirm({ show: false, action: "", item: null })}
        />
      )}
    </div>
  );
}
