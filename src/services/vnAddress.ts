/**
 * Vietnamese administrative units (Tỉnh/Thành → Quận/Huyện → Phường/Xã) and
 * address geocoding, for the customer address form.
 *
 * - Admin units come from the public dataset at provinces.open-api.vn. Its `code`
 *   values are the official GSO codes and match what the backend stores as
 *   ProvinceCode/DistrictCode/WardCode (e.g. HCMC=79, Quận 1=760, Bến Nghé=26734).
 * - Geocoding uses OpenStreetMap Nominatim (free, no key). We keep the derived
 *   lat/lng so nearby-tasker matching works even when browser geolocation is denied.
 *
 * Both hosts send permissive CORS headers, so we call them with plain `fetch`
 * (NOT the app's api client, which would attach the backend base URL + auth header).
 */

const PROVINCES_BASE = "https://provinces.open-api.vn/api";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** One administrative unit — code kept as string to match the backend columns. */
export interface AdminUnit {
  code: string;
  name: string;
}

interface RawUnit {
  code: number;
  name: string;
}

// ── In-memory caches (per page load) so re-opening the form is instant ──────────
let provincesCache: Promise<AdminUnit[]> | null = null;
const districtsCache = new Map<string, Promise<AdminUnit[]>>();
const wardsCache = new Map<string, Promise<AdminUnit[]>>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Địa chỉ hành chính: máy chủ trả về ${res.status}`);
  return (await res.json()) as T;
}

const toUnit = (u: RawUnit): AdminUnit => ({ code: String(u.code), name: u.name });

/** All provinces/cities, sorted by name. Cached. */
export function fetchProvinces(): Promise<AdminUnit[]> {
  if (!provincesCache) {
    provincesCache = fetchJson<RawUnit[]>(`${PROVINCES_BASE}/p/`)
      .then((rows) => rows.map(toUnit))
      .catch((err) => {
        provincesCache = null; // allow retry on next open
        throw err;
      });
  }
  return provincesCache;
}

/** Districts of a province. Cached per province code. */
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

/** Wards of a district. Cached per district code. */
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

/**
 * Geocode a free-text Vietnamese address to a coordinate via Nominatim.
 * Returns null when nothing is found (caller should treat coords as optional).
 */
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

/**
 * Reverse geocode a coordinate to a readable Vietnamese address via Nominatim.
 * Returns null when nothing is found.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("accept-language", "vi");

  const data = await fetchJson<{ display_name?: string }>(url.toString());
  return data.display_name ?? null;
}

/** One address search suggestion (for the map picker's search box). */
export interface GeoResult {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Search Vietnamese addresses via Nominatim, returning up to `limit` suggestions
 * so the user can jump the map to any place — not just their current location.
 */
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
