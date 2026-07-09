import { useState } from "react";
import { adminUsersList } from "@/services/Admin/user.data";

export function useUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = adminUsersList.filter(
    (u) =>
      (statusFilter === "all" || u.status === statusFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)),
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
