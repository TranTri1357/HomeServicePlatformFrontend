import { useEffect, useState } from "react";
import { Plus, Pencil, XCircle, Loader2, AlertCircle, Percent, X } from "lucide-react";
import type { AdminCommissionItem } from "@/shared/types";
import { adminCommissionApi, serviceApi, adminTaskerApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, getErrorMessage, formatDateVn } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";

const PAGE_SIZE = 10;
const EMPTY_FORM = { serviceId: "" as number | "", taskerId: "" as number | "", rate: "", effectiveTo: "" };

function scopeLabel(c: AdminCommissionItem): string {
  if (!c.serviceId && !c.taskerId) return "Toàn hệ thống (mặc định)";
  return `${c.serviceName ?? "Mọi dịch vụ"} · ${c.taskerName ?? "Mọi thợ"}`;
}

export function Commissions() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminCommissionApi.getCommissions({
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

  // Dropdown sources for the scope pickers.
  const { data: catalog } = useApi(() => serviceApi.getServicesExplorer({ pageSize: 100 }), {
    initialData: undefined,
  });
  const { data: taskerPage } = useApi(() => adminTaskerApi.getTaskers({ pageSize: 100 }), {
    initialData: undefined,
  });
  const services = catalog?.items ?? [];
  const taskers = taskerPage?.items ?? [];

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  // Create / edit modal.
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Terminate confirm.
  const [terminateTarget, setTerminateTarget] = useState<AdminCommissionItem | null>(null);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (c: AdminCommissionItem) => {
    setEditId(c.commissionId);
    setForm({
      serviceId: c.serviceId ?? "",
      taskerId: c.taskerId ?? "",
      rate: String(c.commissionRate),
      effectiveTo: c.effectiveTo ? c.effectiveTo.slice(0, 10) : "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const submitForm = async () => {
    setFormError(null);
    const rate = Number(form.rate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100)
      return setFormError("Tỷ lệ hoa hồng phải từ 0 đến 100.");

    const serviceId = form.serviceId === "" ? null : Number(form.serviceId);
    const taskerId = form.taskerId === "" ? null : Number(form.taskerId);
    // End of the chosen day in VN time; null = vô thời hạn.
    const effectiveTo = form.effectiveTo ? `${form.effectiveTo}T23:59:59+07:00` : null;

    setSaving(true);
    try {
      if (editId != null) {
        await adminCommissionApi.updateCommission(editId, {
          serviceId,
          taskerId,
          commissionRate: rate,
          effectiveTo,
        });
        notify.success("Đã cập nhật quy tắc hoa hồng.");
      } else {
        await adminCommissionApi.createCommission({
          serviceId,
          taskerId,
          commissionRate: rate,
          effectiveFrom: new Date().toISOString(),
          effectiveTo,
        });
        notify.success("Đã thêm quy tắc hoa hồng.");
      }
      setShowForm(false);
      void refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmTerminate = async () => {
    if (!terminateTarget) return;
    try {
      await adminCommissionApi.terminateCommission(terminateTarget.commissionId);
      notify.success("Đã chấm dứt quy tắc hoa hồng.");
      setTerminateTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý hoa hồng</h1>
          <p className="text-sm text-muted-foreground">
            Cấu hình tỷ lệ hoa hồng theo dịch vụ / thợ và thời gian hiệu lực
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm quy tắc
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <AdminSearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên dịch vụ, thợ..."
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
            <Percent className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Chưa có quy tắc hoa hồng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Phạm vi áp dụng", "Tỷ lệ", "Hiệu lực từ", "Đến", "Trạng thái", ""].map((h) => (
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
                {items.map((c) => (
                  <tr key={c.commissionId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {scopeLabel(c)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-blue-600">{c.commissionRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateVn(c.effectiveFrom)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.effectiveTo ? formatDateVn(c.effectiveTo) : "Vô thời hạn"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}
                      >
                        {c.isActive ? "Đang áp dụng" : "Hết hiệu lực"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Sửa
                        </button>
                        {c.isActive && (
                          <button
                            onClick={() => setTerminateTarget(c)}
                            className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Chấm dứt
                          </button>
                        )}
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

      {/* Create / edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editId != null ? "Sửa quy tắc hoa hồng" : "Thêm quy tắc hoa hồng"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Áp dụng cho dịch vụ
                </label>
                <select
                  value={form.serviceId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      serviceId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">— Tất cả dịch vụ —</option>
                  {services.map((s) => (
                    <option key={s.serviceId} value={s.serviceId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Áp dụng cho thợ
                </label>
                <select
                  value={form.taskerId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      taskerId: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">— Tất cả thợ —</option>
                  {taskers.map((t) => (
                    <option key={t.taskerId} value={t.taskerId}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Tỷ lệ (%) *
                  </label>
                  <input
                    value={form.rate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rate: e.target.value.replace(/[^0-9.]/g, "") }))
                    }
                    inputMode="decimal"
                    className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Hiệu lực đến
                  </label>
                  <input
                    type="date"
                    value={form.effectiveTo}
                    onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
                    className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Để trống "Hiệu lực đến" nghĩa là áp dụng vô thời hạn. Bỏ trống dịch vụ/thợ = áp dụng
                chung.
              </p>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                {formError}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={submitForm}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editId != null ? "Lưu thay đổi" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {terminateTarget && (
        <ConfirmModal
          title="Chấm dứt quy tắc?"
          message={`Quy tắc hoa hồng "${scopeLabel(terminateTarget)}" (${terminateTarget.commissionRate}%) sẽ ngừng hiệu lực từ bây giờ.`}
          confirmLabel="Chấm dứt"
          onConfirm={confirmTerminate}
          onCancel={() => setTerminateTarget(null)}
        />
      )}
    </div>
  );
}
