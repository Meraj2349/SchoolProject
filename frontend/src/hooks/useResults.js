"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { resultsService } from "@/services/results.service";
import { useBranchStore } from "@/store/branchStore";

/** Public result search; runs once a query is given. */
export function useResultSearch(query) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.results.search(query, branchId),
    queryFn: () => resultsService.search(query),
    enabled: !!query,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}
