import { post, clearTokens, getRefreshToken, setTokens } from "./client";
import { getPrimaryRole, type FrontendRole } from "@/shared/auth/roles";

// ─── Backend response types ────────────────────────────────────────────────────
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  roleId: number;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponseData {
  userId: number;
  fullName: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: unknown[] | null;
}

export type AuthUser = Omit<LoginResponseData, "roles"> & {
  roles: string[];
};

export interface LoginResult {
  user: AuthUser;
  mode: FrontendRole;
}

export interface RegisterResult {
  userId: number;
  message: string;
}

function getFailedMessage(
  response?: Partial<ApiResponse<unknown>> | null,
  fallback = "Yêu cầu thất bại",
) {
  if (Array.isArray(response?.errors) && response.errors.length > 0) {
    return response.errors
      .map((item) => String(item ?? ""))
      .filter(Boolean)
      .join(". ");
  }
  if (typeof response?.message === "string" && response.message.trim()) {
    return response.message;
  }
  return fallback;
}

/**
 * Backend may return either:
 * 1) ApiResponse wrapper: { succeeded, data: { accessToken, refreshToken, ... } }
 * 2) Flat token payload: { accessToken, refreshToken, ... }
 */
function extractTokenPair(response: unknown): TokenPair | null {
  if (!response || typeof response !== "object") return null;

  const root = response as Record<string, unknown>;

  // ApiResponse-style
  if ("data" in root && root.data && typeof root.data === "object") {
    const data = root.data as Record<string, unknown>;
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    if (typeof accessToken === "string" && typeof refreshToken === "string") {
      if ("succeeded" in root && root.succeeded === false) return null;
      return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt:
          typeof data.accessTokenExpiresAt === "string" ? data.accessTokenExpiresAt : undefined,
        refreshTokenExpiresAt:
          typeof data.refreshTokenExpiresAt === "string" ? data.refreshTokenExpiresAt : undefined,
      };
    }
  }

  // Flat payload
  if (typeof root.accessToken === "string" && typeof root.refreshToken === "string") {
    return {
      accessToken: root.accessToken,
      refreshToken: root.refreshToken,
      accessTokenExpiresAt:
        typeof root.accessTokenExpiresAt === "string" ? root.accessTokenExpiresAt : undefined,
      refreshTokenExpiresAt:
        typeof root.refreshTokenExpiresAt === "string" ? root.refreshTokenExpiresAt : undefined,
    };
  }

  return null;
}

// ─── API functions ─────────────────────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<LoginResult> {
  const response = await post<ApiResponse<LoginResponseData>>("/Auth/login", payload, {
    skipAuth: true,
    retryOnUnauthorized: false,
  });

  if (!response?.succeeded || !response?.data) {
    throw new Error(getFailedMessage(response, "Đăng nhập thất bại"));
  }

  const data = response.data;
  const roles = data.roles ?? [];

  setTokens(data.accessToken, data.refreshToken);

  return {
    user: {
      userId: data.userId,
      fullName: data.fullName,
      roles,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    },
    mode: getPrimaryRole(roles),
  };
}

export async function register(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await post<ApiResponse<number>>("/Auth/register", payload, {
    skipAuth: true,
    retryOnUnauthorized: false,
  });

  if (!response?.succeeded || response?.data == null) {
    throw new Error(getFailedMessage(response, "Đăng ký thất bại"));
  }

  return {
    userId: Number(response.data),
    message: response.message || "Đăng ký tài khoản thành công",
  };
}

/**
 * Refresh access/refresh token pair.
 * Must never attach old access token and never auto-retry on 401 (prevents infinite loop).
 */
export async function refreshToken(token: string): Promise<TokenPair> {
  if (!token?.trim()) {
    throw new Error("Thiếu refresh token");
  }

  const response = await post<ApiResponse<LoginResponseData> | LoginResponseData>(
    "/Auth/refresh",
    { refreshToken: token } satisfies RefreshTokenPayload,
    {
      skipAuth: true,
      retryOnUnauthorized: false,
    },
  );

  const pair = extractTokenPair(response);
  if (!pair) {
    const maybeApi = response as Partial<ApiResponse<unknown>> | null;
    throw new Error(getFailedMessage(maybeApi, "Làm mới phiên đăng nhập thất bại"));
  }

  setTokens(pair.accessToken, pair.refreshToken);
  return pair;
}

/**
 * Đổi mật khẩu khi đã đăng nhập — POST /api/Auth/change-password.
 * UserId lấy từ token phía server. Thành công thì backend thu hồi các refresh token cũ
 * (đăng xuất thiết bị khác); phiên hiện tại vẫn dùng access token tới khi hết hạn.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<boolean> {
  const response = await post<ApiResponse<boolean>>("/Auth/change-password", payload, {
    retryOnUnauthorized: false,
  });

  if (!response?.succeeded) {
    throw new Error(getFailedMessage(response, "Đổi mật khẩu thất bại"));
  }

  return Boolean(response.data);
}

/**
 * Log out: revoke the refresh token on the backend, then clear local tokens.
 *
 * Backend contract — POST /api/Auth/logout
 *   body:     { refreshToken: string }
 *   response: ApiResponse<bool>  (succeeded === true on success)
 *   effect:   sets Tokens.IsRevoked = true, RevokedAt = now for Type == 1
 *   errors:   "Token không hợp lệ hoặc không tồn tại." (unknown token)
 *             "Phiên làm việc này đã được đăng xuất trước đó." (already revoked)
 *
 * The server call is best-effort: an invalid / already-revoked token, a missing
 * endpoint or a network failure must never block the local logout below.
 */
export async function logout(): Promise<void> {
  const token = getRefreshToken();
  if (token) {
    try {
      await post<ApiResponse<boolean>>(
        "/Auth/logout",
        { refreshToken: token } satisfies RefreshTokenPayload,
        { retryOnUnauthorized: false },
      );
    } catch {
      // Ignore — token may be expired/revoked, or the backend is unreachable.
    }
  }
  clearTokens();
}
