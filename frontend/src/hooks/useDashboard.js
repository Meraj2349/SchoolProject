"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { dashboardService } from "@/services/dashboard.service";
import { useBranchStore } from "@/store/branchStore";

export function useDashboardSummary() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.dashboard.summary(branchId),
    queryFn: dashboardService.getSummary,
    staleTime: 60 * 1000,
  });
}
