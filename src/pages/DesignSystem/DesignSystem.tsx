/**
 * FixNow — Living Design System
 * Production-ready reference for Frontend (React/Next.js + Tailwind CSS)
 * Organized to mirror the Figma file structure
 */

import { useState } from "react";
import {
  Zap, Droplets, Wind, Brush, Wrench, Home, Search, Bell, MapPin, Star,
  Clock, Phone, MessageCircle, ChevronRight, X, Check, Camera, Navigation,
  Calendar, CreditCard, Wallet, Building2, Send, Paperclip, User, Settings,
  LogOut, BarChart2, Briefcase, Filter, CheckCircle, AlertCircle, Timer,
  Award, Shield, Eye, EyeOff, Plus, Minus, Edit3, Trash2, ChevronLeft,
  ChevronDown, DollarSign, TrendingUp, FileText, Map, BookOpen, Heart,
  Share2, Route, Package, ImageIcon, Users, Layers, Percent, Flag, Menu,
  RefreshCw, Ban, ArrowRight, Info, Loader2, Upload, ToggleLeft, ToggleRight,
  SortAsc, SortDesc, MoreHorizontal, Copy, Download, ExternalLink,
} from "lucide-react";

// ─── Section navigation tree ─────────────────────────────────────────────────
const NAV = [
  {
    group: "Foundation",
    items: [
      { id: "colors",     label: "Colors"              },
      { id: "typography", label: "Typography"           },
      { id: "icons",      label: "Icons"                },
      { id: "spacing",    label: "Grid & Spacing"       },
      { id: "effects",    label: "Effects & Variables"  },
    ],
  },
  {
    group: "Components",
    items: [
      { id: "buttons",        label: "Buttons"             },
      { id: "inputs",         label: "Inputs"              },
      { id: "select",         label: "Select / Dropdown"   },
      { id: "checkboxes",     label: "Checkbox / Radio / Switch" },
      { id: "searchbar",      label: "Search Bar"          },
      { id: "filter",         label: "Filter"              },
      { id: "cards",          label: "Cards"               },
      { id: "tables",         label: "Tables"              },
      { id: "badges",         label: "Status Badges"       },
      { id: "modals",         label: "Modal / Dialog"      },
      { id: "pagination",     label: "Pagination"          },
      { id: "navigation",     label: "Navbar / Sidebar"    },
      { id: "charts",         label: "Charts"              },
      { id: "toast",          label: "Toast / Notification"},
      { id: "states",         label: "System States"       },
    ],
  },
  {
    group: "Patterns",
    items: [
      { id: "forms",      label: "Form Patterns (CRUD)" },
      { id: "datatable",  label: "Data Table Pattern"   },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Swatch = ({ hex, name, tw }: { hex: string; name: string; tw: string }) => (
  <div className="flex flex-col gap-1.5">
    <div className="h-14 rounded-xl border border-black/5 shadow-sm" style={{ background: hex }} />
    <p className="text-xs font-bold text-foreground">{name}</p>
    <p className="text-[10px] text-muted-foreground font-mono">{hex}</p>
    <p className="text-[10px] text-blue-600 font-mono">{tw}</p>
  </div>
);

const TokenRow = ({ name, value, preview }: { name: string; value: string; preview?: React.ReactNode }) => (
  <div className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
    {preview && <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">{preview}</div>}
    <div className="flex-1">
      <p className="text-sm font-semibold text-foreground font-mono">{name}</p>
      <p className="text-xs text-muted-foreground">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6">
    <h2 className="text-xl font-extrabold text-foreground">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{title}</h3>
    {children}
  </div>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-border/50 ${className}`}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{children}</p>
);

// ─── Section: Colors ──────────────────────────────────────────────────────────
function SectionColors() {
  const palettes = [
    {
      name: "Primary — Blue",
      swatches: [
        { hex: "#EFF6FF", name: "Blue-50",  tw: "bg-blue-50"  },
        { hex: "#DBEAFE", name: "Blue-100", tw: "bg-blue-100" },
        { hex: "#BFDBFE", name: "Blue-200", tw: "bg-blue-200" },
        { hex: "#93C5FD", name: "Blue-300", tw: "bg-blue-300" },
        { hex: "#60A5FA", name: "Blue-400", tw: "bg-blue-400" },
        { hex: "#3B82F6", name: "Blue-500", tw: "bg-blue-500" },
        { hex: "#2563EB", name: "Blue-600 ●", tw: "bg-blue-600" },
        { hex: "#1D4ED8", name: "Blue-700", tw: "bg-blue-700" },
        { hex: "#1E40AF", name: "Blue-800", tw: "bg-blue-800" },
        { hex: "#1E3A8A", name: "Blue-900", tw: "bg-blue-900" },
      ],
    },
    {
      name: "Secondary — Green",
      swatches: [
        { hex: "#ECFDF5", name: "Green-50",  tw: "bg-green-50"  },
        { hex: "#D1FAE5", name: "Green-100", tw: "bg-green-100" },
        { hex: "#A7F3D0", name: "Green-200", tw: "bg-green-200" },
        { hex: "#6EE7B7", name: "Green-300", tw: "bg-green-300" },
        { hex: "#34D399", name: "Green-400", tw: "bg-green-400" },
        { hex: "#10B981", name: "Green-500 ●", tw: "bg-green-500" },
        { hex: "#059669", name: "Green-600", tw: "bg-green-600" },
        { hex: "#047857", name: "Green-700", tw: "bg-green-700" },
        { hex: "#065F46", name: "Green-800", tw: "bg-green-800" },
        { hex: "#064E3B", name: "Green-900", tw: "bg-green-900" },
      ],
    },
    {
      name: "Neutral — Slate",
      swatches: [
        { hex: "#F8FAFC", name: "Slate-50 ●", tw: "bg-slate-50"  },
        { hex: "#F1F5F9", name: "Slate-100",  tw: "bg-slate-100" },
        { hex: "#E2E8F0", name: "Slate-200",  tw: "bg-slate-200" },
        { hex: "#CBD5E1", name: "Slate-300",  tw: "bg-slate-300" },
        { hex: "#94A3B8", name: "Slate-400",  tw: "bg-slate-400" },
        { hex: "#64748B", name: "Slate-500",  tw: "bg-slate-500" },
        { hex: "#475569", name: "Slate-600",  tw: "bg-slate-600" },
        { hex: "#334155", name: "Slate-700",  tw: "bg-slate-700" },
        { hex: "#1E293B", name: "Slate-800 ●", tw: "bg-slate-800" },
        { hex: "#0F172A", name: "Slate-900",  tw: "bg-slate-900" },
      ],
    },
  ];

  const semantic = [
    { hex: "#10B981", name: "Success",  tw: "bg-green-500",   role: "Completed, verified, active" },
    { hex: "#F59E0B", name: "Warning",  tw: "bg-amber-500",   role: "Pending, caution"            },
    { hex: "#EF4444", name: "Danger",   tw: "bg-red-500",     role: "Error, delete, blocked"       },
    { hex: "#3B82F6", name: "Info",     tw: "bg-blue-500",    role: "Informational, accepted"      },
    { hex: "#8B5CF6", name: "Purple",   tw: "bg-purple-500",  role: "In-progress, processing"      },
    { hex: "#F8FAFC", name: "Background", tw: "bg-slate-50",  role: "Page background"              },
    { hex: "#FFFFFF", name: "Surface",  tw: "bg-white",       role: "Card, panel, modal"           },
    { hex: "#1E293B", name: "On-Surface", tw: "text-slate-800", role: "Primary text"               },
    { hex: "#64748B", name: "Muted",    tw: "text-slate-500", role: "Secondary text, labels"       },
    { hex: "#E2E8F0", name: "Border",   tw: "border-slate-200", role: "Dividers, input borders"    },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Colors" subtitle="Design tokens — mapped to Tailwind CSS utility classes" />
      {palettes.map(p => (
        <Card key={p.name}>
          <h4 className="text-sm font-bold text-foreground mb-4">{p.name}</h4>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {p.swatches.map(s => <Swatch key={s.name} {...s} />)}
          </div>
        </Card>
      ))}
      <Card>
        <h4 className="text-sm font-bold text-foreground mb-4">Semantic / Role Colors</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {semantic.map(s => (
            <div key={s.name} className="flex flex-col gap-1.5">
              <div className="h-10 rounded-xl border border-black/5 shadow-sm" style={{ background: s.hex }} />
              <p className="text-xs font-bold text-foreground">{s.name}</p>
              <p className="text-[10px] text-muted-foreground">{s.role}</p>
              <p className="text-[10px] text-blue-600 font-mono">{s.tw}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Typography ──────────────────────────────────────────────────────
function SectionTypography() {
  const scale = [
    { name: "Display",    size: "36px / text-4xl", weight: "800 ExtraBold",  lh: "1.2", sample: "Display Heading", tw: "text-4xl font-extrabold" },
    { name: "H1",         size: "30px / text-3xl", weight: "700 Bold",       lh: "1.3", sample: "Heading Level 1", tw: "text-3xl font-bold" },
    { name: "H2",         size: "24px / text-2xl", weight: "700 Bold",       lh: "1.4", sample: "Heading Level 2", tw: "text-2xl font-bold" },
    { name: "H3",         size: "20px / text-xl",  weight: "600 SemiBold",   lh: "1.4", sample: "Heading Level 3", tw: "text-xl font-semibold" },
    { name: "H4",         size: "16px / text-base",weight: "600 SemiBold",   lh: "1.5", sample: "Heading Level 4", tw: "text-base font-semibold" },
    { name: "Body-LG",    size: "16px / text-base",weight: "400 Regular",    lh: "1.6", sample: "Body large — default reading text", tw: "text-base font-normal" },
    { name: "Body-SM",    size: "14px / text-sm",  weight: "400 Regular",    lh: "1.6", sample: "Body small — secondary description", tw: "text-sm font-normal" },
    { name: "Label",      size: "14px / text-sm",  weight: "600 SemiBold",   lh: "1.5", sample: "Form Label / Nav Item", tw: "text-sm font-semibold" },
    { name: "Caption",    size: "12px / text-xs",  weight: "400 Regular",    lh: "1.5", sample: "Caption · helper text · timestamp", tw: "text-xs font-normal" },
    { name: "Overline",   size: "10px / text-[10px]", weight: "700 Bold",    lh: "1.4", sample: "SECTION LABEL · BADGE", tw: "text-[10px] font-bold uppercase tracking-wider" },
    { name: "Code/Mono",  size: "13px / text-[13px]", weight: "400 Regular", lh: "1.6", sample: "#BK001 · 0901 234 567 · 150,000đ", tw: "text-[13px] font-mono" },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Typography" subtitle="Inter font family — all sizes mapped to Tailwind CSS" />
      <Card>
        <p className="text-xs text-muted-foreground mb-4 font-mono">font-family: 'Inter', sans-serif</p>
        <div className="space-y-1">
          {scale.map(t => (
            <div key={t.name} className="flex items-baseline gap-4 py-3 border-b border-border last:border-0">
              <div className="w-20 flex-shrink-0">
                <p className="text-xs font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.size}</p>
                <p className="text-[10px] text-muted-foreground">{t.weight}</p>
              </div>
              <div className="flex-1">
                <p className={t.tw} style={{ lineHeight: t.lh }}>{t.sample}</p>
              </div>
              <p className="text-[10px] text-blue-600 font-mono hidden md:block flex-shrink-0">{t.tw}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Icons ───────────────────────────────────────────────────────────
function SectionIcons() {
  const iconGroups = [
    { name: "Navigation", icons: [Home, Search, Bell, MapPin, Navigation, Map, ChevronLeft, ChevronRight, ChevronDown, ArrowRight, ExternalLink, Menu] },
    { name: "Actions", icons: [Plus, Minus, Edit3, Trash2, Check, X, Copy, Download, Upload, Share2, RefreshCw, Filter] },
    { name: "Service", icons: [Zap, Droplets, Wind, Brush, Wrench, Wrench, Package, Layers, Timer] },
    { name: "User & Auth", icons: [User, Users, Shield, Award, Eye, EyeOff, LogOut, Settings, Ban] },
    { name: "Communication", icons: [MessageCircle, Phone, Send, Paperclip, Bell, Flag, AlertCircle, Info] },
    { name: "Business", icons: [DollarSign, CreditCard, Wallet, Building2, Percent, TrendingUp, BarChart2, Briefcase, FileText] },
    { name: "Status", icons: [CheckCircle, AlertCircle, Clock, Star, Heart, BookOpen, Route] },
    { name: "Media", icons: [Camera, ImageIcon, Map, Calendar] },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Icons" subtitle="Lucide React — 24×24px default, stroke-width 1.5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {iconGroups.map(group => (
          <Card key={group.name}>
            <p className="text-xs font-bold text-foreground mb-3">{group.name}</p>
            <div className="flex flex-wrap gap-3">
              {group.icons.map((Icon, i) => (
                <div key={i} className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center hover:bg-accent transition-colors" title={Icon.displayName ?? ""}>
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-xs font-bold text-foreground mb-3">Icon Sizes</p>
        <div className="flex items-end gap-6">
          {[{ size: "w-3 h-3", label: "12px · xs" }, { size: "w-4 h-4", label: "16px · sm" }, { size: "w-5 h-5", label: "20px · md" }, { size: "w-6 h-6", label: "24px · lg ●" }, { size: "w-8 h-8", label: "32px · xl" }].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="bg-muted rounded-xl flex items-center justify-center" style={{ width: 48, height: 48 }}>
                <Wrench className={s.size} />
              </div>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Spacing ─────────────────────────────────────────────────────────
function SectionSpacing() {
  const spacingScale = [
    { tw: "p-0.5", px: 2,  label: "2px  · 0.5" },
    { tw: "p-1",   px: 4,  label: "4px  · 1"   },
    { tw: "p-2",   px: 8,  label: "8px  · 2 ●" },
    { tw: "p-3",   px: 12, label: "12px · 3"   },
    { tw: "p-4",   px: 16, label: "16px · 4 ●" },
    { tw: "p-5",   px: 20, label: "20px · 5"   },
    { tw: "p-6",   px: 24, label: "24px · 6 ●" },
    { tw: "p-8",   px: 32, label: "32px · 8"   },
    { tw: "p-10",  px: 40, label: "40px · 10"  },
    { tw: "p-12",  px: 48, label: "48px · 12"  },
    { tw: "p-16",  px: 64, label: "64px · 16"  },
  ];

  const radii = [
    { label: "None",  tw: "rounded-none",  px: "0" },
    { label: "SM",    tw: "rounded-sm",    px: "2px" },
    { label: "MD",    tw: "rounded",       px: "4px" },
    { label: "LG",    tw: "rounded-lg",    px: "8px" },
    { label: "XL",    tw: "rounded-xl",    px: "12px" },
    { label: "2XL ●", tw: "rounded-2xl",   px: "16px — Cards" },
    { label: "3XL",   tw: "rounded-3xl",   px: "24px — Sheets" },
    { label: "Full",  tw: "rounded-full",  px: "9999px — Pills" },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Grid & Spacing" subtitle="8px base grid — all spacing values are multiples of 4px" />
      <Card>
        <p className="text-xs font-bold text-foreground mb-4">Spacing Scale (8px Grid)</p>
        <div className="flex flex-wrap gap-3 items-end">
          {spacingScale.map(s => (
            <div key={s.tw} className="flex flex-col items-center gap-2">
              <div className="bg-blue-100 border-2 border-blue-400 rounded" style={{ width: s.px, height: s.px, minWidth: 4, minHeight: 4 }} />
              <p className="text-[10px] text-muted-foreground text-center whitespace-nowrap">{s.label}</p>
              <p className="text-[10px] text-blue-600 font-mono">{s.tw}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold text-foreground mb-4">Border Radius</p>
        <div className="flex flex-wrap gap-4 items-end">
          {radii.map(r => (
            <div key={r.label} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 bg-blue-100 border-2 border-blue-400 ${r.tw}`} />
              <p className="text-[10px] font-bold text-foreground">{r.label}</p>
              <p className="text-[10px] text-muted-foreground">{r.px}</p>
              <p className="text-[10px] text-blue-600 font-mono">{r.tw}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold text-foreground mb-4">Layout Grid (1440px Desktop — 12 col, 24px gutter)</p>
        <div className="flex gap-2 h-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-blue-100 rounded text-center text-[10px] text-blue-600 font-bold flex items-center justify-center">{i + 1}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs text-muted-foreground">
          <div><span className="font-bold text-foreground">Mobile:</span> 4 col, 16px margin</div>
          <div><span className="font-bold text-foreground">Tablet:</span> 8 col, 20px gutter</div>
          <div><span className="font-bold text-foreground">Desktop:</span> 12 col, 24px gutter</div>
          <div><span className="font-bold text-foreground">Max width:</span> 1440px centered</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Effects ─────────────────────────────────────────────────────────
function SectionEffects() {
  const shadows = [
    { name: "shadow-none",  tw: "shadow-none",  label: "None — flat elements" },
    { name: "shadow-sm",    tw: "shadow-sm",    label: "SM — cards, inputs"   },
    { name: "shadow",       tw: "shadow",       label: "MD — dropdowns"       },
    { name: "shadow-md",    tw: "shadow-md",    label: "MD+ — popovers"       },
    { name: "shadow-lg",    tw: "shadow-lg",    label: "LG — modals"          },
    { name: "shadow-xl",    tw: "shadow-xl",    label: "XL — drawers"         },
    { name: "shadow-2xl",   tw: "shadow-2xl",   label: "2XL — phone frame"    },
  ];

  const tokens = [
    { name: "--background",       value: "#F8FAFC",  desc: "Page background"        },
    { name: "--foreground",       value: "#1E293B",  desc: "Primary text"           },
    { name: "--card",             value: "#FFFFFF",  desc: "Card / panel surface"   },
    { name: "--primary",          value: "#2563EB",  desc: "Blue 600 — CTA, active" },
    { name: "--secondary",        value: "#10B981",  desc: "Green 500 — success"    },
    { name: "--muted",            value: "#EFF2F7",  desc: "Subdued surface"        },
    { name: "--muted-foreground", value: "#64748B",  desc: "Labels, captions"       },
    { name: "--border",           value: "#E2E8F0",  desc: "Hairline dividers"      },
    { name: "--destructive",      value: "#EF4444",  desc: "Danger / error"         },
    { name: "--radius",           value: "0.75rem",  desc: "Base radius (12px)"     },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Effects & Variables" subtitle="CSS custom properties — theme.css tokens" />
      <Card>
        <p className="text-xs font-bold text-foreground mb-4">Box Shadows</p>
        <div className="flex flex-wrap gap-6">
          {shadows.map(s => (
            <div key={s.name} className="flex flex-col items-center gap-3">
              <div className={`w-16 h-16 bg-white rounded-2xl ${s.tw}`} />
              <div className="text-center">
                <p className="text-[11px] font-bold text-foreground">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold text-foreground mb-1">CSS Variables (theme.css)</p>
        <p className="text-xs text-muted-foreground mb-4">Referenced via Tailwind @theme inline mapping</p>
        <div>
          {tokens.map(t => (
            <div key={t.name} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <div className="w-6 h-6 rounded border border-black/10 flex-shrink-0" style={{ background: t.value.startsWith("#") ? t.value : "#2563EB" }} />
              <p className="w-48 text-xs font-mono font-bold text-foreground flex-shrink-0">{t.name}</p>
              <p className="text-xs font-mono text-blue-600 flex-shrink-0">{t.value}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Buttons ─────────────────────────────────────────────────────────
function SectionButtons() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Buttons" subtitle="All variants, sizes, and states" />
      <Card>
        <SubSection title="Variants">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">Primary</button>
            <button className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">Secondary</button>
            <button className="px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-semibold hover:bg-accent transition-colors">Outline</button>
            <button className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-accent transition-colors">Ghost</button>
            <button className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Danger</button>
            <button className="px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">Warning</button>
            <button className="px-4 py-2.5 text-blue-600 text-sm font-semibold hover:underline">Link</button>
          </div>
        </SubSection>

        <SubSection title="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">XS · h-7</button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">SM · h-9</button>
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">MD · h-10 ●</button>
            <button className="px-5 py-3 bg-blue-600 text-white rounded-xl text-base font-semibold">LG · h-12</button>
            <button className="px-6 py-3.5 bg-blue-600 text-white rounded-xl text-lg font-bold">XL · h-14</button>
          </div>
        </SubSection>

        <SubSection title="States">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">Default</button>
            <button className="px-4 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold ring-2 ring-blue-600 ring-offset-2">Focus</button>
            <button className="px-4 py-2.5 bg-blue-800 text-white rounded-xl text-sm font-semibold">Active</button>
            <button className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-semibold cursor-not-allowed" disabled>Disabled</button>
            <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />Loading
            </button>
          </div>
        </SubSection>

        <SubSection title="With Icons">
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />Thêm mới
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
              <Edit3 className="w-4 h-4" />Chỉnh sửa
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" />Xóa
            </button>
            <button className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-accent transition-colors">
              <MoreHorizontal className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </SubSection>
      </Card>
    </div>
  );
}

// ─── Section: Inputs ──────────────────────────────────────────────────────────
function SectionInputs() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Inputs" subtitle="Text fields — all states" />
      <Card>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <Label>Default</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Họ và tên</label>
            <input className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm border border-transparent focus:outline-none" placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-1">
            <Label>Focus</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Email</label>
            <input className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm border-2 border-blue-600 focus:outline-none ring-4 ring-blue-50" placeholder="email@example.com" defaultValue="email@" />
          </div>
          <div className="space-y-1">
            <Label>Success</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Số điện thoại</label>
            <div className="relative">
              <input className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm border-2 border-green-500 focus:outline-none pr-10" defaultValue="0901 234 567" />
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            </div>
            <p className="text-xs text-green-600">Số điện thoại hợp lệ</p>
          </div>
          <div className="space-y-1">
            <Label>Error</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Mật khẩu</label>
            <div className="relative">
              <input type="password" className="w-full px-4 py-2.5 bg-red-50 rounded-xl text-sm border-2 border-red-400 focus:outline-none pr-10" defaultValue="123" />
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            </div>
            <p className="text-xs text-red-600">Mật khẩu phải có ít nhất 8 ký tự</p>
          </div>
          <div className="space-y-1">
            <Label>Disabled</Label>
            <label className="text-sm font-semibold text-muted-foreground block mb-1">Mã tham chiếu</label>
            <input className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border border-transparent text-muted-foreground cursor-not-allowed" value="BK001-2026" disabled />
          </div>
          <div className="space-y-1">
            <Label>With Prefix / Suffix</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Giá dịch vụ</label>
            <div className="flex items-center border border-border rounded-xl overflow-hidden bg-muted">
              <span className="px-3 py-2.5 text-sm text-muted-foreground bg-muted/80 border-r border-border">₫</span>
              <input className="flex-1 px-3 py-2.5 bg-transparent text-sm focus:outline-none" placeholder="150,000" />
              <span className="px-3 py-2.5 text-xs text-muted-foreground">/lượt</span>
            </div>
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label>Textarea</Label>
            <label className="text-sm font-semibold text-foreground block mb-1">Ghi chú</label>
            <textarea className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm border border-transparent focus:border-blue-600 focus:outline-none resize-none" rows={3} placeholder="Nhập ghi chú cho thợ..." />
            <p className="text-xs text-muted-foreground text-right">0 / 200 ký tự</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Select / Checkbox / Switch ─────────────────────────────────────
function SectionCheckboxes() {
  const [checked, setChecked] = useState({ a: true, b: false, c: false });
  const [radio, setRadio] = useState("cash");
  const [sw, setSw] = useState({ a: true, b: false });

  return (
    <div className="space-y-8">
      <SectionTitle title="Select / Checkbox / Radio / Switch" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <SubSection title="Select / Dropdown">
            <div className="space-y-3">
              <select className="w-full px-4 py-2.5 bg-muted rounded-xl text-sm border border-transparent focus:border-blue-600 focus:outline-none appearance-none">
                <option>Tất cả danh mục</option>
                <option>Điện</option>
                <option>Nước</option>
                <option>Điều hòa</option>
              </select>
              <select className="w-full px-4 py-2.5 bg-muted/50 rounded-xl text-sm border border-transparent text-muted-foreground cursor-not-allowed appearance-none" disabled>
                <option>Disabled select</option>
              </select>
            </div>
          </SubSection>
          <SubSection title="Checkbox">
            {[["a", "Sửa điện dân dụng"], ["b", "Thông cống tắc"], ["c", "Dọn dẹp nhà"]].map(([k, label]) => (
              <label key={k} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <div
                  onClick={() => setChecked(p => ({ ...p, [k]: !p[k as "a"|"b"|"c"] }))}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${checked[k as "a"|"b"|"c"] ? "bg-blue-600 border-blue-600" : "border-border group-hover:border-blue-400"}`}
                >
                  {checked[k as "a"|"b"|"c"] && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </SubSection>
        </Card>
        <Card>
          <SubSection title="Radio">
            {[["cash", "Tiền mặt"], ["bank", "Chuyển khoản"], ["wallet", "Ví điện tử"]].map(([v, label]) => (
              <label key={v} className="flex items-center gap-3 py-1.5 cursor-pointer">
                <div onClick={() => setRadio(v)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${radio === v ? "border-blue-600" : "border-border hover:border-blue-400"}`}>
                  {radio === v && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </SubSection>
          <SubSection title="Toggle Switch">
            {[["a", "Nhận việc ngay"], ["b", "Thông báo qua SMS"]].map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">{label}</span>
                <button onClick={() => setSw(p => ({ ...p, [k]: !p[k as "a"|"b"] }))} className={`relative w-11 h-6 rounded-full transition-colors ${sw[k as "a"|"b"] ? "bg-blue-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${sw[k as "a"|"b"] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </SubSection>
        </Card>
      </div>
    </div>
  );
}

// ─── Section: Search & Filter ─────────────────────────────────────────────────
function SectionFilter() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const filters = ["all", "Điện", "Nước", "Điều hòa", "Dọn dẹp", "Sơn"];

  return (
    <div className="space-y-8">
      <SectionTitle title="Search Bar & Filter" />
      <Card>
        <SubSection title="Search Bar Variants">
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Tìm kiếm dịch vụ..." />
              {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
            </div>
            <div className="flex gap-2 max-w-lg">
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Tìm theo tên, SĐT..." />
              </div>
              <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4" />Tìm
              </button>
              <button className="px-3 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-1">
                <Filter className="w-4 h-4" />Lọc
              </button>
            </div>
          </div>
        </SubSection>
        <SubSection title="Filter Pills">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setActive(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${active === f ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                {f === "all" ? "Tất cả" : f}
              </button>
            ))}
          </div>
        </SubSection>
        <SubSection title="Sort Controls">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sắp xếp:</span>
            {["Giá tăng dần", "Giá giảm dần", "Lượt đặt nhiều nhất"].map((s, i) => (
              <button key={s} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === 0 ? "bg-accent text-blue-600" : "text-muted-foreground hover:bg-muted"}`}>
                {i === 0 ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
                {s}
              </button>
            ))}
          </div>
        </SubSection>
      </Card>
    </div>
  );
}

// ─── Section: Cards ───────────────────────────────────────────────────────────
function SectionCards() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Cards" subtitle="Service, Provider, Booking, Stats — all card variants" />
      <div className="grid md:grid-cols-3 gap-4">
        {/* Service Card */}
        <div>
          <Label>Service Card</Label>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-shadow">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1621905251189-08b1489462be?w=300&h=160&fit=crop&auto=format" alt="service" className="w-full h-28 object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg px-2 py-0.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-bold">234</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-bold text-sm text-foreground">Sửa chữa điện</p>
              <p className="text-xs text-muted-foreground mt-0.5">234 lượt đặt</p>
              <p className="text-blue-600 font-bold text-sm mt-1">từ 150,000đ</p>
              <div className="flex gap-1.5 mt-2">
                <button className="flex-1 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-[11px] font-bold">Chi tiết</button>
                <button className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold">Đặt lịch</button>
              </div>
            </div>
          </div>
        </div>
        {/* Provider Card */}
        <div>
          <Label>Provider Card</Label>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format" alt="provider" className="w-14 h-14 rounded-xl object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1"><p className="font-bold text-sm text-foreground">Nguyễn Văn An</p><Shield className="w-3 h-3 text-blue-500" /></div>
                <p className="text-xs text-muted-foreground">Electrical Expert · 5 năm</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs font-bold">4.9</span></div>
                  <span className="text-xs text-muted-foreground">312 công việc</span>
                  <span className="text-xs text-muted-foreground">0.8 km</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">Đặt lịch</button>
          </div>
        </div>
        {/* Stat Card */}
        <div>
          <Label>Stats Card</Label>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+12.5%</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">4,250,000đ</p>
            <p className="text-xs text-muted-foreground mt-0.5">Doanh thu hôm nay</p>
          </div>
        </div>
      </div>

      <Card>
        <SubSection title="Booking Card — All Statuses">
          <div className="space-y-3">
            {[
              { id: "BK001", service: "Sửa chữa điện", tech: "Nguyễn Văn An", date: "20/06/2026 · 09:00", status: "in_progress", price: "350,000" },
              { id: "BK002", service: "Dọn dẹp nhà",   tech: "Phạm Hoa",       date: "18/06/2026 · 14:00", status: "completed",   price: "240,000" },
              { id: "BK003", service: "Thông cống",     tech: "Trần Thị Bình",  date: "22/06/2026 · 10:00", status: "pending",     price: "180,000" },
            ].map(b => {
              const s = { in_progress: { label: "Đang thực hiện", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" }, completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700", dot: "bg-green-500" }, pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" } }[b.status]!;
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-muted rounded-2xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><p className="font-bold text-sm text-foreground">{b.service}</p></div>
                    <p className="text-xs text-muted-foreground">{b.id} · {b.tech} · {b.date}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-blue-600">{b.price}đ</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SubSection>
      </Card>
    </div>
  );
}

// ─── Section: Tables ──────────────────────────────────────────────────────────
function SectionTables() {
  const [sort, setSort] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "name", dir: "asc" });
  const rows = [
    { id: 1, name: "Nguyễn Văn An", skill: "Điện", rating: 4.9, jobs: 312, status: "active" },
    { id: 2, name: "Trần Thị Bình", skill: "Nước", rating: 4.8, jobs: 245, status: "active" },
    { id: 3, name: "Lê Minh Cường", skill: "Điều hòa", rating: 4.7, jobs: 198, status: "pending" },
    { id: 4, name: "Phạm Hoa",      skill: "Dọn dẹp", rating: 4.6, jobs: 421, status: "blocked" },
  ];

  const headerCls = "text-left text-xs font-bold text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground";

  return (
    <div className="space-y-8">
      <SectionTitle title="Tables" subtitle="Data Table — sortable, selectable rows" />
      <Card className="p-0">
        <div className="p-4 border-b border-border flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Tìm kiếm..." />
          </div>
          <select className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none bg-background">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Chờ duyệt</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" />Thêm mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                {[["name","Họ tên"],["skill","Kỹ năng"],["rating","Đánh giá"],["jobs","Công việc"],["status","Trạng thái"]].map(([col, label]) => (
                  <th key={col} className={headerCls} onClick={() => setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }))}>
                    <span className="flex items-center gap-1">{label}{sort.col === col ? (sort.dir === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />) : null}</span>
                  </th>
                ))}
                <th className={headerCls}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(r => {
                const s = { active: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", blocked: "bg-red-100 text-red-700" }[r.status]!;
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">{r.name[0]}</div>
                        <span className="text-sm font-semibold text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="bg-accent text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">{r.skill}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-sm font-semibold">{r.rating}</span></div></td>
                    <td className="px-4 py-3 text-sm text-foreground">{r.jobs}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s}`}>{r.status === "active" ? "Hoạt động" : r.status === "pending" ? "Chờ duyệt" : "Bị khóa"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors">Chi tiết</button>
                        <button className="px-2 py-1 bg-muted hover:bg-accent rounded-lg text-xs font-semibold transition-colors"><Edit3 className="w-3 h-3" /></button>
                        <button className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors text-red-600"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Hiển thị 1–4 / 187 bản ghi</span>
          <div className="flex gap-1">
            {[1,2,3,"...",38].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === 1 ? "bg-blue-600 text-white" : "border border-border hover:bg-muted"}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Badges ──────────────────────────────────────────────────────────
function SectionBadges() {
  const statuses = [
    { label: "Chờ xác nhận",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
    { label: "Đã xác nhận",    color: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
    { label: "Đang thực hiện", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    { label: "Hoàn thành",     color: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
    { label: "Đã hủy",         color: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
    { label: "Chờ duyệt",      color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
    { label: "Hoạt động",      color: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
    { label: "Bị khóa",        color: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
    { label: "Rảnh",           color: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
    { label: "Bận",            color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
    { label: "Offline",        color: "bg-gray-100 text-gray-600",     dot: "bg-gray-400"   },
    { label: "Vi phạm",        color: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="Status Badges" subtitle="Pill badges with dot indicator — all system states" />
      <Card>
        <div className="flex flex-wrap gap-3">
          {statuses.map(s => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Label>Solid variants</Label>
          {[["bg-blue-600 text-white","Primary"],["bg-green-600 text-white","Success"],["bg-red-600 text-white","Danger"],["bg-amber-500 text-white","Warning"],["bg-gray-600 text-white","Neutral"]].map(([cls, l]) => (
            <span key={l} className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{l}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Modals ──────────────────────────────────────────────────────────
function SectionModals() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <SectionTitle title="Modal / Dialog" subtitle="Confirmation, form, and information dialogs" />
      <Card>
        <div className="flex gap-3">
          <button onClick={() => setShowConfirm(true)} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Xem Confirm Modal</button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Xem Form Modal</button>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          {/* Confirm modal preview */}
          <div className="border-2 border-dashed border-border rounded-2xl p-4 flex items-center justify-center bg-muted/20">
            <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-base font-bold text-center text-foreground mb-2">Xóa dịch vụ?</h3>
              <p className="text-xs text-muted-foreground text-center">Dịch vụ "Sửa điện" sẽ bị xóa vĩnh viễn. Không thể hoàn tác.</p>
              <div className="flex gap-3 mt-5">
                <button className="flex-1 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Hủy</button>
                <button className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold">Xóa</button>
              </div>
            </div>
          </div>
          {/* Success modal preview */}
          <div className="border-2 border-dashed border-border rounded-2xl p-4 flex items-center justify-center bg-muted/20">
            <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
              <h3 className="text-lg font-extrabold text-foreground mb-2">Đặt lịch thành công!</h3>
              <p className="text-xs text-muted-foreground mb-4">Mã đặt lịch: <span className="font-bold text-foreground">#BK001</span></p>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Xem đặt lịch</button>
            </div>
          </div>
        </div>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-lg font-bold text-center mb-2">Xóa tài khoản?</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">Tài khoản Trần Minh Khoa sẽ bị xóa vĩnh viễn. Không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Hủy</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Thêm dịch vụ mới</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Tên dịch vụ *</label><input className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="VD: Sửa ổ cắm điện" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Loại</label><select className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none"><option>Điện</option><option>Nước</option></select></div>
                <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Giá (đ)</label><input className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none" placeholder="150,000" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold">Hủy</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Pagination ──────────────────────────────────────────────────────
function SectionPagination() {
  const [page, setPage] = useState(3);
  const total = 10;

  return (
    <div className="space-y-8">
      <SectionTitle title="Pagination" />
      <Card>
        <SubSection title="Standard Pagination">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hiển thị 11–15 / 187 bản ghi</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: total }, (_, i) => i+1).filter(p => p === 1 || p === total || Math.abs(p - page) <= 1).reduce((acc: (number|string)[], p, i, arr) => {
                if (i > 0 && p - (arr[i-1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, []).map((p, i) => (
                <button key={i} onClick={() => typeof p === "number" && setPage(p)} disabled={p === "..."} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-blue-600 text-white" : p === "..." ? "cursor-default text-muted-foreground" : "border border-border hover:bg-muted"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(total, p+1))} disabled={page === total} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </SubSection>
        <SubSection title="Simple Prev / Next">
          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" />Trước</button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Tiếp<ChevronRight className="w-4 h-4" /></button>
          </div>
        </SubSection>
      </Card>
    </div>
  );
}

// ─── Section: Navigation ──────────────────────────────────────────────────────
function SectionNavigation() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Navbar / Sidebar" />
      {/* Top Navbar */}
      <Card className="p-0 overflow-hidden">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-2">Top Navbar — Web</p>
        <div className="bg-white border-b border-border flex items-center h-14 px-4 gap-3">
          <div className="flex items-center gap-2 mr-6">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Wrench className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-extrabold text-base text-foreground">Fix<span className="text-blue-500">Now</span></span>
          </div>
          <div className="flex items-center gap-0.5 flex-1">
            {["Trang chủ","Dịch vụ","Lịch đặt","Hồ sơ"].map((n, i) => (
              <button key={n} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === 0 ? "bg-accent text-blue-600" : "text-muted-foreground hover:bg-muted"}`}>{n}</button>
            ))}
          </div>
          <button className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center"><Bell className="w-4 h-4 text-muted-foreground" /></button>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted cursor-pointer">
            <div className="w-6 h-6 bg-blue-600 rounded-full" />
            <span className="text-xs font-semibold text-foreground">Minh Khoa</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </Card>

      {/* Admin Sidebar */}
      <Card className="p-0 overflow-hidden">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-2">Admin Sidebar</p>
        <div className="flex h-56">
          <div className="w-48 bg-white border-r border-border flex flex-col py-3 px-2 space-y-0.5">
            {[
              { icon: BarChart2, label: "Dashboard", active: true },
              { icon: FileText, label: "Đơn hàng",   active: false },
              { icon: Wrench,   label: "Quản lý thợ",active: false },
              { icon: Package,  label: "Dịch vụ",    active: false },
              { icon: Users,    label: "Tài khoản",  active: false },
              { icon: Percent,  label: "Hoa hồng",   active: false },
            ].map(item => (
              <button key={item.label} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${item.active ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"}`}>
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />{item.label}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">Content area</div>
        </div>
      </Card>

      {/* Mobile Bottom Nav */}
      <Card className="p-0 overflow-hidden max-w-xs">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 pt-4 pb-2">Mobile Bottom Nav</p>
        <div className="bg-white border-t border-border flex items-center px-2 py-2">
          {[{icon: Home, label: "Trang chủ", active: true},{icon: Search, label: "Dịch vụ", active: false},{icon: FileText, label: "Lịch đặt", active: false},{icon: User, label: "Hồ sơ", active: false}].map(item => (
            <button key={item.label} className={`flex-1 flex flex-col items-center gap-1 py-1 ${item.active ? "text-blue-600" : "text-muted-foreground"}`}>
              <item.icon className="w-4 h-4" />
              <span className="text-[9px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: Charts ──────────────────────────────────────────────────────────
function SectionCharts() {
  const barData = [{ d: "T2", v: 42 }, { d: "T3", v: 65 }, { d: "T4", v: 38 }, { d: "T5", v: 81 }, { d: "T6", v: 57 }, { d: "T7", v: 90 }, { d: "CN", v: 73 }];
  const max = Math.max(...barData.map(d => d.v));

  const pieData = [{ label: "Điện", pct: 35, color: "bg-amber-400" }, { label: "Dọn dẹp", pct: 28, color: "bg-green-400" }, { label: "Điều hòa", pct: 18, color: "bg-blue-400" }, { label: "Nước", pct: 12, color: "bg-cyan-400" }, { label: "Khác", pct: 7, color: "bg-purple-400" }];

  return (
    <div className="space-y-8">
      <SectionTitle title="Charts" subtitle="CSS-based charts — no dependency required" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <p className="text-sm font-bold text-foreground mb-4">Bar Chart — Doanh thu 7 ngày</p>
          <div className="flex items-end gap-1.5 h-32">
            {barData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-muted-foreground">{d.v}M</span>
                <div className={`w-full rounded-t-lg ${i === barData.length - 1 ? "bg-blue-600" : "bg-blue-100"}`} style={{ height: `${(d.v / max) * 80}px` }} />
                <span className="text-[9px] text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-sm font-bold text-foreground mb-4">Horizontal Bar — Theo loại dịch vụ</p>
          <div className="space-y-3">
            {pieData.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Section: Toast ───────────────────────────────────────────────────────────
function SectionToast() {
  const toasts = [
    { type: "success", icon: CheckCircle, color: "border-l-green-500 bg-green-50",  iconColor: "text-green-600", title: "Đặt lịch thành công!",  body: "Thợ sẽ liên hệ trong 5 phút."        },
    { type: "error",   icon: AlertCircle, color: "border-l-red-500 bg-red-50",     iconColor: "text-red-600",   title: "Thanh toán thất bại",    body: "Vui lòng kiểm tra thông tin thẻ."    },
    { type: "warning", icon: AlertCircle, color: "border-l-amber-500 bg-amber-50", iconColor: "text-amber-600", title: "Phiên sắp hết hạn",      body: "Đăng nhập lại để tiếp tục."           },
    { type: "info",    icon: Info,        color: "border-l-blue-500 bg-blue-50",   iconColor: "text-blue-600",  title: "Cập nhật mới",           body: "Phiên bản 2.6 đã sẵn sàng."          },
  ];
  return (
    <div className="space-y-8">
      <SectionTitle title="Toast / Notification" />
      <Card>
        <div className="space-y-3 max-w-sm">
          {toasts.map(t => (
            <div key={t.type} className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-sm ${t.color}`}>
              <t.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${t.iconColor}`} />
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.body}</p>
              </div>
              <button><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Section: System States ───────────────────────────────────────────────────
function SectionStates() {
  return (
    <div className="space-y-8">
      <SectionTitle title="System States" subtitle="Loading, Empty, No Data, Error, Success — required for every list screen" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "Loading",
            content: (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-foreground">Đang tải...</p>
                <p className="text-xs text-muted-foreground">Vui lòng chờ</p>
              </div>
            ),
          },
          {
            label: "Empty State",
            content: (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Chưa có dịch vụ</p>
                <p className="text-xs text-muted-foreground text-center">Thêm dịch vụ đầu tiên của bạn</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"><Plus className="w-3.5 h-3.5" />Thêm mới</button>
              </div>
            ),
          },
          {
            label: "No Results",
            content: (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Không tìm thấy</p>
                <p className="text-xs text-muted-foreground text-center">Thử từ khóa hoặc bộ lọc khác</p>
              </div>
            ),
          },
          {
            label: "Error",
            content: (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-foreground">Có lỗi xảy ra</p>
                <p className="text-xs text-muted-foreground text-center">Không thể tải dữ liệu. Thử lại.</p>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors"><RefreshCw className="w-3.5 h-3.5" />Thử lại</button>
              </div>
            ),
          },
          {
            label: "Success",
            content: (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-foreground">Thành công!</p>
                <p className="text-xs text-muted-foreground text-center">Thao tác đã được thực hiện</p>
              </div>
            ),
          },
          {
            label: "Skeleton / Loading Row",
            content: (
              <div className="space-y-2 w-full">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-muted rounded-full animate-pulse" style={{ width: `${60 + i*10}%` }} />
                      <div className="h-2 bg-muted rounded-full animate-pulse" style={{ width: `${40 + i*8}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
        ].map(state => (
          <div key={state.label} className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider self-start">{state.label}</p>
            {state.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: Forms (CRUD Patterns) ──────────────────────────────────────────
function SectionForms() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Form Patterns (CRUD)" subtitle="Standard form layouts — Create, Edit, Delete confirmation" />
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Create / Edit Form</p>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-foreground mb-1 block">Tên dịch vụ *</label><input className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="VD: Sửa điện dân dụng" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold text-foreground mb-1 block">Loại dịch vụ *</label><select className="w-full bg-muted px-3 py-2.5 rounded-xl text-sm focus:outline-none"><option>Điện</option><option>Nước</option></select></div>
              <div><label className="text-xs font-semibold text-foreground mb-1 block">Giá cơ bản (đ) *</label><input className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none" placeholder="150,000" /></div>
            </div>
            <div><label className="text-xs font-semibold text-foreground mb-1 block">Mô tả</label><textarea rows={2} className="w-full bg-muted px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none" placeholder="Mô tả ngắn gọn..." /></div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <div className="w-9 h-5 bg-blue-600 rounded-full relative"><div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" /></div>
                Kích hoạt ngay
              </label>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-colors">Hủy</button>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">CRUD Actions Pattern</p>
          <div className="space-y-2">
            {[
              { label: "Create", icon: Plus, cls: "bg-blue-600 text-white", desc: "POST /api/services" },
              { label: "Read / List", icon: Search, cls: "bg-muted text-foreground", desc: "GET /api/services?page=1&limit=10" },
              { label: "Read / Detail", icon: Eye, cls: "bg-muted text-foreground", desc: "GET /api/services/:id" },
              { label: "Update", icon: Edit3, cls: "border border-border text-foreground", desc: "PUT /api/services/:id" },
              { label: "Delete", icon: Trash2, cls: "bg-red-50 text-red-600", desc: "DELETE /api/services/:id" },
              { label: "Approve / Reject", icon: Check, cls: "bg-green-50 text-green-700", desc: "PATCH /api/providers/:id/status" },
            ].map(a => (
              <div key={a.label} className="flex items-center gap-3 p-2 bg-muted rounded-xl">
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${a.cls}`}><a.icon className="w-3.5 h-3.5" />{a.label}</button>
                <code className="text-[10px] text-muted-foreground font-mono flex-1 truncate">{a.desc}</code>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Section: Data Table Pattern ─────────────────────────────────────────────
function SectionDataTable() {
  return (
    <div className="space-y-8">
      <SectionTitle title="Data Table Pattern" subtitle="Full CRUD table — anatomy & REST API mapping" />
      <Card>
        <div className="space-y-4">
          {[
            { zone: "1 · Header",        cls: "bg-blue-50 border border-blue-200",  content: "Page title + description + [+ Thêm mới] button" },
            { zone: "2 · Stats Strip",   cls: "bg-green-50 border border-green-200",content: "3–4 KPI mini cards (total, active, pending, etc.)" },
            { zone: "3 · Toolbar",       cls: "bg-amber-50 border border-amber-200",content: "SearchBar + Filter dropdowns + [Sort] + [Export]" },
            { zone: "4 · Table Head",    cls: "bg-purple-50 border border-purple-200", content: "Checkbox (bulk) · Columns with sort icons · Actions" },
            { zone: "5 · Table Body",    cls: "bg-slate-50 border border-slate-200",content: "Rows: avatar + name · badge · numbers · status badge · [Chi tiết][Sửa][Xóa]" },
            { zone: "6 · Pagination",    cls: "bg-orange-50 border border-orange-200", content: "Record range · Page buttons · rows-per-page select" },
            { zone: "7 · Detail Panel",  cls: "bg-cyan-50 border border-cyan-200",  content: "Slide-in right panel with all fields + action buttons" },
            { zone: "8 · Confirm Modal", cls: "bg-red-50 border border-red-200",    content: "Overlay modal: icon + title + message + [Hủy][Xác nhận]" },
          ].map((z, i) => (
            <div key={i} className={`px-4 py-3 rounded-xl ${z.cls}`}>
              <span className="text-xs font-bold text-foreground">{z.zone}</span>
              <span className="text-xs text-muted-foreground ml-2">→ {z.content}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p className="text-xs font-bold text-foreground mb-3">REST API Request / Response Pattern</p>
        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto">
          <pre className="text-[11px] text-green-400 font-mono leading-relaxed">{`// GET /api/services?page=1&limit=10&search=điện&category=Điện&sort=orders&dir=desc
{
  "success": true,
  "data": {
    "items": [{ "id": 1, "name": "Sửa điện", "price": 150000, "status": "active", ... }],
    "pagination": { "page": 1, "limit": 10, "total": 47, "totalPages": 5 }
  }
}

// POST /api/services  |  body: { name, categoryId, price, description, isActive }
// PUT  /api/services/:id  |  body: partial service object
// DELETE /api/services/:id  →  204 No Content
// PATCH /api/providers/:id/approve  |  body: { status: "active" | "rejected" }`}</pre>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Design System page ──────────────────────────────────────────────────
export default function DesignSystem({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState("colors");

  const renderContent = () => {
    switch (active) {
      case "colors":      return <SectionColors />;
      case "typography":  return <SectionTypography />;
      case "icons":       return <SectionIcons />;
      case "spacing":     return <SectionSpacing />;
      case "effects":     return <SectionEffects />;
      case "buttons":     return <SectionButtons />;
      case "inputs":      return <SectionInputs />;
      case "select":      return <SectionCheckboxes />;
      case "checkboxes":  return <SectionCheckboxes />;
      case "searchbar":   return <SectionFilter />;
      case "filter":      return <SectionFilter />;
      case "cards":       return <SectionCards />;
      case "tables":      return <SectionTables />;
      case "badges":      return <SectionBadges />;
      case "modals":      return <SectionModals />;
      case "pagination":  return <SectionPagination />;
      case "navigation":  return <SectionNavigation />;
      case "charts":      return <SectionCharts />;
      case "toast":       return <SectionToast />;
      case "states":      return <SectionStates />;
      case "forms":       return <SectionForms />;
      case "datatable":   return <SectionDataTable />;
      default:            return <SectionColors />;
    }
  };

  return (
    <div className="flex h-full bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <div>
            <p className="font-extrabold text-sm text-foreground">FixNow DS</p>
            <p className="text-[10px] text-muted-foreground">v1.0 · Tailwind CSS</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV.map(group => (
            <div key={group.group}>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">{group.group}</p>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${active === item.id ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">React + Tailwind CSS</p>
          <p className="text-[10px] text-muted-foreground">Inter · 8px Grid · #2563EB</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
