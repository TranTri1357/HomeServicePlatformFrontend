
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://homeserviceplatform.onrender.com/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "https://homeserviceplatform.onrender.com";


export const DEFAULT_TIMEOUT_MS = 15000;


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



export interface ApiResponse<T> {
  succeeded: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: unknown[] | null;
}


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
  
  timeoutMs?: number;
}


async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  
  const callerSignal = init.signal;
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      
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

    
    if (obj.errors && typeof obj.errors === "object" && !Array.isArray(obj.errors)) {
      const messages = Object.values(obj.errors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value))
        .filter(Boolean);
      if (messages.length > 0) return messages.join(". ");
    }

    
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


let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return null;

    try {
      
      
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

  
  
  const isPublicAuth = isPublicAuthPath(path);
  const shouldRetryUnauthorized = retryOnUnauthorized && !skipAuth && !isPublicAuth;

  const token = getAccessToken();
  const finalHeaders = new Headers(headers);
  
  
  if (!finalHeaders.has("Content-Type") && body !== undefined && !(body instanceof FormData)) {
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
      
      forceLogoutToAuth();
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    
    finalHeaders.set("Authorization", `Bearer ${newAccessToken}`);
    const retryResponse = await fetchWithTimeout(
      buildUrl(path, params),
      { ...fetchOptions, headers: finalHeaders, body },
      timeoutMs,
    );

    
    if (retryResponse.status === 401) {
      forceLogoutToAuth();
      throw new ApiError("Phiên đăng nhập đã hết hạn", 401);
    }

    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}


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


export function postForm<T>(
  url: string,
  formData: FormData,
  config?: Omit<RequestOptions, "method" | "body">,
): Promise<T> {
  return request<T>(url, { ...config, method: "POST", body: formData });
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
