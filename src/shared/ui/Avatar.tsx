import { UNSPLASH_BASE, UI_AVATARS_BASE } from "@/shared/constants";

interface AvatarProps {
  src?: string;
  size?: number;
  name?: string;
}

export function Avatar({ src, size = 40, name = "" }: AvatarProps) {
  const url = src
    ? `${UNSPLASH_BASE}/${src}?w=${size * 2}&h=${size * 2}&fit=crop&auto=format&face`
    : `${UI_AVATARS_BASE}/?name=${encodeURIComponent(name)}&background=2563EB&color=fff`;

  return (
    <img
      src={url}
      alt={name}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
