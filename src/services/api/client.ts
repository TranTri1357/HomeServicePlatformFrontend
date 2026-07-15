// ─── Environment config ────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://homeserviceplatform.onrender.com/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "https://homeserviceplatform.onrender.com";

/**
 * Default request timeout (ms). The Render free tier can cold-start for tens of
 * seconds; without an upper bound a hung request would freeze the UI forever.
 */
export const DEFAULT_TIMEOUT_MS = 15000;

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

// ─── Standard backend envelope ───────────────────────────────────────────────
/** Every backend endpoint replies with this shape: the data lives under `data`. */
export interface ApiResponse<T> {
  succeeded: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: unknown[] | null;
}

/**
 * Unwrap an ApiResponse<T>: return `data` on success, or throw an ApiError
 * carrying the backend message on failure. Use this in every *.api.ts function
 * so components receive the payload directly, never the envelope.
 */
export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response?.succeeded || response.data == null) {
    const joinedErrors =
      Array.isArray(response?.errors) && response.errors.length > 0
        ? response.errors.map((e) => String(e ?? "")).filter(Boolean).join(". ")
        : "";
    const message = joinedErrors || response?.message || "Yêu cầu thất bại";
    throw new ApiError(message, response?.statusCode ?? 0, response);
  }
  return response.data;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
  skipAuth?: boolean;
  retryOnUnauthorized?: boolean;
  /** Abort the request after this many ms. Defaults to DEFAULT_TIMEOUT_MS. */
  timeoutMs?: number;
}

/**
 * fetch() that rejects after `timeoutMs` and normalizes failures into ApiError,
 * so the UI never stays stuck on a spinner and always gets a friendly message.
 * Honors a caller-provided AbortSignal in addition to the timeout.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Chain any caller-provided signal into our controller.
  const callerSignal = init.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      // Distinguish a real timeout from a caller cancellation.
      if (callerSignal?.aborted) {
        throw new ApiError("Yêu cầu đã bị hủy", 0);
      }
      throw new ApiError("Máy chủ phản hồi quá lâu, vui lòng thử lại", 408);
    }
    throw new ApiError("Không thể kết nối máy chủ, vui lòng kiểm tra mạng", 0);
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      // Mảng -> lặp lại key (status=0&status=1) để khớp binding mảng của ASP.NET.
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") url.searchParams.append(key, String(v));
        });
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

/** Public auth endpoints must never trigger refresh/redirect loops. */
function isPublicAuthPath(path: string) {
  const normalized = path.toLowerCase();
  return (
    normalized.includes("/auth/login") ||
    normalized.includes("/auth/register") ||
    normalized.includes("/auth/refresh") ||
    normalized.endsWith("auth/login") ||
    normalized.endsWith("auth/register") ||
    normalized.endsWith("auth/refresh")
  );
}

function extractBackendMessage(data: unknown, fallback: string) {
  if (!data) return fallback;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // ASP.NET validation dictionary: { errors: { Field: ["msg"] } }
    if (obj.errors && typeof obj.errors === "object" && !Array.isArray(obj.errors)) {
      const messages = Object.values(obj.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value))
        .filter(Boolean);
      if (messages.length > 0) return messages.join(". ");
    }

    // ApiResponse-style: { errors: ["msg"] }
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return obj.errors.map((value) => String(value)).join(". ");
    }

    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message;
    }

    if (typeof obj.title === "string" && obj.title.trim()) {
      return obj.title;
    }
  }

  return fallback;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message = extractBackendMessage(data, response.statusText || "Lỗi kết nối mạng");
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

function forceLogoutToAuth() {
  clearTokens();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth";
  }
}

/**
 * Single-flight refresh:
 * If many APIs get 401 at the same time, only one refresh request is sent.
 * Others await the same promise.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return null;

    try {
      // Dynamic import avoids circular dependency:
      // auth.api.ts imports post() from client.ts
      const { refreshToken } = await import("./auth.api");
      const pair = await refreshToken(currentRefreshToken);
      return pair.accessToken;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

// ─── Fetch wrapper — request/response interceptor style ───────────────────────
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    params,
    skipAuth = false,
    retryOnUnauthorized = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    body,
    ...fetchOptions
  } = options;

  // Public auth APIs must never auto-refresh / hard-redirect.
  // Backend returns 401 UnauthorizedException for wrong credentials on login.
  const isPublicAuth = isPublicAuthPath(path);
  const shouldRetryUnauthorized = retryOnUnauthorized && !skipAuth && !isPublicAuth;

  const token = getAccessToken();
  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type") && body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth && !isPublicAuth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetchWithTimeout(
    buildUrl(path, params),
    { ...fetchOptions, headers: finalHeaders, body },
    timeoutMs,
  );

  if (response.status === 401 && shouldRetryUnauthorized) {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      // Refresh failed: expired/revoked/locked/reuse attack, etc.
      forceLogoutToAuth();
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    // Retry original request once with the new access token.
    finalHeaders.set("Authorization", `Bearer ${newAccessToken}`);
    const retryResponse = await fetchWithTimeout(
      buildUrl(path, params),
      { ...fetchOptions, headers: finalHeaders, body },
      timeoutMs,
    );

    // If still unauthorized after a successful refresh, force re-login.
    if (retryResponse.status === 401) {
      forceLogoutToAuth();
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

// ─── Typed request helpers ─────────────────────────────────────────────────────
export function get<T>(url: string, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, { ...config, method: "GET" });
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function put<T>(
  url: string,
  data?: unknown,
  config?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: "PUT",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

export function del<T>(url: string, config?: Omit<RequestOptions, "method" | "body">): Promise<T> {
  return request<T>(url, { ...config, method: "DELETE" });
}
