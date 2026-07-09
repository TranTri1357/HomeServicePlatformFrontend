import { useState } from "react";
import { X, Plus, CheckCircle, Ban, Users as UsersIcon } from "lucide-react";
import { adminUsersList } from "@/services/Admin/user.data";
import { AdminBadge, ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { useUsers } from "@/hooks/Admin/useUsers";

export function Users() {
  const { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage } = useUsers();
  const [selected, setSelected] = useState<
    (typeof adminUsersList)[0] | null
  >(null);
  const [confirm, setConfirm] = useState<{
    show: boolean;
    action: string;
    item: (typeof adminUsersList)[0] | null;
  }>({ show: false, action: "", item: null });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý tài khoản
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản khách hàng trong hệ thống
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200">
          <Plus className="w-4 h-4" />
          Thêm tài khoản
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          {
            label: "Tổng tài khoản",
            value: adminUsersList.length,
            color: "text-blue-600",
            bg: "bg-blue-100",
            icon: UsersIcon,
          },
          {
            label: "Đang hoạt động",
            value: adminUsersList.filter(
              (u) => u.status === "active",
            ).length,
            color: "text-green-600",
            bg: "bg-green-100",
            icon: CheckCircle,
          },
          {
            label: "Bị khóa",
            value: adminUsersList.filter(
              (u) => u.status === "blocked",
            ).length,
            color: "text-red-600",
            bg: "bg-red-100",
            icon: Ban,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p
                className={`text-xl font-extrabold ${s.color}`}
              >
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-3">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email, SĐT..."
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/40">
              <tr>
                {[
                  "Khách hàng",
                  "Email",
                  "Số điện thoại",
                  "Đơn hàng",
                  "Chi tiêu",
                  "Ngày tham gia",
                  "Trạng thái",
                  "",
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
              {paged.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                        {u.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {u.phone}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {u.orders}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {u.spent}đ
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.joined}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelected(u)}
                        className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                      >
                        Chi tiết
                      </button>
                      {u.status === "active" ? (
                        <button
                          onClick={() =>
                            setConfirm({
                              show: true,
                              action: "block",
                              item: u,
                            })
                          }
                          className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Khóa
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setConfirm({
                              show: true,
                              action: "unblock",
                              item: u,
                            })
                          }
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
        <AdminPagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </div>

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
              <h3 className="font-bold">Chi tiết tài khoản</h3>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl font-bold">
                  {selected.name[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {selected.name}
                  </p>
                  <AdminBadge status={selected.status} />
                </div>
              </div>
              {[
                ["Email", selected.email],
                ["Điện thoại", selected.phone],
                ["Số đơn hàng", selected.orders.toString()],
                ["Tổng chi tiêu", `${selected.spent}đ`],
                ["Ngày tham gia", selected.joined],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {l}
                  </span>
                  <span className="text-sm font-semibold">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {confirm.show && confirm.item && (
        <ConfirmModal
          title={
            confirm.action === "block"
              ? "Khóa tài khoản?"
              : "Mở khóa tài khoản?"
          }
          message={`Tài khoản ${confirm.item.name} sẽ ${confirm.action === "block" ? "bị khóa và không thể đặt lịch." : "được mở khóa."}`}
          confirmLabel={
            confirm.action === "block" ? "Khóa" : "Mở khóa"
          }
          danger={confirm.action === "block"}
          onConfirm={() =>
            setConfirm({ show: false, action: "", item: null })
          }
          onCancel={() =>
            setConfirm({ show: false, action: "", item: null })
          }
        />
      )}
    </div>
  );
}
