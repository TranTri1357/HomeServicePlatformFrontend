import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authApi, getAccessToken } from "@/services/api";
import {
  getAllFrontendRoles,
  getHomePathByRole,
  getPrimaryRole,
  hasAnyRole as checkAnyRole,
  type FrontendRole,
} from "@/shared/auth/roles";

const AUTH_USER_KEY = "auth_user";

export interface AuthUserState {
  userId: number;
  fullName: string;
  roles: string[];
  mode: FrontendRole;
}

interface AuthContextValue {
  user: AuthUserState | null;
  roles: FrontendRole[];
  mode: FrontendRole | null;
  isAuthenticated: boolean;
  setSession: (user: Omit<AuthUserState, "mode"> & { mode?: FrontendRole }) => void;
  logout: () => void;
  hasRole: (role: FrontendRole) => boolean;
  hasAnyRole: (roles: FrontendRole[]) => boolean;
  getHomePath: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUserState | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUserState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.userId !== "number") return null;
    if (typeof parsed.fullName !== "string") return null;
    if (!Array.isArray(parsed.roles)) return null;

    const mode = parsed.mode ?? getPrimaryRole(parsed.roles);
    return {
      userId: parsed.userId,
      fullName: parsed.fullName,
      roles: parsed.roles,
      mode,
    };
  } catch {
    return null;
  }
}

function persistUser(user: AuthUserState) {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to persist auth user:", e);
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {
    console.error("Failed to clear auth user:", e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserState | null>(() => {
    const token = getAccessToken();
    if (!token) return null;
    return readStoredUser();
  });

  const roles = useMemo(() => (user ? getAllFrontendRoles(user.roles) : []), [user]);
  const mode = user?.mode ?? null;
  const isAuthenticated = Boolean(getAccessToken() && user);

  const setSession = useCallback(
    (nextUser: Omit<AuthUserState, "mode"> & { mode?: FrontendRole }) => {
      const normalizedUser: AuthUserState = {
        ...nextUser,
        mode: nextUser.mode ?? getPrimaryRole(nextUser.roles),
      };
      persistUser(normalizedUser);
      setUser(normalizedUser);
    },
    [],
  );

  const logout = useCallback(() => {
    // Best-effort backend revoke; reads the refresh token before it clears tokens.
    void authApi.logout();
    clearStoredUser();
    setUser(null);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth";
    }
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      roles,
      mode,
      isAuthenticated,
      setSession,
      logout,
      hasRole: (role: FrontendRole) => roles.includes(role),
      hasAnyRole: (requiredRoles: FrontendRole[]) => checkAnyRole(roles, requiredRoles),
      getHomePath: () => getHomePathByRole(mode ?? roles[0] ?? "customer"),
    }),
    [isAuthenticated, logout, mode, roles, setSession, user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

export { AUTH_USER_KEY };
