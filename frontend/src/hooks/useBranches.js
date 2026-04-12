"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { branchService } from "@/services/branch.service";

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.all,
    queryFn: branchService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}
