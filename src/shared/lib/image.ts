import { UNSPLASH_BASE, UI_AVATARS_BASE } from "@/shared/constants";
import { API_BASE_URL } from "@/services/api/client";

export function getUnsplashUrl(key: string, w = 200, h = 200) {
  return `${UNSPLASH_BASE}/${key}?w=${w}&h=${h}&fit=crop&auto=format`;
}


export function getApiAssetUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/i, "");
  return `${origin}/${path.replace(/^\//, "")}`;
}

export function getAvatarUrl(name: string, size = 40) {
  return `${UI_AVATARS_BASE}/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&w=${size}&h=${size}`;
}
