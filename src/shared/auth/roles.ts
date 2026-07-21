


export type BackendRole = "Admin" | "Customer" | "Provider" | "Worker" | "Tasker";


export type FrontendRole = "admin" | "customer" | "provider";


export function normalizeRole(role: string): FrontendRole {
  const key = (role ?? "").trim().toLowerCase();
  if (!key) return "customer";

  if (key.includes("admin") || key.includes("quản trị")) return "admin";

  if (
    key.includes("provider") ||
    key.includes("worker") ||
    key.includes("tasker") ||
    key.includes("partner") ||
    key.includes("technician") ||
    key.includes("thợ") ||
    key.includes("đối tác") ||
    key.includes("kythuat")
  ) {
    return "provider";
  }

  if (key.includes("customer") || key.includes("khách") || key.includes("khach") || key.includes("client")) {
    return "customer";
  }

  if (typeof console !== "undefined") {
    console.warn(`[roles] Vai trò backend chưa nhận diện: "${role}" → tạm coi là customer`);
  }
  return "customer";
}


export function getHomePathByRole(role: FrontendRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "provider":
      return "/provider/dashboard";
    case "customer":
    default:
      return "/customer/home";
  }
}


export function canAccessPath(pathname: string, roles: FrontendRole[]): boolean {
  if (!pathname.startsWith("/")) return true;

  if (pathname.startsWith("/admin")) {
    return roles.includes("admin");
  }
  if (pathname.startsWith("/provider")) {
    return roles.includes("provider");
  }
  if (pathname.startsWith("/customer")) {
    return roles.includes("customer");
  }

  
  return true;
}


export function getRequiredRoles(pathname: string): FrontendRole[] {
  if (pathname.startsWith("/admin")) return ["admin"];
  if (pathname.startsWith("/provider")) return ["provider"];
  if (pathname.startsWith("/customer")) return ["customer"];
  return []; 
}


export function getPrimaryRole(backendRoles: string[]): FrontendRole {
  for (const role of backendRoles) {
    const mapped = normalizeRole(role);
    if (mapped) return mapped;
  }
  return "customer"; 
}


export function getAllFrontendRoles(backendRoles: string[]): FrontendRole[] {
  const set = new Set<FrontendRole>();
  for (const role of backendRoles) {
    set.add(normalizeRole(role));
  }
  return Array.from(set);
}


export function hasAnyRole(userRoles: FrontendRole[], requiredRoles: FrontendRole[]): boolean {
  return requiredRoles.some((r) => userRoles.includes(r));
}


export function isAdmin(userRoles: FrontendRole[]): boolean {
  return userRoles.includes("admin");
}


export function isCustomer(userRoles: FrontendRole[]): boolean {
  return userRoles.includes("customer");
}


export function isProvider(userRoles: FrontendRole[]): boolean {
  return userRoles.includes("provider");
}


export function getRoleLabel(role: FrontendRole): string {
  const labels: Record<FrontendRole, string> = {
    admin: "Quản trị viên",
    customer: "Khách hàng",
    provider: "Đối tác dịch vụ",
  };
  return labels[role];
}


export function getBackendRoleLabel(role: BackendRole): string {
  const labels: Record<BackendRole, string> = {
    Admin: "Quản trị viên",
    Customer: "Khách hàng",
    Provider: "Đối tác dịch vụ",
    Worker: "Kỹ thuật viên",
    Tasker: "Thợ",
  };
  return labels[role];
}
