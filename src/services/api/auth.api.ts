import { post, clearTokens } from "./client";
import type { UserMode } from "@/shared/types";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: Exclude<UserMode, "design-system">;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: Exclude<UserMode, "design-system">;
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await post<AuthResponse>("/auth/login", payload);
  return response;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await post<AuthResponse>("/auth/register", payload);
  return response;
}

export function logout() {
  clearTokens();
}
