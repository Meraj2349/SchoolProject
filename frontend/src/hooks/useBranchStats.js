"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { branchService } from "@/services/branch.service";

export function useBranchStats() {
  return useQuery({
    queryKey: queryKeys.branches.stats,
    queryFn: branchService.getStats,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}
