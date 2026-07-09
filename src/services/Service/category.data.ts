import type { Category } from "@/shared/types";

/**
 * Mock fallback for the category grid so the home screen never flashes empty
 * while the backend is unreachable. iconUrl is left empty on purpose — the UI
 * falls back to a generic icon when there is no image.
 */
export const categories: Category[] = [
  { categoryId: 1, name: "Vệ sinh nhà cửa", slug: "ve-sinh-nha-cua", iconUrl: "" },
  { categoryId: 2, name: "Điện lạnh", slug: "dien-lanh", iconUrl: "" },
  { categoryId: 3, name: "Điện nước", slug: "dien-nuoc", iconUrl: "" },
  { categoryId: 4, name: "Sửa máy giặt", slug: "sua-may-giat", iconUrl: "" },
  { categoryId: 5, name: "Sơn sửa nhà", slug: "son-sua-nha", iconUrl: "" },
  { categoryId: 6, name: "Diệt côn trùng", slug: "diet-con-trung", iconUrl: "" },
];
