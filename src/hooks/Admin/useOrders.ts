import { useState } from "react";
import { adminOrdersList } from "@/services/Admin/order.data";

export function useOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = adminOrdersList.filter(
    (o) =>
      (statusFilter === "all" || o.status === statusFilter) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.service.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage };
}
