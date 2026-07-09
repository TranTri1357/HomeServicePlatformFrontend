import { UNSPLASH_BASE, UI_AVATARS_BASE } from "@/shared/constants";

export function getUnsplashUrl(key: string, w = 200, h = 200) {
  return `${UNSPLASH_BASE}/${key}?w=${w}&h=${h}&fit=crop&auto=format`;
}

export function getAvatarUrl(name: string, size = 40) {
  return `${UI_AVATARS_BASE}/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&w=${size}&h=${size}`;
}
