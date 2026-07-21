import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, Users as UsersIcon, MapPin, Wallet } from "lucide-react";
import type { AdminUserItem, AdminUserDetail } from "@/shared/types";
import { adminUserApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, formatVnd, formatDateVn } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: number }) {
  const active = status === 1;
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
    >
      {active ? "Hoạt động" : "Bị khóa"}
    </span>
  );
}

export function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminUserApi.getUsers({
        searchTerm: search.trim() || undefined,
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }),
    { immediate: false },
  );
  useEffect(() => {
    const t = setTimeout(() => void refetch(), 300);
    return () => clearTimeout(t);
  }, [search, page, refetch]);

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  
  const [toggleTarget, setToggleTarget] = useState<AdminUserItem | null>(null);
  const [toggling, setToggling] = useState(false);

  const openDetail = async (u: AdminUserItem) => {
    setLoadingDetail(true);
    setDetail({
      userId: u.userId,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
      lastLoginAt: null,
      walletBalance: 0,
      roles: [],
      addresses: [],
    });
    try {
      const d = await adminUserApi.getUserDetail(u.userId);
      setDetail(d);
    } catch (err) {
      notify.error(err);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      await adminUserApi.toggleUserStatus(toggleTarget.userId);
      notify.success(toggleTarget.status === 1 ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
      setToggleTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý tài khoản</h1>
        <p className="text-sm text-muted-foreground">Người dùng (khách hàng, thợ, quản trị) trong hệ thống</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email, SĐT..."
          />
        </div>

        {loading && items.length === 0 ? (
          <div className="py-16 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <UsersIcon className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có tài khoản nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Người dùng", "Email", "SĐT", "Đơn hàng", "Chi tiêu", "Tham gia", "Trạng thái", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold text-muted-foreground px-4 py-3"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((u) => (
                  <tr key={u.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{u.phone}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {u.totalBookings}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatVnd(u.totalSpent)}đ
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openDetail(u)}
                          className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => setToggleTarget(u)}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${u.status === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {u.status === 1 ? "Khóa" : "Mở khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} total={total} perPage={PAGE_SIZE} onChange={setPage} />
      </div>

      {}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end" onClick={() => setDetail(null)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold">Chi tiết tài khoản</h3>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl font-bold flex-shrink-0">
                  {detail.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg truncate">{detail.fullName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <StatusBadge status={detail.status} />
                    {detail.roles.map((r) => (
                      <span
                        key={r}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {loadingDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
                </div>
              )}

              <div>
                {[
                  ["Email", detail.email],
                  ["Điện thoại", detail.phone],
                  ["Ngày tham gia", formatDateVn(detail.createdAt)],
                  ["Đăng nhập gần nhất", detail.lastLoginAt ? formatDateVn(detail.lastLoginAt) : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">{l}</span>
                    <span className="text-sm font-semibold text-right">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> Số dư ví
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatVnd(detail.walletBalance)}đ
                  </span>
                </div>
              </div>

              {detail.addresses.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-2">Địa chỉ đã lưu</h4>
                  <div className="space-y-2">
                    {detail.addresses.map((a) => (
                      <div
                        key={a.addressId}
                        className="flex items-start gap-2 p-2.5 bg-muted rounded-xl"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground flex-1">{a.addressLine}</span>
                        {a.isDefault && (
                          <span className="text-[10px] font-bold text-green-600">Mặc định</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.status === 1 ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
          message={
            toggleTarget.status === 1
              ? `Tài khoản ${toggleTarget.fullName} sẽ bị khóa và không thể đăng nhập.`
              : `Tài khoản ${toggleTarget.fullName} sẽ được mở khóa.`
          }
          confirmLabel={toggling ? "Đang xử lý..." : toggleTarget.status === 1 ? "Khóa" : "Mở khóa"}
          danger={toggleTarget.status === 1}
          onConfirm={confirmToggle}
          onCancel={() => !toggling && setToggleTarget(null)}
        />
      )}
    </div>
  );
}
