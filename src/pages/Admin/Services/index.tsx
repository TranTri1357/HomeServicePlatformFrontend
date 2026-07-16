import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2, Loader2, AlertCircle, Package } from "lucide-react";
import type { AdminServiceItem } from "@/shared/types";
import { adminServiceApi, categoryApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, getErrorMessage } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { ImageUploader } from "@/shared/ui";

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", categoryId: 0, durationMinutes: 60, description: "", imageUrl: "", isActive: true };

export function Services() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminServiceApi.getServices({
        searchTerm: search.trim() || undefined,
        pageIndex: page,
        pageSize: PAGE_SIZE,
      }),
    { immediate: false },
  );
  // Debounced fetch on search / page change.
  useEffect(() => {
    const t = setTimeout(() => void refetch(), 300);
    return () => clearTimeout(t);
  }, [search, page, refetch]);

  const { data: categories = [] } = useApi(() => categoryApi.getActiveCategories(), {
    initialData: [],
  });

  const items = paged?.items ?? [];
  const total = paged?.totalCount ?? 0;

  // Form modal (create or edit).
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm.
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceItem | null>(null);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.categoryId ?? 0 });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = async (svc: AdminServiceItem) => {
    setEditId(svc.serviceId);
    setFormError(null);
    setShowForm(true);
    setLoadingDetail(true);
    try {
      const d = await adminServiceApi.getServiceDetail(svc.serviceId);
      setForm({
        name: d.name,
        categoryId: d.categoryId,
        durationMinutes: d.durationMinutes,
        description: d.description ?? "",
        imageUrl: d.imageUrl ?? "",
        isActive: d.isActive,
      });
    } catch (err) {
      notify.error(err);
      setShowForm(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const submitForm = async () => {
    setFormError(null);
    if (!form.name.trim()) return setFormError("Vui lòng nhập tên dịch vụ.");
    if (!form.categoryId) return setFormError("Vui lòng chọn danh mục.");
    if (!form.durationMinutes || form.durationMinutes <= 0)
      return setFormError("Thời lượng phải lớn hơn 0.");

    setSaving(true);
    try {
      if (editId != null) {
        await adminServiceApi.updateService(editId, {
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          durationMinutes: form.durationMinutes,
          isActive: form.isActive,
          imageUrl: form.imageUrl || undefined,
        });
        notify.success("Đã cập nhật dịch vụ.");
      } else {
        await adminServiceApi.createService({
          categoryId: form.categoryId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          durationMinutes: form.durationMinutes,
          imageUrl: form.imageUrl || undefined,
        });
        notify.success("Đã thêm dịch vụ.");
      }
      setShowForm(false);
      void refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminServiceApi.deleteService(deleteTarget.serviceId);
      notify.success("Đã xóa dịch vụ.");
      setDeleteTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý dịch vụ</h1>
          <p className="text-sm text-muted-foreground">Danh sách các dịch vụ trong hệ thống</p>
        </div>
        <button
          onClick={openAdd}
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
            <Package className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có dịch vụ nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Tên dịch vụ", "Danh mục", "Thợ cung cấp", "Lượt đặt", "Trạng thái", "Thao tác"].map(
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
                {items.map((s) => (
                  <tr key={s.serviceId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {s.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{s.totalTaskers}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{s.totalBookings}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}
                      >
                        {s.isActive ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
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
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">
                {editId != null ? "Sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-10 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Tên dịch vụ *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Sửa ổ cắm điện"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Danh mục *
                      </label>
                      <select
                        value={form.categoryId}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))
                        }
                        className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>— Chọn —</option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                        Thời lượng (phút) *
                      </label>
                      <input
                        value={form.durationMinutes || ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            durationMinutes: Number(e.target.value.replace(/\D/g, "")) || 0,
                          }))
                        }
                        inputMode="numeric"
                        className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="60"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Mô tả
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Mô tả ngắn về dịch vụ..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Ảnh dịch vụ
                    </label>
                    <ImageUploader
                      value={form.imageUrl || null}
                      onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
                      folder="services"
                      shape="square"
                      hint="Ảnh minh hoạ dịch vụ (JPG/PNG/WEBP). Tối đa 3MB."
                    />
                  </div>
                  {editId != null && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                      </button>
                      <span className="text-sm text-foreground">
                        {form.isActive ? "Đang hoạt động" : "Tạm ẩn"}
                      </span>
                    </label>
                  )}
                </div>

                {formError && (
                  <div className="mt-3 p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
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
                    {editId != null ? "Lưu thay đổi" : "Thêm dịch vụ"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Xóa dịch vụ?"
          message={`Dịch vụ "${deleteTarget.name}" sẽ bị xóa khỏi hệ thống.`}
          confirmLabel="Xóa"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
