import { get, unwrap, type ApiResponse } from "./client";
import type { GlobalSearchResult } from "@/shared/types";


export async function globalSearch(keyword: string): Promise<GlobalSearchResult> {
  const response = await get<ApiResponse<GlobalSearchResult>>("/Search", {
    params: { keyword },
  });
  return unwrap(response);
}
