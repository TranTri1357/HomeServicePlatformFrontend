import { useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  Loader2,
  AlertCircle,
  LocateFixed,
} from "lucide-react";
import type { Screen, CustomerAddress, AddressInput } from "@/shared/types";
import { useGoBack } from "@/app/routes/useGoBack";
import { addressApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { notify, getErrorMessage } from "@/shared/lib";

export function CustomerAddresses({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const goBack = useGoBack("customerProfile");
  const { data: addresses = [], loading, error, refetch } = useApi(() => addressApi.getMyAddresses());

  // Add / edit modal.
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [line, setLine] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm.
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyDefaultId, setBusyDefaultId] = useState<number | null>(null);

  const resetGeoFields = () => {
    setProvince("");
    setDistrict("");
    setWard("");
    setLat(null);
    setLng(null);
  };

  const openAdd = () => {
    setEditing(null);
    setLine("");
    resetGeoFields();
    setMakeDefault(addresses.length === 0);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditing(addr);
    setLine(addr.addressLine);
    setProvince(addr.provinceCode ?? "");
    setDistrict(addr.districtCode ?? "");
    setWard(addr.wardCode ?? "");
    setLat(addr.latitude || null); // 0 = chưa có toạ độ
    setLng(addr.longitude || null);
    setMakeDefault(addr.isDefault);
    setFormError(null);
    setShowForm(true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify.error("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
        notify.success("Đã lấy toạ độ vị trí hiện tại.");
      },
      () => {
        setLocating(false);
        notify.error("Không lấy được vị trí. Kiểm tra quyền định vị.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const saveForm = async () => {
    setFormError(null);
    if (!line.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");

    const payload: AddressInput = {
      addressLine: line.trim(),
      provinceCode: province.trim() || undefined,
      districtCode: district.trim() || undefined,
      wardCode: ward.trim() || undefined,
      latitude: lat ?? undefined,
      longitude: lng ?? undefined,
      isDefault: makeDefault,
    };

    setSaving(true);
    try {
      if (editing) {
        await addressApi.updateAddress(editing.addressId, payload);
        notify.success("Cập nhật địa chỉ thành công");
      } else {
        await addressApi.createAddress(payload);
        notify.success("Thêm địa chỉ thành công");
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
    setDeleting(true);
    try {
      await addressApi.deleteAddress(deleteTarget.addressId);
      notify.success("Đã xóa địa chỉ");
      setDeleteTarget(null);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const makeAsDefault = async (addr: CustomerAddress) => {
    setBusyDefaultId(addr.addressId);
    try {
      await addressApi.setDefaultAddress(addr.addressId);
      void refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyDefaultId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Địa chỉ đã lưu" onBack={goBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && addresses.length === 0 ? (
          [1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)
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
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <MapPin className="w-10 h-10 text-slate-300" />
            <p className="text-sm text-muted-foreground">Chưa có địa chỉ nào được lưu.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.addressId} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{addr.addressLine}</p>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-green-600" />
                        Mặc định
                      </span>
                    )}
                  </div>
                  {(addr.wardCode || addr.districtCode || addr.provinceCode) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[addr.wardCode, addr.districtCode, addr.provinceCode]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                {!addr.isDefault && (
                  <button
                    onClick={() => makeAsDefault(addr)}
                    disabled={busyDefaultId === addr.addressId}
                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-accent transition-colors disabled:opacity-60"
                  >
                    {busyDefaultId === addr.addressId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Star className="w-3.5 h-3.5" />
                    )}
                    Đặt mặc định
                  </button>
                )}
                <button
                  onClick={() => openEdit(addr)}
                  className="px-3 py-1.5 bg-muted rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-accent transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Sửa
                </button>
                <button
                  onClick={() => setDeleteTarget(addr)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-red-100 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <div className="bg-white border-t border-border px-4 py-4">
        <button
          onClick={openAdd}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Add / edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-foreground">
              {editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Địa chỉ chi tiết</label>
              <textarea
                value={line}
                onChange={(e) => setLine(e.target.value)}
                rows={2}
                autoFocus
                className="w-full bg-muted rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Số nhà, tên đường..."
              />
            </div>

            {/* Administrative fields (stored as short text; max 20 chars each). */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tỉnh/Thành</label>
                <input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  maxLength={20}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TP.HCM"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Quận/Huyện</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  maxLength={20}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Quận 1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Phường/Xã</label>
              <input
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                maxLength={20}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bến Nghé"
              />
            </div>

            {/* Coordinates (used to match nearby taskers). */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Toạ độ</label>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locating}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-blue-600 hover:bg-accent transition-colors disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                {locating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
              </button>
              {lat != null && lng != null && (
                <p className="text-[11px] text-green-600 font-medium">
                  Đã lấy toạ độ: {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setMakeDefault((v) => !v)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${makeDefault ? "bg-blue-600 border-blue-600" : "border-border"}`}
              >
                {makeDefault && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
              <span className="text-sm text-foreground">Đặt làm địa chỉ mặc định</span>
            </label>

            {formError && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                {formError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-foreground">Xóa địa chỉ?</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {deleteTarget.addressLine}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
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
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
