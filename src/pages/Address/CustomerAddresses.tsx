import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Check, Star, Loader2, AlertCircle } from "lucide-react";
import type { Screen, CustomerAddress, AddressInput } from "@/shared/types";
import { useGoBack } from "@/app/routes/useGoBack";
import { addressApi } from "@/services/api";
import { useApi } from "@/shared/hooks";
import { TopBar } from "@/shared/ui";
import { notify, getErrorMessage } from "@/shared/lib";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  geocodeAddress,
  type AdminUnit,
} from "@/services/vnAddress";
import { LocationPicker } from "./LocationPicker";

export function CustomerAddresses({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const goBack = useGoBack("customerProfile");
  const { data: addresses = [], loading, error, refetch } = useApi(() => addressApi.getMyAddresses());

  // Add / edit modal.
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [line, setLine] = useState("");
  // Administrative selection — codes are saved to the backend, names drive display + geocoding.
  const [province, setProvince] = useState<AdminUnit | null>(null);
  const [district, setDistrict] = useState<AdminUnit | null>(null);
  const [ward, setWard] = useState<AdminUnit | null>(null);
  const [provinces, setProvinces] = useState<AdminUnit[]>([]);
  const [districts, setDistricts] = useState<AdminUnit[]>([]);
  const [wards, setWards] = useState<AdminUnit[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [makeDefault, setMakeDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Human-readable "Ward · District · Province" label per address, for the list card.
  const [labels, setLabels] = useState<Record<number, string>>({});

  // Delete confirm.
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyDefaultId, setBusyDefaultId] = useState<number | null>(null);

  // Load the province list once (also used to resolve names for the list cards).
  useEffect(() => {
    fetchProvinces()
      .then(setProvinces)
      .catch(() => notify.error("Không tải được danh sách Tỉnh/Thành."));
  }, []);

  // Resolve code → name for every saved address so cards show real place names.
  // Depend on a stable content signature (not the array identity, which changes
  // every render because of the `= []` default) to avoid a setState render loop.
  const addressSig = addresses
    .map((a) => `${a.addressId}:${a.provinceCode}:${a.districtCode}:${a.wardCode}`)
    .join("|");
  useEffect(() => {
    if (provinces.length === 0 || addresses.length === 0) return;
    let alive = true;
    (async () => {
      const next: Record<number, string> = {};
      for (const addr of addresses) {
        if (!addr.provinceCode && !addr.districtCode && !addr.wardCode) continue;
        try {
          const [ds, ws] = await Promise.all([
            addr.provinceCode ? fetchDistricts(addr.provinceCode) : Promise.resolve<AdminUnit[]>([]),
            addr.districtCode ? fetchWards(addr.districtCode) : Promise.resolve<AdminUnit[]>([]),
          ]);
          const pName = provinces.find((p) => p.code === addr.provinceCode)?.name;
          const dName = ds.find((d) => d.code === addr.districtCode)?.name;
          const wName = ws.find((w) => w.code === addr.wardCode)?.name;
          const label = [wName, dName, pName].filter(Boolean).join(" · ");
          if (label) next[addr.addressId] = label;
        } catch {
          /* fall back to nothing for this address */
        }
      }
      if (alive) setLabels(next);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressSig, provinces]);

  const resetGeoFields = () => {
    setProvince(null);
    setDistrict(null);
    setWard(null);
    setDistricts([]);
    setWards([]);
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

  const openEdit = async (addr: CustomerAddress) => {
    setEditing(addr);
    setLine(addr.addressLine);
    setLat(addr.latitude || null); // 0 = chưa có toạ độ
    setLng(addr.longitude || null);
    setMakeDefault(addr.isDefault);
    setFormError(null);
    setShowForm(true);

    // Prefill the cascading selects from the saved codes.
    setProvince(addr.provinceCode ? { code: addr.provinceCode, name: "" } : null);
    setDistrict(addr.districtCode ? { code: addr.districtCode, name: "" } : null);
    setWard(addr.wardCode ? { code: addr.wardCode, name: "" } : null);
    setDistricts([]);
    setWards([]);
    try {
      const provs = provinces.length ? provinces : await fetchProvinces();
      const pName = provs.find((p) => p.code === addr.provinceCode)?.name ?? "";
      if (addr.provinceCode) setProvince({ code: addr.provinceCode, name: pName });
      if (addr.provinceCode) {
        const ds = await fetchDistricts(addr.provinceCode);
        setDistricts(ds);
        if (addr.districtCode)
          setDistrict({ code: addr.districtCode, name: ds.find((d) => d.code === addr.districtCode)?.name ?? "" });
        if (addr.districtCode) {
          const ws = await fetchWards(addr.districtCode);
          setWards(ws);
          if (addr.wardCode)
            setWard({ code: addr.wardCode, name: ws.find((w) => w.code === addr.wardCode)?.name ?? "" });
        }
      }
    } catch {
      /* selects stay partially filled; user can re-pick */
    }
  };

  const onProvinceChange = async (code: string) => {
    const p = provinces.find((x) => x.code === code) ?? null;
    setProvince(p);
    setDistrict(null);
    setWard(null);
    setDistricts([]);
    setWards([]);
    if (!p) return;
    setLoadingDistricts(true);
    try {
      setDistricts(await fetchDistricts(p.code));
    } catch {
      notify.error("Không tải được Quận/Huyện.");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const onDistrictChange = async (code: string) => {
    const d = districts.find((x) => x.code === code) ?? null;
    setDistrict(d);
    setWard(null);
    setWards([]);
    if (!d) return;
    setLoadingWards(true);
    try {
      setWards(await fetchWards(d.code));
    } catch {
      notify.error("Không tải được Phường/Xã.");
    } finally {
      setLoadingWards(false);
    }
  };

  const saveForm = async () => {
    setFormError(null);
    if (!line.trim()) return setFormError("Vui lòng nhập địa chỉ chi tiết.");

    setSaving(true);
    try {
      // Coordinates: prefer any already captured (geolocation / edit), otherwise
      // geocode the chosen address so nearby-tasker matching keeps working.
      let latitude = lat ?? undefined;
      let longitude = lng ?? undefined;
      if (latitude == null || longitude == null) {
        const parts = [line.trim(), ward?.name, district?.name, province?.name, "Việt Nam"].filter(
          Boolean,
        );
        try {
          const geo = await geocodeAddress(parts.join(", "));
          if (geo) {
            latitude = geo.lat;
            longitude = geo.lng;
          }
        } catch {
          /* geocoding is best-effort; save without coords if it fails */
        }
      }

      const payload: AddressInput = {
        addressLine: line.trim(),
        provinceCode: province?.code || undefined,
        districtCode: district?.code || undefined,
        wardCode: ward?.code || undefined,
        latitude,
        longitude,
        isDefault: makeDefault,
      };

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
                  {labels[addr.addressId] && (
                    <p className="text-xs text-muted-foreground mt-0.5">{labels[addr.addressId]}</p>
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

            {/* Administrative selects — cascading Tỉnh → Quận → Phường; store codes. */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tỉnh/Thành</label>
              <select
                value={province?.code ?? ""}
                onChange={(e) => void onProvinceChange(e.target.value)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                disabled={provinces.length === 0}
              >
                <option value="">-- Chọn Tỉnh/Thành --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Quận/Huyện</label>
                <select
                  value={district?.code ?? ""}
                  onChange={(e) => void onDistrictChange(e.target.value)}
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  disabled={!province || loadingDistricts}
                >
                  <option value="">{loadingDistricts ? "Đang tải..." : "-- Chọn --"}</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Phường/Xã</label>
                <select
                  value={ward?.code ?? ""}
                  onChange={(e) =>
                    setWard(wards.find((w) => w.code === e.target.value) ?? null)
                  }
                  className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  disabled={!district || loadingWards}
                >
                  <option value="">{loadingWards ? "Đang tải..." : "-- Chọn --"}</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coordinates (used to match nearby taskers) — pick any location on the map. */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Vị trí trên bản đồ
              </label>
              <LocationPicker
                value={lat != null && lng != null ? { lat, lng } : null}
                onChange={(la, ln) => {
                  setLat(la);
                  setLng(ln);
                }}
                fallbackQuery={[line, ward?.name, district?.name, province?.name, "Việt Nam"]
                  .filter(Boolean)
                  .join(", ")}
              />
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
