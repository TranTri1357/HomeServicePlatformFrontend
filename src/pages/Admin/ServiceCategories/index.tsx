import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2, Loader2, AlertCircle, LayoutGrid } from "lucide-react";
import type { AdminCategoryItem } from "@/shared/types";
import { adminCategoryApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { notify, getErrorMessage, getApiAssetUrl } from "@/shared/lib";
import { ConfirmModal, AdminPagination, AdminSearchBar } from "@/components/Admin";
import { ImageUploader } from "@/shared/ui";

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", slug: "", iconUrl: "", isActive: true };

/** Turn a name into a URL-friendly slug (handles Vietnamese diacritics). */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Category icon with a graceful fallback. */
function CategoryIcon({ iconUrl, name }: { iconUrl: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  const url = iconUrl ? getApiAssetUrl(iconUrl) : "";
  if (!url || broken) {
    return (
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
        <LayoutGrid className="w-4 h-4 text-blue-600" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={name}
      className="w-9 h-9 rounded-lg object-contain bg-blue-50 p-1"
      onError={() => setBroken(true)}
    />
  );
}

export function ServiceCategories() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: paged, loading, error, refetch } = useApi(
    () =>
      adminCategoryApi.getCategories({
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

  // Create / edit modal.
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [slugTouched, setSlugTouched] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(null);

  const setName = (name: string) =>
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setSlugTouched(false);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = async (cat: AdminCategoryItem) => {
    setEditId(cat.categoryId);
    setSlugTouched(true);
    setFormError(null);
    setShowForm(true);
    setLoadingDetail(true);
    try {
      const d = await adminCategoryApi.getCategoryDetail(cat.categoryId);
      setForm({ name: d.name, slug: d.slug, iconUrl: d.iconUrl ?? "", isActive: d.isActive });
    } catch (err) {
      notify.error(err);
      setShowForm(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const submitForm = async () => {
    setFormError(null);
    if (!form.name.trim()) return setFormError("Vui lòng nhập tên danh mục.");
    if (!form.slug.trim()) return setFormError("Slug không được để trống.");
    setSaving(true);
    try {
      const iconUrl = form.iconUrl.trim() || undefined;
      if (editId != null) {
        await adminCategoryApi.updateCategory(editId, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          iconUrl,
          isActive: form.isActive,
        });
        notify.success("Đã cập nhật danh mục.");
      } else {
        await adminCategoryApi.createCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          iconUrl,
        });
        notify.success("Đã thêm danh mục.");
      }
      setShowForm(false);
      void refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Inline active toggle: needs slug (not in the list), so fetch detail then update.
  const toggleActive = async (cat: AdminCategoryItem) => {
    setTogglingId(cat.categoryId);
    try {
      const d = await adminCategoryApi.getCategoryDetail(cat.categoryId);
      await adminCategoryApi.updateCategory(cat.categoryId, {
        name: d.name,
        slug: d.slug,
        iconUrl: d.iconUrl ?? undefined,
        isActive: !d.isActive,
      });
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminCategoryApi.deleteCategory(deleteTarget.categoryId);
      notify.success("Đã xóa danh mục.");
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
          <h1 className="text-2xl font-bold text-foreground">Quản lý danh mục dịch vụ</h1>
          <p className="text-sm text-muted-foreground">Các danh mục nhóm dịch vụ trong hệ thống</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
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
            placeholder="Tìm danh mục..."
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
            <LayoutGrid className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">Không có danh mục nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Icon", "Tên danh mục", "Số dịch vụ", "Thợ cung cấp", "Lượt đặt", "Trạng thái", "Thao tác"].map(
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
                {items.map((c) => (
                  <tr key={c.categoryId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <CategoryIcon iconUrl={c.iconUrl} name={c.name} />
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{c.totalServices}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{c.totalTaskers}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{c.totalBookings}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={togglingId === c.categoryId}
                        className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-60 ${c.isActive ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                      </button>
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
                        <button
                          onClick={() => setDeleteTarget(c)}
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
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editId != null ? "Sửa danh mục" : "Thêm danh mục"}
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
                      Tên danh mục *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Điện lạnh"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Slug *
                    </label>
                    <input
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((f) => ({ ...f, slug: e.target.value }));
                      }}
                      className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="dien-lanh"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Định danh trên URL, tự tạo từ tên (có thể sửa).
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Icon danh mục
                    </label>
                    <ImageUploader
                      value={form.iconUrl || null}
                      onChange={(url) => setForm((f) => ({ ...f, iconUrl: url ?? "" }))}
                      folder="categories"
                      shape="circle"
                      hint="Nên dùng icon nền trong suốt (PNG). Tối đa 3MB."
                    />
                  </div>
                  {editId != null && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-blue-600" : "bg-gray-300"}`}
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
              </>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Xóa danh mục?"
          message={`Danh mục "${deleteTarget.name}" sẽ bị xóa khỏi hệ thống.`}
          confirmLabel="Xóa"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
