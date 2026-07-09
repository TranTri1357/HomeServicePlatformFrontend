import { useState } from "react";
import { adminProvidersList } from "@/services/Admin/technician.data";

export function useTechnicians() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = adminProvidersList.filter(
    (p) =>
      (statusFilter === "all" || p.status === statusFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search) ||
        p.skill.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    filtered,
    paged,
    perPage,
  };
}
