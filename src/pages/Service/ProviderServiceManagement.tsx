import { useState } from "react";
import {
  Search,
  X,
  Plus,
  Pencil,
  Trash2,
  Package,
  Clock,
  Wrench,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Screen, TaskerService } from "@/shared/types";
import { taskerServiceApi, serviceApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { formatVnd, notify, getErrorMessage, getApiAssetUrl } from "@/shared/lib";

export function ProviderServiceManagement({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const goBack = useGoBack("providerDashboard");
  const [search, setSearch] = useState("");

  const { data: services = [], loading, error, refetch } = useApi(() =>
    taskerServiceApi.getMyTaskerServices(),
  );

  // Platform services to pick from when adding (fetched once).
  const { data: catalog } = useApi(() => serviceApi.getServicesExplorer({ pageSize: 100 }), {
    initialData: undefined,
  });

  // Add modal.
  const [showAdd, setShowAdd] = useState(false);
  const [addServiceId, setAddServiceId] = useState<number | "">("");
  const [addPrice, setAddPrice] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit-price modal.
  const [editSvc, setEditSvc] = useState<TaskerService | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  // Delete confirm.
  const [deleteSvc, setDeleteSvc] = useState<TaskerService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = services.filter(
    (s) =>
      s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  // Services in the catalog the tasker hasn't registered yet.
  const registeredIds = new Set(services.map((s) => s.serviceId));
  const available = (catalog?.items ?? []).filter((s) => !registeredIds.has(s.serviceId));

  const openAdd = () => {
    setAddServiceId("");
    setAddPrice("");
    setShowAdd(true);
  };

  const submitAdd = async () => {
    if (addServiceId === "") return notify.error("Vui lòng chọn dịch vụ.");
    const price = Number(addPrice);
    if (!price || price <= 0) return notify.error("Vui lòng nhập giá hợp lệ.");
    setAdding(true);
    try {
      await taskerServiceApi.addTaskerService(Number(addServiceId), price);
      notify.success("Đã thêm dịch vụ.");
      setShowAdd(false);
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (svc: TaskerService) => {
    setEditSvc(svc);
    setEditPrice(String(svc.price));
  };

  const submitEdit = async () => {
    if (!editSvc) return;
    const price = Number(editPrice);
    if (!price || price <= 0) return notify.error("Vui lòng nhập giá hợp lệ.");
    setSavingPrice(true);
    try {
      await taskerServiceApi.updateTaskerServicePrice(editSvc.serviceId, price);
      notify.success("Đã cập nhật giá.");
      setEditSvc(null);
      void refetch();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSavingPrice(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteSvc) return;
    setDeleting(true);
    try {
      await taskerServiceApi.removeTaskerService(deleteSvc.serviceId);
      notify.success("Đã xóa dịch vụ.");
      setDeleteSvc(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const avgPrice = services.length
    ? Math.round(services.reduce((a, s) => a + s.price, 0) / services.length)
    : 0;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Dịch vụ & giá"
        onBack={goBack}
        actions={
          <button
            onClick={openAdd}
            className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            placeholder="Tìm dịch vụ của bạn..."
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-border px-4 py-3 flex gap-4">
        {[
          { label: "Tổng dịch vụ", value: `${services.length}`, color: "text-blue-600" },
          {
            label: "Đang bật",
            value: `${services.filter((s) => s.isActive).length}`,
            color: "text-green-600",
          },
          { label: "Giá trung bình", value: `${formatVnd(avgPrice)}đ`, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 text-center">
            <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && services.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse h-24" />
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {services.length === 0 ? "Bạn chưa đăng ký dịch vụ nào" : "Không tìm thấy dịch vụ"}
            </p>
            <p className="text-xs mt-1">Bấm + để thêm dịch vụ và đặt giá</p>
          </div>
        ) : (
          filtered.map((svc) => (
            // Key by serviceId: the backend returns TaskerServiceId = taskerId (same
            // for every row), so serviceId is the real unique id per registered service.
            <div key={svc.serviceId} className="bg-white rounded-2xl p-3 shadow-sm">
              <div className="flex gap-3">
                {svc.imageUrl ? (
                  <img
                    src={getApiAssetUrl(svc.imageUrl)}
                    alt={svc.serviceName}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-blue-50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {svc.serviceName}
                      </p>
                      <span className="inline-block bg-accent text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                        {svc.categoryName || "Dịch vụ"}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${svc.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}
                    >
                      {svc.isActive ? "Đang bật" : "Tắt"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-blue-600 font-extrabold text-sm">
                      {formatVnd(svc.price)}đ
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />~{svc.durationMinutes} phút
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEdit(svc)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold text-foreground transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Sửa giá
                    </button>
                    <button
                      onClick={() => setDeleteSvc(svc)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add service modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Thêm dịch vụ</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Bạn đã đăng ký hết các dịch vụ hiện có trên hệ thống.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Chọn dịch vụ</label>
                  <select
                    value={addServiceId}
                    onChange={(e) => {
                      const id = e.target.value === "" ? "" : Number(e.target.value);
                      setAddServiceId(id);
                      const svc = available.find((x) => x.serviceId === id);
                      if (svc && svc.startingPrice > 0) setAddPrice(String(svc.startingPrice));
                    }}
                    className="w-full bg-muted px-3 py-3 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="">— Chọn dịch vụ —</option>
                    {available.map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Giá của bạn (đ)</label>
                  <input
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: 150000"
                  />
                </div>
                <button
                  onClick={submitAdd}
                  disabled={adding}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {adding && <Loader2 className="w-4 h-4 animate-spin" />}
                  {adding ? "Đang thêm..." : "Thêm dịch vụ"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit price modal */}
      {editSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-foreground">Sửa giá · {editSvc.serviceName}</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Giá mới (đ)</label>
              <input
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                autoFocus
                className="w-full bg-muted px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 150000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditSvc(null)}
                disabled={savingPrice}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={submitEdit}
                disabled={savingPrice}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {savingPrice && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Xóa dịch vụ?</h3>
              <p className="text-sm text-muted-foreground mt-1">{deleteSvc.serviceName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteSvc(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
