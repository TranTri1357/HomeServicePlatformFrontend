

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const BG = [0x25, 0x63, 0xeb]; 
const FG = [0xff, 0xff, 0xff];


const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; 
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; 
  ihdr[9] = 6; 
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}


function inRoundedRect(x, y, size, radius) {
  const r = radius;
  const cx = Math.min(Math.max(x, r), size - r);
  const cy = Math.min(Math.max(y, r), size - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  const a = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
  const b = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
  return a >= 0 && b >= 0 && a + b <= 1;
}


function houseAt(u, v) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return 0;
  const roof = inTriangle(u, v, 0.5, 0.06, 0.0, 0.47, 1.0, 0.47);
  const body = u >= 0.14 && u <= 0.86 && v >= 0.42 && v <= 0.93;
  if (!roof && !body) return 0;
  
  const door = u >= 0.40 && u <= 0.60 && v >= 0.63 && v <= 0.93;
  if (door) return 0;
  
  const winL = u >= 0.22 && u <= 0.35 && v >= 0.57 && v <= 0.70;
  const winR = u >= 0.65 && u <= 0.78 && v >= 0.57 && v <= 0.70;
  if (winL || winR) return 0;
  return 1;
}


function renderIcon(size, opts = {}) {
  const SS = 4; 
  const S = size * SS;
  const radius = opts.bleed ? 0 : S * 0.22;
  
  const glyphScale = opts.maskable ? 0.52 : 0.66;
  const g0 = (S - S * glyphScale) / 2;
  const gS = S * glyphScale;

  const acc = new Float32Array(size * size * 4);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      const inside = opts.bleed ? true : inRoundedRect(x + 0.5, y + 0.5, S, radius);
      if (inside) {
        a = 255;
        const isGlyph = houseAt((x - g0) / gS, (y - g0) / gS);
        [r, g, b] = isGlyph ? FG : BG;
      }
      const di = (Math.floor(y / SS) * size + Math.floor(x / SS)) * 4;
      acc[di] += r; acc[di + 1] += g; acc[di + 2] += b; acc[di + 3] += a;
    }
  }
  const n = SS * SS;
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size * 4; i++) out[i] = Math.round(acc[i] / n);
  return encodePNG(size, size, out);
}

const targets = [
  ["icons/icon-192.png", 192, {}],
  ["icons/icon-512.png", 512, {}],
  ["icons/icon-maskable-512.png", 512, { maskable: true, bleed: true }],
  ["icons/apple-touch-icon.png", 180, { bleed: true }], 
  ["icons/favicon-32.png", 32, {}],
];

const root = resolve(process.argv[2]);
for (const [rel, size, opts] of targets) {
  const p = resolve(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, renderIcon(size, opts));
  console.log("✓", rel, size + "x" + size);
}
