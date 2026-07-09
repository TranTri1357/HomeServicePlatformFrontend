import { useState } from "react";
import { adminComplaintsList } from "@/services/Admin/complaint.data";
import type { AdminComplaint } from "@/shared/types";

export function useComplaints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminComplaint[]>(adminComplaintsList);
  const perPage = 5;

  const filtered = items.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      (c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.customer.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const updateStatus = (id: string, status: AdminComplaint["status"]) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  return { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage, items, updateStatus };
}
