import { get, unwrap, type ApiResponse } from "./client";
import type { GlobalSearchResult } from "@/shared/types";

/**
 * GET /api/Search?keyword= — global search across categories, services and
 * taskers (up to 5 of each). Public endpoint.
 */
export async function globalSearch(keyword: string): Promise<GlobalSearchResult> {
  const response = await get<ApiResponse<GlobalSearchResult>>("/Search", {
    params: { keyword },
  });
  return unwrap(response);
}
