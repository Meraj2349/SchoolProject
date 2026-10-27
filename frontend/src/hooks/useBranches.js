"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localized } from "@/lib/homePage";
import { queryKeys } from "@/lib/queryKeys";
import { branchService } from "@/services/branch.service";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore } from "@/store/languageStore";

export function useBranches() {
  return useQuery({
    queryKey: queryKeys.branches.all,
    queryFn: branchService.getAll,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

/**
 * The chosen branch's name in the current language (the stored name until the
 * branch list loads), or null for all branches.
 */
export function useCurrentBranchName() {
  const branchId = useBranchStore((s) => s.currentBranchId);
  const storedName = useBranchStore((s) => s.currentBranchName);
  const language = useLanguageStore((s) => s.language);
  const { data: branches = [] } = useBranches();
  if (branchId == null) return null;
  const branch = branches.find((b) => b.id === branchId);
  return (branch && localized(branch, "name", language)) || storedName;
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => branchService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
      qc.invalidateQueries({ queryKey: queryKeys.branches.overview });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => branchService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
      qc.invalidateQueries({ queryKey: queryKeys.branches.overview });
    },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => branchService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.branches.all });
      qc.invalidateQueries({ queryKey: queryKeys.branches.stats });
      qc.invalidateQueries({ queryKey: queryKeys.branches.overview });
    },
  });
}
