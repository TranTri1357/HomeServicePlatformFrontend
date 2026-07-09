import { useState } from "react";
import { adminReviewsList } from "@/services/Admin/review.data";

export function useReviews() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = adminReviewsList.filter(
    (r) =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (r.customer.toLowerCase().includes(search.toLowerCase()) ||
        r.provider.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())),
  );
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return { search, setSearch, statusFilter, setStatusFilter, page, setPage, filtered, paged, perPage };
}
