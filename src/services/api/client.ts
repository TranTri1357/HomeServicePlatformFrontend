// ─── Environment config ────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

// ─── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEYS = {
  access: "access_token",
  refresh: "refresh_token",
};

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS.access);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEYS.refresh);
  } catch {
    return null;
  }
}

export function setTokens(access: string, refresh: string) {
  try {
    localStorage.setItem(TOKEN_KEYS.access, access);
    localStorage.setItem(TOKEN_KEYS.refresh, refresh);
  } catch (e) {
    console.error("Failed to save tokens:", e);
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN_KEYS.access);
    localStorage.removeItem(TOKEN_KEYS.refresh);
  } catch (e) {
    console.error("Failed to clear tokens:", e);
  }
}

// ─── Error type ────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data && "message" in data ? String((data as { message?: string }).message) : null) ||
      response.statusText ||
      "Lỗi kết nối mạng";
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const accessToken = data.accessToken as string | undefined;
  const newRefreshToken = data.refreshToken as string | undefined;

  if (!accessToken || !newRefreshToken) return null;

  setTokens(accessToken, newRefreshToken);
  return accessToken;
}

// ─── Fetch wrapper — request/response interceptor style ───────────────────────
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    skipAuth = false,
    retryOnUnauthorized = true,
    headers,
    body,
    ...fetchOptions
  } = options;

  const token = getAccessToken();
  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type") && body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: finalHeaders,
    body,
  });

  if (response.status === 401 && retryOnUnauthorized && !skipAuth) {
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      clearTokens();
      window.location.href = "/auth";
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    finalHeaders.set("Authorization", `Bearer ${newAccessToken}`);
    const retryResponse = await fetch(buildUrl(path, params), {
      ...fetchOptions,
      headers: finalHeaders,
      body,
    });
    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

// ─── Typed request helpers ─────────────────────────────────────────────────────
export function get<T>(url: string, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, { ...config, method: "GET" });
}

export function post<T>(url: string, data?: unknown, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, {
    ...config,
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function put<T>(url: string, data?: unknown, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, {
    ...config,
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function del<T>(url: string, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, { ...config, method: "DELETE" });
}
