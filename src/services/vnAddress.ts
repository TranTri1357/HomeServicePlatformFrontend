

const PROVINCES_BASE = "https://provinces.open-api.vn/api";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";


export interface AdminUnit {
  code: string;
  name: string;
}

interface RawUnit {
  code: number;
  name: string;
}


let provincesCache: Promise<AdminUnit[]> | null = null;
const districtsCache = new Map<string, Promise<AdminUnit[]>>();
const wardsCache = new Map<string, Promise<AdminUnit[]>>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Địa chỉ hành chính: máy chủ trả về ${res.status}`);
  return (await res.json()) as T;
}

const toUnit = (u: RawUnit): AdminUnit => ({ code: String(u.code), name: u.name });


export function fetchProvinces(): Promise<AdminUnit[]> {
  if (!provincesCache) {
    provincesCache = fetchJson<RawUnit[]>(`${PROVINCES_BASE}/p/`)
      .then((rows) => rows.map(toUnit))
      .catch((err) => {
        provincesCache = null; 
        throw err;
      });
  }
  return provincesCache;
}


export function fetchDistricts(provinceCode: string): Promise<AdminUnit[]> {
  let p = districtsCache.get(provinceCode);
  if (!p) {
    p = fetchJson<{ districts: RawUnit[] }>(`${PROVINCES_BASE}/p/${provinceCode}?depth=2`)
      .then((data) => (data.districts ?? []).map(toUnit))
      .catch((err) => {
        districtsCache.delete(provinceCode);
        throw err;
      });
    districtsCache.set(provinceCode, p);
  }
  return p;
}


export function fetchWards(districtCode: string): Promise<AdminUnit[]> {
  let p = wardsCache.get(districtCode);
  if (!p) {
    p = fetchJson<{ wards: RawUnit[] }>(`${PROVINCES_BASE}/d/${districtCode}?depth=2`)
      .then((data) => (data.wards ?? []).map(toUnit))
      .catch((err) => {
        wardsCache.delete(districtCode);
        throw err;
      });
    wardsCache.set(districtCode, p);
  }
  return p;
}


export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("q", query);

  const rows = await fetchJson<Array<{ lat: string; lon: string }>>(url.toString());
  if (!rows.length) return null;
  const { lat, lon } = rows[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}


export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("accept-language", "vi");

  const data = await fetchJson<{ display_name?: string }>(url.toString());
  return data.display_name ?? null;
}


export interface GeoResult {
  label: string;
  lat: number;
  lng: number;
}


export async function searchAddresses(query: string, limit = 5): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("q", query);

  const rows = await fetchJson<Array<{ display_name: string; lat: string; lon: string }>>(
    url.toString(),
  );
  return rows.map((r) => ({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) }));
}
